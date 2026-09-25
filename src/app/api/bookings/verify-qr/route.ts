import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decodeQRPayload } from '@/lib/qr-helper';

export async function POST(request: Request) {
  try {
    const { qrString, bookingCode, action = 'verify' } = await request.json();

    let codeToSearch = bookingCode;

    if (qrString) {
      const decoded = decodeQRPayload(qrString);
      if (decoded?.code) {
        codeToSearch = decoded.code;
      } else {
        // In case raw booking code was passed as qrString
        codeToSearch = qrString.trim();
      }
    }

    if (!codeToSearch) {
      return NextResponse.json(
        { success: false, error: 'Valid QR payload or bookingCode is required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: codeToSearch.toUpperCase() },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
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
        { success: false, error: 'Invalid Ticket: No booking found with this code' },
        { status: 404 }
      );
    }

    if (action === 'checkin') {
      if (booking.status === 'CANCELLED') {
        return NextResponse.json(
          { success: false, error: 'Cannot check-in: Booking was cancelled' },
          { status: 400 }
        );
      }

      if (booking.status === 'CHECKED_IN') {
        return NextResponse.json(
          {
            success: true,
            alreadyCheckedIn: true,
            message: `Customer was already checked in at ${new Date(booking.checkInTime!).toLocaleTimeString()}`,
            booking,
          }
        );
      }

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CHECKED_IN',
          checkInTime: new Date(),
          remainingAmount: 0,
          paymentStatus: 'PAID', // Balance cleared at check-in
        },
        include: {
          customer: true,
          ground: { include: { turf: true } },
          bookingAddOns: { include: { addOn: true } },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Check-in successful! Ticket validated and balance cleared.',
        booking: updated,
      });
    }

    // Default verify action
    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error('QR verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
