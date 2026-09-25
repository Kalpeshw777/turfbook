import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { turfId, customerId, rating, comment } = await request.json();

    if (!turfId || !customerId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required review fields' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        turfId,
        customerId,
        rating: parseInt(rating.toString(), 10),
        comment: comment || '',
      },
      include: {
        customer: { select: { name: true, avatar: true } },
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
