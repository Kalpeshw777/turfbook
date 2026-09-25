import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDailySlots } from '@/lib/slot-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groundId = searchParams.get('groundId');
    const date = searchParams.get('date');

    if (!groundId || !date) {
      return NextResponse.json(
        { success: false, error: 'groundId and date are required' },
        { status: 400 }
      );
    }

    const ground = await prisma.ground.findUnique({
      where: { id: groundId },
      include: {
        turf: true,
        pricingRules: true,
      },
    });

    if (!ground) {
      return NextResponse.json(
        { success: false, error: 'Ground not found' },
        { status: 404 }
      );
    }

    // Check if slots exist for this ground and date
    let slots = await prisma.timeSlot.findMany({
      where: {
        groundId,
        date,
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            customer: { select: { name: true, phone: true } },
            status: true,
            isManualBooking: true,
            manualCustomerName: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // If slots not yet generated for this date, generate them on the fly
    if (slots.length === 0) {
      const generated = generateDailySlots(
        ground.turf.openTime,
        ground.turf.closeTime,
        ground.basePrice,
        date,
        ground.pricingRules
      );

      // Create them in DB
      await prisma.timeSlot.createMany({
        data: generated.map((s) => ({
          groundId,
          date,
          startTime: s.startTime,
          endTime: s.endTime,
          price: s.price,
          status: 'AVAILABLE',
        })),
      });

      // Refetch with created IDs
      slots = await prisma.timeSlot.findMany({
        where: { groundId, date },
        orderBy: { startTime: 'asc' },
      }) as any;
    }

    return NextResponse.json({
      success: true,
      ground: {
        id: ground.id,
        name: ground.name,
        sport: ground.sport,
        basePrice: ground.basePrice,
      },
      slots,
    });
  } catch (error: any) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
