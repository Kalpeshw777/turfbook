import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const all = searchParams.get('all') === 'true';

    const whereClause: any = {};

    if (!all) {
      whereClause.isApproved = true;
    }

    if (city) {
      whereClause.city = { contains: city };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { area: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const turfs = await prisma.turf.findMany({
      where: whereClause,
      include: {
        grounds: true,
        reviews: {
          select: { rating: true, comment: true, createdAt: true },
        },
        addOns: {
          where: { isAvailable: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by sport if specified
    const filteredTurfs = sport
      ? turfs.filter((t) =>
          t.grounds.some(
            (g) => g.sport.toLowerCase() === sport.toLowerCase()
          )
        )
      : turfs;

    // Transform amenities and images JSON
    const formatted = filteredTurfs.map((turf) => {
      const images: string[] = JSON.parse(turf.images || '[]');
      const amenities: string[] = JSON.parse(turf.amenities || '[]');
      const avgRating =
        turf.reviews.length > 0
          ? Number(
              (
                turf.reviews.reduce((acc, r) => acc + r.rating, 0) /
                turf.reviews.length
              ).toFixed(1)
            )
          : 4.8; // default rating if new

      const minPrice =
        turf.grounds.length > 0
          ? Math.min(...turf.grounds.map((g) => g.basePrice))
          : 600;

      return {
        ...turf,
        images,
        amenities,
        averageRating: avgRating,
        reviewsCount: turf.reviews.length,
        startingPrice: minPrice,
      };
    });

    return NextResponse.json({ success: true, turfs: formatted });
  } catch (error: any) {
    console.error('Error fetching turfs:', error);
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
      ownerId,
      name,
      description,
      address,
      city,
      area,
      openTime,
      closeTime,
      images,
      amenities,
      grounds,
    } = body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const turf = await prisma.turf.create({
      data: {
        ownerId,
        name,
        slug,
        description,
        address,
        city,
        area,
        openTime: openTime || '06:00',
        closeTime: closeTime || '23:00',
        images: JSON.stringify(images || []),
        amenities: JSON.stringify(amenities || []),
        isApproved: false, // requires admin approval
        grounds: {
          create: grounds.map((g: any) => ({
            name: g.name,
            sport: g.sport,
            surfaceType: g.surfaceType,
            size: g.size,
            indoorOutdoor: g.indoorOutdoor || 'Outdoor',
            basePrice: parseFloat(g.basePrice),
          })),
        },
      },
      include: {
        grounds: true,
      },
    });

    return NextResponse.json({ success: true, turf });
  } catch (error: any) {
    console.error('Error creating turf:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
