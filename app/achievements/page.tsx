'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Award, Star, Calendar, Filter, Sparkles, Medal } from 'lucide-react';
import { getAchievements, fetchAchievements } from '@/lib/sheets';
import { Achievement } from '@/types';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchAchievements()
      .then((data) => setAchievements(data))
      .catch(() => setAchievements(getAchievements()));
  }, []);

  const filteredList = achievements.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'MEDAL') return item.position.toLowerCase().includes('medal');
    if (filter === 'BELT') return item.event.toLowerCase().includes('belt') || item.title.toLowerCase().includes('belt');
    return true;
  });

  return (
    <div className="space-y-16 pb-20 pt-12">
      
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          ACD Martial Art Hall of Fame
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-white">
          Academy & Student Achievements
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-base">
          Celebrating medals, tournament victories, and belt grading milestones earned by ACD athletes.
        </p>
      </section>

      {/* FILTER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-amber-400" /> Filter Achievements:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Achievements ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('MEDAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'MEDAL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Championship Medals
          </button>
          <button
            onClick={() => setFilter('BELT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'BELT'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Belt Promotions & Grading
          </button>
        </div>
      </section>

      {/* ACHIEVEMENTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-700/70 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative h-56 w-full">
                  <Image
                    unoptimized
                    src={item.imageUrl || '/assets/achievement_trophy.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Medal className="w-3.5 h-3.5" /> {item.position}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" /> {item.date}
                  </div>
                  <h3 className="text-xl font-bold font-outfit text-white">{item.title}</h3>
                  {item.studentName && (
                    <p className="text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/40 px-2.5 py-1 rounded-md w-fit">
                      Student: {item.studentName} ({item.studentId || 'ACD Athlete'})
                    </p>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Event: {item.event}</span>
                <span>Ref: {item.id}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
