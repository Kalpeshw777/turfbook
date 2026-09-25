import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/components/role-context';
import RoleSwitcherBanner from '@/components/role-switcher-banner';
import Navbar from '@/components/navbar';

export const metadata: Metadata = {
  title: 'TurfBook — Sports Turf Booking & Management Platform',
  description:
    'Book sports turfs in real-time for Football, Cricket, Badminton, Box Cricket, and Pickleball. Complete operating system for turf owners.',
  manifest: '/manifest.json',
  themeColor: '#059669',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TurfBook',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <RoleProvider>
          <RoleSwitcherBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs text-center">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-base">⚽</span>
                <span className="font-semibold text-white">TurfBook Platform</span>
                <span>— The Operating System for Sports Grounds</span>
              </div>
              <p>© 2026 TurfBook Inc. Real-time availability, zero double-booking.</p>
            </div>
          </footer>
        </RoleProvider>
      </body>
    </html>
  );
}
