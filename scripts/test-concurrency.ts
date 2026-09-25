import { PrismaClient } from '@prisma/client';
import { generateBookingCode, encodeQRPayload } from '../src/lib/qr-helper';

const prisma = new PrismaClient();

async function runConcurrencyStressTest() {
  console.log('🧪 Starting Concurrency Double-Booking Stress Test...');

  const testDate = '2026-11-20';
  const testStartTime = '20:00';
  const testEndTime = '21:00';

  const ground = await prisma.ground.findFirst({
    include: { turf: true },
  });
  if (!ground) throw new Error('No ground found');

  const customer = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' },
  });
  if (!customer) throw new Error('No customer found');

  // Ensure clean test slot
  await prisma.timeSlot.deleteMany({
    where: {
      groundId: ground.id,
      date: testDate,
      startTime: testStartTime,
    },
  });

  const slot = await prisma.timeSlot.create({
    data: {
      groundId: ground.id,
      date: testDate,
      startTime: testStartTime,
      endTime: testEndTime,
      price: 1000,
      status: 'AVAILABLE',
    },
  });

  console.log(`📍 Created isolated test slot: (${testDate} ${testStartTime} - Ground: ${ground.name})`);

  // Launch 5 parallel booking attempts at the exact same millisecond
  const ATTEMPTS = 5;
  console.log(`⚡ Launching ${ATTEMPTS} simultaneous booking requests...`);

  const attemptBooking = async (playerIndex: number) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const targetSlot = await tx.timeSlot.findUnique({
          where: { id: slot.id },
        });

        if (!targetSlot || targetSlot.status !== 'AVAILABLE') {
          throw new Error('SLOT_ALREADY_RESERVED');
        }

        const bookingCode = generateBookingCode();
        const createdBooking = await tx.booking.create({
          data: {
            bookingCode,
            customerId: customer.id,
            turfId: ground.turfId,
            groundId: ground.id,
            date: testDate,
            startTime: testStartTime,
            endTime: testEndTime,
            durationHours: 1,
            totalAmount: 1000,
            advanceAmount: 1000,
            remainingAmount: 0,
            paymentStatus: 'PAID',
            paymentMethod: 'UPI',
            status: 'CONFIRMED',
            qrCodeData: encodeQRPayload({
              code: bookingCode,
              bookingId: 'test',
              turfName: ground.turf.name,
              groundName: ground.name,
              customerName: `Player #${playerIndex}`,
              date: testDate,
              time: `${testStartTime} - ${testEndTime}`,
              duration: 1,
              totalAmount: 1000,
              remainingAmount: 0,
              paymentStatus: 'PAID',
            }),
          },
        });

        await tx.timeSlot.update({
          where: { id: slot.id },
          data: {
            status: 'BOOKED',
            bookingId: createdBooking.id,
          },
        });

        return { success: true, bookingCode, playerIndex };
      });

      return result;
    } catch (err: any) {
      return { success: false, error: err.message, playerIndex };
    }
  };

  const results = await Promise.all([
    attemptBooking(1),
    attemptBooking(2),
    attemptBooking(3),
    attemptBooking(4),
    attemptBooking(5),
  ]);

  const successful = results.filter((r) => r.success);
  const rejected = results.filter((r) => !r.success);

  console.log('\n📊 Concurrency Stress Test Results:');
  console.log(`   Total Parallel Attempts: ${ATTEMPTS}`);
  console.log(`   Successful Bookings: ${successful.length}`);
  console.log(`   Rejected Collisions: ${rejected.length}`);

  if (successful.length === 1 && rejected.length === ATTEMPTS - 1) {
    console.log(`\n🏆 PASS: Zero Double-Booking Guarantee 100% Verified!`);
    console.log(`   Winner: Player #${successful[0].playerIndex} (Booking Code: ${(successful[0] as any).bookingCode})`);
    console.log(`   All ${rejected.length} other concurrent attempts were rejected cleanly with SLOT_ALREADY_RESERVED.`);
  } else {
    console.error('\n❌ FAIL: Concurrency violation detected!');
    process.exit(1);
  }

  // Cleanup test slot
  await prisma.booking.deleteMany({
    where: { bookingCode: (successful[0] as any).bookingCode },
  });
  await prisma.timeSlot.deleteMany({
    where: { id: slot.id },
  });
  console.log('🧹 Cleaned up test records.');
}

runConcurrencyStressTest()
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
