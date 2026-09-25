'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building2,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Sparkles,
  MapPin,
} from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [pendingTurfs, setPendingTurfs] = useState<any[]>([]);
  const [approvedTurfs, setApprovedTurfs] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/approvals').then((r) => r.json()),
      fetch('/api/admin/complaints').then((r) => r.json()),
    ])
      .then(([statsRes, approvalsRes, complaintsRes]) => {
        if (statsRes.success) setStats(statsRes.stats);
        if (approvalsRes.success) {
          setPendingTurfs(approvalsRes.pending || []);
          setApprovedTurfs(approvalsRes.approved || []);
        }
        if (complaintsRes.success) {
          setComplaints(complaintsRes.complaints || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTurfAction = async (turfId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turfId, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId,
          status: 'RESOLVED',
          adminResolution: 'Verified power issue with arena manager. ₹200 wallet credit issued to player.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Ticket marked as Resolved!');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading Admin Platform console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          Super Administrator
        </span>
        <h1 className="text-2xl font-black text-white mt-0.5">
          Platform Governance & Verification
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor ecosystem health, approve turf owner listings, and settle player disputes.
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            Platform Players
          </span>
          <span className="text-3xl font-black text-white">
            {stats?.totalUsers || 240}
          </span>
          <span className="text-[10px] text-emerald-400 block pt-1">
            Registered customer accounts
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            Active Sports Arenas
          </span>
          <span className="text-3xl font-black text-white">
            {stats?.approvedTurfs || 3}
          </span>
          <span className="text-[10px] text-slate-400 block pt-1">
            {stats?.pendingTurfs || 1} awaiting verification
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            Gross Booking Value
          </span>
          <span className="text-3xl font-black text-white">
            ₹{stats?.grossBookingValue?.toLocaleString() || '18,400'}
          </span>
          <span className="text-[10px] text-emerald-400 block pt-1">
            All-time match volume
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            Commission Revenue (5%)
          </span>
          <span className="text-3xl font-black text-emerald-400">
            ₹{stats?.platformCommission?.toLocaleString() || '920'}
          </span>
          <span className="text-[10px] text-emerald-500 block pt-1">
            Platform net earnings
          </span>
        </div>
      </div>

      {/* Pending Turf Approvals Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Pending Turf Approvals Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review owner KYC and verify facilities before publishing to public discovery
            </p>
          </div>
          <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full">
            {pendingTurfs.length} Pending
          </span>
        </div>

        {pendingTurfs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800">
            All turf listings are approved and up to date!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTurfs.map((turf) => (
              <div
                key={turf.id}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{turf.name}</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded font-semibold">
                      Needs Verification
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{turf.address}, {turf.city}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Owner: <strong className="text-slate-200">{turf.owner?.name}</strong> ({turf.owner?.phone})
                  </p>
                </div>

                <div className="flex gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleTurfAction(turf.id, 'APPROVE')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Publish</span>
                  </button>
                  <button
                    onClick={() => handleTurfAction(turf.id, 'REJECT')}
                    className="px-4 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Disputes & Complaints Ticketing */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Customer Support & Dispute Tickets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Player grievances regarding turf lighting, ground maintenance, or refunds
            </p>
          </div>
        </div>

        {complaints.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800">
            Zero open dispute tickets. Platform running smoothly!
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {c.ticketNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{c.subject}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Reported by {c.customer?.name} ({c.customer?.phone}) against {c.turf?.name}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'RESOLVED'
                        ? 'bg-teal-950 text-teal-300 border border-teal-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  "{c.description}"
                </p>

                {c.adminResolution ? (
                  <p className="text-teal-400 font-medium">
                    ✓ Resolution: {c.adminResolution}
                  </p>
                ) : (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleResolveComplaint(c.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
                    >
                      Issue Resolution & Close Ticket
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
