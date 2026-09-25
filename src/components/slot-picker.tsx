'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Sparkles, Check } from 'lucide-react';

export interface SlotPickerProps {
  grounds: Array<{
    id: string;
    name: string;
    sport: string;
    surfaceType: string;
    size: string;
    basePrice: number;
  }>;
  onSlotSelected: (selection: {
    ground: any;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalSlotPrice: number;
    slots: any[];
  } | null) => void;
}

export default function SlotPicker({ grounds, onSlotSelected }: SlotPickerProps) {
  const [selectedGroundId, setSelectedGroundId] = useState<string>(grounds[0]?.id || '');
  const [duration, setDuration] = useState<number>(1); // 1, 2, 3 hours

  // Generate next 7 days for the date strip
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNumber, month };
  });

  const [selectedDate, setSelectedDate] = useState<string>(dates[0].dateStr);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);

  const selectedGround = grounds.find((g) => g.id === selectedGroundId) || grounds[0];

  // Fetch slots whenever ground or date changes
  useEffect(() => {
    if (!selectedGroundId || !selectedDate) return;
    setLoading(true);
    setSelectedStartTime(null);
    onSlotSelected(null);

    fetch(`/api/slots?groundId=${selectedGroundId}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSlots(data.slots);
        }
      })
      .catch((err) => console.error('Error fetching slots:', err))
      .finally(() => setLoading(false));
  }, [selectedGroundId, selectedDate]);

  // Handle slot click
  const handleSlotClick = (slot: any) => {
    if (slot.status !== 'AVAILABLE') return;

    // Check if consecutive slots for duration are available
    const startIndex = slots.findIndex((s) => s.startTime === slot.startTime);
    if (startIndex === -1) return;

    if (startIndex + duration > slots.length) {
      alert(`Cannot book ${duration} hours at this time: Grounds close at ${slots[slots.length - 1].endTime}`);
      return;
    }

    const contiguousSlots = slots.slice(startIndex, startIndex + duration);
    const hasUnavailable = contiguousSlots.some((s) => s.status !== 'AVAILABLE');

    if (hasUnavailable) {
      alert(`The consecutive ${duration}-hour slot cannot be booked because one of the hours is already reserved.`);
      return;
    }

    setSelectedStartTime(slot.startTime);
    const totalSlotPrice = contiguousSlots.reduce((acc, s) => acc + s.price, 0);
    const endTime = contiguousSlots[contiguousSlots.length - 1].endTime;

    onSlotSelected({
      ground: selectedGround,
      date: selectedDate,
      startTime: slot.startTime,
      endTime,
      duration,
      totalSlotPrice,
      slots: contiguousSlots,
    });
  };

  // Group slots by time bands
  const morningSlots = slots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    return h >= 6 && h < 12;
  });
  const afternoonSlots = slots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    return h >= 12 && h < 17;
  });
  const eveningSlots = slots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    return h >= 17 && h < 21;
  });
  const nightSlots = slots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    return h >= 21;
  });

  const isSlotSelected = (slot: any) => {
    if (!selectedStartTime) return false;
    const startIndex = slots.findIndex((s) => s.startTime === selectedStartTime);
    const currIndex = slots.findIndex((s) => s.startTime === slot.startTime);
    return currIndex >= startIndex && currIndex < startIndex + duration;
  };

  const renderSlotGrid = (slotList: any[]) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {slotList.map((slot) => {
          const isSelected = isSlotSelected(slot);
          const isBooked = slot.status === 'BOOKED';
          const isBlocked = slot.status === 'BLOCKED' || slot.status === 'MAINTENANCE';

          return (
            <button
              key={slot.id || slot.startTime}
              disabled={isBooked || isBlocked}
              onClick={() => handleSlotClick(slot)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 relative ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40 scale-[1.02] ring-2 ring-emerald-400'
                  : isBooked
                  ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : isBlocked
                  ? 'bg-amber-950/20 border-amber-900/40 text-amber-500/70 cursor-not-allowed'
                  : 'bg-slate-800/80 border-slate-700/80 text-white hover:border-emerald-500/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {slot.startTime}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                {isBooked && (
                  <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded">
                    Booked
                  </span>
                )}
                {isBlocked && (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                    Blocked
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-400">
                  {isBooked ? 'Unavailable' : `${slot.endTime}`}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-emerald-400'
                  }`}
                >
                  ₹{slot.price}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Check Real-Time Availability
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select pitch, date, and duration to book instant confirmed slots
          </p>
        </div>

        {/* Duration Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-medium pl-2 pr-1">Duration:</span>
          {[1, 2, 3].map((hr) => (
            <button
              key={hr}
              onClick={() => {
                setDuration(hr);
                setSelectedStartTime(null);
                onSlotSelected(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                duration === hr
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {hr} hr{hr > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Ground Tabs */}
      <div className="mt-5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Select Ground / Court:
        </label>
        <div className="flex flex-wrap gap-2">
          {grounds.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroundId(g.id)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedGroundId === g.id
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{g.sport === 'FOOTBALL' ? '⚽' : g.sport === 'BOX_CRICKET' ? '🏏' : '🏸'}</span>
              <span>{g.name}</span>
              <span className="text-[10px] text-slate-400">({g.size})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Carousel Strip */}
      <div className="mt-6">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Select Date:
        </label>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {dates.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => setSelectedDate(d.dateStr)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border text-center transition-all min-w-[85px] ${
                selectedDate === d.dateStr
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <span className="text-[11px] block font-medium opacity-90">{d.dayName}</span>
              <span className="text-lg font-bold block my-0.5">{d.dayNumber}</span>
              <span className="text-[10px] uppercase tracking-wider block opacity-75">{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slot Matrix */}
      <div className="mt-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Checking live slot availability...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No slots available for this date.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Morning */}
            {morningSlots.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>🌅</span> Morning Saver Slots (06:00 - 12:00)
                </h4>
                {renderSlotGrid(morningSlots)}
              </div>
            )}

            {/* Afternoon */}
            {afternoonSlots.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>☀️</span> Afternoon Standard (12:00 - 17:00)
                </h4>
                {renderSlotGrid(afternoonSlots)}
              </div>
            )}

            {/* Evening */}
            {eveningSlots.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>⚡</span> Prime Floodlight Evening (17:00 - 21:00)
                </h4>
                {renderSlotGrid(eveningSlots)}
              </div>
            )}

            {/* Night */}
            {nightSlots.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>🌙</span> Late Night Rush (21:00 - 23:00)
                </h4>
                {renderSlotGrid(nightSlots)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-400" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800 opacity-60" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-950 border border-amber-900" />
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
}
