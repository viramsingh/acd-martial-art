import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsappIcon } from './SocialIcons';

export default function Footer() {
  return (
    <footer className="bg-[#0B0F19] border-t border-slate-800 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand & Vision & Socials */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-red-500 shrink-0">
              <Image src="/assets/logo.PNG" alt="ACD Logo" fill className="object-cover" />
            </div>
            <div>
              <span className="font-outfit font-black text-lg text-white block leading-tight">
                ACD <span className="text-red-600">MARTIAL ARTS</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                Sports Club • Mandsaur
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            ACD Martial Arts – Sports Club specializes in Taekwondo, Kickboxing, Kung Fu, Self-Defense, and traditional weapons training (Katana, Nunchaku, Bo Staff).
          </p>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-full w-fit">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Government & Belt Federation Certified
          </div>

          {/* Social Media Links */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5">Follow Our Social Media</span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/acdmartialarts.mandsaur?igsh=aHBxYzBxaWF4amZ1&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-900 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-600 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-pink-500 transition-all shadow-md hover:scale-110"
                title="Follow ACD Martial Arts Mandsaur on Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/17QNDRhLt6/?mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-blue-500 transition-all shadow-md hover:scale-110"
                title="Like ACD Martial Arts on Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@acdmartialarts.mandsaur"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-red-500 transition-all shadow-md hover:scale-110"
                title="Subscribe to ACD Martial Arts YouTube Channel"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919340772689"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-emerald-500 transition-all shadow-md hover:scale-110"
                title="Chat with ACD Academy on WhatsApp (+91 9340772689)"
              >
                <WhatsappIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="space-y-3">
          <h3 className="font-outfit text-white font-bold text-base tracking-wide uppercase">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-red-500 transition-colors">Home Page</Link></li>
            <li><Link href="/about" className="hover:text-red-500 transition-colors">Academy History & Vision</Link></li>
            <li><Link href="/achievements" className="hover:text-red-500 transition-colors">Hall of Fame & Medals</Link></li>
            <li><Link href="/attendance" className="hover:text-red-500 transition-colors">Academy Attendance Info</Link></li>
            <li><Link href="/registration" className="hover:text-red-500 transition-colors">Online Student Registration</Link></li>
            <li><Link href="/admin/login" className="hover:text-red-500 transition-colors">Staff / Admin Login</Link></li>
          </ul>
        </div>

        {/* Training Batches & Schedule */}
        <div className="space-y-3">
          <h3 className="font-outfit text-white font-bold text-base tracking-wide uppercase">Training Schedules</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-semibold block">Evening Batch 1</span>
                <span className="text-xs text-slate-400">Mon - Sat: 5:00 PM To 6:00 PM</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-semibold block">Evening Batch 2</span>
                <span className="text-xs text-slate-400">Mon - Sat: 6:30 PM To 7:30 PM</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-semibold block">Evening Batch 3</span>
                <span className="text-xs text-slate-400">Mon - Sat: 8:00 PM To 9:00 PM</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="font-outfit text-white font-bold text-base tracking-wide uppercase">Academy Address</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <a
                href="https://share.google/1hs5JhdKoZCa2NvX3"
                target="_blank"
                rel="noreferrer"
                className="text-xs leading-relaxed text-slate-300 hover:text-red-400 transition-colors group"
              >
                Shree Nitvan Public Schools Rooftop, Steel Nagar near Meghdoot Nagar, Mhow-Neemuch Road, Mandsaur.
                <span className="block text-[11px] font-bold text-red-400 group-hover:underline mt-0.5">📍 Open in Google Maps ↗</span>
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-red-500 shrink-0" />
              <a href="tel:9340772689" className="hover:text-red-400 transition-colors">+91 93407 72689</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <a href="mailto:Adityachanaldojang@gmail.com" className="hover:text-red-400 transition-colors text-xs">Adityachanaldojang@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© {new Date().getFullYear()} ACD Martial Arts - Sports Club Mandsaur. All rights reserved.</p>
        <p className="flex items-center gap-2">
          Designed for Excellence in Martial Arts & Character Building.
        </p>
      </div>
    </footer>
  );
}
