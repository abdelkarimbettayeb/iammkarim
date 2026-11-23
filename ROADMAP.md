# Portfolio v2.1+ Roadmap

Prioritized engineering, UX, and conversion improvements for **iamkarim.vercel.app** (`/`, `/room`, and `/studio`) aimed at making every first-time visitor—recruiters, engineering leads, and founders—immediately impressed on both desktop and mobile.

---

## Phase 1 — High-Impact Polish & Consistency (Quick Wins)

> Highest visual and credibility payoff with minimal scope.

- [x] **Touch-Friendly Hero Tooltips** (`High Impact · Mobile UX`)
  - **Target:** `src/components/cv/HeroTooltip.tsx`
  - **Status:** Added touch-pointer tap-to-toggle state (`open` / outside-tap dismissal) plus `collisionPadding={12}` so tooltips work cleanly on phones and never clip off-screen.

- [x] **Pointer-Aware 3D Stage Telemetry Hint** (`Medium Impact · Mobile UX`)
  - **Target:** `src/components/cv/Atelier3DStage.tsx`
  - **Status:** Added coarse-pointer detection via `useSyncExternalStore` so touch screens show `"Drag to orbit · Tap lamp for theme"` while desktop keeps cursor wording.

- [x] **Copy & Asset Consistency Audit** (`High Impact · Technical Credibility`)
  - **Targets:** `src/components/cv/HybridCV.tsx`, `src/data/resumeData.ts`, `public/`
  - **Status:**
    - Updated Hero `C++ engines` tooltip to accurately describe Alnurayn's C++ N-API search addon and Mouser's `.NET 8 / Avalonia / C++ CMake / Kotlin` stack.
    - Updated Jud timeframe in `resumeData.ts` to `Oct 2025 – Present`.
    - Removed stray `public/Resume - EN - 03 - 12.docx`.
    - *User note:* Double-check `public/Resume.pdf` periodically to confirm it includes your latest Jud, Mouser, Meuble, and BAC Maths bullets.

---

## Phase 2 — Growth, Shareability & Conversion

> Turn LinkedIn posts, GitHub links, and portfolio visits into direct conversations.

- [x] **Deep-Linkable Project Case Studies** (`High Impact · Shareability`)
  - **Targets:** `src/components/cv/HybridCV.tsx`, `src/components/cv/CVCaseStudyModal.tsx`
  - **Status:** Added `?project=<id>` (`jud`, `alnurayn`, `freelance`, `mouser`, `meuble`, `algmath`) support to mount the project on the 3D monitor and open `CVCaseStudyModal` automatically, synced via `history.replaceState`, plus a one-click **Copy Link** button inside the modal footer.

- [x] **Recruiter Fast-Path Actions in Hero & Header** (`Medium Impact · Conversion`)
  - **Targets:** `src/components/cv/HybridCV.tsx`
  - **Status:** Added a one-click **Copy Email** button right beside GitHub and LinkedIn in the Hero CTA row with instant `Copied` state and tooltip feedback. (*Optional future enhancement:* add a Cal.com / Calendly link if you enable calendar booking.)

- [x] **Polished OpenGraph & Project Link Previews** (`Medium Impact · Social CTR`)
  - **Targets:** `src/app/opengraph-image.tsx`
  - **Status:** Upgraded the OG card to Graphite Dark `#18181C` / `#202026` framing with an accent top border, aligned Folded Prism mark, `32+ Commercial Platforms`, `5.0 / 5.0 Client Rating`, and `iamkarim.vercel.app` badge.

---

## Phase 3 — Senior Engineering Craft & Performance

> Subtle product-grade touches and mobile bundle hygiene that set senior portfolios apart.

- [x] **Trim Unused Legacy Google Fonts** (`Medium Impact · Mobile Performance`)
  - **Targets:** `src/app/layout.tsx`, `src/app/globals.css`, `src/app/helpers/fonts.ts`
  - **Status:** Removed unused `Josefin Sans`, `Signika`, and `Padauk` Google Font downloads from the root bundle while preserving backwards-compatible variable aliases mapped to `Bricolage Grotesque`, `DM Sans`, and `JetBrains Mono`.

- [x] **Keyboard Command Palette (`⌘K` / `Ctrl+K`)** (`Medium Impact · Craft`)
  - **Targets:** `src/components/cv/CommandPalette.tsx`, `src/components/cv/HybridCV.tsx`
  - **Status:** Built a full keyboard-navigable command palette (`↑`/`↓`, `Enter`, `Esc`) with desktop header `⌘K` pill trigger to open any case study, jump sections, enter `/room`, copy email, switch theme, or download `Resume.pdf`.

- [x] **Live Open-Source Telemetry & Architecture Proof** (`Low-Medium Impact · Depth`)
  - **Targets:** `src/components/cv/CVCaseStudyModal.tsx`
  - **Status:** Added cached client-side GitHub repository stargazer telemetry for open-source projects (`xnevz/mouser`) rendered as `MIT · Open Source ★ <count>` with silent offline/rate-limit fallback.
