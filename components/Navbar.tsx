'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(!!data.authenticated);
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/attendance', label: 'Attendance' },
    { href: '/achievements', label: 'Achievements' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/registration', label: 'Registration' },
  ];

  const isActive = (path: string) => pathname === path;
  const adminTarget = isLoggedIn ? '/admin/dashboard' : '/admin/login';
  const adminText = isLoggedIn ? 'Admin Dashboard' : 'Admin Portal';

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-red-600/80 shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform shrink-0">
            <Image 
              src="/assets/logo.PNG" 
              alt="ACD Martial Arts Logo" 
              fill 
              className="object-cover" 
            />
          </div>
          <div>
            <span className="font-outfit font-extrabold text-sm sm:text-xl tracking-wider text-white flex items-center gap-1 leading-tight">
              ACD <span className="text-red-600">MARTIAL ARTS</span>
            </span>
            <span className="block font-inter text-[9px] sm:text-[11px] uppercase tracking-widest text-amber-400 font-bold">
              Sports Club • Mandsaur
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg font-medium text-xs lg:text-sm transition-all whitespace-nowrap ${
                isActive(link.href)
                  ? 'bg-red-600/15 text-red-500 border border-red-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Admin Portal Button & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={adminTarget}
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-red-950/50 transition-all border border-red-500/40 uppercase tracking-wider whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4" />
            {adminText}
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive(link.href)
                    ? 'bg-red-600/20 text-red-400 font-bold border border-red-600/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href={adminTarget}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-md text-sm uppercase tracking-wider text-center"
            >
              <UserCheck className="w-4 h-4" />
              {adminText}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
