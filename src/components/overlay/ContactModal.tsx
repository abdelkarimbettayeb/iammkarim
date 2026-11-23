'use client';

import React, { useState } from 'react';
import { X, Mail, MessageSquare, Download, Linkedin, Github, Send, CheckCircle2, Copy, Check, MapPin } from 'lucide-react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import { personalInfo } from '@/data/resumeData';
import { sendEmail } from '@/app/actions';

const CHANNELS = [
  { label: 'WhatsApp', href: personalInfo.whatsappUrl, icon: MessageSquare, accent: 'var(--cv-live)' },
  { label: 'LinkedIn', href: personalInfo.linkedinUrl, icon: Linkedin, accent: 'var(--cv-ink)' },
  { label: 'GitHub', href: personalInfo.githubUrl, icon: Github, accent: 'var(--cv-ink)' },
  { label: 'CV (PDF)', href: personalInfo.resumePdfUrl, icon: Download, accent: 'var(--cv-accent)' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block font-cv-mono text-[10.5px] uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--cv-ink-muted)' }}
      >
        {label}
      </span>
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6">
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--cv-scrim)' }}
        onClick={handleClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="dialog-in relative cv-modal-sheet w-full max-w-[490px] max-h-[90vh] overflow-y-auto overflow-x-hidden"
      >
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className="block font-cv-mono text-[10.5px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: 'var(--cv-accent)' }}
              >
                Direct Dispatch
              </span>
              <h2
                id="contact-title"
                className="font-cv-display font-bold text-[26px] sm:text-[30px] leading-[1.06] tracking-[-0.025em]"
                style={{ color: 'var(--cv-ink)' }}
              >
                Let&apos;s build something enduring.
              </h2>
              <p className="mt-2 text-[13px] flex items-center gap-1.5" style={{ color: 'var(--cv-ink-muted)' }}>
                <MapPin size={13} className="shrink-0" style={{ color: 'var(--cv-accent)' }} />
                {personalInfo.location}, {personalInfo.availability.toLowerCase()}
              </p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="cv-icon-btn h-9 w-9 shrink-0 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* Email */}
          <div
            className="mt-5 cv-radius-md flex items-center gap-3 p-2 pl-3.5"
            style={{
              backgroundColor: 'var(--cv-surface)',
              border: '1px solid var(--cv-border)',
            }}
          >
            <Mail size={16} className="shrink-0" style={{ color: 'var(--cv-accent)' }} />
            <a
              href={`mailto:${personalInfo.email}`}
              className="text-[13px] font-medium truncate hover:underline underline-offset-4"
              style={{ color: 'var(--cv-ink)' }}
            >
              {personalInfo.email}
            </a>
            <button
              onClick={copyEmail}
              className="ml-auto cv-btn-secondary h-8 px-3 text-[12px] font-medium flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check size={13} style={{ color: 'var(--cv-live)' }} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Quick Channels */}
          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {CHANNELS.map(({ label, href, icon: Icon, accent }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-skill-tile py-3 flex flex-col items-center gap-1.5 text-[11.5px] font-medium"
                style={{ color: 'var(--cv-ink)' }}
              >
                <Icon size={16} style={{ color: accent }} />
                <span>{label}</span>
              </a>
            ))}
          </div>

          <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--cv-border)' }}>
            {submitted ? (
              <div
                className="p-4 cv-radius-md flex items-start gap-3 text-[13.5px]"
                role="status"
                style={{
                  backgroundColor: 'var(--cv-live-soft)',
                  border: '1px solid var(--cv-border)',
                  color: 'var(--cv-ink-secondary)',
                }}
              >
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--cv-live)' }} />
                <span>
                  Message sent. I&apos;ll reply to <strong style={{ color: 'var(--cv-ink)' }}>{formData.email}</strong>.
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
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="cv-input w-full px-3.5 py-2.5"
                    />
                  </Field>
                  <Field label="Your email">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="cv-input w-full px-3.5 py-2.5"
                    />
                  </Field>
                </div>
                <Field label="What are you working on?">
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell me about the team, scope, or architecture…"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="cv-input w-full px-3.5 py-2.5 resize-none"
                  />
                </Field>

                {errorMessage && (
                  <p role="alert" className="text-[12.5px]" style={{ color: 'var(--cv-accent)' }}>
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="cv-btn-primary w-full h-11 text-[13.5px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={15} />
                  <span>{submitting ? 'Sending…' : 'Send message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
