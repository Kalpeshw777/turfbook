'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  CheckSquare,
  AlertTriangle,
  Receipt,
  Users,
  Settings,
} from 'lucide-react';
import { useRole } from '@/components/role-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useRole();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Platform Control
              </span>
              <h2 className="text-xs font-black text-white">TurfBook Admin</h2>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Platform Console</span>
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-400">TurfBook Core v1.0</p>
          <p>SuperAdmin Privileges Active</p>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
