import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        turf: { select: { id: true, name: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, complaints });
  } catch (error: any) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { complaintId, status, adminResolution } = await request.json();

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status, // "OPEN", "INVESTIGATING", "RESOLVED"
        adminResolution,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint status updated',
      complaint: updated,
    });
  } catch (error: any) {
    console.error('Error updating complaint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
