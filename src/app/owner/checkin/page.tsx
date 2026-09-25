'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  DollarSign,
  Sparkles,
} from 'lucide-react';

export default function OwnerCheckInPage() {
  const [inputCode, setInputCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const handleVerify = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setScanning(true);
    setError('');
    setCheckInSuccess(false);

    try {
      const res = await fetch('/api/bookings/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode: codeToSearch.trim(), action: 'verify' }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBookingData(data.booking);
      } else {
        setError(data.error || 'Invalid booking ticket');
        setBookingData(null);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!bookingData) return;
    setScanning(true);
    try {
      const res = await fetch('/api/bookings/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode: bookingData.bookingCode, action: 'checkin' }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckInSuccess(true);
        setBookingData(data.booking);
      } else {
        setError(data.error || 'Check-in failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          Venue Access Control
        </span>
        <h1 className="text-2xl font-black text-white mt-0.5">
          Customer Check-In & QR Scanner
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Scan the player's mobile pass or enter their Booking ID to verify advance payment and record arrival.
        </p>
      </div>

      {/* Code Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <label className="text-xs font-semibold text-slate-300 block">
          Enter Customer Booking ID or Scan Payload:
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <QrCode className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify(inputCode)}
              placeholder="e.g. TB-938271"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white uppercase font-mono placeholder:font-sans placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => handleVerify(inputCode)}
            disabled={scanning || !inputCode}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {scanning ? 'Verifying...' : 'Validate Pass'}
          </button>
        </div>

        {/* Demo Fast Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Quick Test Passes:</span>
          <button
            type="button"
            onClick={() => {
              setInputCode('TB-938271');
              handleVerify('TB-938271');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[11px] border border-slate-700"
          >
            TB-938271 (Rahul - Advance Paid)
          </button>
          <button
            type="button"
            onClick={() => {
              setInputCode('TB-481920');
              handleVerify('TB-481920');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-mono text-[11px] border border-slate-700"
          >
            TB-481920 (Akash - Full Paid)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Ticket Details Display */}
      {bookingData && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in">
          {checkInSuccess ? (
            <div className="p-4 bg-teal-950/60 border border-teal-800 rounded-2xl flex items-center gap-3 text-teal-300">
              <CheckCircle2 className="w-6 h-6 text-teal-400 flex-shrink-0" />
              <div>
                <strong className="block text-sm font-bold text-white">
                  Check-In Verified & Successful!
                </strong>
                <p className="text-xs">
                  Customer has entered the arena. Pending dues marked as cleared.
                </p>
              </div>
            </div>
          ) : bookingData.status === 'CHECKED_IN' ? (
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2 text-slate-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Player was already checked in at{' '}
                {new Date(bookingData.checkInTime).toLocaleTimeString()}
              </span>
            </div>
          ) : null}

          {/* Ticket Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                Validated Pass
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {bookingData.ground?.name}
              </h2>
              <span className="text-xs text-slate-400">
                Arena: {bookingData.ground?.turf?.name}
              </span>
            </div>

            <span className="font-mono text-base font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400">
              {bookingData.bookingCode}
            </span>
          </div>

          {/* Customer & Match Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase block">Player / Team</span>
              <p className="font-bold text-white text-sm">
                {bookingData.isManualBooking
                  ? bookingData.manualCustomerName
                  : bookingData.customer?.name}
              </p>
              <span className="text-slate-400">
                {bookingData.isManualBooking
                  ? bookingData.manualCustomerPhone
                  : bookingData.customer?.phone}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase block">Date & Time</span>
              <p className="font-bold text-white text-sm">{bookingData.date}</p>
              <span className="text-emerald-400 font-semibold">
                {bookingData.startTime} - {bookingData.endTime} ({bookingData.durationHours} hr)
              </span>
            </div>
          </div>

          {/* Payment Status Check */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Total Match Fee:</span>
              <span className="text-white font-bold">₹{bookingData.totalAmount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Advance Paid Online:</span>
              <span className="text-emerald-400 font-bold">
                ₹{bookingData.advanceAmount} ({bookingData.paymentMethod})
              </span>
            </div>

            {bookingData.remainingAmount > 0 && !checkInSuccess && (
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-amber-300 font-bold text-sm bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/40">
                <span>Collect Balance at Counter:</span>
                <span>₹{bookingData.remainingAmount} CASH / UPI</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {bookingData.status !== 'CHECKED_IN' && !checkInSuccess && (
            <button
              onClick={handleConfirmCheckIn}
              disabled={scanning}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {bookingData.remainingAmount > 0
                  ? `Collect ₹${bookingData.remainingAmount} & Confirm Check-In`
                  : 'Confirm Player Check-In'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
