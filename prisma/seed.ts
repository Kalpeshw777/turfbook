import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getFormattedDate(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

async function main() {
  console.log('🌱 Starting TurfBook database seed...');

  // Clean existing tables safely
  await prisma.complaint.deleteMany();
  await prisma.review.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.bookingAddOn.deleteMany();
  await prisma.addOn.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.ground.deleteMany();
  await prisma.turf.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Core Users
  const customerRahul = await prisma.user.create({
    data: {
      name: 'Rahul Patil',
      email: 'rahul@gmail.com',
      phone: '+91 98201 12345',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });

  const customerAkash = await prisma.user.create({
    data: {
      name: 'Akash Sharma',
      email: 'akash@gmail.com',
      phone: '+91 98202 23456',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  const ownerApex = await prisma.user.create({
    data: {
      name: 'Vikram Malhotra (Apex Arena)',
      email: 'owner@apexarena.com',
      phone: '+91 98765 43210',
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'TurfBook SuperAdmin',
      email: 'admin@turfbook.com',
      phone: '+91 99999 88888',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    },
  });

  console.log('✅ Created users: Customer, Owner, SuperAdmin');

  // 2. Create Turfs
  // Turf 1: Apex Sports Arena (Mumbai)
  const apexTurf = await prisma.turf.create({
    data: {
      ownerId: ownerApex.id,
      name: 'Apex Sports Arena',
      slug: 'apex-sports-arena',
      description: 'Mumbai’s premier multi-sport turf facility featuring FIFA 2-Star artificial turf, floodlights (500 Lux), premium changing rooms, and box cricket cages.',
      address: 'Plot 42, Link Road, Next to Metro Pillar 114, Andheri West',
      city: 'Mumbai',
      area: 'Andheri West',
      latitude: 19.1363,
      longitude: 72.8277,
      openTime: '06:00',
      closeTime: '23:00',
      isApproved: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80',
      ]),
      amenities: JSON.stringify([
        'FIFA 2-Star Artificial Turf',
        'Floodlights (500 Lux)',
        'Changing Rooms & Showers',
        'Free Parking (40 cars)',
        'Chilled RO Water Dispenser',
        'First Aid & Physio Kit',
        'Spectator Seating Lounge',
      ]),
    },
  });

  // Turf 2: KickOff Sports Hub (Bangalore)
  const kickoffTurf = await prisma.turf.create({
    data: {
      ownerId: ownerApex.id,
      name: 'KickOff Sports Hub',
      slug: 'kickoff-sports-hub',
      description: 'Popular high-energy sports arena in Koramangala. Equipped with top-tier turf grass, tournament cages, and equipment rentals.',
      address: '80 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      area: 'Koramangala',
      latitude: 12.9352,
      longitude: 77.6245,
      openTime: '06:00',
      closeTime: '23:00',
      isApproved: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80',
      ]),
      amenities: JSON.stringify([
        'Floodlights',
        'Locker Room',
        'Drinking Water',
        'Dugouts',
        'Two-wheeler Parking',
      ]),
    },
  });

  // Turf 3: Smash Badminton & Pickleball Dome (Mumbai)
  const smashTurf = await prisma.turf.create({
    data: {
      ownerId: ownerApex.id,
      name: 'Smash Badminton & Pickleball Dome',
      slug: 'smash-badminton-dome',
      description: 'World-class indoor air-conditioned facility with BWF certified badminton synthetic courts and dedicated USAPA approved pickleball courts.',
      address: 'Hiranandani Business Park, Powai',
      city: 'Mumbai',
      area: 'Powai',
      latitude: 19.1176,
      longitude: 72.906,
      openTime: '06:00',
      closeTime: '22:00',
      isApproved: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      ]),
      amenities: JSON.stringify([
        'Air Conditioned Courts',
        'BWF Synthetic Flooring',
        'Equipment Pro Shop',
        'Shower & Locker Facilities',
        'Physio on Call',
      ]),
    },
  });

  // Turf 4: Pending Approval Turf (To demonstrate Admin verification)
  await prisma.turf.create({
    data: {
      ownerId: ownerApex.id,
      name: 'Skyline Rooftop Turf',
      slug: 'skyline-rooftop-turf',
      description: 'Newly constructed rooftop turf in Lower Parel overlooking the skyline. Awaiting admin inspection.',
      address: '12th Floor Terrace, Phoenix Mill Compound, Lower Parel',
      city: 'Mumbai',
      area: 'Lower Parel',
      latitude: 18.9953,
      longitude: 72.8258,
      openTime: '07:00',
      closeTime: '23:00',
      isApproved: false, // PENDING APPROVAL
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80',
      ]),
      amenities: JSON.stringify(['Rooftop View', 'Floodlights', 'Cafe']),
    },
  });

  console.log('✅ Created 4 turfs across sports and approval statuses');

  // 3. Create Grounds for Apex Turf
  const groundFootball7v7 = await prisma.ground.create({
    data: {
      turfId: apexTurf.id,
      name: 'Main 7v7 Football Arena',
      sport: 'FOOTBALL',
      surfaceType: 'FIFA 2-Star Artificial Turf (50mm)',
      size: '140 x 90 ft',
      indoorOutdoor: 'Outdoor',
      basePrice: 1200,
    },
  });

  const groundFootball5v5 = await prisma.ground.create({
    data: {
      turfId: apexTurf.id,
      name: '5v5 Cage Football Ground',
      sport: 'FOOTBALL',
      surfaceType: 'FIFA Artificial Grass',
      size: '95 x 60 ft',
      indoorOutdoor: 'Outdoor',
      basePrice: 850,
    },
  });

  const groundBoxCricket = await prisma.ground.create({
    data: {
      turfId: apexTurf.id,
      name: 'Box Cricket Champions Pitch',
      sport: 'BOX_CRICKET',
      surfaceType: 'High-Density Synthetic Mat',
      size: '75 x 45 ft',
      indoorOutdoor: 'Outdoor',
      basePrice: 750,
    },
  });

  // Grounds for Smash Dome
  const groundBadminton = await prisma.ground.create({
    data: {
      turfId: smashTurf.id,
      name: 'BWF Court 1 (Badminton)',
      sport: 'BADMINTON',
      surfaceType: 'BWF Wooden Cushioned Vinyl',
      size: '44 x 20 ft',
      indoorOutdoor: 'Indoor',
      basePrice: 500,
    },
  });

  const groundPickleball = await prisma.ground.create({
    data: {
      turfId: smashTurf.id,
      name: 'Pickleball Pro Arena',
      sport: 'PICKLEBALL',
      surfaceType: 'USAPA Acrylic Cushion',
      size: '44 x 22 ft',
      indoorOutdoor: 'Indoor',
      basePrice: 600,
    },
  });

  console.log('✅ Created multi-sport grounds');

  // 4. Create Add-Ons for Apex Turf
  await prisma.addOn.createMany({
    data: [
      { turfId: apexTurf.id, name: 'Match Grade Football (Size 5)', price: 100, icon: '⚽', description: 'Official Nike / Adidas tournament ball' },
      { turfId: apexTurf.id, name: 'Team Bibs Set (14 Bibs)', price: 150, icon: '🎽', description: 'Neon green and orange reversible bibs' },
      { turfId: apexTurf.id, name: 'Certified Match Referee', price: 500, icon: '👨‍⚖️', description: 'MFA certified official referee for full match' },
      { turfId: apexTurf.id, name: 'GoPro 4K Match Recording', price: 450, icon: '📹', description: 'Full match video delivered via Google Drive link' },
      { turfId: apexTurf.id, name: 'Chilled Hydration Pack (12 Bottles)', price: 180, icon: '💧', description: 'Electrolyte and mineral water crate' },
    ],
  });

  // 5. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'FIRST20',
        discountPercent: 20,
        minAmount: 500,
        maxDiscount: 300,
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'WEEKEND10',
        discountPercent: 10,
        minAmount: 800,
        maxDiscount: 200,
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'FLAT150',
        discountAmount: 150,
        minAmount: 700,
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
    ],
  });

  console.log('✅ Created add-ons and coupons');

  // 6. Generate Time Slots for Today and Next 5 Days
  const todayStr = getFormattedDate(0);
  const tomorrowStr = getFormattedDate(1);
  const day2Str = getFormattedDate(2);
  const day3Str = getFormattedDate(3);

  const datesToSeed = [todayStr, tomorrowStr, day2Str, day3Str];
  const groundsToSeed = [groundFootball7v7, groundFootball5v5, groundBoxCricket, groundBadminton];

  for (const date of datesToSeed) {
    for (const g of groundsToSeed) {
      for (let hour = 6; hour < 23; hour++) {
        const sH = hour.toString().padStart(2, '0') + ':00';
        const eH = (hour + 1).toString().padStart(2, '0') + ':00';

        let price = g.basePrice;
        if (hour >= 6 && hour < 9) price = Math.round(g.basePrice * 0.85);
        else if (hour >= 17 && hour < 21) price = Math.round(g.basePrice * 1.35);
        else if (hour >= 21) price = Math.round(g.basePrice * 1.15);

        // Pre-mark some evening slots as BOOKED to show realistic calendar
        let status = 'AVAILABLE';
        if (date === todayStr && (hour === 18 || hour === 20) && g.id === groundFootball7v7.id) {
          status = 'BOOKED';
        }
        if (date === todayStr && hour === 19 && g.id === groundBoxCricket.id) {
          status = 'BOOKED';
        }

        await prisma.timeSlot.create({
          data: {
            groundId: g.id,
            date,
            startTime: sH,
            endTime: eH,
            price,
            status,
          },
        });
      }
    }
  }

  console.log('✅ Generated 272 dynamic time slots with realistic peak/off-peak pricing');

  // 7. Create Pre-existing Bookings with QR codes
  const booking1 = await prisma.booking.create({
    data: {
      bookingCode: 'TB-938271',
      customerId: customerRahul.id,
      turfId: apexTurf.id,
      groundId: groundFootball7v7.id,
      date: todayStr,
      startTime: '18:00',
      endTime: '19:00',
      durationHours: 1,
      numberOfPlayers: 14,
      totalAmount: 1600,
      advanceAmount: 500,
      remainingAmount: 1100,
      paymentStatus: 'ADVANCE_PAID',
      paymentMethod: 'UPI',
      status: 'CONFIRMED',
      qrCodeData: JSON.stringify({
        code: 'TB-938271',
        turf: 'Apex Sports Arena',
        ground: 'Main 7v7 Football Arena',
        customer: 'Rahul Patil',
        date: todayStr,
        time: '18:00 - 19:00',
        due: 1100,
      }),
    },
  });

  // Attach slot to booking
  await prisma.timeSlot.updateMany({
    where: {
      groundId: groundFootball7v7.id,
      date: todayStr,
      startTime: '18:00',
    },
    data: {
      bookingId: booking1.id,
      status: 'BOOKED',
    },
  });

  // Booking 2: Akash Sharma (Already Checked In earlier today)
  await prisma.booking.create({
    data: {
      bookingCode: 'TB-481920',
      customerId: customerAkash.id,
      turfId: apexTurf.id,
      groundId: groundBoxCricket.id,
      date: todayStr,
      startTime: '08:00',
      endTime: '09:00',
      durationHours: 1,
      numberOfPlayers: 10,
      totalAmount: 650,
      advanceAmount: 650,
      remainingAmount: 0,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      status: 'CHECKED_IN',
      checkInTime: new Date(),
      qrCodeData: JSON.stringify({
        code: 'TB-481920',
        turf: 'Apex Sports Arena',
        ground: 'Box Cricket Champions Pitch',
        customer: 'Akash Sharma',
        date: todayStr,
        time: '08:00 - 09:00',
        due: 0,
      }),
    },
  });

  console.log('✅ Created sample bookings with QR codes');

  // 8. Create Tournaments & Events
  const eventFootball = await prisma.event.create({
    data: {
      turfId: apexTurf.id,
      title: 'Mumbai Monsoon Football Cup 2026',
      sport: 'FOOTBALL',
      bannerImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      description: 'The biggest corporate & club 7v7 knockout championship in Western Mumbai! Certified referees, live streaming, trophies, and cash prizes.',
      eventDate: getFormattedDate(7),
      startTime: '09:00',
      endTime: '21:00',
      entryFee: 1500,
      prizePool: 25000,
      maxTeams: 16,
      status: 'UPCOMING',
      rules: '7 players on field + 3 substitutes. Rolling subs allowed. 20-minute halves. Yellow/Red card disciplinary rules strictly enforced.',
    },
  });

  await prisma.eventRegistration.createMany({
    data: [
      {
        eventId: eventFootball.id,
        teamName: 'Bandra Strikers FC',
        captainName: 'Kunal Roy',
        captainPhone: '+91 98331 44556',
        captainEmail: 'kunal@bandrastrikers.com',
        playersCount: 10,
        paymentStatus: 'PAID',
      },
      {
        eventId: eventFootball.id,
        teamName: 'Andheri Titans',
        captainName: 'Farhan Shaikh',
        captainPhone: '+91 97690 12345',
        captainEmail: 'farhan@andherititans.in',
        playersCount: 9,
        paymentStatus: 'PAID',
      },
    ],
  });

  const eventCricket = await prisma.event.create({
    data: {
      turfId: apexTurf.id,
      title: 'Apex Box Cricket Super League',
      sport: 'BOX_CRICKET',
      bannerImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
      description: 'Exciting 6-over tennis ball indoor box tournament under floodlights. High voltage cricket with prize money & man of the match trophies.',
      eventDate: getFormattedDate(10),
      startTime: '16:00',
      endTime: '23:00',
      entryFee: 1200,
      prizePool: 18000,
      maxTeams: 12,
      status: 'UPCOMING',
      rules: '6 overs per innings. Direct hit out of cage boundary is 6. Net catches are out. Fast bowling allowed under shoulder height.',
    },
  });

  console.log('✅ Created tournaments & team registrations');

  // 9. Create Reviews
  await prisma.review.createMany({
    data: [
      {
        turfId: apexTurf.id,
        customerId: customerRahul.id,
        rating: 5,
        comment: 'Top quality 7v7 pitch! The 50mm artificial turf has incredible bounce and no joint strain. Floodlights are bright and parking is super convenient.',
        ownerReply: 'Thanks Rahul! Excited to host your team every weekend!',
      },
      {
        turfId: apexTurf.id,
        customerId: customerAkash.id,
        rating: 4,
        comment: 'Box cricket netting is in pristine condition. Great music system and chilled energy drinks at the counter.',
      },
    ],
  });

  // 10. Create Sample Complaint for Admin ticketing demo
  await prisma.complaint.create({
    data: {
      ticketNumber: 'TKT-10281',
      turfId: kickoffTurf.id,
      customerId: customerRahul.id,
      bookingCode: 'TB-918234',
      subject: 'Lights flickered during 8 PM slot',
      description: 'Two floodlight towers went off for 15 minutes during our game due to power fluctuation.',
      status: 'INVESTIGATING',
    },
  });

  console.log('🎉 Seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
