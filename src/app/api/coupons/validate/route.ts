import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, amount = 0, turfId } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired coupon code' },
        { status: 400 }
      );
    }

    if (new Date(coupon.validUntil) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Coupon code has expired' },
        { status: 400 }
      );
    }

    if (coupon.turfId && turfId && coupon.turfId !== turfId) {
      return NextResponse.json(
        { success: false, error: 'Coupon is not valid for this turf' },
        { status: 400 }
      );
    }

    if (amount < coupon.minAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum booking amount of ₹${coupon.minAmount} required to use this coupon`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountPercent) {
      discount = (amount * coupon.discountPercent) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountAmount) {
      discount = coupon.discountAmount;
    }

    const finalDiscount = Math.min(amount, Math.round(discount));

    return NextResponse.json({
      success: true,
      message: `Coupon ${coupon.code} applied successfully!`,
      coupon: {
        code: coupon.code,
        discount: finalDiscount,
        newTotal: amount - finalDiscount,
      },
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
