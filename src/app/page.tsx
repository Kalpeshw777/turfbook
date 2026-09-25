'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TurfCard from '@/components/turf-card';
import {
  Search,
  Trophy,
  Sparkles,
  ShieldCheck,
  Zap,
  CalendarCheck,
  ArrowRight,
  MapPin,
  Clock,
  Flame,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredTurfs, setFeaturedTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/turfs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeaturedTurfs(data.turfs);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/turfs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/turfs');
    }
  };

  const sportsCategories = [
    { name: 'Football', icon: '⚽', query: 'FOOTBALL', color: 'from-emerald-600 to-teal-500' },
    { name: 'Box Cricket', icon: '🏏', query: 'BOX_CRICKET', color: 'from-amber-600 to-orange-500' },
    { name: 'Badminton', icon: '🏸', query: 'BADMINTON', color: 'from-blue-600 to-cyan-500' },
    { name: 'Pickleball', icon: '🏓', query: 'PICKLEBALL', color: 'from-purple-600 to-pink-500' },
    { name: 'Tournaments', icon: '🏆', link: '/events', color: 'from-rose-600 to-red-500' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 md:py-24 border-b border-slate-800">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold mb-6 shadow-lg shadow-emerald-950/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time Turf Booking & Sports Arena OS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Book Sports Turfs.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Zero Double-Booking.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 font-normal">
            Find nearby grounds, check live hourly availability, lock your pitch with advance payment, and check-in via instant QR pass.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search turf, area (Andheri, Powai, Koramangala) or sport..."
                className="w-full bg-transparent pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Find Grounds</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Categories Bar */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {sportsCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.link || `/turfs?sport=${cat.query}`}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-white transition-all hover:scale-105 shadow-md"
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offers & Discounts Promo Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Limited Time Promotion
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Get 20% OFF on Your First Turf Match!
            </h3>
            <p className="text-xs text-slate-300">
              Apply coupon <code className="bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300 font-mono font-bold">FIRST20</code> at checkout. Minimum booking ₹500.
            </p>
          </div>

          <Link
            href="/turfs"
            className="px-6 py-3 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-100 transition-colors shadow-lg"
          >
            Claim Offer & Book
          </Link>
        </div>
      </section>

      {/* Featured Turfs (Popular Tonight) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Trending Matches
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">
              Popular Turfs & Grounds
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              High-rated FIFA turf surfaces, floodlights, and box cricket cages
            </p>
          </div>

          <Link
            href="/turfs"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading arenas...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTurfs.map((turf) => (
              <TurfCard key={turf.id} {...turf} />
            ))}
          </div>
        )}
      </section>

      {/* Tournaments Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Competitive Sports
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Active Tournaments & Leagues
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Register your squad for local 7v7 football cups and box cricket tournaments.
              </p>
            </div>

            <Link
              href="/events"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl self-start sm:self-auto transition-colors"
            >
              Browse Tournaments
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                  ⚽ FOOTBALL 7v7
                </span>
                <span className="text-xs font-black text-amber-400">
                  ₹25,000 Prize Pool
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Mumbai Monsoon Football Cup 2026
              </h3>
              <p className="text-xs text-slate-400">
                16 teams knockout cup under floodlights at Apex Sports Arena. Certified referees and video highlights.
              </p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-300">Entry: <strong>₹1,500/team</strong></span>
                <Link
                  href="/events"
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Register Team →
                </Link>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60">
                  🏏 BOX CRICKET
                </span>
                <span className="text-xs font-black text-amber-400">
                  ₹18,000 Prize Pool
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Apex Box Cricket Super League
              </h3>
              <p className="text-xs text-slate-400">
                6-over tennis ball indoor cages tournament. Man of the match trophies & live commentary.
              </p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-300">Entry: <strong>₹1,200/team</strong></span>
                <Link
                  href="/events"
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Register Team →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights ("Why TurfBook?") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Engineered for Sports
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            Built Like BookMyShow for Sports Turfs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Everything players and turf owners need in a unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero Double-Booking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Database-level atomic locking ensures two players can never reserve the same time slot at the same second.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Instant QR Code Pass</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive a scannable digital match ticket with full booking details, advance payments, and WhatsApp share links.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Owner Business OS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Turf owners get a powerful dashboard to manage schedules, walk-in cash bookings, scan QR codes, and view revenue analytics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
