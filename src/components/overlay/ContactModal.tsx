'use client';

import React, { useState } from 'react';
import { X, Mail, MessageSquare, Download, Linkedin, Github, Send, CheckCircle2, Copy, Check, MapPin } from 'lucide-react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import { personalInfo } from '@/data/resumeData';
import { sendEmail } from '@/app/actions';

const CHANNELS = [
  { label: 'WhatsApp', href: personalInfo.whatsappUrl, icon: MessageSquare, tint: 'text-emerald-300' },
  { label: 'LinkedIn', href: personalInfo.linkedinUrl, icon: Linkedin, tint: 'text-sky-300' },
  { label: 'GitHub', href: personalInfo.githubUrl, icon: Github, tint: 'text-white' },
  { label: 'CV (PDF)', href: personalInfo.resumePdfUrl, icon: Download, tint: 'text-amber-300' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] text-slate-300 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function ContactModal() {
  const isContactOpen = useRoomStore((state) => state.isContactOpen);
  const toggleContact = useRoomStore((state) => state.toggleContact);

  const handleClose = React.useCallback(() => {
    toggleContact();
    roomStore.setActiveStation('none');
  }, [toggleContact]);

  React.useEffect(() => {
    if (!isContactOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isContactOpen, handleClose]);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isContactOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await sendEmail(null, formData);
      if (res && (res.name?.length || res.email?.length)) {
        setErrorMessage('Check your name and email address, then send again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMessage(`The message didn't go through. You can email me directly at ${personalInfo.email}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${personalInfo.email}`;
    }
  };

  return (
    <div className="hud fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6">
      <div
        className="scrim-in absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgb(14_23_38/0.35),rgb(3_7_18/0.7))] backdrop-blur-[3px]"
        onClick={handleClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="dialog-in relative glass-panel-master w-full max-w-[480px] max-h-[90vh] overflow-y-auto overflow-x-hidden"
        style={{ '--a1': '#ffb547', '--a2': '#5cc8ff', '--a3': '#8b7cff' } as React.CSSProperties}
      >
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        <div className="relative p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="contact-title" className="font-primary font-bold text-[28px] sm:text-[32px] leading-[1.05] tracking-[-0.02em] text-white">
                Let&apos;s build something
              </h2>
              <p className="mt-2 text-[13px] text-slate-300 flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-300 shrink-0" />
                {personalInfo.location}, {personalInfo.availability.toLowerCase()}
              </p>
            </div>
            <button onClick={handleClose} aria-label="Close" className="h-9 w-9 shrink-0 glass-btn-secondary text-slate-200 flex items-center justify-center">
              <X size={17} />
            </button>
          </div>

          {/* Email first: it's what most people want */}
          <div className="mt-5 glass-tile flex items-center gap-3 p-1.5 pl-3">
            <Mail size={16} className="text-sky-300 shrink-0" />
            <a href={`mailto:${personalInfo.email}`} className="text-[13.5px] text-white truncate hover:underline underline-offset-4">
              {personalInfo.email}
            </a>
            <button
              onClick={copyEmail}
              className="ml-auto h-8 px-3 glass-btn-secondary text-[12px] text-slate-200 flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-2">
            {CHANNELS.map(({ label, href, icon: Icon, tint }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-tile hover:-translate-y-0.5 py-3 flex flex-col items-center gap-1.5 text-[11.5px] text-slate-200"
              >
                <Icon size={17} className={tint} />
                {label}
              </a>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            {submitted ? (
              <div className="pane-in flex items-start gap-3 text-[13.5px] text-emerald-200" role="status">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-300 mt-0.5" />
                <span>
                  Message sent. I&apos;ll reply to <span className="text-white">{formData.email}</span>.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Your name">
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 glass-input text-[13.5px] text-white"
                    />
                  </Field>
                  <Field label="Your email">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 glass-input text-[13.5px] text-white"
                    />
                  </Field>
                </div>
                <Field label="What are you working on?">
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 glass-input text-[13.5px] text-white resize-none"
                  />
                </Field>

                {errorMessage && (
                  <p role="alert" className="text-[12.5px] text-rose-300">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 glass-btn-primary text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={15} className={submitting ? 'animate-pulse' : ''} />
                  {submitting ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
