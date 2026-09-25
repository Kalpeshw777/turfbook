import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { slotId, action } = await request.json(); // action: "BLOCK" | "UNBLOCK"

    if (!slotId) {
      return NextResponse.json(
        { success: false, error: 'slotId is required' },
        { status: 400 }
      );
    }

    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      return NextResponse.json(
        { success: false, error: 'Slot not found' },
        { status: 404 }
      );
    }

    if (action === 'BLOCK') {
      if (slot.status === 'BOOKED') {
        return NextResponse.json(
          { success: false, error: 'Cannot block a slot that has an active booking' },
          { status: 400 }
        );
      }
      const updated = await prisma.timeSlot.update({
        where: { id: slotId },
        data: { status: 'BLOCKED' },
      });
      return NextResponse.json({ success: true, slot: updated });
    } else {
      const updated = await prisma.timeSlot.update({
        where: { id: slotId },
        data: { status: 'AVAILABLE' },
      });
      return NextResponse.json({ success: true, slot: updated });
    }
  } catch (error: any) {
    console.error('Error modifying slot block status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
