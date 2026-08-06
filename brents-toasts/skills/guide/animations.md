# Animations

`animation` controls how a toast enters/leaves the snackbar, and how it
glides later when a sibling toast is added, removed, or resizes (e.g. a
details block toggled open). Set it per-toast (`ToastOptions.animation`),
library-wide (`configure({ animation })`), or via
`ToastBuilder.withAnimation()`.

## Built-ins

| Name | `ToastAnimation` constant | Behavior |
|---|---|---|
| `'slide'` | `ToastAnimation.SLIDE` | **Default.** Slides in/out from its stacking edge while fading (opacity + `top`/`bottom` offset + `transform`, 300ms ease-in-out). |
| `'fade'` | `ToastAnimation.FADE` | Opacity-only: appears already at its final resting offset (nothing slides) and just fades in/out, 300ms. |
| `'none'` | `ToastAnimation.NONE` | No transition at all: appears, disappears, and reflows instantly (`exitDurationMs: 0`). Useful for reduced-motion preferences, tests, or a deliberately snappy stack. |

```ts
toasts.showToast('Instant toast', { animation: ToastAnimation.NONE });
toasts.configure({ animation: ToastAnimation.FADE }); // library-wide default
new ToastBuilder('Slides in').withAnimation(ToastAnimation.SLIDE).show();
```

Passing an unregistered animation name falls back to `slide` with a
one-time `console.warn` (same pattern as an unrecognized `position` or
`locale`).

## How reflow works

A toast's own `containerTransition` (see below) governs three separate
things over its lifetime: the entrance (`enterFrom` → `enterTo`), its own
exit, and any reflow caused by *its own* resize (e.g. its details block
toggling open growing it).

Reflow caused by a **sibling** entering or exiting is different: the toast
that's entering/exiting is what's causing that particular reflow, so *its*
`containerTransition`, not each displaced toast's own, temporarily governs
how the displaced toasts move, then each displaced toast's own transition is
restored. This is what makes an all-`NONE` stack reflow instantly with no
special-cased stacking logic, and what stops a `NONE` toast appearing/
disappearing instantly from leaving `SLIDE` siblings visibly still gliding
out of its way.

## Registering a custom animation

```ts
import { registerToastAnimation, ToastAnimation } from 'brents-toasts';

registerToastAnimation('zoom', {
  containerTransition: 'opacity 200ms ease-out, transform 200ms ease-out',
  enterFrom(ctx, targetOffsetPx) {
    ctx.container.style[ctx.edge] = `${targetOffsetPx}px`;
    ctx.container.style.opacity = '0';
    ctx.container.style.transform = 'scale(0.85)';
  },
  enterTo(ctx) {
    ctx.container.style.opacity = '1';
    ctx.container.style.transform = 'scale(1)';
  },
  exit(ctx) {
    ctx.container.style.opacity = '0';
    ctx.container.style.transform = 'scale(0.85)';
  },
  exitDurationMs: 200,
});

toasts.showToast('Zooms in', { animation: 'zoom' });
```

`registerToastAnimation(name, definition)` overwrites a built-in name (e.g.
`'slide'`) if you pass one, replacing its behavior for every toast that
requests it afterwards; the name is just a registry key.

A `ToastAnimationDefinition` is four hooks plus one setting:

| Field | Called | Purpose |
|---|---|---|
| `containerTransition` | Applied once, inline, to `.bt-toast-container` at creation | The CSS `transition` value governing entrance, this toast's own exit, its own-resize reflow, *and* (temporarily, passed through as `causingTransition`) how sibling toasts move when this one enters/exits. |
| `enterFrom(ctx, targetOffsetPx)` | Synchronously, once the toast's resting stack offset is known, right before it becomes visible | Set the "from" (hidden) styles. |
| `enterTo(ctx, targetOffsetPx)` | One animation frame later | Set the "to" (resting) styles; `containerTransition` animates between the two. |
| `exit(ctx)` | Once, synchronously, when the toast starts being removed | Set its exiting styles. |
| `exitDurationMs` | n/a | How long (ms) the exit visual takes before the DOM node is actually removed. Should match whatever `containerTransition`/`exit()` relies on. |

`ctx` (`ToastAnimationHookContext`) gives you `container` (the
`.bt-toast-container` element, safe to read/set styles on directly) and
`edge` (`'top' | 'bottom'`, which viewport edge this toast's position
anchors to).
