'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Phone,
  Calendar,
  MessageCircle,
  Search,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function OwnerCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/owner/analytics')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.frequentCustomers) {
          setCustomers(data.frequentCustomers);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Player CRM & Loyalty
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            Customer Directory & Lifetime Value
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track repeat players, lifetime match spend, and reward frequent squads.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading player database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No customers found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Player / Team</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Total Matches</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Loyalty Tier</th>
                  <th className="py-3 px-4 text-right">Direct Outreach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xs text-emerald-400 font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {c.bookingsCount} booking{c.bookingsCount > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{c.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.isVip ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-amber-400" /> VIP Player
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${c.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                          `Hi ${c.name}, special 15% discount for your next match at Apex Sports Arena! Use code VIP15.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-semibold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Offer</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
