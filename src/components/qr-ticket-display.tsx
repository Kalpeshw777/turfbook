'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  MessageCircle,
  XCircle,
} from 'lucide-react';

export interface QRTicketDisplayProps {
  booking: any;
  onCancelled?: () => void;
}

export default function QRTicketDisplay({ booking, onCancelled }: QRTicketDisplayProps) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelResult, setCancelResult] = useState<string | null>(null);

  const turf = booking.ground?.turf || {};
  const isCancelled = booking.status === 'CANCELLED';
  const isCheckedIn = booking.status === 'CHECKED_IN';

  // Calculate refund eligibility
  const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
  const hoursUntil = (bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);

  let refundEstimate = '0%';
  if (hoursUntil >= 24) refundEstimate = '100% (Full Refund)';
  else if (hoursUntil >= 12) refundEstimate = '50% Refund';
  else refundEstimate = '0% (Less than 12h)';

  const handleShareWhatsApp = () => {
    const text = `⚽ TurfBook Match Confirmation!\n\nGround: ${turf.name} - ${booking.ground?.name}\nDate: ${booking.date}\nTime: ${booking.startTime} - ${booking.endTime}\nBooking Code: ${booking.bookingCode}\nTotal: ₹${booking.totalAmount}\nSee you on the pitch! 🏆`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: booking.bookingCode,
          reason: cancelReason || 'Customer requested',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelResult(data.message);
        setTimeout(() => {
          setCancelModalOpen(false);
          if (onCancelled) onCancelled();
          else window.location.reload();
        }, 1500);
      } else {
        alert(data.error || 'Failed to cancel');
      }
    } catch (err: any) {
      alert(err.message || 'Error cancelling booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Top Banner */}
      <div
        className={`p-6 text-center text-white ${
          isCancelled
            ? 'bg-rose-950/70 border-b border-rose-900/60'
            : isCheckedIn
            ? 'bg-teal-950/70 border-b border-teal-900/60'
            : 'bg-emerald-950/70 border-b border-emerald-900/60'
        }`}
      >
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isCancelled
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : isCheckedIn
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {isCancelled ? (
            <>
              <XCircle className="w-3.5 h-3.5" /> Cancelled
            </>
          ) : isCheckedIn ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked In & Playing
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Booking Confirmed
            </>
          )}
        </span>

        <h2 className="text-2xl font-black mt-2 text-white">
          {turf.name || 'Sports Arena'}
        </h2>
        <p className="text-xs text-slate-300 font-medium mt-0.5">
          {booking.ground?.name}
        </p>

        <div className="mt-4 inline-block bg-slate-900/80 px-4 py-1.5 rounded-xl border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
            Booking ID
          </span>
          <span className="text-base font-mono font-bold tracking-wider text-emerald-400">
            {booking.bookingCode}
          </span>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="p-6 flex flex-col items-center justify-center border-b border-dashed border-slate-800 bg-slate-950/40">
        <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800">
          <QRCodeSVG
            value={booking.qrCodeData || booking.bookingCode}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          Show this QR code to the turf manager at the venue reception
        </p>
      </div>

      {/* Booking Details Grid */}
      <div className="p-6 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Match Date
            </span>
            <p className="text-white font-bold text-sm mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {booking.date}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Slot Time
            </span>
            <p className="text-white font-bold text-sm mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {booking.startTime} - {booking.endTime}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Players
            </span>
            <p className="text-white font-semibold mt-0.5">
              {booking.numberOfPlayers} Players
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Duration
            </span>
            <p className="text-white font-semibold mt-0.5">
              {booking.durationHours} Hour{booking.durationHours > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Address */}
        {turf.address && (
          <div className="flex items-start gap-2 text-slate-300 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Venue Location:</span>
              <span>{turf.address}, {turf.area}, {turf.city}</span>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span>Total Amount:</span>
            <span className="font-bold text-white text-sm">₹{booking.totalAmount}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Amount Paid:</span>
            <span className="font-semibold text-emerald-400">
              ₹{booking.advanceAmount || booking.totalAmount} ({booking.paymentMethod})
            </span>
          </div>

          {booking.remainingAmount > 0 && (
            <div className="flex justify-between items-center bg-amber-950/30 p-2 rounded-lg text-amber-300 font-semibold border border-amber-800/40">
              <span>Pending Due at Venue:</span>
              <span>₹{booking.remainingAmount}</span>
            </div>
          )}

          {booking.refundAmount && booking.refundAmount > 0 && (
            <div className="flex justify-between items-center bg-rose-950/40 p-2 rounded-lg text-rose-300 font-semibold border border-rose-800/40">
              <span>Refund Processed:</span>
              <span>₹{booking.refundAmount}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </button>

          {!isCancelled && !isCheckedIn && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="py-3 px-4 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800 text-slate-400 font-medium rounded-xl border border-slate-700 transition-colors"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Cancel Booking?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Based on the venue policy:
              <br />• &gt;24 hours before match: <strong>100% Refund</strong>
              <br />• 12–24 hours before match: <strong>50% Refund</strong>
              <br />• &lt;12 hours: <strong>No Refund</strong>
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-emerald-400 font-semibold">
              Current Refund Eligibility: {refundEstimate}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Reason for cancellation:
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Rain, player injured, change in plan..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 h-20"
              />
            </div>

            {cancelResult && (
              <p className="text-xs text-emerald-400 font-medium">{cancelResult}</p>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
