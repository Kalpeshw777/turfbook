'use client';

import React, { useState } from 'react';
import { useRole } from './role-context';
import { useRouter } from 'next/navigation';
import {
  X,
  CreditCard,
  Tag,
  ShieldAlert,
  Users,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  turf: any;
  selection: {
    ground: any;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalSlotPrice: number;
    slots: any[];
  };
}

export default function CheckoutModal({
  isOpen,
  onClose,
  turf,
  selection,
}: CheckoutModalProps) {
  const router = useRouter();
  const { user } = useRole();

  const [playersCount, setPlayersCount] = useState<number>(10);
  const [selectedAddOns, setSelectedAddOns] = useState<{ [id: string]: number }>({});
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<'FULL' | 'ADVANCE'>('FULL');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  if (!isOpen) return null;

  // Addons calculations
  const addOnsList = turf.addOns || [];
  const addOnsTotal = Object.entries(selectedAddOns).reduce((sum, [id, qty]) => {
    const item = addOnsList.find((a: any) => a.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const rawSubtotal = selection.totalSlotPrice + addOnsTotal;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, rawSubtotal - discount);

  const advanceAmount = paymentType === 'ADVANCE' ? Math.round(grandTotal * 0.3) : grandTotal;
  const remainingAmount = grandTotal - advanceAmount;

  const handleToggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => {
      const current = prev[id] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          amount: rawSubtotal,
          turfId: turf.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({
          code: data.coupon.code,
          discount: data.coupon.discount,
        });
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Error validating coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const formattedAddOns = Object.entries(selectedAddOns).map(([id, quantity]) => ({
        id,
        quantity,
      }));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          turfId: turf.id,
          groundId: selection.ground.id,
          date: selection.date,
          startTime: selection.startTime,
          durationHours: selection.duration,
          numberOfPlayers: playersCount,
          addOns: formattedAddOns,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          paymentType,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.success && data.booking) {
        onClose();
        router.push(`/bookings/${data.booking.bookingCode}`);
      } else {
        setSubmitError(data.error || 'Booking failed');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Slot Checkout
            </span>
            <h3 className="text-lg font-bold text-white">Review & Complete Booking</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 space-y-6">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Booking Conflict</strong>
                <span>{submitError}</span>
              </div>
            </div>
          )}

          {/* Booking Summary Card */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold text-white text-sm">{turf.name}</h4>
              <span className="text-xs font-semibold text-emerald-400">
                {selection.ground.name}
              </span>
            </div>
            <div className="text-xs text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
              <span>📅 {selection.date}</span>
              <span>
                ⏰ {selection.startTime} - {selection.endTime} ({selection.duration} hr
                {selection.duration > 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Number of Players */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Estimated Number of Players:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setPlayersCount(Math.max(2, playersCount - 1))}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold text-white">{playersCount}</span>
                <button
                  onClick={() => setPlayersCount(playersCount + 1)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-400">players</span>
            </div>
          </div>

          {/* Add-On Services */}
          {addOnsList.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Add-On Equipment & Services:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {addOnsList.map((addon: any) => {
                  const isChecked = !!selectedAddOns[addon.id];
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddOn(addon.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500/70 text-white'
                          : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{addon.icon || '📦'}</span>
                        <div>
                          <p className="font-semibold">{addon.name}</p>
                          <span className="text-[10px] text-slate-400">
                            +₹{addon.price}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Coupons & Promo Codes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Apply Promo Code:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Try FIRST20 or FLAT150"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Coupon {appliedCoupon.code} applied! Saved ₹
                {appliedCoupon.discount}
              </p>
            )}
            {couponError && (
              <p className="text-xs text-rose-400 mt-1.5">{couponError}</p>
            )}
          </div>

          {/* Payment Type Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              Payment Preference:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType('FULL')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentType === 'FULL'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Pay 100% Online</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                    Instant Check-In
                  </span>
                </div>
                <p className="text-sm font-bold text-white mt-1">₹{grandTotal}</p>
                <span className="text-[10px] text-slate-400">Zero dues at ground</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('ADVANCE')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentType === 'ADVANCE'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Pay Advance (30%)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                    Hold Slot
                  </span>
                </div>
                <p className="text-sm font-bold text-white mt-1">₹{advanceAmount}</p>
                <span className="text-[10px] text-slate-400">
                  Remaining ₹{remainingAmount} at venue
                </span>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Ground Slot Fee ({selection.duration} hr):</span>
              <span className="text-white font-medium">₹{selection.totalSlotPrice}</span>
            </div>
            {addOnsTotal > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Add-ons Total:</span>
                <span className="text-white font-medium">+₹{addOnsTotal}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Coupon Discount:</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
              <span>Total Booking Amount:</span>
              <span className="text-emerald-400">₹{grandTotal}</span>
            </div>
            {paymentType === 'ADVANCE' && (
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between text-xs text-amber-300 font-semibold mt-2">
                <span>Amount to Pay Now:</span>
                <span>₹{advanceAmount} (Due at venue: ₹{remainingAmount})</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Payable Now
            </span>
            <span className="text-xl font-black text-white">₹{advanceAmount}</span>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Securing Slot...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{advanceAmount} & Confirm</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
