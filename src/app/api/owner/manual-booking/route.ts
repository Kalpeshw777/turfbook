import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateBookingCode, encodeQRPayload } from '@/lib/qr-helper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      turfId,
      groundId,
      date,
      startTime,
      durationHours = 1,
      customerName,
      customerPhone,
      numberOfPlayers = 10,
      totalAmount,
      paymentMethod = 'CASH',
      ownerId,
    } = body;

    if (!turfId || !groundId || !date || !startTime || !customerName) {
      return NextResponse.json(
        { success: false, error: 'Missing required manual booking fields' },
        { status: 400 }
      );
    }

    const startH = parseInt(startTime.split(':')[0], 10);
    const requiredSlotTimes: string[] = [];
    for (let i = 0; i < durationHours; i++) {
      const h = startH + i;
      requiredSlotTimes.push(h.toString().padStart(2, '0') + ':00');
    }
    const endH = startH + durationHours;
    const endTime = endH.toString().padStart(2, '0') + ':00';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch slots
      const slots = await tx.timeSlot.findMany({
        where: {
          groundId,
          date,
          startTime: { in: requiredSlotTimes },
        },
      });

      if (slots.length !== requiredSlotTimes.length) {
        throw new Error('Slots not generated for this date');
      }

      for (const slot of slots) {
        if (slot.status !== 'AVAILABLE') {
          throw new Error(`Slot at ${slot.startTime} is already ${slot.status}`);
        }
      }

      const ground = await tx.ground.findUnique({
        where: { id: groundId },
        include: { turf: true },
      });
      if (!ground) throw new Error('Ground not found');

      // Find or create customer
      let customer = await tx.user.findFirst({
        where: { phone: customerPhone || 'walkin' },
      });

      if (!customer) {
        customer = await tx.user.create({
          data: {
            name: customerName,
            email: `walkin-${Date.now()}@turfbook.local`,
            phone: customerPhone,
            role: 'CUSTOMER',
          },
        });
      }

      const bookingCode = generateBookingCode();
      const finalAmount = totalAmount || slots.reduce((acc, s) => acc + s.price, 0);

      const qrData = encodeQRPayload({
        code: bookingCode,
        bookingId: 'manual',
        turfName: ground.turf.name,
        groundName: ground.name,
        customerName: customerName,
        date,
        time: `${startTime} - ${endTime}`,
        duration: durationHours,
        totalAmount: finalAmount,
        remainingAmount: 0,
        paymentStatus: 'PAID',
      });

      const booking = await tx.booking.create({
        data: {
          bookingCode,
          customerId: customer.id,
          turfId,
          groundId,
          date,
          startTime,
          endTime,
          durationHours,
          numberOfPlayers,
          totalAmount: finalAmount,
          advanceAmount: finalAmount,
          remainingAmount: 0,
          paymentStatus: 'PAID',
          paymentMethod: paymentMethod || 'CASH',
          status: 'CONFIRMED',
          qrCodeData: qrData,
          isManualBooking: true,
          manualCustomerName: customerName,
          manualCustomerPhone: customerPhone,
        },
      });

      await tx.timeSlot.updateMany({
        where: {
          groundId,
          date,
          startTime: { in: requiredSlotTimes },
        },
        data: {
          status: 'BOOKED',
          bookingId: booking.id,
        },
      });

      return booking;
    });

    return NextResponse.json({
      success: true,
      message: 'Manual booking created and slot blocked successfully!',
      booking: result,
    });
  } catch (error: any) {
    console.error('Error creating manual booking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
