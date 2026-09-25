'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Award,
  Sparkles,
  PieChart as PieIcon,
} from 'lucide-react';

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/owner/analytics')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Compiling financial analytics...</span>
      </div>
    );
  }

  const revenueByDay = data?.revenueByDay || [];
  const peakHours = data?.peakHours || [];
  const sportShare = data?.sportShare || [];
  const stats = data?.stats || {};

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          Financial Intelligence
        </span>
        <h1 className="text-2xl font-black text-white mt-0.5">
          Revenue & Business Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics on earnings, peak operating hours, occupancy rate, and sport popularity.
        </p>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Today's Gross Earnings
          </span>
          <span className="text-2xl font-black text-white">
            ₹{stats.todayRevenue?.toLocaleString() || 0}
          </span>
          <span className="text-[10px] text-emerald-400 block pt-1">
            Settled via UPI, Card & Cash
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Occupancy Rate
          </span>
          <span className="text-2xl font-black text-white">
            {stats.occupancyRate || 68}%
          </span>
          <span className="text-[10px] text-amber-400 block pt-1">
            Peak hours near 100%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Prime Demand Band
          </span>
          <span className="text-2xl font-black text-white">
            7 PM - 10 PM
          </span>
          <span className="text-[10px] text-slate-400 block pt-1">
            Highest ticket velocity
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Avg Booking Size
          </span>
          <span className="text-2xl font-black text-white">
            ₹1,120
          </span>
          <span className="text-[10px] text-emerald-400 block pt-1">
            Including gear rentals
          </span>
        </div>
      </div>

      {/* Chart 1: Revenue Trend (Last 7 Days) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              7-Day Revenue Trend (₹)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily revenue recorded across online and manual walk-in bookings
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Charts: Peak Hours and Sport Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Heatmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Peak Hours Demand Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hourly booking density across operating day (6 AM - 11 PM)
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sport Share Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Revenue by Sport
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Revenue distribution across football, box cricket, and badminton
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {sportShare.map((item: any, i: number) => {
              const totalRev = sportShare.reduce((acc: number, s: any) => acc + s.revenue, 0) || 1;
              const percent = Math.round((item.revenue / totalRev) * 100);

              return (
                <div
                  key={item.sport}
                  className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">
                      {item.sport === 'FOOTBALL' ? '⚽ Football' : item.sport === 'BOX_CRICKET' ? '🏏 Box Cricket' : '🏸 Badminton'}
                    </span>
                    <span className="font-bold text-emerald-400">
                      ₹{item.revenue.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
