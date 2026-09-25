'use client';

import React from 'react';
import { useRole, RoleType } from './role-context';
import { UserCheck, Shield, Building2, User, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoleSwitcherBanner() {
  const { role, setRole, user } = useRole();
  const router = useRouter();

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    if (newRole === 'OWNER') {
      router.push('/owner');
    } else if (newRole === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> TURFBOOK MULTI-ROLE DEMO:
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Active as: <strong className="text-white">{user.name}</strong> ({role})
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => handleRoleChange('CUSTOMER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              role === 'CUSTOMER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => handleRoleChange('OWNER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              role === 'OWNER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Turf Owner OS</span>
          </button>

          <button
            onClick={() => handleRoleChange('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              role === 'ADMIN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
