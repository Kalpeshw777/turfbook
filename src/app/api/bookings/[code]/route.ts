import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        ground: {
          include: {
            turf: true,
          },
        },
        bookingAddOns: {
          include: { addOn: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Error fetching booking by code:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
