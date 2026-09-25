'use client';

import React, { useState, useEffect } from 'react';
import { useRole } from '@/components/role-context';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-react';

export default function CustomerBookingsPage() {
  const { user } = useRole();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bookings?customerId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings);
        }
      })
      .catch((err) => console.error('Error fetching bookings:', err))
      .finally(() => setLoading(false));
  }, [user.id]);

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'UPCOMING') return b.status === 'CONFIRMED';
    if (filterTab === 'COMPLETED') return b.status === 'CHECKED_IN' || b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Player Dashboard
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">My Turf Bookings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Viewing bookings for {user.name} ({user.phone})
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['ALL', 'UPCOMING', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Fetching your matches...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-950/60 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-800/40">
            ⚽
          </div>
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            You don't have any bookings in this tab yet. Find a nearby ground and kick off a game!
          </p>
          <Link
            href="/turfs"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40"
          >
            Explore Turfs & Book Slots
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancelled = b.status === 'CANCELLED';
            const isCheckedIn = b.status === 'CHECKED_IN';

            return (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                        {b.bookingCode}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">
                        {b.ground?.name}
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isCheckedIn
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{b.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{b.startTime} - {b.endTime}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Total: <strong className="text-white">₹{b.totalAmount}</strong>
                    </span>
                    <span>
                      Status:{' '}
                      <span className="text-emerald-400 font-medium">
                        {b.paymentStatus}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/bookings/${b.bookingCode}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Digital Ticket & QR</span>
                  </Link>

                  <Link
                    href={`/bookings/${b.bookingCode}`}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
