'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from './role-context';
import {
  Trophy,
  Calendar,
  Search,
  Menu,
  X,
  Compass,
  Building2,
  Shield,
  CircleDot,
} from 'lucide-react';
import InstallPWAButton from './install-pwa-button';

export default function Navbar() {
  const pathname = usePathname();
  const { role, user } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-[41px] z-40 backdrop-blur-md bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
                <span className="text-xl">⚽</span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                  Turf<span className="text-emerald-400">Book</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 font-medium block -mt-1 tracking-wider uppercase">
                  Sports Arena OS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/turfs"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/turfs')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Compass className="w-4 h-4" />
                Find Turfs
              </Link>

              <Link
                href="/events"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/events')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Tournaments
              </Link>

              <Link
                href="/bookings"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/bookings')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </Link>
            </div>
          </div>

          {/* Right Actions & Portal Quicklinks */}
          <div className="hidden md:flex items-center space-x-3">
            <InstallPWAButton />

            <Link
              href="/owner"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              Owner OS
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>

            <div className="h-6 w-px bg-slate-800 mx-1" />

            <Link
              href="/auth"
              className="flex items-center gap-2 pl-1 bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700/80 transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-emerald-500/50 object-cover"
              />
              <div className="text-left hidden lg:block">
                <p className="text-xs font-medium text-white leading-tight">{user.name}</p>
                <span className="text-[10px] text-emerald-400 font-normal">Switch / Login</span>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <InstallPWAButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/turfs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            Find Turfs
          </Link>
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            Tournaments
          </Link>
          <Link
            href="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            My Bookings
          </Link>
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <Link
              href="/owner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800/60"
            >
              Owner OS
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
