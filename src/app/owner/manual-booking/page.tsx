'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '@/components/role-context';
import {
  PlusCircle,
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

function ManualBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useRole();

  const [grounds, setGrounds] = useState<any[]>([]);
  const [turfId, setTurfId] = useState<string>('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedGroundId, setSelectedGroundId] = useState(
    searchParams.get('groundId') || ''
  );
  const [date, setDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(
    searchParams.get('time') || '18:00'
  );
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [totalAmount, setTotalAmount] = useState<number>(800);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState<any>(null);

  useEffect(() => {
    fetch('/api/turfs')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.turfs?.length > 0) {
          const firstTurf = data.turfs[0];
          setTurfId(firstTurf.id);
          setGrounds(firstTurf.grounds);
          if (!selectedGroundId) {
            setSelectedGroundId(firstTurf.grounds[0]?.id || '');
          }
        }
      });
  }, []);

  // Update calculated total amount
  useEffect(() => {
    const ground = grounds.find((g) => g.id === selectedGroundId);
    if (ground) {
      setTotalAmount(ground.basePrice * duration);
    }
  }, [selectedGroundId, duration, grounds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedGroundId || !date || !startTime) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/owner/manual-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turfId,
          groundId: selectedGroundId,
          date,
          startTime,
          durationHours: duration,
          customerName,
          customerPhone,
          totalAmount,
          paymentMethod,
          ownerId: user.id,
        }),
      });

      const data = await res.json();

      if (data.success && data.booking) {
        setSuccessBooking(data.booking);
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          Offline & Phone Bookings
        </span>
        <h1 className="text-2xl font-black text-white mt-0.5">
          New Manual Walk-In Booking
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record cash or phone call bookings. Instantly blocks the slot in real-time to avoid double booking with online customers.
        </p>
      </div>

      {successBooking ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-emerald-800/60">
            ✓
          </div>
          <h2 className="text-xl font-bold text-white">Manual Booking Confirmed!</h2>
          <p className="text-xs text-slate-300">
            Slot reserved for <strong>{customerName}</strong> on{' '}
            <strong>{date} ({startTime})</strong>.
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-w-sm mx-auto text-xs space-y-1">
            <span className="text-slate-400 block">Generated Booking ID:</span>
            <span className="font-mono text-lg font-bold text-emerald-400 block">
              {successBooking.bookingCode}
            </span>
            <span className="text-slate-400 block">
              Payment: {paymentMethod} (₹{totalAmount})
            </span>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Link
              href={`/bookings/${successBooking.bookingCode}`}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
            >
              View / Print Pass
            </Link>
            <button
              onClick={() => {
                setSuccessBooking(null);
                setCustomerName('');
                setCustomerPhone('');
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Create Another Booking
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl text-xs"
        >
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Patil"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Customer Mobile Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98200 11223"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Ground Selection */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">
              Select Pitch / Ground *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {grounds.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setSelectedGroundId(g.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedGroundId === g.id
                      ? 'bg-emerald-950 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold">{g.name}</p>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    ₹{g.basePrice}/hr
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Booking Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Start Time *
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {Array.from({ length: 17 }, (_, i) => {
                  const h = (6 + i).toString().padStart(2, '0') + ':00';
                  return (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={3}>3 Hours</option>
              </select>
            </div>
          </div>

          {/* Payment Method & Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Payment Received Via
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="CASH">Cash at Counter</option>
                <option value="UPI">Direct UPI / GPay</option>
                <option value="CARD">Card POS Swipe</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Total Amount Charged (₹)
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Locking Slot...' : 'Confirm Walk-In & Block Slot'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ManualBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-400 text-xs">
          Loading booking form...
        </div>
      }
    >
      <ManualBookingContent />
    </Suspense>
  );
}
