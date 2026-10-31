# Design Document: 3D Isometric Room Resume ("iambettayeb")

**Date:** 2026-10-31  
**Project:** iambettayeb (`iamkarim`)  
**Target:** Next.js 15 / React 19 / Vercel  

---

## 1. Intent & The "Why"
The objective is to transform Abdelkarim Bettayeb's portfolio into an interactive, warm, and memorable 3D isometric diorama room (inspired by modern 3D room illustrations). When visitors, clients, or recruiters land on the site, they should immediately be captivated by its originality, playful atmosphere, and tactile "fidget-factor"—exploring Abdelkarim's 9+ years of engineering accomplishments through interactive physical metaphors rather than a flat static resume.

---

## 2. Application Shell & Page Architecture
- **Fullscreen Immersive 3D Experience:** The application mounts as a 100vw / 100vh full-bleed canvas (`overflow: hidden`).
- **Scroll Behavior:** Mouse wheel scrolling and two-finger trackpad gestures are dedicated directly to 3D camera zooming in and out (no window scroll conflicts).
- **Slide-Out Classic Resume Drawer:** A prominent, accessible button in the top navigation bar (`[📄 View Full Resume]`) slides out a sleek, accessible 2D Radix Sheet drawer containing Abdelkarim's complete background, 9+ years summary, achievements (10+ web apps, 10+ payment gateways, etc.), testimonials, and full project descriptions.

---

## 3. Goals, Non-Goals & Anti-Goals

### Goals
- **Warm & Original Aesthetic:** Recreate the cozy, stylish look of the reference photo using a balanced color palette (warm teak, mustard armchair, charcoal accent wall, oatmeal carpet, botanical green).
- **Tactile Fidget-Factor:** Every zone contains interactive easter eggs with sound effects (guitar strum, lamp switch, clickable dartboard, popping mailbox).
- **Mouse-Reactive Backdrop:** Subtle parallax tilt tracking the cursor, dynamic shadow movement, and floating ambient dust particles.
- **Storytelling via Shelves:**
  - **Upper Shelf:** Spoken languages represented by waving 3D miniature desk flags (Arabic, French, English) with fluency tooltips.
  - **Middle Bookcase:** 3D glowing tech emblems for core languages and frameworks (React, Next.js, Node.js, PostgreSQL, Tailwind, C++/C#).
  - **Company Experience:** Retro Game Cartridges (Option C) that can be clicked to slot into a console and boot up interactive case studies on the workstation monitor.
- **Unified Camera System:** Seamless blending of free bounded 360° orbit, mouse wheel zoom in/out, cinematic click-to-focus zoom on objects, and a bottom quick-nav pill bar (`[Overview] [Skills] [Experience] [Projects] [Contact]`).
- **High Performance:** Smooth 60 FPS on standard laptops and mobile devices, zero multi-megabyte GLTF loading bottlenecks.

### Non-Goals
- Building an entire multi-room house or walkthrough game.
- Heavy 50MB+ photorealistic textured scans that crash mobile GPUs.
- Discarding the rich 2D resume content: it is fully preserved inside the accessible slide-out drawer.

### Anti-Goals
- Cluttered, overwhelming visuals that make reading the actual CV content difficult.
- Disruptive autoplay audio (all audio must respect browser autoplay policies and provide a prominent mute toggle).
- Disorienting free-flight camera that flips upside down or clips into the back walls.

---

## 4. Visual & Aesthetic System

### Color Palette
- **Charcoal Accent Wall:** `#181A1B` (creates depth and contrast behind the teak shelving).
- **Plaster / Window Wall:** `#F8F9FA` with Venetian blinds filtering warm directional light.
- **Warm Teak Furniture:** `#D96B27` / `#C85A17` (desk, top shelf, and tall cube bookcase).
- **Mustard Pop:** `#EAB308` (mid-century modern yellow armchair).
- **Oatmeal Carpet Floor:** `#F3EFE6` (soft, inviting floor texture with baseboard trim).
- **Botanical Green:** `#22C55E` (potted cactus, hanging fern).
- **Azure Accent:** `#0284C7` (binders, posters, flag accents).

---

## 5. Room Layout & Zones

```
+--------------------------------------------------------------+
| [Top Shelf] Flags (AR, FR, EN) | Plants | Framed Avatar       |
| [Back Wall] 3D "BETTAYEB" Logo | Dartboard | Pendant Lamp    |
|                                                              |
| [Workstation Desk]                                           |
|   - Ultrawide Monitor (boots interactive cartridge data)     |
|   - Mechanical Keyboard (typing sound effects)               |
|   - Desk Lamp (toggles global Day / Night theme)             |
|   - Gaming Console underneath                                |
|                                                              |
| [Tall Bookcase]                                              |
|   - Top: Retro Cartridges (Alnurayn, Mostaql, TastyTracks)   |
|   - Mid: 3D Tech Emblems (React, Next.js, Node, Postgres, C#)|
|   - Floor: Acoustic Guitar (strum audio), Sneakers, PS5      |
|                                                              |
| [Foreground Lounge]                                          |
|   - Yellow Armchair & Coffee Table with Potted Cactus        |
|   - Vintage Mailbox (pops open contact modal & resume)       |
+--------------------------------------------------------------+
```

### Detailed Zone Specifications

#### Zone 1: Upper Wall Shelf (Languages & Identity)
- Mini 3D flags: Algeria/Arabic, France/French, UK/English.
- Behavior: Hovering causes the flag to wave gently and shows a glassmorphic tooltip with fluency level (Native / Fluent / Professional).
- Accompanied by a low-poly potted hanging fern and a framed portrait photograph.

#### Zone 2: Back Wall & Branding
- 3D extruded lettering on the wall: `BETTAYEB` with soft metallic bevel.
- Dartboard: Hover shows target cursor; clicking shoots a dart into the bullseye with a sound effect.
- Hanging pendant lamp casting soft downward lighting.

#### Zone 3: Tall Cube Bookshelf (Experience & Skills)
- **Top Cubes (Retro Game Cartridges):**
  1. *Cartridge 1: Alnurayn.org* (Fullstack Engineering, PostgreSQL, Node, C++ search engine).
  2. *Cartridge 2: Mostaql Freelance* (30+ completed projects, 5-star client ratings, payment gateways, web scraping, bots).
  3. *Cartridge 3: TastyTracks* (Restaurant platform, Figma to React).
  - *Interaction:* Clicking a cartridge lifts it from the shelf, triggers a snappy camera glide over to the desk, and illuminates the workstation monitor while opening a crisp, responsive 2D glass case study panel for effortless reading and clickable project links.
- **Middle Cubes (3D Tech Emblems):**
  - Stylized glowing 3D emblems for React, Next.js, Node.js, PostgreSQL, Tailwind, and C++/C#. Hovering gently floats and rotates them with skill descriptions.
- **Lower Cube & Floor Props:**
  - Acoustic guitar: Clicking plays an authentic acoustic guitar strum.
  - Tennis racket and tennis ball: Bounces when clicked.
  - Sneakers placed on an oatmeal "Welcome!" mat.

#### Zone 4: Central Workstation (Active Projects & Mode Switch)
- Desk surface with monitor, mouse, and clicky keyboard.
- Desk Lamp: Clicking the lamp shade synchronizes with `next-themes`, toggling the entire application and 3D lighting between **Day Mode** (warm daylight streaming through blinds) and **Night Mode** (ambient neon cyberpunk lighting + monitor glow).
- Ultrawide Monitor: Clicking the screen opens the interactive project case study panel.

#### Zone 5: Foreground Lounge & Contact
- Mid-century mustard armchair and coffee table with a small potted cactus.
- Vintage Mailbox: Standing beside the desk. Clicking it raises the red flag, opens the door, and pops up the Contact Modal with email, LinkedIn (`karimbettayeb`), GitHub (`xnevz`), and Resume download.

---

## 6. Navigation & Unified Camera Controls

The camera system merges all three requested modes:
1. **Free Smooth Orbit (Bounded):**
   - User can click and drag to rotate the room.
   - Azimuth angle clamped between $-45^\circ$ and $+45^\circ$, polar angle clamped between $30^\circ$ and $75^\circ$ (preventing awkward wall backfaces or clipping under the floor).
   - Wheel scroll controls smooth distance zoom in/out with minimum and maximum distance clamps.
   - Mouse parallax: When not dragging, mouse position gently offsets the camera target for an organic 3D parallax feel.
2. **Click-to-Focus Cinematic Swoop:**
   - Clicking an interactive element (Desk, Shelf, Cartridge, Mailbox) smoothly glides the camera into a tailored close-up angle using `@react-three/drei`'s `CameraControls`.
   - An elegant floating "← Back to Room" button returns to the default isometric view.
3. **Floating Quick-Nav Bar:**
   - A glassmorphic bottom bar with buttons:
     - `[Overview]` (resets isometric camera)
     - `[Skills]` (zooms to tech shelf)
     - `[Experience]` (zooms to retro cartridges)
     - `[Workstation]` (zooms to monitor)
     - `[Contact]` (zooms to mailbox)

---

## 7. Audio Architecture
- **Web Audio Engine:** Procedural synthesizers / lightweight micro-audio triggers for:
  - Guitar acoustic chord strum.
  - Desk lamp click switch.
  - Dartboard thud.
  - Cartridge slotting sound.
  - Achievement chime.
- **Global Sound Toggle:** Located in the top header (muted by default with a clear speaker icon, remembers preference in `localStorage`).

---

## 8. Technical Implementation Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI & State:** React 19, Tailwind CSS, Lucide React, `next-themes`, Radix UI Sheet
- **3D Engine:** Three.js + `@react-three/fiber` (R3F)
- **3D Helpers:** `@react-three/drei` (`Canvas`, `CameraControls`, `Float`, `Html`, `ContactShadows`)
- **Asset Strategy:** Lightweight procedural geometries (boxes, cylinders, lathed shapes) with tuned PBR standard materials to guarantee sub-second load times and flawless Vercel deployment.

---

## 9. Builder Decisions Recorded
- **Monitor Case Studies:** Rendered as a synchronized responsive 2D glass sheet overlay rather than an in-canvas 3D DOM element to eliminate font raster blur and touch-scrolling conflicts.
- **Cartridge Transitions:** Snappy camera glide directly to the desk rather than a slow multi-second manual path to keep user interaction responsive.
- **Day/Night Synchronization:** Synchronized bidirectionally with `next-themes` so both 3D lighting and UI elements transition in unison.
