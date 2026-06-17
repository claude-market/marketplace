---
name: motion-animations
description: Use when building website animations, scroll effects, entrance reveals, layout transitions, gesture interactions, parallax, hero choreography, or any animated UI component. Auto-trigger on any website build or frontend feature that involves motion, transitions, or animated elements.
---

# Motion Animations

Reference skill for building production animations with the [Motion library](https://github.com/motiondivision/motion) (formerly Framer Motion). Consult this before writing any animation code.

**Install:** `npm install motion`
**Import:** `import { motion, AnimatePresence } from "motion/react"`
**Next.js RSC:** use `"use client"` directive on any component with motion

---

## Core Concept

Every HTML/SVG element has a `motion.*` counterpart. Animation is declarative via props:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
/>
```

**Animatable properties:** `x`, `y`, `scale`, `rotate`, `opacity`, `filter`, `clipPath`, `backgroundColor`, `borderRadius`, `boxShadow`. Height can animate to/from `"auto"`.

---

## Pattern Catalog

### 1. Entrance Animations (scroll-triggered)

The default for any element appearing on scroll:

```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
/>
```

Always set `viewport={{ once: true }}` unless bidirectional reveal is intentional.

### 2. Staggered List Entrance

Use variants for coordinated parent-to-child animations:

```jsx
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3 } }
}

<motion.ul variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(i => <motion.li key={i} variants={item} />)}
</motion.ul>
```

Children inherit `initial`/`animate` labels automatically from parent — only need `variants` prop.

### 3. Exit Animations

`AnimatePresence` holds elements in DOM until exit completes:

```jsx
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="unique"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    />
  )}
</AnimatePresence>
```

Modes: `"sync"` (simultaneous), `"wait"` (exit before enter), `"popLayout"` (exiting pops out of flow).

### 4. Scroll-Linked Animations (parallax, progress)

```jsx
const ref = useRef(null)
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
})
const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])

<div ref={ref}>
  <motion.img style={{ y }} />
</div>
```

**Offset format:** `"[element edge] [viewport edge]"` — `"start end"` means element top hits viewport bottom.

**Progress bar:**
```jsx
const { scrollYProgress } = useScroll()
<motion.div style={{ scaleX: scrollYProgress, transformOrigin: "left" }} />
```

**Clip-path reveal:**
```jsx
const clipPath = useTransform(scrollYProgress, [0, 0.4],
  ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"])
<motion.img style={{ clipPath }} />
```

**Horizontal scroll (panels):**
```jsx
const { scrollYProgress } = useScroll({ target: containerRef })
const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"])
<div ref={containerRef} style={{ height: "400vh" }}>
  <div style={{ position: "sticky", top: 0, overflow: "hidden" }}>
    <motion.div style={{ x, display: "flex" }}>{panels}</motion.div>
  </div>
</div>
```

### 5. Layout Animations

Auto-animate any DOM layout change:

```jsx
<motion.div layout />
```

Shared element transitions (thumbnail to modal, tab switches):

```jsx
// Grid item
<motion.div layoutId={`card-${id}`} onClick={() => setSelected(id)} />

// Expanded modal
<AnimatePresence>
  {selected && <motion.div layoutId={`card-${selected}`} className="modal" />}
</AnimatePresence>
```

Layout prop values: `true` (position + size), `"position"`, `"size"`, `"preserve-aspect"`.

### 6. Gesture Animations

```jsx
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#f0f0f0" }}
  whileTap={{ scale: 0.97 }}
  whileFocus={{ outline: "2px solid blue" }}
/>
```

**Drag:**
```jsx
<motion.div
  drag
  dragConstraints={constraintsRef}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
/>
```

### 7. Timeline Sequences (hero choreography)

```jsx
import { animate, stagger } from "motion"

const sequence = [
  ["nav", { opacity: 1 }, { duration: 0.5 }],
  ["h1", { opacity: 1, y: 0 }, { at: "<" }],       // simultaneous
  ["p", { opacity: 1 }, { at: "+0.2" }],            // 0.2s after previous
  ["button", { opacity: 1, scale: 1 }, { at: 2.0 }] // absolute time
]
const controls = animate(sequence)
```

`at` values: `"<"` (with previous), `"+0.5"` (after previous), `"<0.3"` (after previous starts), `2.0` (absolute).

### 8. Physics Effects

**Magnetic button:**
```jsx
const mouseX = useMotionValue(0), mouseY = useMotionValue(0)
const x = useSpring(mouseX, { stiffness: 150, damping: 15 })
const y = useSpring(mouseY, { stiffness: 150, damping: 15 })
// onMouseMove: set mouseX/Y to (cursor offset from center) * 0.3
```

**Velocity-aware skew:**
```jsx
const xVelocity = useVelocity(x)
const skewX = useTransform(xVelocity, [-2000, 0, 2000], [-15, 0, 15])
```

**Counter without re-renders:**
```jsx
const count = useMotionValue(0)
const rounded = useTransform(count, v => Math.round(v))
animate(count, 1000, { duration: 2, ease: "easeOut" })
<motion.span>{rounded}</motion.span>
```

---

## Transitions

| Type | Config |
|---|---|
| Spring | `{ type: "spring", stiffness: 200, damping: 20 }` or `{ type: "spring", bounce: 0.3, duration: 0.6 }` |
| Tween | `{ type: "tween", duration: 0.5, ease: "easeOut" }` |
| Keyframes | `animate={{ x: [0, 100, 50] }}` with `times: [0, 0.5, 1]` |
| Per-property | `transition={{ default: { type: "spring" }, opacity: { duration: 0.3 } }}` |

Easing: `"linear"`, `"easeIn"`, `"easeOut"`, `"easeInOut"`, `"circOut"`, `"backOut"`, `"anticipate"`, or `[0.17, 0.67, 0.83, 0.67]`.

**Global defaults:**
```jsx
<MotionConfig transition={{ duration: 0.3, ease: "easeOut" }}>
  <App />
</MotionConfig>
```

---

## Performance Rules (non-negotiable)

1. **Only animate `transform` and `opacity`** — these are GPU-composited. Never animate `width`, `height`, `top`, `left`, `padding`, `margin`.
2. **Use MotionValues for high-frequency updates** — `useMotionValue`, `useTransform`, `useSpring` bypass React renders entirely. Use these for scroll, drag, and mouse-tracking effects.
3. **Set `viewport={{ once: true }}`** on scroll-triggered animations unless bidirectional is intentional.
4. **Use `initial={false}`** to skip entrance animations on SSR/first render.
5. **Wrap app in `<MotionConfig reducedMotion="user">`** for accessibility.

**Bundle optimization:** Full motion is ~34kb. Use `LazyMotion` + `m` component for lighter builds (4.6kb + lazy features).

---

## API Quick Reference

| Hook/Component | Purpose |
|---|---|
| `motion.div` | Declarative animation component |
| `AnimatePresence` | Mount/unmount transitions |
| `useScroll` | Scroll position tracking |
| `useTransform` | Map/derive MotionValues |
| `useMotionValue` | Reactive primitive (no re-renders) |
| `useSpring` | Spring-physics MotionValue |
| `useVelocity` | Track rate of change |
| `useAnimate` | Scoped imperative animations |
| `useInView` | Viewport detection (0.6kb) |
| `MotionConfig` | Global defaults + accessibility |
| `animate()` | Imperative + timeline sequences |
| `stagger()` | Cascading delays |

For full API details, see [reference.md](reference.md).