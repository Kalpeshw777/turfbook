'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QRTicketDisplay from '@/components/qr-ticket-display';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function BookingTicketPage() {
  const params = useParams();
  const code = params.code as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooking = () => {
    setLoading(true);
    fetch(`/api/bookings/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.booking) {
          setBooking(data.booking);
        } else {
          setError(data.error || 'Booking ticket not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (code) fetchBooking();
  }, [code]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading your digital pass...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <p className="text-rose-400 font-semibold text-sm mb-4">{error}</p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            Explore Turfs
          </Link>
        </div>
      ) : (
        <div>
          <QRTicketDisplay booking={booking} onCancelled={fetchBooking} />
        </div>
      )}
    </div>
  );
}
