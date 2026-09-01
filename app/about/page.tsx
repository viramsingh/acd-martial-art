'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Shield, Target, Flame, Users, CheckCircle2, ArrowRight, Sparkles, Sword } from 'lucide-react';

export default function AboutPage() {
  const instructors = [
    {
      name: 'Founder & Head Coach Aditya Chanal',
      title: 'Founder, Head Coach & Chief Instructor',
      rank: 'Black Belt Dan Master',
      exp: '15+ Years Martial Arts Experience',
      image: '/assets/IMG_4159.PNG',
      bio: 'Founder of Aditya Chanal Dojang, dedicated to training athletes in Taekwondo, Kickboxing, Kung Fu, Self-Defense, and traditional martial arts weapons (Katana, Nunchaku, Bo Staff).',
    },
  ];

  const beltPath = [
    { belt: 'White Belt', title: 'Beginner Rank', desc: 'Purity & Foundation. Basic stances, fundamental blocks, punches, and discipline.', class: 'belt-white' },
    { belt: 'Yellow Belt', title: 'Novice Rank', desc: 'The Earth. Deepening stance control, basic front kicks, and form kata 1.', class: 'belt-yellow' },
    { belt: 'Green Belt', title: 'Intermediate Rank', desc: 'Growth & Power. Side kicks, roundhouse kicks, speed sparring combinations.', class: 'belt-green' },
    { belt: 'Green-1 Belt', title: 'Intermediate Advanced', desc: 'Enhanced form precision, combinations, and controlled sparring technique.', class: 'belt-green' },
    { belt: 'Blue Belt', title: 'Advanced Rank', desc: 'The Sky. High jumping kicks, Katana & Nunchaku weapons, counter-attack strategy.', class: 'belt-blue' },
    { belt: 'Blue-1 Belt', title: 'Advanced Senior', desc: 'Complex weapon forms, speed agility drills, and competitive ring sparring.', class: 'belt-blue' },
    { belt: 'Red Belt', title: 'Senior Rank', desc: 'Danger & Control. Master level sparring drills, assistant instruction practice.', class: 'belt-red' },
    { belt: 'Red-1 Belt', title: 'Senior Expert', desc: 'Pre-Black Belt Dan preparation, high endurance, and leadership development.', class: 'belt-red' },
    { belt: 'Black Belt', title: 'Expert Dan Rank', desc: 'Maturity & Mastery. Certified black belt rank, master instructor level, and elite athlete.', class: 'belt-black-1st' },
  ];

  return (
    <div className="space-y-20 pb-20 pt-12">
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4 text-red-500" />
          About ACD Martial Arts – Sports Club
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-white">
          Developing Discipline, Power & Warrior Mindset
        </h1>
        <p className="text-slate-300 max-w-3xl mx-auto text-base">
          ACD Martial Arts – Sports Club is a dedicated martial arts academy committed to developing discipline, confidence, power, fitness, and practical martial arts skills in students of all ages.
        </p>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* HISTORY & VISION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl font-extrabold font-outfit text-white">
              Our Passion, Mission & Philosophy
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Founded with a passion for training and empowering individuals, <strong className="text-white font-semibold">ACD Martial Arts</strong> specializes in <span className="text-amber-400 font-semibold">Taekwondo, Kickboxing, Kung Fu, and Self-Defense</span>, along with traditional martial arts weapons training.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our training includes expertise in traditional weapons such as <strong className="text-white font-medium">Katana, Nunchaku, Bo Staff</strong>, and various other martial arts weapons. We combine traditional martial arts values with modern training methods to provide structured, progressive, and performance-oriented training.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-red-500/30 text-amber-300/90 font-medium">
              "At ACD Martial Arts, our goal is not only to teach students how to fight, but also to build discipline, respect, confidence, physical fitness, mental strength, and a strong warrior mindset."
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="glass-card p-4 rounded-xl border border-red-500/30">
                <h4 className="text-amber-400 font-bold font-outfit text-lg">Our Vision</h4>
                <p className="text-xs text-slate-300 mt-1">To empower every student with unbreakable self-confidence, athletic fitness, and moral courage.</p>
              </div>
              <div className="glass-card p-4 rounded-xl border border-amber-500/30">
                <h4 className="text-red-400 font-bold font-outfit text-lg">Our Motto</h4>
                <p className="text-xs text-slate-300 mt-1">Discipline in Mind • Power in Body • Honor in Spirit.</p>
              </div>
            </div>
          </div>

          {/* Coach Back Position Stand Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[440px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <Image src="/assets/IMG_4159.PNG" alt="Founder & Head Coach Aditya Chanal Dojang Batch Training" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 glass-card p-5 rounded-xl border border-slate-700">
                <p className="text-white font-bold font-outfit text-lg">Founder & Head Coach Aditya Chanal</p>
                <p className="text-xs text-amber-400 font-medium">Leading Dojang batch on rooftop turf training facility.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SPECIALIZED WEAPONS & DISCIPLINES */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">Traditional & Modern Training</span>
          <h2 className="text-3xl font-extrabold font-outfit text-white">Weapons Mastery & Fighting Styles</h2>
          <p className="text-slate-400 text-sm">
            Expert instruction combining ancient weapon arts with modern combat fitness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-700/60">
            <div className="relative h-56 w-full rounded-xl overflow-hidden">
              <Image src="/assets/IMG_9229.JPEG" alt="Katana Sword Training" fill className="object-cover" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Katana Sword Mastery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional Japanese blade handling, draw strikes, focus drills, and precise sword stance execution.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-700/60">
            <div className="relative h-56 w-full rounded-xl overflow-hidden">
              <Image src="/assets/nunchaku_practice.jpg" alt="Nunchaku & Bo Staff Training" fill className="object-cover object-top" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Nunchaku & Bo Staff</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-speed wrist rotation, dual Nunchaku technique, long Bo staff blocks, and coordination drills.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-700/60">
            <div className="relative h-56 w-full rounded-xl overflow-hidden">
              <Image src="/assets/IMG_8855.JPEG" alt="Taekwondo, Kickboxing & Kung Fu" fill className="object-cover" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Taekwondo, Kickboxing & Kung Fu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-body combat conditioning, ring sparring, self-defense escapes, and high vertical kicks.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* INSTRUCTOR PROFILE (ONLY HEAD COACH ADITYA CHANAL) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Leadership & Master</span>
          <h2 className="text-3xl font-extrabold font-outfit text-white">Certified Master Trainer</h2>
          <p className="text-slate-400 text-sm">
            Learn directly under Founder & Head Coach Aditya Chanal committed to your growth and athletic success.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {instructors.map((inst, i) => (
            <div key={i} className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl">
              <div className="relative h-80 w-full">
                <Image src={inst.image} alt={inst.name} fill className="object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  {inst.rank}
                </span>
              </div>
              <div className="p-8 space-y-3">
                <h3 className="text-2xl font-bold font-outfit text-white">{inst.name}</h3>
                <p className="text-xs font-semibold text-amber-400">{inst.title} • {inst.exp}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{inst.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* BELT PROGRESSION TIMELINE */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">Student Progression Path</span>
          <h2 className="text-3xl font-extrabold font-outfit text-white">Belt Rank Graduation System</h2>
          <p className="text-slate-400 text-sm">
            Clear, structured milestones from White Belt beginner to Black Belt rank.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {beltPath.map((item, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl space-y-3 border border-slate-700/80 relative">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${item.class}`}>
                  {item.belt}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Stage {idx + 1}</span>
              </div>
              <h4 className="text-lg font-bold font-outfit text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* REGISTRATION CTA */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-red-500/40 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
            Start Your Journey with ACD Martial Arts Today
          </h3>
          <p className="text-slate-300 max-w-xl mx-auto text-sm">
            Admissions are open for Evening batches (5:00-6:00, 6:30-7:30, 8:00-9:00 PM). Fill out the student registration form to reserve your spot.
          </p>
          <Link
            href="/registration"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-xl shadow-xl text-xs sm:text-sm uppercase tracking-wider"
          >
            Register Student Online <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
