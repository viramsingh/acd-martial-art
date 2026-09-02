'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, CheckCircle2, AlertCircle, ArrowRight, UserPlus, FileText, School, Loader2 } from 'lucide-react';
import { submitRegistration, submitRegistrationApi } from '@/lib/sheets';
import { BeltLevel, StudentRegistration } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function StudentRegistrationPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    guardianName: '',
    emergencyPhone: '',
    schoolName: '',
    batch: 'Evening 5:00 To 6:00',
    beltLevel: 'White Belt' as BeltLevel,
    experience: 'Beginner (No prior experience)',
  });

  const [submittedReg, setSubmittedReg] = useState<StudentRegistration | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reg = await submitRegistrationApi(formData) || submitRegistration(formData);
      setLoading(false);
      setSubmittedReg(reg);
      showToast(`Registration submitted for ${formData.fullName}! Reference: ${reg.id}`, 'success');
      setFormData({
        fullName: '',
        dob: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        guardianName: '',
        emergencyPhone: '',
        schoolName: '',
        batch: 'Evening 5:00 To 6:00',
        beltLevel: 'White Belt' as BeltLevel,
        experience: 'Beginner (No prior experience)',
      });
    } catch (err) {
      setLoading(false);
      showToast('Failed to submit registration. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-12 pb-20 pt-12">
      
      {/* HEADER SECTION */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-bold uppercase tracking-wider">
          <UserPlus className="w-4 h-4 text-red-500" />
          ACD Martial Arts – Sports Club Enrollment
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-white">
          Student Registration Form
        </h1>
        <p className="text-slate-300 text-base">
          Fill out the official student registration form to apply for admission at ACD Martial Arts – Sports Club.
        </p>
      </section>

      {/* REGISTRATION FORM CONTAINER */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-slate-700/80 shadow-2xl relative">
          
          {submittedReg ? (
            <div className="py-12 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Registration Submitted Successfully!</span>
                <h3 className="text-3xl font-extrabold font-outfit text-white">Welcome, {submittedReg.fullName}!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Your application has been registered in the ACD Martial Arts database under status <strong className="text-amber-400 font-mono">PENDING APPROVAL</strong>.
                </p>
              </div>

              {/* Registration Voucher Card */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl max-w-md mx-auto text-left space-y-3 font-mono text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Registration Reference:</span>
                  <span className="text-amber-400 font-bold">{submittedReg.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="text-white font-bold">{submittedReg.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">School / Institution:</span>
                  <span className="text-slate-200">{submittedReg.schoolName || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Preferred Batch:</span>
                  <span className="text-slate-200">{submittedReg.batch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Initial Belt Rank:</span>
                  <span className="text-emerald-400 font-bold">{submittedReg.beltLevel}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => { setSubmittedReg(null); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-6 py-3 rounded-xl border border-slate-700"
                >
                  Submit Another Student Registration
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECTION 1: PERSONAL DETAILS */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-outfit text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  1. Student Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9340772689"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Address / City *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Steel Nagar, Mandsaur"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* SECTION 2: SCHOOL & GUARDIAN DETAILS */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-outfit text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <School className="w-5 h-5 text-amber-500" />
                  2. School & Parent / Guardian Details
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-amber-400" />
                    School / College / Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="e.g. Shree Nitvan Public School, Mandsaur"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Emergency Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="e.g. 9876500000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: BATCH & BELT PREFERENCE */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-outfit text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  3. Batch & Belt Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Preferred Batch *</label>
                    <select
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Evening 5:00 To 6:00">Evening 5:00 To 6:00 PM</option>
                      <option value="Evening 6:30 To 7:30">Evening 6:30 To 7:30 PM</option>
                      <option value="Evening 8:00 To 9:00">Evening 8:00 To 9:00 PM</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Current Belt Level *</label>
                    <select
                      value={formData.beltLevel}
                      onChange={(e) => setFormData({ ...formData, beltLevel: e.target.value as BeltLevel })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="White Belt">White Belt</option>
                      <option value="Yellow Belt">Yellow Belt</option>
                      <option value="Green Belt">Green Belt</option>
                      <option value="Green-1 Belt">Green-1 Belt</option>
                      <option value="Blue Belt">Blue Belt</option>
                      <option value="Blue-1 Belt">Blue-1 Belt</option>
                      <option value="Red Belt">Red Belt</option>
                      <option value="Red-1 Belt">Red-1 Belt</option>
                      <option value="Black Belt">Black Belt</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Previous Experience</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Beginner (No prior experience)">Beginner (No prior experience)</option>
                      <option value="1-2 Years Martial Arts">1-2 Years Martial Arts</option>
                      <option value="Advanced / Tournament Level">Advanced / Tournament Level</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 sm:py-3.5 px-6 rounded-xl shadow-xl transition-all whitespace-nowrap inline-flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Processing Registration...
                  </>
                ) : (
                  <>
                    Complete & Submit Registration
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </section>

    </div>
  );
}
