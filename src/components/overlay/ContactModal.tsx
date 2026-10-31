'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Mail, MessageSquare, Download, Linkedin, Github, Send, CheckCircle2 } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { personalInfo } from '@/data/resumeData';
import { sendEmail } from '@/app/actions';

export function ContactModal() {
  const isContactOpen = useRoomStore((state) => state.isContactOpen);
  const toggleContact = useRoomStore((state) => state.toggleContact);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isContactOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await sendEmail(null, formData);
      if (res && (res.name?.length || res.email?.length)) {
        setErrorMessage('Please check the entered fields.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMessage('Something went wrong. Please reach out via email directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/80 shadow-2xl rounded-3xl p-6 sm:p-7 text-white animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-widest text-amber-400">
              Direct Contact
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-0.5 text-white">
              Get in Touch
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Have an exciting project, contract, or full-time role? Let&apos;s talk.
            </p>
          </div>

          <button
            onClick={toggleContact}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Social & Resume Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <Link
            href={`mailto:${personalInfo.email}`}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex flex-col items-center text-center gap-1.5 transition-all hover:scale-105"
          >
            <Mail size={16} className="text-sky-400" />
            <span className="text-[10px] font-bold text-slate-200">Email</span>
          </Link>

          <Link
            href={personalInfo.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex flex-col items-center text-center gap-1.5 transition-all hover:scale-105"
          >
            <MessageSquare size={16} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-200">WhatsApp</span>
          </Link>

          <Link
            href={personalInfo.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex flex-col items-center text-center gap-1.5 transition-all hover:scale-105"
          >
            <Linkedin size={16} className="text-blue-400" />
            <span className="text-[10px] font-bold text-slate-200">LinkedIn</span>
          </Link>

          <Link
            href={personalInfo.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex flex-col items-center text-center gap-1.5 transition-all hover:scale-105"
          >
            <Github size={16} className="text-slate-300" />
            <span className="text-[10px] font-bold text-slate-200">GitHub</span>
          </Link>
        </div>

        {/* PDF Resume Download Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Download size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Curriculum Vitae (PDF)</div>
              <div className="text-[10px] text-slate-400">Complete verified resume</div>
            </div>
          </div>
          <Link
            href={personalInfo.resumePdfUrl}
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            Download
          </Link>
        </div>

        {/* Send Direct Message Form */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Send a Message
          </h3>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 size={20} className="shrink-0" />
              <span>Thank you! Your message has been sent successfully.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div>
                <textarea
                  rows={3}
                  placeholder="Your Message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-400 font-semibold">{errorMessage}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
