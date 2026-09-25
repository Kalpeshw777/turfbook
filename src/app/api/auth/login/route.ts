import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password, isGoogle, googleName, googleEmail } = await request.json();

    // Google Sign-In Flow
    if (isGoogle && googleEmail) {
      let user = await prisma.user.findUnique({
        where: { email: googleEmail.toLowerCase() },
        include: {
          turfsOwned: { select: { id: true, name: true, slug: true } },
        },
      });

      if (!user) {
        // Create new user from Google profile
        user = await prisma.user.create({
          data: {
            name: googleName || 'Google User',
            email: googleEmail.toLowerCase(),
            role: 'CUSTOMER',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
          include: {
            turfsOwned: { select: { id: true, name: true, slug: true } },
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Google login successful!',
        user,
      });
    }

    // Standard Email Login Flow
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email or Mobile number is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: email.trim() },
        ],
      },
      include: {
        turfsOwned: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email or mobile number.' },
        { status: 404 }
      );
    }

    // For password checking: in this demo setup, allow login
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
