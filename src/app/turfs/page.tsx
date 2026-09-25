'use client';

import React, { useState, useEffect, Suspense } from 'react';
import TurfCard from '@/components/turf-card';
import { Search, Filter, Compass, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function TurfsDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get('sport') || '';

  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  const fetchTurfs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedSport) params.append('sport', selectedSport);
    if (selectedCity) params.append('city', selectedCity);

    fetch(`/api/turfs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTurfs(data.turfs);
        }
      })
      .catch((err) => console.error('Error fetching turfs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTurfs();
  }, [selectedSport, selectedCity]);

  const sportsList = [
    { label: 'All Sports', value: '', icon: '🎯' },
    { label: 'Football', value: 'FOOTBALL', icon: '⚽' },
    { label: 'Box Cricket', value: 'BOX_CRICKET', icon: '🏏' },
    { label: 'Badminton', value: 'BADMINTON', icon: '🏸' },
    { label: 'Pickleball', value: 'PICKLEBALL', icon: '🏓' },
  ];

  const filteredTurfs = turfs.filter(
    (t) => (t.startingPrice || 600) <= maxPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div>
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          Marketplace
        </span>
        <h1 className="text-3xl font-black text-white mt-1 flex items-center gap-2">
          <Compass className="w-7 h-7 text-emerald-400" />
          Discover & Book Sports Turfs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore floodlit football cages, indoor badminton wooden courts, and box cricket pitches with real-time slot booking.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTurfs()}
              placeholder="Search by arena name, area (Andheri, Powai, Koramangala)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* City Selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Gurugram">Gurugram</option>
          </select>

          {/* Search Button */}
          <button
            onClick={fetchTurfs}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Search
          </button>
        </div>

        {/* Sports Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap gap-2">
            {sportsList.map((item) => (
              <button
                key={item.value}
                onClick={() => setSelectedSport(item.value)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedSport === item.value
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Max Price Slider */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Max Price:</span>
            <input
              type="range"
              min="500"
              max="2000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-24 accent-emerald-500"
            />
            <span className="font-bold text-white">₹{maxPrice}/hr</span>
          </div>
        </div>
      </div>

      {/* Turfs Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Searching sports arenas...</span>
        </div>
      ) : filteredTurfs.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto">
          <p className="text-sm font-semibold text-white">No sports turfs match your filter.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Try clearing filters or adjusting your price limit.</p>
          <button
            onClick={() => {
              setSelectedSport('');
              setSelectedCity('');
              setSearchQuery('');
              setMaxPrice(2000);
            }}
            className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTurfs.map((turf) => (
            <TurfCard key={turf.id} {...turf} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TurfsDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-400 text-xs">
          Loading turf marketplace...
        </div>
      }
    >
      <TurfsDiscoveryContent />
    </Suspense>
  );
}
