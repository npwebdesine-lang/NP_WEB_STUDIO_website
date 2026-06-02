# Next.js Migration Design — NP Web Studio

**Date:** 2026-06-02  
**Status:** Approved  
**Phase:** 1 — Homepage (`index`) only. Remaining 5 pages follow in Phase 2.

---

## Why

The current site is a vanilla HTML/CSS/JS SPA with a custom fetch-based router, Three.js, and GSAP — no build step, no component model. The problems:

- **Poor UX and low contrast** in several sections
- **Broken RTL layout** in some components (logo/nav side placement inconsistencies)
- **No type safety, no module bundling** — hard to extend reliably
- **Custom SPA router** duplicates work Next.js provides for free

The goal is to rebuild on Next.js App Router, keeping every premium visual effect (Liquid Chrome R3F blob, GSAP scroll animations, custom cursor, magnetic buttons, WhatsApp lead modal) while fixing the UX and RTL issues and introducing a proper component architecture.

---

## Decisions Made

| Topic | Decision |
|-------|----------|
| Framework | Next.js App Router, root-level `app/` (no `src/`) |
| Styling | Tailwind CSS + CSS custom properties for theme tokens |
| 3D | **React Three Fiber** (`@react-three/fiber`) — blob as declarative `<mesh>` |
| Animations | GSAP via `@gsap/react` `useGSAP` hook + `ScrollTrigger` registered globally |
| Theme | Dark/Light toggle × 3 accents (Indigo / Jade / Copper) = 6 `data-theme` values |
| Cursor | Custom dual-layer cursor kept — React hook, hidden on touch via CSS |
| Scope | Phase 1 = homepage only. Phase 2 = remaining 5 routes |

---

## Architecture

### File Tree

```
app/
  layout.tsx          — <html dir="rtl" lang="he">, ThemeProvider, <Cursor />, <Modal />
  page.tsx            — Homepage: <Hero /> + <Process />
  providers.tsx       — ThemeContext: { mode, accent, setMode, setAccent }
  globals.css         — Tailwind base + 6 [data-theme="…"] token blocks

components/
  layout/
    Navbar.tsx        — Fixed, RTL: logo right, nav links left, MagneticButton CTA
    Footer.tsx        — Auto year, RTL-aligned
  ui/
    Cursor.tsx        — Dot + ring rendered globally in layout, hidden on touch
    ThemeSwitcher.tsx — Side panel: ☀️/🌙 toggle + 3 accent swatches
    Modal.tsx         — 3-step WhatsApp lead capture, circle-reveal animation
    MagneticButton.tsx — Wrapper: GSAP quickTo pulls element toward cursor ≤80px
  three/
    BlobScene.tsx     — R3F <Canvas>, full-viewport, pointer-events:none
    BlobMesh.tsx      — <mesh> with ShaderMaterial (ported vert/frag from scene.js)
    Particles.tsx     — <points> geometry, orbit + scatter on scroll velocity
  sections/
    Hero.tsx          — Full-viewport, BlobScene behind text, GSAP load reveal
    Process.tsx       — 3 glass cards, ScrollTrigger stagger, 3D tilt + spotlight

hooks/
  useTheme.ts         — Reads ThemeContext, writes data-theme on <html>, persists to localStorage
  useCursor.ts        — rAF loop: dot tracks mouse exactly, ring lerps (0.14), magnetic pull

lib/
  theme.ts            — 6 token maps exported as typed constants
  whatsapp.ts         — buildMessage(name, business, service, page) → wa.me/972547492977 URL
```

---

## Theme System

**6 `data-theme` values:** `dark-indigo`, `dark-jade`, `dark-copper`, `light-indigo`, `light-jade`, `light-copper`

Each maps to a CSS variable block in `globals.css`:

```css
[data-theme="dark-indigo"] {
  --bg:        #0e1433;
  --bg-raised: #1a2050;
  --text:      #eef1fa;
  --muted:     rgba(238,241,250,0.55);
  --accent:    #8a95c9;
  --accent-2:  #5a6abf;
  --glass:     rgba(255,255,255,0.05);
  --glass-edge:rgba(138,149,201,0.2);
}
/* … 5 more blocks */
```

**ThemeContext** holds `{ mode: 'dark'|'light', accent: 'indigo'|'jade'|'copper' }`. `useTheme` derives the `data-theme` string and writes it to `document.documentElement`.

**Default:** On first visit, reads `prefers-color-scheme` for mode; always defaults accent to `indigo`. Persisted in `localStorage['np-theme']` as `"dark-indigo"` etc.

---

## RTL Implementation

- `<html dir="rtl" lang="he">` set in `app/layout.tsx`
- Tailwind configured with `direction: rtl` in `tailwind.config.ts`
- Navbar: `flex-row` naturally places logo on the right, nav links on the left in RTL
- All text aligns right by default; no manual `text-right` classes needed
- Logical CSS properties (`margin-inline-start`, `padding-inline-end`) used where possible

---

## Component Specifications

### `BlobScene.tsx` + `BlobMesh.tsx` + `Particles.tsx`

- R3F `<Canvas>` fills the hero viewport, `pointer-events: none`, `position: absolute`, `inset: 0`
- `BlobMesh`: ports the existing vertex/fragment shaders from `js/scene.js` into R3F `shaderMaterial`. Uniforms: `uTime`, `uMouse`, `uTheme` (for per-theme color gradients). Animated via R3F `useFrame`.
- `Particles`: `<points>` with `BufferGeometry`, 2000 points (800 on mobile via `useMediaQuery`). Scroll velocity passed via `useRef` — **not React state** — to avoid re-renders. Updated in `useFrame`.
- Mouse position piped from `useCursor` hook via a shared ref in context, not prop-drilling.

### `Hero.tsx`

Load reveal timeline in `useGSAP({ scope: containerRef })`:

```
t=0.0s  Canvas: opacity 0→1, duration 1.2s
t=0.3s  Navbar: y -60→0, opacity 0→1, duration 0.6s
t=0.6s  Chip tags: stagger(y 20→0, opacity 0→1, 0.1s apart)
t=0.9s  H1 words: clip reveal (overflow:hidden spans), stagger 0.08s
t=1.3s  Subtitle + CTAs: y 20→0, opacity 0→1, 0.5s stagger between them
```

### `Process.tsx`

ScrollTrigger in `useGSAP({ scope: containerRef })`:
- Section heading: `x -40→0, opacity 0→1` on enter (RTL: slides in from the right side)
- 3 glass cards: `scale 0.92→1, y 40→0, opacity 0→1`, staggered 0.15s
- Card tilt: `onMouseMove` → `gsap.to(card, { rotateX, rotateY })` ±8°, perspective 800px
- Spotlight: CSS custom prop `--mx`/`--my` updated on mousemove, radial-gradient follows cursor
- `onMouseLeave`: snap all transforms back to 0 with elastic ease

### `MagneticButton.tsx`

```
onMouseMove (document) → for each mounted MagneticButton:
  compute delta between cursor and element center
  if dist < 80px: xTo(delta.x * 0.4), yTo(delta.y * 0.4)  // gsap.quickTo setters
  else:           xTo(0), yTo(0)
onMouseLeave wrapper → gsap.to(el, { x: 0, y: 0, ease: 'elastic.out(1, 0.3)' })
```

### `Modal.tsx`

Preserves the full `modal.js` flow:
- Triggered by `open-modal-btn` class → React state `isOpen`
- Circle reveal: `clip-path: circle(0% at cx cy)` → `circle(150% at cx cy)`, origin = click coordinates
- Step 1: Name + Business (optional)
- Step 2: Service dropdown (3 options in Hebrew)
- Step 3: Spinner → `whatsapp.buildMessage()` → `window.open(wa.me URL)`
- WhatsApp number: `972547492977`

### `useCursor.ts`

- `rAF` loop (not `mousemove` events for smoothness)
- Dot: `transform: translate(mx, my)` set directly on DOM ref — no React state
- Ring: lerps toward dot position each frame with factor 0.14
- Magnetic: exposed as `attachMagnetic(el)` → returns cleanup fn, called by `MagneticButton`
- Hidden via `@media (pointer: coarse) { .cursor { display: none } }`

---

## Animations Summary

| Layer | Trigger | API |
|-------|---------|-----|
| Hero text reveal | Component mount | `useGSAP` timeline |
| Navbar slide | Component mount | Same timeline as hero |
| Process cards | Scroll enter | `ScrollTrigger` inside `useGSAP` |
| Card tilt + spotlight | `onMouseMove` | `gsap.to` direct DOM |
| Magnetic buttons | Cursor proximity | `gsap.quickTo` in `useCursor` |
| Blob mouse tracking | `useFrame` in R3F | Uniform update, no GSAP |
| Particle scatter | Scroll velocity ref | `useFrame` in R3F |

---

## Dependencies to Install

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"

npm install gsap @gsap/react
npm install @react-three/fiber @react-three/drei three
npm install @types/three
```

---

## Verification

1. `npm run dev` — dev server starts at localhost:3000
2. Homepage loads with RTL layout: logo on the right, nav on the left
3. Three.js blob visible and animating on hero load
4. GSAP load reveal fires in correct sequence (canvas → navbar → chips → H1 → subtitle)
5. Scroll to Process section — cards stagger in
6. Hover over Process card — tilt + spotlight effect visible
7. Navbar CTA button has magnetic pull toward cursor
8. Custom cursor dot + ring visible on desktop, absent on touch/mobile
9. ThemeSwitcher: switching mode + accent updates all colors instantly with no flash
10. Modal opens with circle reveal, steps through to WhatsApp link
11. `localStorage['np-theme']` persists on page reload
12. Lighthouse accessibility score ≥ 90 (RTL, semantic HTML, contrast)
