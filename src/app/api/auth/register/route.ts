import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, phone, role = 'CUSTOMER', password, turfName } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Full name and email are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Create user
    const userRole = role === 'OWNER' ? 'OWNER' : 'CUSTOMER';
    const avatar =
      userRole === 'OWNER'
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null,
        role: userRole,
        avatar,
      },
    });

    // If registered as a Turf Owner, optionally create their initial pending turf
    if (userRole === 'OWNER' && turfName) {
      const slug = turfName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
      await prisma.turf.create({
        data: {
          ownerId: user.id,
          name: turfName.trim(),
          slug,
          description: `Sports facility managed by ${user.name}`,
          address: 'Main Sports Road',
          city: 'Mumbai',
          area: 'West Zone',
          isApproved: false, // Requires admin approval
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
          ]),
          amenities: JSON.stringify(['Floodlights', 'Drinking Water', 'Parking']),
          grounds: {
            create: [
              {
                name: 'Main Ground (Multi-Sport)',
                sport: 'FOOTBALL',
                surfaceType: 'FIFA Artificial Turf',
                size: '100x60 ft',
                basePrice: 800,
              },
            ],
          },
        },
      });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        turfsOwned: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: fullUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
