'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Zap, Award, Users, CheckCircle2, ArrowRight, Calendar, Star, Trophy, Target, Flame, Clock, MapPin } from 'lucide-react';
import { getEvents, getAchievements, fetchEvents, fetchAchievements } from '@/lib/sheets';
import { UpcomingEvent, Achievement } from '@/types';

export default function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchEvents()
      .then((data) => setUpcomingEvents(data))
      .catch(() => setUpcomingEvents(getEvents()));

    fetchAchievements()
      .then((data) => setRecentAchievements(data.slice(0, 3)))
      .catch(() => setRecentAchievements(getAchievements().slice(0, 3)));
  }, []);
  const trainingServices = [
    {
      title: 'Taekwondo & Kicking Mastery',
      category: 'Flexibility & Olympic Kicking',
      description: 'Master high vertical axe kicks, jumping kicks, agility drills, and WTF certified sparring forms under Master Aditya Chanal.',
      icon: Flame,
      color: 'from-red-600 to-amber-600',
      image: '/assets/IMG_5101.PNG',
    },
    {
      title: 'Kickboxing & Ring Combat',
      category: 'WAKO Championship Sport',
      description: 'High-intensity stamina training combining boxing gloves, ring sparring, core strength, and rapid kick combinations.',
      icon: Zap,
      color: 'from-orange-600 to-red-600',
      image: '/assets/IMG_8855.JPEG',
    },
    {
      title: 'Traditional Weapons (Katana, Nunchaku, Bo Staff)',
      category: 'Kung Fu & Traditional Arts',
      description: 'Expertise in traditional weapons including Katana blade strikes, dual Nunchaku, Bo Staff forms, and mental focus.',
      icon: Target,
      color: 'from-amber-500 to-yellow-600',
      image: '/assets/nunchaku_practice.jpg',
    },
    {
      title: 'Kung Fu & Youth Self-Defense',
      category: 'Real-World Combat & Sparring',
      description: 'Practical self-defense tactics, chest & head guard sparring drills, and building a strong warrior mindset.',
      icon: Shield,
      color: 'from-red-700 to-purple-700',
      image: '/assets/IMG_7470.JPEG',
    },
  ];

  const whyChooseUs = [
    {
      title: 'Certified Master Trainers',
      desc: 'Instructors with over 15+ years of experience holding official Black Belt Dan certifications.',
    },
    {
      title: 'Structured Belt Progression',
      desc: 'Standardized grading examinations from White Belt all the way to Black Belt levels.',
    },
    {
      title: 'Tournament & Championship Exposure',
      desc: 'Regular participation in District, State, National, and Open Martial Arts Tournaments.',
    },
    {
      title: 'Daily Attendance & Digital Records',
      desc: 'Transparent student record management, attendance tracking, and performance reports.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      
      {/* ------------------------------------------------------------- */}
      {/* HERO BANNER SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-slate-800">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/AISelect_20260814_193426_Instagram(1).jpg.jpeg"
            alt="ACD Martial Arts Outdoor Dojang Training"
            fill
            priority
            className="object-cover object-center opacity-90 brightness-125 contrast-95 scale-100 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19]/65 via-[#0B0F19]/30 to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center sm:text-left grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-600/40 text-red-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md max-w-full text-left leading-tight">
              <Flame className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
              <span>Aditya Chanal Dojang • ACD Martial Arts – Sports Club</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold font-outfit text-white tracking-tight leading-[1.1]">
              UNLEASH YOUR <br />
              <span className="bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
                INNER WARRIOR
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
              Welcome to <strong className="text-white font-semibold">ACD Martial Arts – Sports Club</strong>. Specializing in Taekwondo, Kickboxing, Kung Fu, Self-Defense, and traditional weapons (Katana, Nunchaku, Bo Staff). Build discipline, power, and a strong warrior mindset.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3 sm:gap-4">
              <Link
                href="/registration"
                className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl shadow-xl shadow-red-950/60 hover:scale-105 transition-all text-xs sm:text-sm border border-red-500/50 uppercase tracking-wider"
              >
                Join Now / Register
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/achievements"
                className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all text-xs sm:text-sm"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                View Achievements
              </Link>
              <Link
                href="/contact"
                className="whitespace-nowrap inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white font-semibold px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl hover:bg-slate-800/60 transition-colors text-xs sm:text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Quick Highlight Stats Box */}
          <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-2xl space-y-6 border border-slate-700/60 relative">
            <div className="absolute -top-3 -right-3 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              Academy Highlights
            </div>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4 text-left">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white font-outfit">500+</h4>
                <p className="text-xs text-slate-400 font-medium">Students Enrolled & Trained</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4 text-left">
              <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white font-outfit">45+</h4>
                <p className="text-xs text-slate-400 font-medium">State & National Medals</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white font-outfit">98%</h4>
                <p className="text-xs text-slate-400 font-medium">Daily Attendance Consistency</p>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ------------------------------------------------------------- */}
      {/* ABOUT SHORT INTRODUCTION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-6 relative">
            <div className="relative h-[320px] sm:h-[450px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <Image
                src="/assets/IMG_4159.PNG"
                alt="Master Aditya Chanal leading Dojang batch"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 glass-card p-4 rounded-xl">
                <p className="text-white font-bold font-outfit text-sm sm:text-base">Founder & Head Coach Aditya Chanal</p>
                <p className="text-xs text-amber-400 font-medium">Taekwondo, Kickboxing, Kung Fu & Traditional Weapons Dojang</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="text-xs font-bold uppercase tracking-widest text-red-500">
              About ACD Martial Arts – Sports Club
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white leading-tight">
              Developing Discipline, Power & Fitness
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              ACD Martial Arts – Sports Club is a dedicated martial arts academy committed to developing discipline, confidence, power, fitness, and practical martial arts skills in students of all ages.
            </p>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Our training includes expertise in traditional weapons such as Katana, Nunchaku, Bo Staff, and various other martial arts weapons. We combine traditional martial arts values with modern training methods to build discipline, respect, physical fitness, and a strong warrior mindset.
            </p>

            <div className="pt-2 flex items-center gap-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-bold text-sm uppercase tracking-wider group"
              >
                Learn More About Our Philosophy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* ------------------------------------------------------------- */}
      {/* MARTIAL ARTS TRAINING SERVICES */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">Our Training Programs</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white">
            Specialized Martial Arts Disciplines
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Comprehensive training modules in Taekwondo, Kickboxing, Kung Fu, Self-Defense, and Katana & Nunchaku weapons.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainingServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={i}
                className="glass-card glass-card-hover p-5 rounded-2xl space-y-4 flex flex-col justify-between border border-slate-700/60 overflow-hidden group text-left"
              >
                <div className="space-y-4">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className={`absolute top-3 left-3 p-2 rounded-lg bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                    {service.category}
                  </span>
                  <h3 className="text-lg font-bold font-outfit text-white leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <Link
                  href="/registration"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 pt-2"
                >
                  Enroll in this batch <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* UPCOMING EVENTS SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">Stay Updated</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">Upcoming Events & Tournaments</h2>
          </div>
          <Link
            href="/registration"
            className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300"
          >
            Register For Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((event, idx) => (
            <div key={idx} className="glass-card p-5 sm:p-6 rounded-2xl space-y-4 border border-slate-700/80 hover:border-red-500/50 transition-all flex flex-col justify-between text-left group overflow-hidden">
              <div className="space-y-3">
                {event.image && (
                  <div className="relative h-44 w-full rounded-xl overflow-hidden mb-2">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${event.badgeColor}`}>
                    {event.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold font-mono">
                    <Calendar className="w-3.5 h-3.5" /> {event.date}
                  </div>
                </div>

                <h3 className="text-lg font-bold font-outfit text-white leading-snug">{event.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{event.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-tight">{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* WHY CHOOSE ACD MARTIAL ART */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-slate-900/60 border-y border-slate-800/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Why Choose Us</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white leading-tight">
                Why ACD Martial Arts Stands Out
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                We combine traditional martial art values of respect, endurance, and humility with modern fitness science and transparent digital student administration.
              </p>

              <div className="pt-2">
                <Link
                  href="/registration"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg text-sm uppercase tracking-wider"
                >
                  Register As A Student Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-left">
              {whyChooseUs.map((item, idx) => (
                <div key={idx} className="glass-card p-5 rounded-xl space-y-2 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-red-500 font-bold font-outfit text-base">
                    <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0" />
                    {item.title}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-7">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* ------------------------------------------------------------- */}
      {/* ACHIEVEMENTS HIGHLIGHT TEASER */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Hall of Fame</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">Recent Academy Highlights</h2>
          </div>
          <Link
            href="/achievements"
            className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300"
          >
            View All Medals & Trophies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {recentAchievements.map((ach) => (
            <div key={ach.id} className="glass-card p-6 rounded-2xl space-y-4 border border-amber-500/30 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative h-56 sm:h-60 w-full rounded-xl overflow-hidden">
                  <Image unoptimized src={ach.imageUrl || '/assets/achievement_trophy.jpg'} alt={ach.title} fill className="object-cover object-top" />
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-full uppercase tracking-wide inline-block">
                  {ach.position}
                </span>
                <h3 className="text-lg font-bold font-outfit text-white leading-snug">{ach.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM CTA BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-900/80 via-slate-900 to-slate-900 border border-red-600/40 rounded-3xl p-6 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left shadow-2xl relative overflow-hidden">
          <div className="space-y-3 z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white">
              Ready to Begin Your Martial Arts Journey?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Register online today or visit our academy for a free trial session. Evening batches (5:00-6:00, 6:30-7:30, 8:00-9:00 PM) open for admissions.
            </p>
          </div>
          <div className="z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center w-full lg:w-auto shrink-0">
            <Link
              href="/registration"
              className="whitespace-nowrap inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl shadow-lg hover:scale-105 transition-all text-xs sm:text-sm uppercase tracking-wider text-center"
            >
              Fill Student Form
            </Link>
            <Link
              href="/contact"
              className="whitespace-nowrap inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl border border-slate-700 text-xs sm:text-sm text-center"
            >
              Contact Academy
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
