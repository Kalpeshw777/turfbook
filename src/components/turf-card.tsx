'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';

export interface TurfCardProps {
  id: string;
  name: string;
  slug: string;
  area: string;
  city: string;
  images: string[];
  amenities: string[];
  averageRating: number;
  reviewsCount: number;
  startingPrice: number;
  grounds: Array<{ id: string; name: string; sport: string; basePrice: number }>;
}

export default function TurfCard({
  name,
  slug,
  area,
  city,
  images,
  amenities,
  averageRating,
  reviewsCount,
  startingPrice,
  grounds,
}: TurfCardProps) {
  const primaryImage =
    images && images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80';

  // Extract unique sports
  const sports = Array.from(new Set(grounds.map((g) => g.sport)));

  const getSportBadge = (sport: string) => {
    switch (sport) {
      case 'FOOTBALL':
        return { label: 'Football', icon: '⚽', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'CRICKET':
      case 'BOX_CRICKET':
        return { label: 'Box Cricket', icon: '🏏', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'BADMINTON':
        return { label: 'Badminton', icon: '🏸', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'PICKLEBALL':
        return { label: 'Pickleball', icon: '🏓', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default:
        return { label: sport, icon: '🎯', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col">
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <img
          src={primaryImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1 shadow-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-white">{averageRating}</span>
          <span className="text-[10px] text-slate-400">({reviewsCount || 8})</span>
        </div>

        {/* Verified Badge */}
        <div className="absolute top-3 left-3 bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-600/40 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Arena</span>
        </div>

        {/* Sports Pills Overlay */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {sports.map((sport) => {
            const b = getSportBadge(sport);
            return (
              <span
                key={sport}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md border backdrop-blur-md ${b.color} flex items-center gap-1`}
              >
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
              {name}
            </h3>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{area}, {city}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">📍 2.3 km away</span>
          </p>

          {/* Amenities Mini List */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
            {amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-300 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Hourly Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">₹{startingPrice}</span>
              <span className="text-xs text-slate-400">/ hour</span>
            </div>
          </div>

          <Link
            href={`/turfs/${slug}`}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/30 transition-all hover:translate-x-0.5"
          >
            <span>Book Slots</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
