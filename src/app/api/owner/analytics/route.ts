import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const turfId = searchParams.get('turfId');

    const todayStr = new Date().toISOString().split('T')[0];

    const turfWhere = turfId ? { turfId } : {};

    // Fetch all bookings for this turf (or all if not filtered)
    const bookings = await prisma.booking.findMany({
      where: turfWhere,
      include: {
        customer: true,
        ground: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Today stats
    const todayBookings = bookings.filter((b) => b.date === todayStr);
    const todayRevenue = todayBookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((acc, b) => acc + (b.totalAmount - (b.refundAmount || 0)), 0);

    const upcomingBookings = bookings.filter(
      (b) => b.date >= todayStr && b.status === 'CONFIRMED'
    );
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');

    // Fetch slots for today to calculate occupancy
    const todaySlots = await prisma.timeSlot.findMany({
      where: {
        date: todayStr,
        ...(turfId
          ? {
              ground: { turfId },
            }
          : {}),
      },
    });

    const totalSlotsToday = todaySlots.length || 1;
    const bookedSlotsToday = todaySlots.filter((s) => s.status === 'BOOKED').length;
    const availableSlotsToday = todaySlots.filter((s) => s.status === 'AVAILABLE').length;
    const occupancyRate = Math.round((bookedSlotsToday / totalSlotsToday) * 100);

    // Revenue by last 7 days
    const daysMap: { [key: string]: { revenue: number; bookings: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      daysMap[dStr] = { revenue: 0, bookings: 0 };
    }

    bookings.forEach((b) => {
      if (daysMap[b.date] && b.status !== 'CANCELLED') {
        daysMap[b.date].revenue += b.totalAmount;
        daysMap[b.date].bookings += 1;
      }
    });

    const revenueByDay = Object.keys(daysMap).map((d) => {
      const dateObj = new Date(d);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date: d,
        day: dayName,
        revenue: daysMap[d].revenue,
        bookings: daysMap[d].bookings,
      };
    });

    // Peak hours analysis
    const hoursMap: { [key: string]: number } = {};
    for (let h = 6; h < 23; h++) {
      const hStr = h.toString().padStart(2, '0') + ':00';
      hoursMap[hStr] = 0;
    }
    bookings.forEach((b) => {
      if (b.status !== 'CANCELLED' && hoursMap[b.startTime] !== undefined) {
        hoursMap[b.startTime] += 1;
      }
    });

    const peakHours = Object.keys(hoursMap).map((h) => ({
      hour: h,
      bookings: hoursMap[h],
    }));

    // Sport breakdown
    const sportMap: { [key: string]: { bookings: number; revenue: number } } = {};
    bookings.forEach((b) => {
      const sport = b.ground?.sport || 'OTHER';
      if (!sportMap[sport]) sportMap[sport] = { bookings: 0, revenue: 0 };
      if (b.status !== 'CANCELLED') {
        sportMap[sport].bookings += 1;
        sportMap[sport].revenue += b.totalAmount;
      }
    });

    const sportShare = Object.keys(sportMap).map((s) => ({
      sport: s,
      bookings: sportMap[s].bookings,
      revenue: sportMap[s].revenue,
    }));

    // Customer loyalty & CRM
    const customerAgg: {
      [key: string]: {
        name: string;
        phone: string;
        email: string;
        bookingsCount: number;
        totalSpent: number;
      };
    } = {};

    bookings.forEach((b) => {
      const cId = b.customerId;
      const cName = b.isManualBooking ? b.manualCustomerName || 'Walk-in' : b.customer?.name || 'Customer';
      const cPhone = b.isManualBooking ? b.manualCustomerPhone || '-' : b.customer?.phone || '-';
      const cEmail = b.customer?.email || '-';

      if (!customerAgg[cId]) {
        customerAgg[cId] = {
          name: cName,
          phone: cPhone,
          email: cEmail,
          bookingsCount: 0,
          totalSpent: 0,
        };
      }
      if (b.status !== 'CANCELLED') {
        customerAgg[cId].bookingsCount += 1;
        customerAgg[cId].totalSpent += b.totalAmount;
      }
    });

    const frequentCustomers = Object.values(customerAgg)
      .map((c) => ({
        ...c,
        isVip: c.totalSpent > 3000 || c.bookingsCount >= 3,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({
      success: true,
      stats: {
        todayBookingsCount: todayBookings.length,
        todayRevenue,
        upcomingBookingsCount: upcomingBookings.length,
        cancelledCount: cancelledBookings.length,
        availableSlotsCount: availableSlotsToday,
        occupancyRate,
      },
      revenueByDay,
      peakHours,
      sportShare,
      frequentCustomers,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
