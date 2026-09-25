import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const turfId = searchParams.get('turfId');
    const sport = searchParams.get('sport');

    const whereClause: any = {};
    if (turfId) whereClause.turfId = turfId;
    if (sport) whereClause.sport = sport.toUpperCase();

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        turf: { select: { id: true, name: true, city: true, area: true } },
        registrations: true,
      },
      orderBy: { eventDate: 'asc' },
    });

    const formatted = events.map((ev) => ({
      ...ev,
      registeredTeamsCount: ev.registrations.length,
      slotsLeft: Math.max(0, ev.maxTeams - ev.registrations.length),
    }));

    return NextResponse.json({ success: true, events: formatted });
  } catch (error: any) {
    console.error('Error fetching events:', error);
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
      turfId,
      title,
      sport,
      description,
      eventDate,
      startTime,
      endTime,
      entryFee,
      prizePool,
      maxTeams,
      rules,
      bannerImage,
    } = body;

    const event = await prisma.event.create({
      data: {
        turfId,
        title,
        sport: sport.toUpperCase(),
        description,
        eventDate,
        startTime,
        endTime,
        entryFee: parseFloat(entryFee),
        prizePool: parseFloat(prizePool),
        maxTeams: parseInt(maxTeams, 10),
        rules: rules || 'Standard sports rules apply.',
        bannerImage:
          bannerImage ||
          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
