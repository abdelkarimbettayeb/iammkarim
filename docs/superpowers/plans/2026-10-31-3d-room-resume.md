# 3D Isometric Room Resume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the portfolio into an interactive 3D isometric diorama room resume with tactile fiddle features, retro cartridges, mouse-reactive parallax, waving language flags, 3D tech emblems, and an accessible slide-out resume drawer.

**Architecture:** A full-screen Next.js 15 / React 19 app powered by Three.js and `@react-three/fiber` (`@react-three/drei`). A centralized Zustand / React state store manages camera target focus, active cartridge selection, day/night mode, and audio triggers. The 3D canvas is surrounded by lightweight glassmorphic HTML overlays (Quick-Nav bar, Case Study modal, Contact drawer, and Radix Sheet for the complete classic CV).

**Tech Stack:** Next.js 15, React 19, Three.js, `@react-three/fiber`, `@react-three/drei`, Tailwind CSS, Lucide React, Web Audio API, `next-themes`.

**Spec:** `D:/projects/cv/iambettayeb/docs/superpowers/specs/2026-10-31-3d-room-resume-design.md`

## Global Constraints
- Target: Next.js 15 (App Router, Turbopack) & React 19 in `d:/projects/cv/iambettayeb`.
- Palette: Charcoal accent `#181A1B`, warm teak `#D96B27`, mustard yellow `#EAB308`, oatmeal carpet `#F3EFE6`, botanical green `#22C55E`, azure `#0284C7`.
- Performance: 100% procedural Three.js geometries & standard PBR materials for instant loading and 60 FPS on Vercel; zero heavy external GLTF file dependencies.
- Shell: 100vw/100vh full-screen canvas (`overflow: hidden`). Mouse wheel strictly zooms 3D camera.
- Resume Content: The entire rich 2D resume (who am I, achievements, projects, testimonials, skills) is preserved in a slide-out Radix Sheet drawer.
- Audio: Web Audio API synthesis engine (guitar strum, lamp switch, dartboard, cartridge click) with a prominent global mute toggle (muted by default).

## Review Focus
1. Camera bounding: User drags orbit camera aggressively -> Clamped angles prevent camera flipping upside down or clipping through walls.
2. Rapid cartridge clicking: Clicking multiple cartridges in quick succession -> State transitions cleanly cancel/replace in-flight animation without crashing.
3. Mobile touch gestures: Pinch-to-zoom and touch drag on small screens -> Smooth camera scaling without scrolling the browser viewport.
4. Audio autoplay policies: Clicking guitar or switches when browser has not unlocked audio context -> Gracefully unlocks on first user gesture without throwing unhandled exceptions.
5. High-DPI screens: Canvas rendering on 4K / Retina displays -> `dpr={[1, 2]}` clamp prevents GPU overheating while keeping edges sharp.

---

### Task 1: Resume Data Model & Room State Store

**Files:**
- Create: `src/types/room.ts`
- Create: `src/data/resumeData.ts`
- Create: `src/store/useRoomStore.ts`

**Interfaces:**
- Produces:
  - `RoomZone`: `'overview' | 'skills' | 'experience' | 'workstation' | 'contact'`
  - `CartridgeId`: `'alnurayn' | 'freelance' | 'tastytracks'`
  - `useRoomStore`: Zustand/hook managing `activeZone`, `activeCartridge`, `isMuted`, `isDrawerOpen`, `isContactOpen`, and camera transition actions.

- [ ] **Step 1: Define TypeScript definitions in `src/types/room.ts`**
  - Define interfaces for `FlagItem`, `TechSkillItem`, `CartridgeProject`, `AchievementItem`, and room state types.

- [ ] **Step 2: Create structured resume data in `src/data/resumeData.ts`**
  - Migrate all data from `src/app/page.tsx` (Alnurayn, Mostaql Freelance, TastyTracks, 9+ years experience, achievements, languages: Arabic, French, English, and skills: React, Next.js, Node.js, PostgreSQL, Tailwind, C#/C++).

- [ ] **Step 3: Create room state hook in `src/store/useRoomStore.ts`**
  - Provide reactive state for camera target coordinates, active cartridge, audio mute state, drawer open state, and zone transitions.

- [ ] **Step 4: Verify TypeScript compilation**
  Run: `yarn tsc --noEmit`
  Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**
  ```bash
  git add src/types/room.ts src/data/resumeData.ts src/store/useRoomStore.ts
  git commit -m "feat: add resume data structures and room state store"
  ```

---

### Task 2: Web Audio Procedural Sound Engine

**Files:**
- Create: `src/lib/audioEngine.ts`

**Interfaces:**
- Consumes: `isMuted` from `useRoomStore`
- Produces:
  - `playSound(effect: 'guitar' | 'lamp' | 'dart' | 'cartridge' | 'chime') -> void`

- [ ] **Step 1: Implement Web Audio synthesis in `src/lib/audioEngine.ts`**
  - Create audio context with automatic user-gesture unlock.
  - Implement acoustic guitar strum (multi-oscillator decay simulation).
  - Implement mechanical click for desk lamp / switches.
  - Implement dull thud for dartboard impact.
  - Implement pleasant retro slot-in chime for cartridges.

- [ ] **Step 2: Test audio execution in browser**
  - Verify `playSound` executes cleanly without errors when muted or unmuted.

- [ ] **Step 3: Commit**
  ```bash
  git add src/lib/audioEngine.ts
  git commit -m "feat: add procedural Web Audio sound synthesis engine"
  ```

---

### Task 3: 3D Room Architecture & Camera Rig

**Files:**
- Create: `src/components/room/RoomCanvas.tsx`
- Create: `src/components/room/RoomStructure.tsx`
- Create: `src/components/room/LightingRig.tsx`
- Create: `src/components/room/CameraRig.tsx`

**Interfaces:**
- Consumes: `useRoomStore` for camera positioning, `next-themes` for Day/Night mode.
- Produces:
  - `<RoomCanvas />` rendering the 3D diorama canvas with bounded `CameraControls`, soft contact shadows, and mouse-parallax room tilt.

- [ ] **Step 1: Implement `RoomStructure.tsx`**
  - Procedural geometry: Floor with oatmeal carpet texture (`#F3EFE6`), dark charcoal accent back wall (`#181A1B`), right plaster wall (`#F8F9FA`), detailed window frame with horizontal Venetian blinds, skirting boards.

- [ ] **Step 2: Implement `LightingRig.tsx`**
  - Day mode: Warm sunlight directional light streaming through blinds with soft shadows + warm ambient fill.
  - Night mode: Cool ambient fill, warm desk lamp spot cone, emissive neon rim lighting.

- [ ] **Step 3: Implement `CameraRig.tsx`**
  - Bounded camera controls: Azimuth clamped between $-45^\circ$ and $+45^\circ$, polar clamped between $30^\circ$ and $75^\circ$.
  - Mouse-parallax tilt: Slight camera target offset based on pointer coordinates.
  - Smooth interpolation to zone coordinates when `activeZone` updates.

- [ ] **Step 4: Implement `RoomCanvas.tsx`**
  - R3F Canvas configured with `dpr={[1, 2]}`, `gl={{ antialias: true }}`, `ContactShadows`, and floating dust motes.

- [ ] **Step 5: Verify build & render**
  Run: `yarn tsc --noEmit`
  Expected: PASS

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/room/
  git commit -m "feat: implement 3D room structure, lighting rig, and camera controls"
  ```

---

### Task 4: Upper Shelf (Waving Language Flags, Fern & Identity)

**Files:**
- Create: `src/components/room/TopShelf.tsx`
- Create: `src/components/room/WavingFlag.tsx`

**Interfaces:**
- Consumes: `resumeData.languages`
- Produces:
  - `<TopShelf />` mounted on the charcoal wall.

- [ ] **Step 1: Build teak floating shelf & framed avatar in `TopShelf.tsx`**
  - Teak shelf plank (`#D96B27`), low-poly potted fern with lush leaves, framed portrait photograph with stand.

- [ ] **Step 2: Build `WavingFlag.tsx`**
  - 3D mini desk flag poles with cloth meshes (Algeria/Arabic, France/French, UK/English).
  - Gentle harmonic waving animation (`Math.sin` vertex offset).
  - Hover tooltip (`<Html />` from `@react-three/drei`) displaying language name and fluency rating.

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/room/TopShelf.tsx src/components/room/WavingFlag.tsx
  git commit -m "feat: add top shelf with waving language flags and avatar"
  ```

---

### Task 5: Wall Decor & Interactive Dartboard

**Files:**
- Create: `src/components/room/WallDecor.tsx`

**Interfaces:**
- Consumes: `playSound('dart')`
- Produces:
  - `<WallDecor />` with 3D "BETTAYEB" logo and interactive dartboard.

- [ ] **Step 1: Implement extruded 3D logo in `WallDecor.tsx`**
  - 3D extruded lettering `BETTAYEB` mounted on charcoal wall with soft metallic finish.

- [ ] **Step 2: Implement interactive dartboard & dart flight**
  - Segmented circular dartboard with numbered rings and bullseye.
  - On click: triggers dart launch animation sticking into bullseye, plays sound effect, displays celebratory hit particle.

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/room/WallDecor.tsx
  git commit -m "feat: add wall branding and playable dartboard easter egg"
  ```

---

### Task 6: Tall Bookcase (Retro Cartridges, 3D Tech Emblems & Props)

**Files:**
- Create: `src/components/room/Bookcase.tsx`
- Create: `src/components/room/RetroCartridge.tsx`
- Create: `src/components/room/TechEmblem.tsx`

**Interfaces:**
- Consumes: `resumeData.projects`, `resumeData.skills`, `playSound`, `useRoomStore`
- Produces:
  - `<Bookcase />` housing the 3 game cartridges, floating 3D tech emblems, and floor props (acoustic guitar, sneakers, tennis racket).

- [ ] **Step 1: Build modular cube bookcase in `Bookcase.tsx`**
  - 4x2 teakwood cube shelving with realistic inner borders and storage boxes.

- [ ] **Step 2: Build `RetroCartridge.tsx`**
  - Color-coded retro cartridges (Alnurayn Blue, Freelance Emerald, TastyTracks Gold) with embossed stickers.
  - Click interaction: Cartridge lifts with glow, plays chime, updates `activeCartridge` in store, and triggers camera glide to workstation screen.

- [ ] **Step 3: Build `TechEmblem.tsx`**
  - 3D geometric icons for React, Next.js, Node.js, PostgreSQL, Tailwind, and C++/C#.
  - Subtle floating hover animation (`<Float />`) with skill level badge.

- [ ] **Step 4: Implement floor props & guitar strum**
  - Acoustic guitar leaning on bookcase: Click plays acoustic chord strum with body wobble.
  - Sneakers on welcome mat and tennis racket with bouncy ball.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/room/Bookcase.tsx src/components/room/RetroCartridge.tsx src/components/room/TechEmblem.tsx
  git commit -m "feat: add tall bookcase with retro cartridges, tech emblems, and acoustic guitar"
  ```

---

### Task 7: Workstation Desk (Interactive Monitor, Clicky Keyboard & Lamp)

**Files:**
- Create: `src/components/room/Workstation.tsx`
- Create: `src/components/room/DeskLamp.tsx`

**Interfaces:**
- Consumes: `activeCartridge`, `useRoomStore`, `next-themes`
- Produces:
  - `<Workstation />` with ultrawide monitor, mechanical keyboard, desk console, and theme-switching lamp.

- [ ] **Step 1: Build teak desk, gaming chair, and console in `Workstation.tsx`**
  - Desk surface, metal legs, Eames-style modern desk chair, and gaming console slotted underneath.

- [ ] **Step 2: Implement interactive ultrawide monitor**
  - Emissive screen displaying retro booting animation and current project graphics based on `activeCartridge`.
  - Clicking the monitor zooms camera in and triggers the Case Study modal.

- [ ] **Step 3: Implement `DeskLamp.tsx` with Day/Night toggle**
  - Stylized desk lamp with clickable lamp head.
  - Click triggers mechanical click sound and toggles `next-themes` (switching 3D lighting rig and site theme).

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/room/Workstation.tsx src/components/room/DeskLamp.tsx
  git commit -m "feat: add workstation desk with interactive monitor and day/night lamp"
  ```

---

### Task 8: Foreground Lounge & Vintage Mailbox

**Files:**
- Create: `src/components/room/ForegroundLounge.tsx`
- Create: `src/components/room/VintageMailbox.tsx`

**Interfaces:**
- Consumes: `useRoomStore`
- Produces:
  - `<ForegroundLounge />` with mustard yellow armchair, cactus table, and mailbox opening the contact drawer.

- [ ] **Step 1: Model mustard armchair and coffee table in `ForegroundLounge.tsx`**
  - Mid-century mustard armchair (`#EAB308`), wooden angled legs, round coffee table with potted cactus.
  - Clicking armchair triggers gentle cushion squash/bounce.

- [ ] **Step 2: Model `VintageMailbox.tsx`**
  - Standing mailbox by the desk.
  - Clicking pops up the red mail flag, hinges open the door, and sets `isContactOpen = true` in store.

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/room/ForegroundLounge.tsx src/components/room/VintageMailbox.tsx
  git commit -m "feat: add foreground lounge and interactive mailbox"
  ```

---

### Task 9: 2D HUD Overlays (Quick-Nav, Case Study Modal, Contact Drawer & Classic Resume Sheet)

**Files:**
- Create: `src/components/overlay/TopHeader.tsx`
- Create: `src/components/overlay/QuickNavBar.tsx`
- Create: `src/components/overlay/CaseStudyModal.tsx`
- Create: `src/components/overlay/ContactModal.tsx`
- Create: `src/components/overlay/ResumeDrawer.tsx`

**Interfaces:**
- Consumes: `useRoomStore`, `resumeData`
- Produces:
  - Responsive, crisp glassmorphic UI controls rendered above the 3D canvas.

- [ ] **Step 1: Build `TopHeader.tsx`**
  - Logo/title, Sound Toggle button (Mute/Unmute), Day/Night indicator, and `[📄 Full Resume]` trigger button.

- [ ] **Step 2: Build `QuickNavBar.tsx`**
  - Floating pill bar at the bottom: `[Overview]`, `[Skills]`, `[Experience]`, `[Workstation]`, `[Contact]`.
  - Clicking triggers smooth camera transitions to that room zone.

- [ ] **Step 3: Build `CaseStudyModal.tsx`**
  - Responsive glass card showing active cartridge details: project title, role, architecture description, tech stack badges, live URL, and GitHub links with a close button.

- [ ] **Step 4: Build `ContactModal.tsx`**
  - Direct contact form (using existing `src/components/ReachMe/index.tsx`), email link, LinkedIn, GitHub, and Resume PDF download.

- [ ] **Step 5: Build `ResumeDrawer.tsx`**
  - Radix UI Sheet component housing the full, rich traditional CV sections (About, 9+ Years experience, Achievements, Testimonials, Full Projects, and Education).

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/overlay/
  git commit -m "feat: implement 2D HUD overlays, case study modal, contact drawer, and full resume sheet"
  ```

---

### Task 10: Page Integration, Polishing & Verification

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: All 3D components and 2D overlay modules.

- [ ] **Step 1: Wire full-screen 3D app into `src/app/page.tsx`**
  - Mount `<RoomCanvas />`, `<TopHeader />`, `<QuickNavBar />`, `<CaseStudyModal />`, `<ContactModal />`, and `<ResumeDrawer />`.
  - Prevent body overflow and enable dedicated wheel zoom.

- [ ] **Step 2: Add smooth transitions and glassmorphic styling in `src/app/globals.css`**
  - Configure custom backdrop-blur, glow utilities, and scrollbar styling for the drawer.

- [ ] **Step 3: Run comprehensive verification**
  - Run: `yarn tsc --noEmit`
  - Run: `yarn build`
  - Expected: Clean production build with zero errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/app/page.tsx src/app/globals.css
  git commit -m "feat: wire 3D isometric room into main application page"
  ```

