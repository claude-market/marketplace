# Motion Library Reference (formerly Framer Motion)

**Repo:** https://github.com/motiondivision/motion
**Install:** `npm install motion`
**Import (React/Next.js):** `import { motion } from "motion/react"`
**Import (vanilla JS):** `import { animate } from "motion"`
**Next.js RSC:** `import * as motion from "motion/react-client"` in client component files

---

## Core API

Every HTML/SVG element has a `motion.*` counterpart with animation props:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.97 }}
  whileInView={{ opacity: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
/>
```

**Animatable properties:** Independent transforms (`x`, `y`, `scale`, `rotate`, `skewX/Y`), `opacity`, `filter`, `backgroundColor`, `borderRadius`, `clipPath`, `boxShadow`. Height can animate to/from `"auto"`.

---

## Key Features

### 1. Enter/Exit Animations

`AnimatePresence` holds elements in DOM until exit animation completes:

```jsx
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    />
  )}
</AnimatePresence>
```

Modes: `"sync"` (simultaneous), `"wait"` (exit before enter), `"popLayout"` (exiting pops out of flow).

### 2. Variants (Coordinated Tree Animations)

Named states that propagate parent to children with stagger:

```jsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3 } }
}

<motion.ul variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(i => <motion.li key={i} variants={item} />)}
</motion.ul>
```

### 3. Layout Animations

Auto-animate any DOM layout change with a single prop:

```jsx
<motion.div layout />                    // animate position + size
<motion.div layout="position" />         // position only
```

Shared element transitions:
```jsx
<motion.div layoutId={`card-${id}`} />   // animates between mount positions
```

### 4. Scroll Animations

**Scroll-triggered:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
/>
```

**Scroll-linked (parallax, progress):**
```jsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])
<motion.img style={{ y }} />
```

**Offset values:** `"[element position] [viewport position]"` — e.g. `"start end"` means element top reaches viewport bottom.

### 5. Timeline Sequences

Choreographed multi-step animations:

```js
const sequence = [
  ["nav", { opacity: 1 }, { duration: 0.5 }],
  ["h1", { opacity: 1, y: 0 }, { at: "<" }],       // simultaneous with previous
  ["p", { opacity: 1 }, { at: "+0.2" }],            // 0.2s after previous ends
  ["button", { opacity: 1, scale: 1 }, { at: 2.0 }] // at absolute 2.0s
]
const controls = animate(sequence)
controls.pause() / controls.play() / controls.time = 1.5
```

### 6. MotionValues (No-Rerender Reactive Primitives)

```jsx
const x = useMotionValue(0)
const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0])
const smoothX = useSpring(x, { stiffness: 300, damping: 30 })
const xVelocity = useVelocity(x)
<motion.div style={{ x, opacity }} />
```

### 7. Gestures

```jsx
<motion.div
  drag
  dragConstraints={constraintsRef}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1 }}
  onDragEnd={(e, info) => console.log(info.offset, info.velocity)}
/>
```

---

## Transitions

**Spring:** `{ type: "spring", stiffness: 200, damping: 20 }` or `{ type: "spring", bounce: 0.3, duration: 0.6 }`
**Tween:** `{ type: "tween", duration: 0.5, ease: "easeOut" }` or cubic bezier `[0.17, 0.67, 0.83, 0.67]`
**Keyframes:** `animate={{ x: [0, 100, 50, 150] }}` with `times: [0, 0.3, 0.7, 1]`
**Per-property:** `transition={{ default: { type: "spring" }, opacity: { duration: 0.3 } }}`

---

## Production Patterns

**Magnetic button:**
```jsx
const mouseX = useMotionValue(0), mouseY = useMotionValue(0)
const x = useSpring(mouseX, { stiffness: 150, damping: 15 })
const y = useSpring(mouseY, { stiffness: 150, damping: 15 })
// onMouseMove: set mouseX/Y to offset from center * 0.3
```

**Scroll clip-path reveal:**
```jsx
const clipPath = useTransform(scrollYProgress, [0, 0.4], ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"])
<motion.img style={{ clipPath }} />
```

**Counter without re-renders:**
```jsx
const count = useMotionValue(0)
const rounded = useTransform(count, v => Math.round(v))
animate(count, 1000, { duration: 2, ease: "easeOut" })
```

**Velocity-aware drag skew:**
```jsx
const xVelocity = useVelocity(x)
const skewX = useTransform(xVelocity, [-2000, 0, 2000], [-15, 0, 15])
```

---

## Bundle Size

| Approach | Size |
|---|---|
| Full `motion` component | ~34kb |
| `LazyMotion` + `m` + `domAnimation` | 4.6kb + 15kb lazy |
| `useAnimate` only | 2.3kb |
| `useInView` only | 0.6kb |

Use `LazyMotion` for bundle splitting when not using drag/layout animations.

---

## Performance Rules

1. Animate `transform` and `opacity` only when possible (GPU composited)
2. Avoid animating `width`, `height`, `top`, `left` — use `x/y/scale` instead
3. Use MotionValues instead of React state for high-frequency updates
4. Set `viewport={{ once: true }}` on scroll-triggered animations unless bidirectional
5. Wrap app in `<MotionConfig reducedMotion="user">` for accessibility
6. Use `initial={false}` to skip entrance animations on first render (SSR)

---

## API Quick Reference

| API | Import | Use case |
|---|---|---|
| `motion.div` | `motion/react` | Declarative animations |
| `AnimatePresence` | `motion/react` | Mount/unmount transitions |
| `useScroll` | `motion/react` | Scroll position tracking |
| `useTransform` | `motion/react` | Map/derive MotionValues |
| `useMotionValue` | `motion/react` | Reactive animation primitive |
| `useSpring` | `motion/react` | Spring-physics values |
| `useVelocity` | `motion/react` | Track rate of change |
| `useAnimate` | `motion/react` | Scoped imperative animations |
| `useInView` | `motion/react` | Viewport detection |
| `MotionConfig` | `motion/react` | Global defaults + a11y |
| `LazyMotion` + `m` | `motion/react` | Bundle splitting |
| `animate()` | `motion` | Imperative + timeline sequences |
| `stagger()` | `motion` | Cascading delays |
