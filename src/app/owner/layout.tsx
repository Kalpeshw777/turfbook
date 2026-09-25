'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  QrCode,
  Layers,
  BarChart3,
  Users,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useRole } from '@/components/role-context';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useRole();

  const navItems = [
    { label: 'Overview', href: '/owner', icon: LayoutDashboard },
    { label: 'Live Calendar', href: '/owner/calendar', icon: Calendar },
    { label: 'Manual Walk-In', href: '/owner/manual-booking', icon: PlusCircle },
    { label: 'QR Check-In', href: '/owner/checkin', icon: QrCode },
    { label: 'Arena Grounds', href: '/owner/grounds', icon: Layers },
    { label: 'Analytics & Revenue', href: '/owner/analytics', icon: BarChart3 },
    { label: 'Customer CRM', href: '/owner/customers', icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === '/owner') return pathname === '/owner';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Turf Business Header */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
              Turf Business OS
            </span>
            <h2 className="text-sm font-black text-white mt-0.5 truncate">
              {user.turfName || 'Apex Sports Arena'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Manager: {user.name}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online & Synced</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Grounds connected: 3 pitches
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
