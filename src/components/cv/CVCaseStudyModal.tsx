"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import {
  X,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Github,
  Link2,
  Check,
  Star,
} from "lucide-react";
import { cartridgeProjects } from "@/data/resumeData";
import type { CartridgeId } from "@/types/room";
import { JudPlatformPreview } from "./JudPlatformPreview";
import { CppSearchPreview } from "./CppSearchPreview";
import { MostaqlReviewsPreview } from "./MostaqlReviewsPreview";
import { MouserKvmPreview } from "./MouserKvmPreview";
import { MeubleStorePreview } from "./MeubleStorePreview";
import { AlgMathPreview } from "./AlgMathPreview";

const ORDER = Object.keys(cartridgeProjects) as CartridgeId[];
const githubStarsCache = new Map<string, number>();

function getGithubRepoPath(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/?#]+)/i);
  return match ? match[1].replace(/\.git$/, "") : null;
}

interface CVCaseStudyModalProps {
  projectId: CartridgeId | null;
  onClose: () => void;
  onSelectProject: (id: CartridgeId) => void;
  onLoadOn3DMonitor: (id: CartridgeId) => void;
}

const emptySubscribe = () => () => {};

export function CVCaseStudyModal({
  projectId,
  onClose,
  onSelectProject,
  onLoadOn3DMonitor,
}: CVCaseStudyModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [linkCopied, setLinkCopied] = useState(false);
  // Keyed by project so switching projects collapses again without an effect.
  const [expandedFor, setExpandedFor] = useState<CartridgeId | null>(null);
  const [starMap, setStarMap] = useState<Record<string, number>>({});

  const repoPath =
    projectId && cartridgeProjects[projectId]?.isOpenSource
      ? getGithubRepoPath(cartridgeProjects[projectId]?.url)
      : null;

  useEffect(() => {
    if (!repoPath || githubStarsCache.has(repoPath)) return;
    let cancelled = false;
    fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stargazers_count?: unknown } | null) => {
        if (cancelled || !data || typeof data.stargazers_count !== "number")
          return;
        githubStarsCache.set(repoPath, data.stargazers_count);
        setStarMap((prev) => ({
          ...prev,
          [repoPath]: data.stargazers_count as number,
        }));
      })
      .catch(() => {
        // Silent fallback to static Open Source badge
      });
    return () => {
      cancelled = true;
    };
  }, [repoPath]);

  const step = React.useCallback(
    (dir: 1 | -1) => {
      if (!projectId) return;
      const idx = ORDER.indexOf(projectId);
      onSelectProject(ORDER[(idx + dir + ORDER.length) % ORDER.length]);
    },
    [projectId, onSelectProject],
  );

  useEffect(() => {
    if (!projectId) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "Escape") onClose();
      if (tag && ["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projectId, onClose, step]);

  if (!mounted || !projectId) return null;

  const project = cartridgeProjects[projectId];
  if (!project) return null;

  const starCount = repoPath
    ? (starMap[repoPath] ?? githubStarsCache.get(repoPath) ?? null)
    : null;

  const handleCopyCaseLink = async () => {
    const shareUrl = `${window.location.origin}/?project=${project.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const expanded = expandedFor === projectId;

  const index = ORDER.indexOf(projectId);
  const serial = `PRJ—0${index + 1}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-case-title"
    >
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity"
        style={{ backgroundColor: "var(--cv-scrim)" }}
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <section className="cv-modal-sheet relative z-10 w-full sm:max-w-[740px] max-h-[90dvh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Top Metadata Chrome */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--cv-border)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="h-2.5 w-2.5 shrink-0"
              style={{
                borderRadius: "9999px",
                backgroundColor: project.color,
              }}
            />
            <span
              className="font-cv-mono text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: "var(--cv-accent)" }}
            >
              {serial}
            </span>
            <span style={{ color: "var(--cv-ink-subtle)" }}>/</span>
            <span
              className="text-[12px] truncate"
              style={{ color: "var(--cv-ink-muted)" }}
            >
              {project.subtitle}
            </span>
            {project.isOpenSource && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 cv-radius-pill font-cv-mono text-[10px] font-semibold uppercase shrink-0"
                style={{
                  backgroundColor: "var(--cv-surface)",
                  color: "var(--cv-ink)",
                  border: "1px solid var(--cv-border)",
                }}
              >
                <Github size={11} />
                <span>MIT · Open Source</span>
                {starCount !== null && (
                  <span
                    className="inline-flex items-center gap-0.5 cv-tabular"
                    style={{ color: "#F59E0B" }}
                  >
                    <Star size={10} fill="#F59E0B" color="#F59E0B" />
                    <span>{starCount}</span>
                  </span>
                )}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close case study"
            className="cv-icon-btn h-9 w-9 flex items-center justify-center shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5"
          onWheel={(e) => {
            // Scrolling down past the end of the summary stretches the card.
            const el = e.currentTarget;
            if (
              !expanded &&
              e.deltaY > 0 &&
              el.scrollTop + el.clientHeight >= el.scrollHeight - 2
            ) {
              setExpandedFor(projectId);
            }
          }}
        >
          {/* Interactive Visual Preview or Framed Image */}
          {project.visualType === "jud-platform" ? (
            <div className="cv-project-frame w-full min-h-[300px] sm:min-h-[330px]">
              <JudPlatformPreview key={project.id} variant="modal" />
            </div>
          ) : project.visualType === "cpp-search" ? (
            <div className="cv-project-frame w-full min-h-[300px] sm:min-h-[330px]">
              <CppSearchPreview key={project.id} variant="modal" />
            </div>
          ) : project.visualType === "mostaql-reviews" ? (
            <div className="cv-project-frame w-full min-h-[300px] sm:min-h-[320px]">
              <MostaqlReviewsPreview key={project.id} variant="modal" />
            </div>
          ) : project.visualType === "mouser-kvm" ? (
            <div className="cv-project-frame w-full min-h-[300px] sm:min-h-[325px]">
              <MouserKvmPreview key={project.id} variant="modal" />
            </div>
          ) : project.visualType === "meuble-store" ? (
            <div className="cv-project-frame w-full min-h-[300px] sm:min-h-[330px]">
              <MeubleStorePreview key={project.id} variant="modal" />
            </div>
          ) : project.visualType === "alg-math" ? (
            <div className="cv-project-frame w-full min-h-[300px] sm:min-h-[330px]">
              <AlgMathPreview key={project.id} variant="modal" />
            </div>
          ) : project.image ? (
            <div className="cv-project-frame w-full h-44 sm:h-52">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <div>
            <h2
              id="cv-case-title"
              className="font-cv-display font-bold text-[22px] sm:text-[26px] leading-[1.1] tracking-[-0.025em]"
              style={{ color: "var(--cv-ink)" }}
            >
              {project.title}
            </h2>

            {project.caseStudy ? (
              <>
                <p
                  className="mt-2 text-[13px] leading-[1.55]"
                  style={{ color: "var(--cv-ink-secondary)" }}
                >
                  {project.caseStudy.overview}
                </p>

                {/* 4-Column Tabular KPI Stats Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {project.caseStudy.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="px-3 py-2.5 cv-radius-sm"
                      style={{
                        backgroundColor: "var(--cv-surface)",
                        border: "1px solid var(--cv-border)",
                      }}
                    >
                      <div
                        className="font-cv-display font-bold text-[17px] sm:text-[18px] leading-tight cv-tabular"
                        style={{ color: project.color }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="mt-0.5 font-cv-mono text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--cv-ink)" }}
                      >
                        {stat.label}
                      </div>
                      {expanded && stat.detail && (
                        <div
                          className="mt-0.5 text-[11px] leading-snug"
                          style={{ color: "var(--cv-ink-muted)" }}
                        >
                          {stat.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Key Metrics Highlight Strip */
              <div
                className="mt-3.5 px-4 py-3 cv-radius-sm"
                style={{
                  backgroundColor: "var(--cv-surface)",
                  borderLeft: `3px solid ${project.color}`,
                  borderTop: "1px solid var(--cv-border)",
                  borderRight: "1px solid var(--cv-border)",
                  borderBottom: "1px solid var(--cv-border)",
                }}
              >
                <span
                  className="block font-cv-mono text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: "var(--cv-ink-muted)" }}
                >
                  Impact &amp; Delivery Metric
                </span>
                <p
                  className="text-[14px] font-medium leading-snug"
                  style={{ color: "var(--cv-ink)" }}
                >
                  {project.metrics}
                </p>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          <div>
            <h3
              className="font-cv-mono text-[11px] uppercase tracking-widest mb-2.5"
              style={{ color: "var(--cv-ink-muted)" }}
            >
              Core Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="cv-chip px-2.5 py-1 font-cv-mono text-[11px] uppercase"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Expand toggle + full details (the card stretches via grid-rows) */}
          <div>
            <button
              type="button"
              onClick={() => setExpandedFor(expanded ? null : projectId)}
              aria-expanded={expanded}
              aria-controls="cv-case-details"
              className="cv-btn-secondary w-full h-11 text-[13px] font-semibold flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--cv-accent-soft)',
                borderColor: 'var(--cv-accent)',
                color: 'var(--cv-accent)',
              }}
            >
              <span>{expanded ? "Show less" : "Show full details"}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            <div
              id="cv-case-details"
              inert={!expanded}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                expanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pt-5 space-y-5">
                  {project.caseStudy ? (
                    <>
                      {/* Challenge & Solution Cards */}
                      {(project.caseStudy.problem ||
                        project.caseStudy.solution) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {project.caseStudy.problem && (
                            <div
                              className="p-3.5 cv-radius-sm"
                              style={{
                                backgroundColor: "var(--cv-surface)",
                                border: "1px solid var(--cv-border)",
                              }}
                            >
                              <span
                                className="block font-cv-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                                style={{ color: "var(--cv-ink-muted)" }}
                              >
                                Engineering Challenge
                              </span>
                              <p
                                className="text-[13px] leading-[1.55]"
                                style={{ color: "var(--cv-ink-secondary)" }}
                              >
                                {project.caseStudy.problem}
                              </p>
                            </div>
                          )}

                          {project.caseStudy.solution && (
                            <div
                              className="p-3.5 cv-radius-sm"
                              style={{
                                backgroundColor: "var(--cv-surface)",
                                borderLeft: `3px solid ${project.color}`,
                                borderTop: "1px solid var(--cv-border)",
                                borderRight: "1px solid var(--cv-border)",
                                borderBottom: "1px solid var(--cv-border)",
                              }}
                            >
                              <span
                                className="block font-cv-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                                style={{ color: project.color }}
                              >
                                Architecture Solution
                              </span>
                              <p
                                className="text-[13px] leading-[1.55]"
                                style={{ color: "var(--cv-ink-secondary)" }}
                              >
                                {project.caseStudy.solution}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* System Architecture & Subsystems */}
                      {project.caseStudy.architecture &&
                        project.caseStudy.architecture.length > 0 && (
                          <div>
                            <h3
                              className="font-cv-mono text-[11px] uppercase tracking-widest mb-3"
                              style={{ color: "var(--cv-ink-muted)" }}
                            >
                              System Architecture &amp; Subsystems
                            </h3>
                            <div className="space-y-3">
                              {project.caseStudy.architecture.map((mod) => (
                                <div
                                  key={mod.code}
                                  className="p-3.5 sm:p-4 cv-radius-sm"
                                  style={{
                                    backgroundColor: "var(--cv-surface)",
                                    border: "1px solid var(--cv-border)",
                                  }}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        className="font-cv-mono text-[11px] font-semibold cv-tabular shrink-0"
                                        style={{ color: project.color }}
                                      >
                                        {mod.code}
                                      </span>
                                      <h4
                                        className="font-cv-display font-bold text-[14.5px] sm:text-[15px] leading-snug"
                                        style={{ color: "var(--cv-ink)" }}
                                      >
                                        {mod.title}
                                      </h4>
                                    </div>
                                    {mod.badge && (
                                      <span
                                        className="font-cv-mono text-[9.5px] uppercase px-2 py-0.5 cv-radius-sm shrink-0"
                                        style={{
                                          backgroundColor:
                                            "var(--cv-surface-elevated)",
                                          color: "var(--cv-ink-muted)",
                                          border: "1px solid var(--cv-border)",
                                        }}
                                      >
                                        {mod.badge}
                                      </span>
                                    )}
                                  </div>

                                  <p
                                    className="mt-1.5 text-[13px] leading-[1.55]"
                                    style={{ color: "var(--cv-ink-secondary)" }}
                                  >
                                    {mod.summary}
                                  </p>

                                  <ul className="mt-2 space-y-1.5">
                                    {mod.bullets.map((b, bIdx) => (
                                      <li
                                        key={bIdx}
                                        className="flex items-start gap-2 text-[12.5px] leading-[1.5]"
                                        style={{ color: "var(--cv-ink-muted)" }}
                                      >
                                        <span
                                          className="mt-1.5 h-1.5 w-1.5 shrink-0 cv-radius-pill"
                                          style={{
                                            backgroundColor: project.color,
                                          }}
                                        />
                                        <span>{b}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </>
                  ) : (
                    /* Engineering Deliverables */
                    <div>
                      <h3
                        className="font-cv-mono text-[11px] uppercase tracking-widest mb-3"
                        style={{ color: "var(--cv-ink-muted)" }}
                      >
                        Architecture &amp; Engineering Notes
                      </h3>
                      <ol className="space-y-2.5">
                        {project.description.map((line, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-[14px] leading-[1.6]"
                            style={{ color: "var(--cv-ink-secondary)" }}
                          >
                            <span
                              className="font-cv-mono text-[11px] mt-1 shrink-0 cv-tabular"
                              style={{ color: "var(--cv-accent)" }}
                            >
                              0{i + 1}
                            </span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 shrink-0"
          style={{
            borderTop: "1px solid var(--cv-border)",
            backgroundColor: "var(--cv-surface)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => step(-1)}
              aria-label="Previous project"
              className="cv-icon-btn h-9 w-9 flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="font-cv-mono text-[11.5px] px-2 cv-tabular"
              style={{ color: "var(--cv-ink-muted)" }}
            >
              0{index + 1} / 0{ORDER.length}
            </span>
            <button
              onClick={() => step(1)}
              aria-label="Next project"
              className="cv-icon-btn h-9 w-9 flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleCopyCaseLink}
              title="Copy direct case study link"
              className="cv-btn-secondary h-9 px-3 text-[12px] font-medium flex items-center gap-1.5"
            >
              {linkCopied ? (
                <Check size={14} style={{ color: "var(--cv-live)" }} />
              ) : (
                <Link2 size={14} />
              )}
              <span className="hidden sm:inline">
                {linkCopied ? "Copied" : "Copy Link"}
              </span>
            </button>

            <button
              onClick={() => onLoadOn3DMonitor(project.id)}
              className="cv-btn-secondary h-9 px-3.5 text-[12.5px] font-medium flex items-center gap-1.5"
            >
              <Monitor size={14} style={{ color: "var(--cv-accent)" }} />
              <span>3D Monitor</span>
            </button>

            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-btn-primary h-9 px-4 text-[12.5px] font-semibold flex items-center gap-1.5"
              >
                {project.isOpenSource && <Github size={14} />}
                <span>
                  {project.isOpenSource ? "Open on GitHub" : "Open Project"}
                </span>
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
