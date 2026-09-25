import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const turf = await prisma.turf.findUnique({
      where: { slug },
      include: {
        grounds: {
          include: {
            pricingRules: true,
          },
        },
        addOns: {
          where: { isAvailable: true },
        },
        coupons: {
          where: { isActive: true },
        },
        reviews: {
          include: {
            customer: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        pricingRules: true,
      },
    });

    if (!turf) {
      return NextResponse.json(
        { success: false, error: 'Turf not found' },
        { status: 404 }
      );
    }

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
        : 4.8;

    return NextResponse.json({
      success: true,
      turf: {
        ...turf,
        images,
        amenities,
        averageRating: avgRating,
        reviewsCount: turf.reviews.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching turf details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
