import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const { teamName, captainName, captainPhone, captainEmail, playersCount = 8 } =
      await request.json();

    if (!teamName || !captainName || !captainPhone) {
      return NextResponse.json(
        { success: false, error: 'Team name, captain name and phone are required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.registrations.length >= event.maxTeams) {
      return NextResponse.json(
        { success: false, error: 'Registration full: Maximum teams reached' },
        { status: 400 }
      );
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        teamName,
        captainName,
        captainPhone,
        captainEmail: captainEmail || '',
        playersCount: parseInt(playersCount.toString(), 10),
        paymentStatus: 'PAID',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Team successfully registered for tournament!',
      registration,
    });
  } catch (error: any) {
    console.error('Error registering team for event:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
