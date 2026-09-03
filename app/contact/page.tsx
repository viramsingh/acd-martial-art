'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, AlertCircle, Share2, Loader2 } from 'lucide-react';
import { addContactMessage, addContactMessageApi } from '@/lib/sheets';
import { useToast } from '@/context/ToastContext';
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsappIcon } from '@/components/SocialIcons';

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Admission Enquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showToast('Phone number must be exactly 10 numeric digits.', 'error');
      return;
    }

    setLoading(true);

    try {
      await addContactMessageApi({ ...formData, phone: cleanPhone }) || addContactMessage({ ...formData, phone: cleanPhone });
      setLoading(false);
      setSubmitted(true);
      showToast(`Thank you, ${formData.name}! Your message was sent to ACD Academy.`, 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Admission Enquiry',
        message: '',
      });
    } catch (err) {
      setLoading(false);
      showToast('Failed to send message. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-16 pb-20 pt-12">
      
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-red-500" />
          Get In Touch With ACD Martial Arts – Sports Club
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-white">
          Contact Us & Visit Academy
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-base">
          Have questions about admissions, batch timing, fee structures, or training programs? Send us a message or visit our academy.
        </p>
      </section>

      {/* CONTACT INFO & FORM GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Direct Contact & Location Details */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-outfit text-white">Academy Information</h2>
            <p className="text-slate-400 text-sm">
              Visit our Dojang for a free trial training session and meet Master Aditya Chanal.
            </p>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-5 rounded-2xl flex items-start gap-4 border border-slate-700 hover:border-red-500/50 transition-colors">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-xl shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-bold font-outfit text-base">Academy / Dojang Address</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Shree Nitvan Public Schools Rooftop, Steel Nagar near Meghdoot Nagar, Mhow-Neemuch Road, Mandsaur.
                </p>
                <a
                  href="https://share.google/1hs5JhdKoZCa2NvX3"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 border border-red-800/40 px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                >
                  <MapPin className="w-3.5 h-3.5" /> View / Navigate on Google Maps
                </a>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-start gap-4 border border-slate-700">
              <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold font-outfit text-base">Phone & WhatsApp</h4>
                <p className="text-xs text-slate-300">
                  <a href="tel:9340772689" className="hover:text-amber-400 font-semibold">+91 93407 72689</a> (Master Aditya Chanal / Admissions)
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-start gap-4 border border-slate-700">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold font-outfit text-base">Email Support</h4>
                <p className="text-xs text-slate-300">
                  <a href="mailto:Adityachanaldojang@gmail.com" className="hover:text-emerald-400 font-medium">Adityachanaldojang@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Social Media Connect Box */}
            <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-700/80">
              <h4 className="text-white font-bold font-outfit text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" /> Connect On Social Media
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <a
                  href="https://www.instagram.com/acdmartialarts.mandsaur?igsh=aHBxYzBxaWF4amZ1&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-600 border border-slate-800 transition-all text-slate-300 hover:text-white group"
                >
                  <InstagramIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold">Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/share/17QNDRhLt6/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-blue-600 border border-slate-800 transition-all text-slate-300 hover:text-white group"
                >
                  <FacebookIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold">Facebook</span>
                </a>
                <a
                  href="https://www.youtube.com/@acdmartialarts.mandsaur"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-red-600 border border-slate-800 transition-all text-slate-300 hover:text-white group"
                >
                  <YoutubeIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold">YouTube</span>
                </a>
                <a
                  href="https://wa.me/919340772689"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-emerald-600 border border-slate-800 transition-all text-slate-300 hover:text-white group"
                >
                  <WhatsappIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold">WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7 glass-card p-8 rounded-3xl border border-slate-700/80 relative">
          {submitted ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-outfit text-white">Message Received!</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Thank you for contacting ACD Martial Arts – Sports Club. Our staff will get back to you shortly via phone or email.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: 'Admission Enquiry', message: '' }); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl border border-slate-700 mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-outfit text-white">Send Us A Message</h3>
                <p className="text-xs text-slate-400">Fill out the form below to connect directly with our admin team.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Phone Number (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(e.key) && !e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="e.g. 9340772689"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Admission Enquiry">Admission Enquiry</option>
                    <option value="Batch Timing Query">Batch Timing Query</option>
                    <option value="Belt Examination Info">Belt Examination Info</option>
                    <option value="Self Defense Workshop">Self Defense Workshop</option>
                    <option value="Other Query">Other Query</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Submitting Message...
                  </>
                ) : (
                  <>
                    Submit Contact Enquiry
                    <Send className="w-4 h-4" />
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
