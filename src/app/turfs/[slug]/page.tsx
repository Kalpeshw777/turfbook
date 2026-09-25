'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  Calendar,
  ShieldCheck,
  Phone,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import SlotPicker from '@/components/slot-picker';
import CheckoutModal from '@/components/checkout-modal';
import { useRole } from '@/components/role-context';

export default function TurfDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useRole();

  const [turf, setTurf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected slot for checkout
  const [selectedSlotData, setSelectedSlotData] = useState<any>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchTurf = () => {
    setLoading(true);
    fetch(`/api/turfs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.turf) {
          setTurf(data.turf);
        } else {
          setError(data.error || 'Turf not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (slug) fetchTurf();
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turfId: turf.id,
          customerId: user.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewComment('');
        fetchTurf();
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading arena details...</span>
      </div>
    );
  }

  if (error || !turf) {
    return (
      <div className="py-24 text-center text-rose-400 text-sm">
        {error || 'Arena details unavailable'}
      </div>
    );
  }

  const images: string[] = turf.images || [];
  const amenities: string[] = turf.amenities || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Turfs</span>
          <span>/</span>
          <span>{turf.city}</span>
          <span>/</span>
          <span className="text-white font-medium">{turf.name}</span>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden max-h-[420px]">
        <div className="md:col-span-2 relative h-72 md:h-full bg-slate-800">
          <img
            src={images[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80'}
            alt={turf.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:flex flex-col gap-3">
          <div className="h-1/2 bg-slate-800 rounded-2xl overflow-hidden relative">
            <img
              src={images[1] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80'}
              alt={turf.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-1/2 bg-slate-800 rounded-2xl overflow-hidden relative">
            <img
              src={images[2] || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80'}
              alt={turf.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Facility
            </span>
            <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-full text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">{turf.averageRating}</span>
              <span className="text-slate-400">({turf.reviewsCount} reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white mt-2">
            {turf.name}
          </h1>

          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{turf.address}, {turf.area}, {turf.city}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">📍 2.3 km away</span>
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Starting from
            </span>
            <span className="text-2xl font-black text-white">
              ₹{turf.grounds[0]?.basePrice || 700}
            </span>
            <span className="text-xs text-slate-400"> / hour</span>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('booking-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all hover:scale-105"
          >
            Check Available Slots
          </button>
        </div>
      </div>

      {/* Grid: Grounds Details & Dynamic Pricing Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About & Amenities */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">About the Arena</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {turf.description}
            </p>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Facilities & Amenities
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grounds / Pitches Available */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Grounds & Pitches Available</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {turf.grounds.map((g: any) => (
                <div
                  key={g.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        {g.sport}
                      </span>
                      <h4 className="text-sm font-bold text-white">{g.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded-lg">
                      ₹{g.basePrice}/hr
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    <p>• Size: <strong className="text-slate-200">{g.size}</strong></p>
                    <p>• Surface: <strong className="text-slate-200">{g.surfaceType}</strong></p>
                    <p>• Type: <strong className="text-slate-200">{g.indoorOutdoor}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Slot Booking Section */}
          <div id="booking-section">
            <SlotPicker
              grounds={turf.grounds}
              onSlotSelected={(selection) => setSelectedSlotData(selection)}
            />
          </div>
        </div>

        {/* Right Sidebar: Dynamic Pricing Guide, Add-ons & Active Selection */}
        <div className="space-y-6">
          {/* Selected Slot Floating Checkout Summary */}
          {selectedSlotData ? (
            <div className="bg-emerald-950/80 border border-emerald-500 rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in sticky top-28">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Slot Selected
                </span>
                <span className="text-xs font-bold text-white bg-emerald-800/80 px-2 py-0.5 rounded-full">
                  {selectedSlotData.duration} Hour{selectedSlotData.duration > 1 ? 's' : ''}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {selectedSlotData.ground.name}
                </h4>
                <div className="text-xs text-emerald-200/90 mt-1 space-y-0.5">
                  <p>📅 {selectedSlotData.date}</p>
                  <p>
                    ⏰ {selectedSlotData.startTime} - {selectedSlotData.endTime}
                  </p>
                </div>
              </div>

              <div className="border-t border-emerald-800/60 pt-3 flex items-baseline justify-between">
                <span className="text-xs text-emerald-200">Slot Fee:</span>
                <span className="text-2xl font-black text-white">
                  ₹{selectedSlotData.totalSlotPrice}
                </span>
              </div>

              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full py-3 bg-white text-emerald-950 hover:bg-emerald-100 font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                Proceed to Checkout →
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-slate-400 text-xs">
              <Calendar className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-white">Select a slot on the calendar</p>
              <p className="mt-1">
                Pick a time slot from the availability grid to proceed with your booking.
              </p>
            </div>
          )}

          {/* Dynamic Pricing Rate Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Dynamic Hourly Pricing Guide
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">🌅 Morning Saver (6 AM–9 AM)</span>
                <span className="font-bold text-emerald-400">15% OFF</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">☀️ Daytime (9 AM–5 PM)</span>
                <span className="font-bold text-white">Standard Base</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">⚡ Floodlit Peak (5 PM–9 PM)</span>
                <span className="font-bold text-amber-400">Peak Demand</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">🌙 Late Night (9 PM–11 PM)</span>
                <span className="font-bold text-white">Night Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              Player Reviews & Ratings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified feedback from sportsmen and teams
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {turf.reviews && turf.reviews.length > 0 ? (
            turf.reviews.map((r: any) => (
              <div
                key={r.id}
                className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-xs text-white">
                      {r.customer?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{r.customer?.name}</p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    {'⭐'.repeat(r.rating)}
                  </div>
                </div>

                <p className="text-xs text-slate-300">{r.comment}</p>

                {r.ownerReply && (
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-emerald-400/90 ml-4 mt-2">
                    <strong className="block text-slate-400">Response from Owner:</strong>
                    {r.ownerReply}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No reviews yet.</p>
          )}
        </div>

        {/* Add Review Form */}
        <form
          onSubmit={handleReviewSubmit}
          className="pt-6 border-t border-slate-800 space-y-3"
        >
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Leave a Review (Active as {user.name})
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Rating:</span>
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setReviewRating(val)}
                className={`text-base transition-transform ${
                  val <= reviewRating ? 'scale-110' : 'opacity-40 grayscale'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience regarding turf bounce, lighting, facilities, and staff..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 h-20"
          />

          <button
            type="submit"
            disabled={submittingReview || !reviewComment.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
          >
            {submittingReview ? 'Posting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Checkout Modal */}
      {selectedSlotData && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          turf={turf}
          selection={selectedSlotData}
        />
      )}
    </div>
  );
}
