import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { bookingCode, reason } = await request.json();

    if (!bookingCode) {
      return NextResponse.json(
        { success: false, error: 'bookingCode is required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        timeSlots: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a booking that has already started or completed' },
        { status: 400 }
      );
    }

    // Calculate time difference until booking start
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
    const now = new Date();
    const hoursRemaining = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Tiered refund calculation
    let refundPercentage = 0;
    if (hoursRemaining >= 24) {
      refundPercentage = 100;
    } else if (hoursRemaining >= 12) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    const refundAmount = Math.round((booking.advanceAmount * refundPercentage) / 100);

    // Atomic cancellation & slot release
    await prisma.$transaction(async (tx) => {
      // 1. Release slots back to AVAILABLE
      await tx.timeSlot.updateMany({
        where: { bookingId: booking.id },
        data: {
          status: 'AVAILABLE',
          bookingId: null,
        },
      });

      // 2. Mark booking as CANCELLED
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          refundAmount,
          cancellationReason: reason || 'Customer requested cancellation',
          paymentStatus: refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Booking cancelled successfully. Refund of ₹${refundAmount} (${refundPercentage}%) initiated to original payment source.`,
      refundPercentage,
      refundAmount,
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
