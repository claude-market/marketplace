---
name: scroll-video
description: Build the foundation of an Apple-style scroll-driven video website — extract frames from a video, render them on canvas, and bind playback to scroll progress with a circle-wipe hero reveal.
---

# Scroll-Driven Video — Foundation

The core mechanism: extract a video into still frames, preload them into memory, and paint the correct frame onto a canvas as the user scrolls. Lenis smooths the scroll; GSAP ScrollTrigger drives the frame index. A circle-wipe reveals the canvas as the hero section scrolls away. Text sections float over the canvas, appearing and disappearing at defined scroll positions with staggered entrance animations.

---

## Step 1: Analyze the Video

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,duration,r_frame_rate,nb_frames \
  -of csv=p=0 "<VIDEO_PATH>"
```

Determine resolution, duration, frame rate, total frames. Then decide:

- **Target frame count**: 150–300 for a smooth scroll experience
  - Short (<10s): extract at original fps, cap at ~300
  - Medium (10–30s): 10–15fps
  - Long (30s+): 5–10fps
- **Output resolution**: match aspect ratio, cap width at 1920px

---

## Step 2: Extract Frames

```bash
mkdir -p frames
ffmpeg -i "<VIDEO_PATH>" \
  -vf "fps=<CALCULATED_FPS>,scale=<WIDTH>:-1" \
  -c:v libwebp -quality 80 \
  "frames/frame_%04d.webp"
```

Count the output: `ls frames/ | wc -l`

---

## Step 3: Project Scaffold

```
project-root/
  index.html
  css/style.css
  js/app.js
  frames/frame_0001.webp ...
```

No bundler. Vanilla HTML/CSS/JS + CDN libraries only.

---

## Step 4: HTML Structure

Minimal required structure — in this order:

```html
<!-- 1. Hero: .hero-standalone (100vh, solid bg) -->
<!-- 2. Canvas: .canvas-wrap > canvas#canvas (fixed, full viewport) -->
<!-- 3. Scroll container: #scroll-container (800vh+) containing text sections -->

<section class="hero-standalone">
  <h1 class="hero-heading">Your Headline</h1>
</section>

<div class="canvas-wrap">
  <canvas id="canvas"></canvas>
</div>

<div id="scroll-container">

  <!-- Text section: appears at 20% scroll, leaves at 38% -->
  <!-- data-enter / data-leave are percentages of total scroll progress -->
  <!-- data-animation picks the entrance type (see 6e) -->
  <section class="scroll-section"
           data-enter="20" data-leave="38" data-animation="slide-left">
    <div class="section-inner">
      <span class="section-label">Label / category</span>
      <h2 class="section-heading">Your headline here</h2>
      <p class="section-body">Supporting text here.</p>
    </div>
  </section>

  <!-- Add more sections — stagger their enter/leave ranges so they don't overlap -->
  <section class="scroll-section"
           data-enter="42" data-leave="60" data-animation="fade-up">
    <div class="section-inner">
      <span class="section-label">Another label</span>
      <h2 class="section-heading">Second point</h2>
      <p class="section-body">More detail here.</p>
    </div>
  </section>

  <!-- Final section: data-persist keeps it visible at end of scroll -->
  <section class="scroll-section"
           data-enter="75" data-leave="95" data-animation="scale-up" data-persist="true">
    <div class="section-inner">
      <h2 class="section-heading">Closing statement or CTA</h2>
    </div>
  </section>

</div>
```

**Spacing rule:** give each section an 8–12% scroll range (leave minus enter). Space sections so they don't overlap. The total scroll height should be at least 100vh × number-of-sections × 1.5 — 800vh works well for 5–6 sections.

CDN scripts (end of body, in this order):

```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="js/app.js"></script>
```

---

## Step 5: CSS Foundations

```css
/* Canvas sits fixed behind everything */
.canvas-wrap {
  position: fixed;
  inset: 0;
  z-index: 0;
  clip-path: circle(0% at 50% 50%); /* starts hidden, revealed by JS */
}

canvas#canvas {
  width: 100%;
  height: 100%;
}

/* Hero covers the canvas initially */
.hero-standalone {
  position: relative;
  z-index: 1;
  height: 100vh;
}

/* Scroll container provides the scroll range */
#scroll-container {
  position: relative;
  z-index: 2;
  height: 800vh; /* expand for more scroll time */
}

/* Text sections float over the canvas */
.scroll-section {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  /* JS positions each section at the midpoint of its enter/leave range */
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
}

/* Section inner constrains text width — adapt placement to your layout */
.section-inner {
  max-width: 480px;
  padding: 2rem;
}

/* Suggested element styles — adapt to your design */
.section-label {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 0.75rem;
}

.section-heading {
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.1;
  margin-bottom: 1rem;
}

.section-body {
  font-size: 1rem;
  line-height: 1.7;
  opacity: 0.8;
}
```

---

## Step 6: JavaScript — Core Engine

### 6a. Lenis Smooth Scroll (always first)

```js
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### 6b. Frame Preloader

Two-phase: load first 10 frames immediately (fast first paint), then load the rest in background. Hide loader only after all frames are ready.

```js
const FRAME_COUNT = /* total frame count */;
const frames = new Array(FRAME_COUNT).fill(null);

function loadFrame(index) {
  return new Promise((resolve) => {
    const img = new Image();
    const num = String(index + 1).padStart(4, "0");
    img.src = `frames/frame_${num}.webp`;
    img.onload = () => { frames[index] = img; resolve(); };
  });
}

async function preloadFrames() {
  // Phase 1: first 10 frames
  await Promise.all(Array.from({ length: Math.min(10, FRAME_COUNT) }, (_, i) => loadFrame(i)));

  // Phase 2: rest in background
  for (let i = 10; i < FRAME_COUNT; i++) loadFrame(i);
}
```

### 6c. Canvas Renderer — Padded Cover Mode

```js
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const IMAGE_SCALE = 0.85; // 0.82–0.90 sweet spot; avoids clipping into nav

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let bgColor = "#111";

function sampleBgColor(img) {
  // Sample a corner pixel to match the padded border to the frame's edge
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = img.naturalWidth;
  tmpCanvas.height = img.naturalHeight;
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.drawImage(img, 0, 0);
  const [r, g, b] = tmpCtx.getImageData(0, 0, 1, 1).data;
  bgColor = `rgb(${r},${g},${b})`;
}

function drawFrame(index) {
  const img = frames[index];
  if (!img) return;

  const cw = canvas.width / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale, dh = ih * scale;
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}
```

### 6d. Frame-to-Scroll Binding

```js
const FRAME_SPEED = 2.0; // 1.8–2.2; higher = video finishes earlier in the scroll
const scrollContainer = document.getElementById("scroll-container");
let currentFrame = 0;

ScrollTrigger.create({
  trigger: scrollContainer,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => {
    const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
    const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
    if (index !== currentFrame) {
      currentFrame = index;
      if (index % 20 === 0 && frames[index]) sampleBgColor(frames[index]);
      requestAnimationFrame(() => drawFrame(currentFrame));
    }
  },
});
```

### 6e. Circle-Wipe Hero Reveal

```js
const heroSection = document.querySelector(".hero-standalone");
const canvasWrap = document.querySelector(".canvas-wrap");

ScrollTrigger.create({
  trigger: scrollContainer,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => {
    const p = self.progress;

    // Hero fades out as scroll begins
    heroSection.style.opacity = Math.max(0, 1 - p * 15);

    // Canvas reveals via expanding circle clip-path
    const wipeProgress = Math.min(1, Math.max(0, (p - 0.01) / 0.06));
    const radius = wipeProgress * 75; // 0% → 75% of viewport
    canvasWrap.style.clipPath = `circle(${radius}% at 50% 50%)`;
  },
});
```

### 6f. Text Section Animation System

Each `.scroll-section` declares its own enter/leave range and animation type via data attributes. The system reads these and wires up ScrollTrigger automatically — no hardcoding per section.

```js
function setupSections() {
  document.querySelectorAll(".scroll-section").forEach((section) => {
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;
    const type = section.dataset.animation || "fade-up";
    const persist = section.dataset.persist === "true";

    // Position section absolutely at the midpoint of its scroll range
    const containerHeight = scrollContainer.offsetHeight;
    const midpoint = (enter + leave) / 2;
    section.style.top = `${midpoint * containerHeight}px`;

    // Build entrance timeline
    const children = section.querySelectorAll(
      ".section-label, .section-heading, .section-body, .cta-button"
    );
    const tl = gsap.timeline({ paused: true });

    switch (type) {
      case "fade-up":
        tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" });
        break;
      case "slide-left":
        tl.from(children, { x: -80, opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" });
        break;
      case "slide-right":
        tl.from(children, { x: 80, opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" });
        break;
      case "scale-up":
        tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: "power2.out" });
        break;
      case "rotate-in":
        tl.from(children, { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" });
        break;
      case "clip-reveal":
        tl.from(children, { clipPath: "inset(100% 0 0 0)", opacity: 0, stagger: 0.15, duration: 1.2, ease: "power4.inOut" });
        break;
      default: // fallback to fade-up
        tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" });
    }

    let isVisible = false;

    ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: false,
      onUpdate: (self) => {
        const p = self.progress;
        const inRange = p >= enter && p <= leave;

        if (inRange && !isVisible) {
          section.style.opacity = "1";
          section.style.pointerEvents = "auto";
          tl.restart();
          isVisible = true;
        } else if (!inRange && isVisible && !persist) {
          section.style.opacity = "0";
          section.style.pointerEvents = "none";
          tl.pause(0); // reset for re-entry
          isVisible = false;
        }
      },
    });
  });
}
```

**Animation types quick reference:**

| `data-animation` | Enters from |
|-----------------|-------------|
| `fade-up` | below, fades in |
| `slide-left` | left |
| `slide-right` | right |
| `scale-up` | scaled down, fades in |
| `rotate-in` | slight rotation + below |
| `clip-reveal` | clips from bottom up |

Vary animation types across sections — avoid repeating the same type back to back.

---

## Step 7: Initialization Order

```js
gsap.registerPlugin(ScrollTrigger);

// 1. Lenis
// 2. Canvas resize
// 3. Preload frames, then:
preloadFrames().then(() => {
  drawFrame(0);
  // 4. Frame-to-scroll binding
  // 5. Circle-wipe hero reveal
  // 6. Text sections
  setupSections();
});
```

---

## Step 8: Test

Serve via HTTP — not `file://` (frames won't load from filesystem):

```bash
npx serve .
# or
python -m http.server 8000
```

Verify:
- Frames load and display before scroll starts
- Scroll moves video forward smoothly
- Hero fades and canvas circle-wipes in as you scroll past the hero
- No white flashes, no blurry canvas

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Frames not loading | Must serve via HTTP, not `file://` |
| Choppy scroll | Increase `scrub` value or reduce frame count |
| White flash | All frames must be loaded before hiding loader |
| Blurry canvas | Apply `devicePixelRatio` scaling |
| Lenis conflicts with ScrollTrigger | Ensure `lenis.on("scroll", ScrollTrigger.update)` is connected |
| Product clips into nav | Lower `IMAGE_SCALE` to 0.82–0.85 |
| Video feels sluggish | `FRAME_SPEED` below 1.8; raise to 2.0–2.2 |

---

## Clip-Path Variations for the Reveal

- Circle (default): `circle(0% at 50% 50%)` → `circle(75% at 50% 50%)`
- Wipe from left: `inset(0 100% 0 0)` → `inset(0 0% 0 0)`
- Wipe from bottom: `inset(100% 0 0 0)` → `inset(0% 0 0 0)`
