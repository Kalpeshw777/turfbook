import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalOwners = await prisma.user.count({ where: { role: 'OWNER' } });
    const totalTurfs = await prisma.turf.count();
    const approvedTurfs = await prisma.turf.count({ where: { isApproved: true } });
    const pendingTurfs = await prisma.turf.count({ where: { isApproved: false } });

    const allBookings = await prisma.booking.findMany({
      select: {
        totalAmount: true,
        status: true,
        refundAmount: true,
      },
    });

    const totalBookingsCount = allBookings.length;
    const completedBookings = allBookings.filter((b) => b.status !== 'CANCELLED');
    const grossBookingValue = completedBookings.reduce(
      (acc, b) => acc + (b.totalAmount - (b.refundAmount || 0)),
      0
    );

    // Platform commission (e.g. 5% platform fee)
    const platformCommission = Math.round(grossBookingValue * 0.05);

    const openComplaints = await prisma.complaint.count({
      where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalOwners,
        totalTurfs,
        approvedTurfs,
        pendingTurfs,
        totalBookingsCount,
        grossBookingValue,
        platformCommission,
        commissionRate: '5%',
        openComplaints,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
