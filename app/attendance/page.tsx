'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle2, ShieldCheck, Lock, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { getAttendanceRecords, fetchAttendanceRecords } from '@/lib/sheets';
import { AttendanceRecord } from '@/types';

export default function AttendancePublicPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchAttendanceRecords()
      .then((data) => setRecords(data))
      .catch(() => setRecords(getAttendanceRecords()));
  }, []);

  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 96;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-16 pb-20 pt-12">
      
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600/20 border border-emerald-600/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Daily Student Attendance Status
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-white">
          Academy Attendance Overview
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-base">
          ACD Martial Arts – Sports Club maintains strict daily attendance discipline across all training batches.
        </p>
        <p className="text-xs text-amber-400 font-mono font-semibold">Today: {todayStr}</p>
      </section>

      {/* METRICS & OVERVIEW CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Overall Consistency Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-extrabold font-outfit text-emerald-400">{attendanceRate}%</p>
          <p className="text-xs text-slate-400">High discipline attendance across morning and evening sessions.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Evening Batches</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-4xl font-extrabold font-outfit text-white">3 Slots</p>
          <p className="text-xs text-slate-400">5:00-6:00 PM, 6:30-7:30 PM, 8:00-9:00 PM</p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-2 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Privacy Standard</span>
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-xl font-bold font-outfit text-white pt-1">Individual Log Privacy</p>
          <p className="text-xs text-slate-400">Personal student attendance logs are securely accessible by authorized admins.</p>
        </div>
      </section>

      {/* BATCH STATUS CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-bold font-outfit text-white border-l-4 border-red-600 pl-4">
          Today's Evening Batch Schedule
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3 border border-emerald-500/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-md">
                Active Slot 1
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Evening Batch 1</h3>
            <p className="text-xs text-amber-400 font-semibold font-mono">Time: 5:00 PM To 6:00 PM</p>
            <p className="text-xs text-slate-400">Curriculum: Beginners & Intermediate Taekwondo, Kicking Drills & Stance Foundation.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 border border-emerald-500/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-md">
                Active Slot 2
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Evening Batch 2</h3>
            <p className="text-xs text-amber-400 font-semibold font-mono">Time: 6:30 PM To 7:30 PM</p>
            <p className="text-xs text-slate-400">Curriculum: Kickboxing Sparring, Katana & Nunchaku Weapon Practice.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 border border-amber-500/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-md">
                Active Slot 3
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Evening Batch 3</h3>
            <p className="text-xs text-amber-400 font-semibold font-mono">Time: 8:00 PM To 9:00 PM</p>
            <p className="text-xs text-slate-400">Curriculum: Advanced Combat, Black Belt Level Sparring & Self-Defense Escapes.</p>
          </div>
        </div>
      </section>

      {/* ADMIN PRIVACY NOTICE & PORTAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 rounded-3xl border border-red-500/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start text-red-400 font-bold text-sm">
              <Lock className="w-4 h-4" /> Authorized Admin Attendance Portal
            </div>
            <h3 className="text-2xl font-bold font-outfit text-white">Need to Mark or Review Student Attendance?</h3>
            <p className="text-slate-300 text-xs max-w-lg">
              Log in with your academy admin credentials to record daily student attendance, update status logs, and view full historical reports.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 text-sm whitespace-nowrap"
          >
            Admin Login Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
