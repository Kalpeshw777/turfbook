import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateBookingCode, encodeQRPayload } from '@/lib/qr-helper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const turfId = searchParams.get('turfId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (customerId) whereClause.customerId = customerId;
    if (turfId) whereClause.turfId = turfId;
    if (date) whereClause.date = date;
    if (status) whereClause.status = status;

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        ground: { select: { id: true, name: true, sport: true } },
        bookingAddOns: {
          include: { addOn: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      turfId,
      groundId,
      date,
      startTime,
      durationHours = 1,
      numberOfPlayers = 10,
      addOns = [], // Array of { id: string, quantity: number }
      couponCode,
      paymentType = 'FULL', // 'FULL' | 'ADVANCE'
      paymentMethod = 'UPI',
    } = body;

    if (!customerId || !turfId || !groundId || !date || !startTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    // Calculate all required consecutive hourly slot start times
    const startH = parseInt(startTime.split(':')[0], 10);
    const requiredSlotTimes: string[] = [];
    for (let i = 0; i < durationHours; i++) {
      const h = startH + i;
      requiredSlotTimes.push(h.toString().padStart(2, '0') + ':00');
    }
    const endH = startH + durationHours;
    const endTime = endH.toString().padStart(2, '0') + ':00';

    // ATOMIC TRANSACTION: Guarantees zero double-booking
    const bookingResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch and lock the target slots
      const slots = await tx.timeSlot.findMany({
        where: {
          groundId,
          date,
          startTime: { in: requiredSlotTimes },
        },
      });

      // Verify that all requested slots exist
      if (slots.length !== requiredSlotTimes.length) {
        throw new Error('MISSING_SLOTS: One or more requested slots do not exist');
      }

      // Check strictly if any requested slot is already taken
      for (const slot of slots) {
        if (slot.status !== 'AVAILABLE') {
          throw new Error(
            `SLOT_UNAVAILABLE: Slot at ${slot.startTime} is already ${slot.status}`
          );
        }
      }

      // 2. Fetch Ground and Turf details
      const ground = await tx.ground.findUnique({
        where: { id: groundId },
        include: { turf: true },
      });
      if (!ground) throw new Error('Ground not found');

      // 3. Fetch Customer
      const customer = await tx.user.findUnique({
        where: { id: customerId },
      });
      if (!customer) throw new Error('Customer not found');

      // 4. Calculate Slots Subtotal
      const slotsSubtotal = slots.reduce((acc, s) => acc + s.price, 0);

      // 5. Calculate Add-ons Subtotal
      let addOnsTotal = 0;
      const addOnItemsToCreate: Array<{ addOnId: string; quantity: number; price: number }> = [];

      if (addOns && addOns.length > 0) {
        for (const item of addOns) {
          if (item.quantity > 0) {
            const addOnDoc = await tx.addOn.findUnique({ where: { id: item.id } });
            if (addOnDoc) {
              const itemPrice = addOnDoc.price * item.quantity;
              addOnsTotal += itemPrice;
              addOnItemsToCreate.push({
                addOnId: addOnDoc.id,
                quantity: item.quantity,
                price: addOnDoc.price,
              });
            }
          }
        }
      }

      let totalAmount = slotsSubtotal + addOnsTotal;

      // 6. Apply Coupon if provided
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.trim().toUpperCase() },
        });

        if (coupon && coupon.isActive && new Date(coupon.validUntil) >= new Date()) {
          if (totalAmount >= coupon.minAmount) {
            let discount = 0;
            if (coupon.discountPercent) {
              discount = (totalAmount * coupon.discountPercent) / 100;
              if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
              }
            } else if (coupon.discountAmount) {
              discount = coupon.discountAmount;
            }
            totalAmount = Math.max(0, totalAmount - Math.round(discount));
          }
        }
      }

      // 7. Calculate Advance vs Full Payment
      let advanceAmount = totalAmount;
      let remainingAmount = 0;
      let paymentStatus = 'PAID';

      if (paymentType === 'ADVANCE') {
        advanceAmount = Math.round(totalAmount * 0.3); // 30% advance token
        remainingAmount = totalAmount - advanceAmount;
        paymentStatus = 'ADVANCE_PAID';
      }

      // 8. Generate unique booking code
      const bookingCode = generateBookingCode();

      // 9. Generate QR Code Payload
      const qrData = encodeQRPayload({
        code: bookingCode,
        bookingId: 'pending',
        turfName: ground.turf.name,
        groundName: ground.name,
        customerName: customer.name,
        date,
        time: `${startTime} - ${endTime}`,
        duration: durationHours,
        totalAmount,
        remainingAmount,
        paymentStatus,
      });

      // 10. Create the Booking Record
      const createdBooking = await tx.booking.create({
        data: {
          bookingCode,
          customerId,
          turfId,
          groundId,
          date,
          startTime,
          endTime,
          durationHours,
          numberOfPlayers,
          totalAmount,
          advanceAmount,
          remainingAmount,
          paymentStatus,
          paymentMethod,
          status: 'CONFIRMED',
          qrCodeData: qrData,
          bookingAddOns: {
            create: addOnItemsToCreate,
          },
        },
        include: {
          ground: true,
          bookingAddOns: { include: { addOn: true } },
          customer: { select: { name: true, email: true, phone: true } },
        },
      });

      // 11. Atomically update all requested slots to BOOKED
      await tx.timeSlot.updateMany({
        where: {
          groundId,
          date,
          startTime: { in: requiredSlotTimes },
        },
        data: {
          status: 'BOOKED',
          bookingId: createdBooking.id,
        },
      });

      return createdBooking;
    });

    return NextResponse.json({
      success: true,
      booking: bookingResult,
      message: 'Booking confirmed successfully!',
    });
  } catch (error: any) {
    console.error('Booking creation error:', error.message);

    // If slot collision occurred, return HTTP 409 Conflict
    if (error.message.includes('SLOT_UNAVAILABLE') || error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slot collision: This time slot was just booked by another player. Please select another slot.',
          code: 'SLOT_COLLISION',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
