'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { useRole } from '@/components/role-context';

export default function TournamentsPage() {
  const { user } = useRole();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('');

  // Team registration modal state
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState(user.name);
  const [captainPhone, setCaptainPhone] = useState(user.phone);
  const [captainEmail, setCaptainEmail] = useState(user.email);
  const [playersCount, setPlayersCount] = useState(8);
  const [registering, setRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  const fetchEvents = () => {
    setLoading(true);
    const url = selectedSport ? `/api/events?sport=${selectedSport}` : '/api/events';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.events);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedSport]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !captainName || !captainPhone) return;

    setRegistering(true);
    setRegError('');

    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          captainName,
          captainPhone,
          captainEmail,
          playersCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegSuccess(true);
        setTimeout(() => {
          setSelectedEvent(null);
          setRegSuccess(false);
          setTeamName('');
          fetchEvents();
        }, 1800);
      } else {
        setRegError(data.error || 'Failed to register team');
      }
    } catch (err: any) {
      setRegError(err.message || 'Error occurred');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Competitive Arena
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Sports Tournaments & Leagues
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compete with top local teams, win championship trophies and cash prize pools.
          </p>
        </div>

        {/* Sport filter */}
        <div className="flex gap-2">
          {['', 'FOOTBALL', 'BOX_CRICKET'].map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                selectedSport === sport
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sport === '' ? 'All Tournaments' : sport === 'FOOTBALL' ? '⚽ Football Cups' : '🏏 Box Cricket'}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading tournaments...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto">
          <p className="text-sm font-semibold text-white">No tournaments scheduled in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              {/* Banner */}
              <div className="relative h-48 bg-slate-800">
                <img
                  src={ev.bannerImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-800/40">
                  {ev.sport === 'FOOTBALL' ? '⚽ Football 7v7' : '🏏 Box Cricket'}
                </div>

                <div className="absolute top-3 right-3 bg-amber-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-amber-300 border border-amber-500/30">
                  ₹{ev.prizePool.toLocaleString()} Prize Pool
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{ev.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ev.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ev.startTime} - {ev.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ev.turf?.name} ({ev.turf?.area}, {ev.turf?.city})</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Registered Teams: <strong className="text-white">{ev.registeredTeamsCount} / {ev.maxTeams}</strong>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {ev.slotsLeft} team slots left
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Registration Fee
                    </span>
                    <span className="text-lg font-black text-white">
                      ₹{ev.entryFee}
                    </span>
                    <span className="text-[10px] text-slate-400"> / team</span>
                  </div>

                  <button
                    disabled={ev.slotsLeft === 0}
                    onClick={() => {
                      setSelectedEvent(ev);
                      setCaptainName(user.name);
                      setCaptainPhone(user.phone);
                      setCaptainEmail(user.email);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors disabled:opacity-50"
                  >
                    {ev.slotsLeft === 0 ? 'Tournament Full' : 'Register Team →'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Tournament Entry
                </span>
                <h3 className="text-base font-bold text-white">
                  Register for {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Registration Confirmed!</h4>
                <p className="text-xs text-slate-300">
                  Your team {teamName} has been enrolled in the tournament bracket.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                {regError && (
                  <p className="p-2.5 bg-rose-950 border border-rose-800 text-rose-300 rounded-xl">
                    {regError}
                  </p>
                )}

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Bandra Strikers FC"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Captain Name *</label>
                    <input
                      type="text"
                      required
                      value={captainName}
                      onChange={(e) => setCaptainName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Captain Phone *</label>
                    <input
                      type="text"
                      required
                      value={captainPhone}
                      onChange={(e) => setCaptainPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Squad Size</label>
                    <input
                      type="number"
                      min={5}
                      max={15}
                      value={playersCount}
                      onChange={(e) => setPlayersCount(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Registration Fee</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold">
                      ₹{selectedEvent.entryFee}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400">
                  <span className="font-semibold text-white block mb-0.5">Tournament Rules:</span>
                  <p>{selectedEvent.rules}</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50"
                  >
                    {registering ? 'Submitting...' : `Pay ₹${selectedEvent.entryFee} & Register`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
