'use client';

import React, { useState, useEffect } from 'react';
import { useRole } from '@/components/role-context';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  PlusCircle,
  QrCode,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function OwnerCalendarPage() {
  const { user } = useRole();

  const [grounds, setGrounds] = useState<any[]>([]);
  const [selectedGroundId, setSelectedGroundId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch grounds first
  useEffect(() => {
    fetch('/api/turfs')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.turfs?.length > 0) {
          const firstTurf = data.turfs[0];
          setGrounds(firstTurf.grounds);
          setSelectedGroundId(firstTurf.grounds[0]?.id || '');
        }
      });
  }, []);

  // Fetch slots whenever ground or date changes
  const fetchSlots = () => {
    if (!selectedGroundId || !selectedDate) return;
    setLoading(true);
    fetch(`/api/slots?groundId=${selectedGroundId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSlots(data.slots);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedGroundId, selectedDate]);

  const handleToggleBlock = async (slotId: string, currentStatus: string) => {
    const action = currentStatus === 'BLOCKED' ? 'UNBLOCK' : 'BLOCK';
    try {
      const res = await fetch('/api/owner/slots/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSlots();
      } else {
        alert(data.error || 'Failed to update slot');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Arena Master Schedule
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            Hourly Booking Grid
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time schedule across all turf pitches. Block private slots or view customer bookings.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <Calendar className="w-4 h-4 text-emerald-400 ml-2" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs text-white px-2 py-1 font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* Ground Tabs */}
      <div className="flex flex-wrap gap-2">
        {grounds.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroundId(g.id)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              selectedGroundId === g.id
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {g.sport === 'FOOTBALL' ? '⚽ ' : g.sport === 'BOX_CRICKET' ? '🏏 ' : '🏸 '}
            {g.name}
          </button>
        ))}
      </div>

      {/* Schedule Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading schedule grid...
          </div>
        ) : (
          <div className="space-y-2.5">
            {slots.map((slot) => {
              const isBooked = slot.status === 'BOOKED';
              const isBlocked = slot.status === 'BLOCKED';
              const isAvailable = slot.status === 'AVAILABLE';
              const booking = slot.booking;

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isBooked
                      ? 'bg-slate-950/90 border-slate-800'
                      : isBlocked
                      ? 'bg-amber-950/20 border-amber-900/50'
                      : 'bg-slate-950/40 border-slate-800/60 hover:border-emerald-500/40'
                  }`}
                >
                  {/* Time & Status */}
                  <div className="flex items-center gap-4">
                    <div className="w-28 flex items-center gap-1.5 font-mono text-sm font-bold text-white">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>{slot.startTime}</span>
                      <span className="text-slate-500">-</span>
                      <span className="text-slate-400">{slot.endTime}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                        isBooked
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                          : isBlocked
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  {/* Customer / Slot Info */}
                  <div className="flex-1 text-xs">
                    {isBooked && booking ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-bold text-white flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          {booking.isManualBooking
                            ? booking.manualCustomerName || 'Walk-In Customer'
                            : booking.customer?.name || 'Customer'}
                        </span>
                        <span className="text-slate-400">
                          {booking.customer?.phone || '-'}
                        </span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          ID: {booking.bookingCode}
                        </span>
                      </div>
                    ) : isBlocked ? (
                      <span className="text-amber-400 text-xs font-medium">
                        Blocked for Maintenance / Private Academy Session
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">
                        Open for Online & Offline Players • Hourly Rate: ₹{slot.price}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isAvailable && (
                      <>
                        <Link
                          href={`/owner/manual-booking?groundId=${selectedGroundId}&date=${selectedDate}&time=${slot.startTime}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Walk-In</span>
                        </Link>

                        <button
                          onClick={() => handleToggleBlock(slot.id, slot.status)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Block</span>
                        </button>
                      </>
                    )}

                    {isBlocked && (
                      <button
                        onClick={() => handleToggleBlock(slot.id, slot.status)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unblock Slot</span>
                      </button>
                    )}

                    {isBooked && (
                      <Link
                        href={`/bookings/${booking?.bookingCode}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ticket</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
