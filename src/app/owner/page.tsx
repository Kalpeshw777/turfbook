'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  QrCode,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useRole } from '@/components/role-context';

export default function OwnerDashboardPage() {
  const { user } = useRole();
  const [analytics, setAnalytics] = useState<any>(null);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/owner/analytics').then((r) => r.json()),
      fetch(`/api/bookings?date=${todayStr}`).then((r) => r.json()),
    ])
      .then(([analyticsData, bookingsData]) => {
        if (analyticsData.success) {
          setAnalytics(analyticsData);
        }
        if (bookingsData.success) {
          setTodayBookings(bookingsData.bookings);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = analytics?.stats || {
    todayBookingsCount: 0,
    todayRevenue: 0,
    upcomingBookingsCount: 0,
    cancelledCount: 0,
    availableSlotsCount: 0,
    occupancyRate: 0,
  };

  const handleQuickCheckIn = async (bookingCode: string) => {
    try {
      const res = await fetch('/api/bookings/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode, action: 'checkin' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Checked in successfully! Balance cleared.`);
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to check-in');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Live Operating Dashboard
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time arena overview for {user.turfName || 'Apex Sports Arena'} • Today is {todayStr}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/owner/manual-booking"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manual Walk-In</span>
          </Link>

          <Link
            href="/owner/checkin"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Scan QR Pass</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Bookings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Today's Bookings
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">
              {stats.todayBookingsCount}
            </span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1">
            {stats.upcomingBookingsCount} upcoming this week
          </span>
        </div>

        {/* Today Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Today's Revenue
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">
              ₹{stats.todayRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
              +14% vs avg
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1">
            Settled via UPI, Card & Cash
          </span>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Arena Occupancy
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">
              {stats.occupancyRate}%
            </span>
            <span className="text-xs text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded">
              Peak Hours
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1">
            {stats.availableSlotsCount} slots left open today
          </span>
        </div>

        {/* Cancellations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Cancellations
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">
              {stats.cancelledCount}
            </span>
            <span className="text-xs text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
              Slots Re-opened
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-1">
            Automatic refund rules applied
          </span>
        </div>
      </div>

      {/* Today's Live Pitch Schedule */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Today's Match Roster
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customers, booked pitches, advance payment status, and 1-click check-in
            </p>
          </div>

          <Link
            href="/owner/calendar"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading schedule...</div>
        ) : todayBookings.length === 0 ? (
          <div className="text-center py-12 bg-slate-950 rounded-2xl border border-slate-800 p-6">
            <p className="text-xs text-slate-400">No bookings scheduled for today yet.</p>
            <Link
              href="/owner/manual-booking"
              className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Add Walk-In Booking
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Ground / Pitch</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Amount & Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {todayBookings.map((b) => {
                  const isCheckedIn = b.status === 'CHECKED_IN';
                  const isCancelled = b.status === 'CANCELLED';
                  const customerName = b.isManualBooking
                    ? b.manualCustomerName || 'Walk-in Customer'
                    : b.customer?.name || 'Customer';
                  const customerPhone = b.isManualBooking
                    ? b.manualCustomerPhone || '-'
                    : b.customer?.phone || '-';

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {b.startTime} - {b.endTime}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {b.ground?.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{customerName}</span>
                        <span className="text-[10px] text-slate-400">{customerPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {b.bookingCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">₹{b.totalAmount}</span>
                        <span className="text-[10px] text-slate-400">
                          {b.paymentStatus === 'ADVANCE_PAID' ? (
                            <span className="text-amber-300 font-semibold">
                              Advance Paid (Due: ₹{b.remainingAmount})
                            </span>
                          ) : (
                            <span className="text-emerald-400">Paid in Full</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isCheckedIn
                              ? 'bg-teal-950 text-teal-300 border border-teal-800'
                              : isCancelled
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isCheckedIn && !isCancelled && (
                          <button
                            onClick={() => handleQuickCheckIn(b.bookingCode)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow transition-colors"
                          >
                            Check-In
                          </button>
                        )}
                        {isCheckedIn && (
                          <span className="text-teal-400 text-xs font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
