# NP Web Studio — Full Redesign Specification
*Date: 2026-05-26 | Status: Approved*

---

## 1. Project Overview

Complete ground-up redesign and rebuild of the NP Web Studio website. The goal is an Awwwards-calibre, "living" site with a genuine wow-effect powered by Three.js WebGL, GSAP animation timelines, a hand-built SPA router, and a complete CSS design system overhaul. All existing Hebrew RTL content and business logic is preserved.

**Aesthetic direction:** Liquid Chrome / Morphing Blobs — iridescent, oil-slick surfaces, organic WebGL morphing, deep void black backgrounds.

---

## 2. Design System

### 2.1 Color Tokens

| CSS Variable | Hex | Usage |
|---|---|---|
| `--void` | `#030509` | Page background |
| `--chrome-1` | `#00f0ff` | Primary accent (cyan) |
| `--chrome-2` | `#7000ff` | Secondary accent (violet) |
| `--chrome-3` | `#ff2d6b` | Tertiary accent (magenta, sparingly) |
| `--chrome-gold` | `#c8a96e` | Pricing premium highlights |
| `--glass` | `rgba(255,255,255,0.035)` | Card backgrounds |
| `--glass-edge` | `rgba(0,240,255,0.12)` | Card borders |
| `--text` | `#f0f4ff` | Body text |
| `--muted` | `#5a6a8a` | Secondary / caption text |
| `--transition-base` | — | `all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)` |

### 2.2 Typography

| Role | Family | Weight | Size |
|---|---|---|---|
| Display / Hero H1 | Space Grotesk | 800 | `clamp(4rem, 10vw, 9rem)` |
| Section H2 | Space Grotesk | 700 | `clamp(2rem, 5vw, 4rem)` |
| Card H3 | Space Grotesk | 600 | `1.5rem` |
| Body | Heebo | 400 | `1.1rem` |
| Labels / Chips | Space Grotesk | 500 | `0.75rem`, `letter-spacing: 0.15em`, uppercase |

Both fonts loaded from Google Fonts. Hebrew RTL (`dir="rtl"`) preserved globally.

### 2.3 No Inline Styles
All styling lives in `style.css` via design tokens and semantic classes. Zero `style=""` attributes in HTML.

---

## 3. WebGL Scene (`js/scene.js`)

A single global Three.js singleton, rendered to `<canvas id="gl-canvas">` positioned `fixed; inset: 0; z-index: 0; pointer-events: none`.

### 3.1 Morphing Blob
- **Geometry**: `THREE.IcosahedronGeometry(1.5, 6)` (subdivided for smooth deformation)
- **Material**: Custom `ShaderMaterial`
  - *Vertex shader*: displaces vertex positions using `sin(time * speed + position.xyz * frequency)` — creates organic breathing motion
  - *Fragment shader*: iridescent color output using Fresnel term (`dot(normal, viewDir)`) blended between `uColor1` and `uColor2` uniforms
- **Size**: ~30vw diameter, centered on viewport
- **Cursor reaction**: mouse position fed as `uMouse` uniform via `lerp(0.08)` — blob leans toward cursor
- **Scroll reaction**: scroll velocity detected via `lastScrollY` delta each frame — amplitude uniform `uMorphStrength` spikes to `2.5` then decays with `lerp(0.05)` back to `1.0`
- **Per-page color targets**: `SCENE.setPage(name)` updates `uTargetColor1/2` uniforms; blob lerps to new color over 1.2s

### 3.2 Particle Field
- **Count**: 2,000 `THREE.Points`
- **Distribution**: random positions in a sphere of radius 4 units around blob center
- **Behavior**: slow orbital drift (`position.applyQuaternion` each frame at `0.0003 rad`)
- **Scroll reaction**: on velocity spike, scatter radially (`position *= 1.8`) then reform with `lerp(0.02)`
- **Appearance**: `THREE.PointsMaterial`, size `0.015`, white, `opacity: 0.5`, `transparent: true`

### 3.3 Page Color Map

| Page | `uColor1` | `uColor2` |
|---|---|---|
| index | `#00f0ff` | `#7000ff` |
| about | `#7000ff` | `#ff2d6b` |
| works | `#00f0ff` | `#c8a96e` |
| prise | `#c8a96e` | `#7000ff` |
| info | `#ff2d6b` | `#00f0ff` |
| addons | `#7000ff` | `#00f0ff` |

---

## 4. Custom SPA Router (`js/router.js`)

A hand-built, zero-dependency SPA router. No Barba.js.

### 4.1 Flow
1. `init()` called on `DOMContentLoaded` — attaches delegated click listener to `document`
2. Click handler intercepts all `<a href>` that match `*.html` internal paths
3. Runs `navigateTo(targetUrl)`:
   a. Call `SCENE.setPage(pageName)` — blob starts color morph
   b. Run GSAP **exit timeline** on `document.querySelector('main')`:
      - `clip-path: inset(0 0 0 0)` → `inset(0 0 100% 0)` — wipe upward, `0.6s ease-in`
   c. `fetch(targetUrl)` → parse with `DOMParser` → extract `<main>` and `<title>`
   d. Swap `document.querySelector('main').innerHTML`
   e. `history.pushState({}, '', targetUrl)`
   f. Update `document.title`
   g. Update active nav link class
   h. Run GSAP **enter timeline** on new `<main>`:
      - Start from `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` — wipe in from bottom, `0.6s ease-out`
      - Stagger child `.reveal` elements
   i. Re-initialize `ANIMATIONS.initPage()` — rebinds ScrollTrigger for new content
   j. Re-initialize `MODAL.init()` — rebinds modal open buttons

### 4.2 Browser Back/Forward
`window.addEventListener('popstate', ...)` calls `navigateTo(location.pathname)` without pushing state.

### 4.3 Exclusions
- `href` starting with `http`, `#`, `mailto:`, `tel:` — not intercepted
- `.open-modal-btn`, `.float-wa`, `.js-wa` — not intercepted

---

## 5. GSAP Animation System (`js/animations.js`)

### 5.1 Site Entry (runs once on initial load)
```
t=0.0s  Blob: scale 0 → 1, elastic.out(1, 0.6), duration 1.2s
t=0.4s  Nav: y -80 → 0, opacity 0 → 1, power2.out, duration 0.6s
t=0.6s  Hero chips: stagger(0.08), y 20 → 0, opacity 0 → 1
t=0.8s  Hero H1: SplitText by word, each word: clipPath reveal from bottom, stagger 0.1s
t=1.2s  Hero subtext: opacity 0 → 1, y 15 → 0
t=1.4s  CTA buttons: scale 0.8 → 1, back.out(1.7)
```
SplitText implementation is native (manual character wrapping, no GSAP SplitText plugin needed):
```js
// Each word wrapped in: <span class="word-wrap"><span class="word">text</span></span>
// .word-wrap: overflow: hidden; display: inline-block
// animation targets .word elements with y: 100% → 0
```

### 5.2 Navbar ScrollTrigger
- Trigger: scroll past 80px
- Effect: `background: rgba(3,5,9,0.85)`, `backdropFilter: blur(20px)` toggled via class `.nav--scrolled`

### 5.3 Homepage Section Animations
- **Hero parallax**: `gsap.to('.hero-content', { y: -80, ease: 'none', scrollTrigger: { scrub: true }})`
- **Process cards**: pinned `300vh` zone, each card snaps in from `x: 150%` as scrub progresses, with scale `0.9 → 1` and opacity `0 → 1`

### 5.4 Inner Page Animations (initialized per navigation via `initPage()`)

| Page | Effect |
|---|---|
| about | 4-card horizontal scroll within pinned zone; step number counts 0→N |
| works | Grid cards: stagger `y: 60 → 0`; image hover = Three.js ripple displacement plane |
| prise | Cards slide from `x: ±200`; price values count up with `gsap.to({val})` ticker |
| info | Split layout with video; text block staggers by paragraph |
| addons | Card grid with velocity-based ease (faster scroll = faster stagger) |

### 5.5 Dividers
SVG `<line>` elements with `stroke-dashoffset` animated to `0` on scroll entry.

---

## 6. Cursor System (`js/cursor.js`)

### 6.1 Structure
```html
<div id="cursor-dot"></div>   <!-- 8px, instant -->
<div id="cursor-ring"></div>  <!-- 40px, lerped -->
```

### 6.2 Behavior

| State | Dot | Ring |
|---|---|---|
| Default | `8px`, filled `--chrome-1` | `40px`, `2px` border `--chrome-1 @ 40%` |
| Hover (links/btns) | scale `0`, opacity `0` | scale `60px`, fill `rgba(0,240,255,0.1)` |
| Click | scale `0.6` snap | scale `0.6` snap |
| On canvas | hidden | hidden; dot → `+` crosshair |

Ring movement: `gsap.to(ring, { x, y, duration: 0.12, ease: 'power2.out' })` called on `mousemove`.

### 6.3 Magnetic Buttons
Applied to all `.btn-primary` and `.btn-ghost`:
- Field radius: `80px`
- On cursor within field: `gsap.to(btn, { x: dx*0.35, y: dy*0.35, duration: 0.3 })`
- Inner text: `gsap.to(btnText, { x: dx*0.15, y: dy*0.15, duration: 0.3 })`
- On exit: `gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })`

---

## 7. Component Designs

### 7.1 Glass Cards (redesigned)
- Background: `rgba(255,255,255,0.025)`
- Border: `1px solid var(--glass-edge)`
- Backdrop blur: `20px`
- On hover: animated conic-gradient rotates on border (CSS `@keyframes` on `--angle` custom property)
- Spotlight effect: JS tracks cursor inside card → radial gradient overlay follows cursor
- 3D tilt: ±8deg max (tuned from current ±10deg)

### 7.2 Navigation
- `position: fixed` (not `sticky`)
- Default: transparent background
- After 80px scroll: class `.nav--scrolled` adds blur + dark bg (via GSAP ScrollTrigger)
- Logo: CSS `animation: chromeCycle 8s linear infinite` cycling text-shadow through palette
- Nav links hover: `::after` underline draws via `scaleX(0 → 1)` transform, `transform-origin: right` (RTL aware)

### 7.3 Lead Modal (redesigned open animation)
- Open trigger: capture click `clientX/Y` → set CSS vars `--cx`, `--cy`
- Animation: `clip-path: circle(0% at var(--cx) var(--cy))` → `circle(150%)`, `0.7s ease-in-out`
- Close: reverse circle collapse back to origin point, `0.5s`
- Modal content: unchanged functionally — same 3-step WhatsApp flow, same validation

---

## 8. File Architecture

```
NP_WEB_STUDIO_website/
├── index.html          ← Full HTML shell; contains nav, canvas, modal, footer
├── about.html          ← Full HTML (router fetches its <main>)
├── works.html
├── prise.html
├── info.html
├── addons.html
├── style.css           ← Complete rewrite — CSS design system, no inline styles
├── js/
│   ├── scene.js        ← Three.js singleton (blob + particles)
│   ├── cursor.js       ← Dual-layer cursor + magnetic buttons
│   ├── animations.js   ← GSAP timelines + ScrollTrigger
│   ├── router.js       ← Custom SPA router
│   └── modal.js        ← Lead modal + WhatsApp logic
├── pics/               ← Unchanged
├── works/              ← Unchanged
└── UX videos/          ← Unchanged (background.mp4, logo background.mp4)
```

### 8.1 CDN Dependencies (in `<head>`, before closing `</body>` for Three.js/GSAP)
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;800&family=Space+Grotesk:wght@500;700;800&display=swap" rel="stylesheet">

<!-- Three.js -->
<script src="https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js"></script>

<!-- GSAP core + ScrollTrigger -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

No SplitText CDN — character splitting implemented manually in `animations.js`.

---

## 9. Preserved Elements (No Change)

| Item | Value |
|---|---|
| WhatsApp number | `972547492977` |
| Lead form steps | 3-step: name/business → service → WhatsApp redirect |
| Service options | דף נחיתה, אתר תדמית, ייעוץ דיגיטלי |
| Portfolio links | pitagorashp.com, rose-events, dkfitness.online |
| Pricing | 700₪, 1,500₪, 150₪/mo, 250₪/mo |
| All Hebrew copy | Preserved verbatim |
| Asset paths | `pics/logo.png`, `works/*.png`, `UX videos/*.mp4` |
| RTL direction | `dir="rtl"` on `<html>` |

---

## 10. Removed Elements

- `bg-video-global` — the full-viewport looping background video is removed. The Three.js canvas replaces it as the living background.
- `script.js` — replaced by the 5 modular JS files
- All `style=""` inline attributes — replaced by CSS classes

---

## 11. Responsive Strategy

- WebGL canvas: always full viewport; blob scales proportionally via `camera.aspect` update on resize
- Hero H1: `clamp()` ensures readable at all widths
- Below `900px`: Three.js blob opacity reduces to `0.6` (performance); particle count drops to 800 via `isMobile` check
- Mobile menu: same structure as current, GSAP enter/exit instead of CSS opacity toggle
- Magnetic buttons: disabled on touch devices (`window.matchMedia('(pointer: coarse)')`)

---

*Spec approved 2026-05-26. Proceed to implementation plan.*
