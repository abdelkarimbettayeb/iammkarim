'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Mail, MessageSquare, Download, Linkedin, Github, Send, CheckCircle2 } from 'lucide-react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => { toggleContact(); roomStore.setActiveStation('none'); }}
    >
      {/* Radical Glassmorphic Dialog Panel */}
      <div
        className="relative w-full max-w-lg glass-panel-master rounded-[28px] p-6 sm:p-8 text-white animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Decorative Light Diffusers */}
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-25 pointer-events-none bg-amber-500" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none bg-sky-500" />

        {/* Header */}
        <div className="relative flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                Direct Contact
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-primary font-bold text-white tracking-tight">
              Get in Touch
            </h2>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1 font-paragraph leading-relaxed">
              Have an exciting project, contract, or full-time role? Let&apos;s talk.
            </p>
          </div>

          <button
            onClick={toggleContact}
            className="p-2.5 rounded-xl glass-btn-secondary text-slate-300 hover:text-white transition-all flex items-center justify-center shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Social & Resume Glass Tiles */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
          <Link
            href={`mailto:${personalInfo.email}`}
            className="p-3 rounded-2xl glass-tile flex flex-col items-center text-center gap-1.5 transition-all hover:scale-105"
          >
            <Mail size={17} className="text-sky-400" />
            <span className="text-[11px] font-bold text-slate-200">Email</span>
          </Link>

          <Link
            href={personalInfo.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl glass-tile flex flex-col items-center text-center gap-1.5 transition-all hover:scale-105"
          >
            <MessageSquare size={17} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-200">WhatsApp</span>
          </Link>

          <Link
            href={personalInfo.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl glass-tile flex flex-col items-center text-center gap-1.5 transition-all hover:scale-105"
          >
            <Linkedin size={17} className="text-blue-400" />
            <span className="text-[11px] font-bold text-slate-200">LinkedIn</span>
          </Link>

          <Link
            href={personalInfo.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl glass-tile flex flex-col items-center text-center gap-1.5 transition-all hover:scale-105"
          >
            <Github size={17} className="text-slate-200" />
            <span className="text-[11px] font-bold text-slate-200">GitHub</span>
          </Link>
        </div>

        {/* PDF Resume Download Glass Banner */}
        <div className="relative mt-5 p-4 rounded-2xl glass-tile border border-sky-500/30 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
              <Download size={17} />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">Curriculum Vitae (PDF)</div>
              <div className="text-[10px] text-slate-300">Complete verified resume</div>
            </div>
          </div>
          <Link
            href={personalInfo.resumePdfUrl}
            target="_blank"
            className="px-4 py-2 rounded-xl glass-btn-primary text-white font-bold text-xs transition-all hover:scale-105 shrink-0"
          >
            Download
          </Link>
        </div>

        {/* Send Direct Message Glass Form */}
        <div className="relative mt-6 pt-5 border-t border-white/[0.08]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3.5">
            Send a Direct Message
          </h3>

          {submitted ? (
            <div className="p-4 rounded-2xl glass-tile border border-emerald-500/40 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
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
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell me about your project or inquiry..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-slate-400 focus:outline-none transition-all resize-none"
                />
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-400 font-semibold p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl glass-btn-primary text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Send size={14} />
                <span>{submitting ? 'Sending Transmission...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
