import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const turfs = await prisma.turf.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        grounds: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const pending = turfs.filter((t) => !t.isApproved);
    const approved = turfs.filter((t) => t.isApproved);

    return NextResponse.json({
      success: true,
      pending,
      approved,
    });
  } catch (error: any) {
    console.error('Error fetching admin approvals:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { turfId, action } = await request.json(); // action: "APPROVE" | "REJECT"

    if (!turfId || !action) {
      return NextResponse.json(
        { success: false, error: 'turfId and action are required' },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      const turf = await prisma.turf.update({
        where: { id: turfId },
        data: { isApproved: true },
      });
      return NextResponse.json({
        success: true,
        message: 'Turf approved and published to customer marketplace!',
        turf,
      });
    } else {
      // Reject or unapprove
      const turf = await prisma.turf.update({
        where: { id: turfId },
        data: { isApproved: false },
      });
      return NextResponse.json({
        success: true,
        message: 'Turf listing rejected/delisted.',
        turf,
      });
    }
  } catch (error: any) {
    console.error('Error updating turf approval status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
