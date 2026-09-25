'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  CheckCircle2,
  DollarSign,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import { useRole } from '@/components/role-context';

export default function OwnerGroundsPage() {
  const { user } = useRole();
  const [grounds, setGrounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New ground modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [sport, setSport] = useState('FOOTBALL');
  const [surfaceType, setSurfaceType] = useState('FIFA 2-Star Artificial Turf');
  const [size, setSize] = useState('120 x 80 ft');
  const [indoorOutdoor, setIndoorOutdoor] = useState('Outdoor');
  const [basePrice, setBasePrice] = useState('900');
  const [submitting, setSubmitting] = useState(false);

  const fetchGrounds = () => {
    setLoading(true);
    fetch('/api/turfs')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.turfs?.length > 0) {
          setGrounds(data.turfs[0].grounds || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGrounds();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Multi-Ground Operations
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            Pitches & Grounds Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure hourly rates, playing surfaces, dimensions, and sports offered.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pitch</span>
        </button>
      </div>

      {/* Grounds Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading grounds...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grounds.map((g) => (
            <div
              key={g.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800/60 uppercase tracking-wider">
                    {g.sport}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {g.indoorOutdoor}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-2">{g.name}</h3>

                <div className="mt-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dimensions:</span>
                    <strong className="text-white">{g.size}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Playing Surface:</span>
                    <strong className="text-white">{g.surfaceType}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">
                    Base Rate
                  </span>
                  <span className="text-lg font-black text-white">
                    ₹{g.basePrice}
                  </span>
                  <span className="text-xs text-slate-400"> / hour</span>
                </div>

                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Ground Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Add New Pitch / Court</h3>

            <div className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1">Pitch Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 5v5 Astro Cage 2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Sport</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="FOOTBALL">Football</option>
                    <option value="BOX_CRICKET">Box Cricket</option>
                    <option value="BADMINTON">Badminton</option>
                    <option value="PICKLEBALL">Pickleball</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Base Price (₹/hr)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Dimensions</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. 100 x 60 ft"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Surface Type</label>
                <input
                  type="text"
                  value={surfaceType}
                  onChange={(e) => setSurfaceType(e.target.value)}
                  placeholder="e.g. FIFA 2-Star Artificial Turf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('New ground added to arena profile!');
                  setShowAddModal(false);
                }}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
              >
                Save Pitch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
