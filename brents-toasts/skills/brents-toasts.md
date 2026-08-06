---
name: brents-toasts
description: Write correct code against brents-toasts, a zero-dependency toast/snackbar UI library for JavaScript/TypeScript. Covers install, the showToast/ToastBuilder call shapes, buttons (plain/confirm/multi-step), details, updating/removing toasts, promise-based toasts, timers, progress bars, animations, theming, localization, and config. Use whenever a task involves adding, changing, or debugging toast/snackbar notifications built with brents-toasts (imports from `brents-toasts`, or `BrentsToasts.*` on a page using the UMD script tag).
---

# brents-toasts

Distributed as a Claude Code plugin: `/plugin marketplace add brentspine/brents-toasts` then
`/plugin install brents-toasts@brents-toasts`. To install by hand instead, copy this whole
`docs/` directory (not just this file) to a project's `.claude/skills/brents-toasts/` - the
links below are relative to files that travel with it either way, so both installs stay useful.

Zero-dependency, framework-agnostic toast/snackbar library. Works as an ESM/CJS import or a
plain `<script>` tag (UMD, global `BrentsToasts`). No CSS to link: the stylesheet is bundled
into the JS.

## Install

```bash
npm install brents-toasts
```

```ts
import { toasts, ToastColor, ToastBuilder, Toasts } from 'brents-toasts';
```

No-build-step alternative:

```html
<script src="https://unpkg.com/brents-toasts/dist/index.umd.min.js"></script>
<script>BrentsToasts.toasts.showToast('Hello, toast.');</script>
```

`BrentsToasts` mirrors the npm named exports 1:1. Full walkthrough:
[guide/getting-started.md](guide/getting-started.md).

## The core decision: which call shape

`toasts` is a ready-to-use singleton. Three equivalent, permanently supported call shapes for
`showToast`; pick whichever reads best, don't mix conventions within one codebase without reason:

```ts
// Options object: default choice once you need more than a bare message
toasts.showToast('Saved!', { color: ToastColor.SUCCESS, duration: 5000, title: 'Done' });

// Legacy positional: message, color, duration(ms), closable, allowHtml (5 args, all after message optional)
toasts.showToast('Saved!', ToastColor.SUCCESS, 5000, false, false);

// Fluent builder: chainable, same options object under the hood
new ToastBuilder('Saved!').asSuccess().withDuration(5000).withTitle('Done').show();
```

`showToast()` returns the toast's `id` (string); save it if you'll `removeToast`/`updateToast`/
control its timer later. Defaults: `color` `ToastColor.INFO`, `duration` `3000`ms, `closable`
`true`, `allowHtml` `false`, `allowLineBreaks` `true` (all overridable via `configure()`, see
[guide/config.md](guide/config.md)). Builder method reference:
[guide/builder-reference.md](guide/builder-reference.md).

**Content rule** (security-relevant - know this one without following the link):
`message`/`title`/every button label/detail label-value render as plain text; `\n` and literal
`<br>`/`<br/>` still become real line breaks (opt out with `allowLineBreaks: false`), nothing
else is parsed. Pass `allowHtml: true` for an HTML string (sanitize it yourself; `title` is
never affected by `allowHtml`). Pass a real `Node` as `message` for fully custom interactive
content: appended directly, no `innerHTML`, no XSS surface, `allowHtml` irrelevant.

## Feature reference

Each of these is a call or two to get going; follow the link for the full option set, edge
cases, and worked examples before implementing anything non-trivial with it.

- **Buttons** - plain action buttons, `toasts.closeButton()`, `toasts.confirmButton(...)`
  (Yes/No → pending → done), and `toasts.stepButton([...])`, the general multi-step primitive
  behind both. Button clicks never trigger the toast's own `closable` dismiss.
  → [guide/buttons.md](guide/buttons.md)
- **Details** - `details: [{ label, value, buttons }]` (or a plain string shorthand) renders an
  expandable block behind an auto-added "Details" toggle; `toasts.detailsCopyButton(text)` is
  the only built-in copyable detail. → [guide/details.md](guide/details.md)
- **Lifecycle** - `removeToast`/`removeAllToasts`/`removeOtherToasts`; `updateToast(id, patch)`
  is a **patch** (only keys present in `patch` change; `buttons`/`details`/`theme` replace
  wholesale - use `addToastButton`/`removeToastButton`/`addToastDetail`/`removeToastDetail` for
  incremental changes), optionally animated via `transition`. Also covers `toasts.promise(...)`
  for loading/success/error toasts. → [guide/lifecycle.md](guide/lifecycle.md)
- **Timers** - `pause`/`resume`/`reset`/`extend`/`removeToastTimer`, `getToastTimer(id)`. All
  no-ops on a sticky toast (`duration: 0`); it never has timer state.
  → [guide/timers.md](guide/timers.md)
- **Progress bar** - `progress: { mode: 'fill' | 'drain' | 'manual' }`; `'manual'` ignores the
  timer, drive it with `setToastProgress(id, 0-1)`. → [guide/progress.md](guide/progress.md)
- **Animations** - `configure({ animation: ToastAnimation.SLIDE | FADE | NONE })`, or
  `registerToastAnimation(...)` for a custom one. → [guide/animations.md](guide/animations.md)
- **Theming** - every color is a `--bt-*` CSS custom property; override via `theme:` on
  `configure()`/a single toast, or with plain CSS on `.bt-toast`.
  → [guide/theming.md](guide/theming.md)
- **Localization** - bundled `en`/`de`/`es`/`fr` chrome text (`configure({ locale })`), only
  affects the library's own labels, never your `title`/`message`. `ToastQuickActions` gives
  separate pre-translated common words. → [guide/localization.md](guide/localization.md)
- **Config** - `configure()`/`configurePosition()` for defaults, six stacking positions,
  `maxToasts`/`evictOldest`, responsive collapsing below `responsiveBreakpoint`. Scope defaults
  to one page/section with `new Toasts()` instead of the shared singleton.
  → [guide/config.md](guide/config.md)
- **Per-toast data** - `setToastData`/`getToastData(id)`: attach a payload so one shared button
  handler can act on many toasts. Not general app state. → [guide/data.md](guide/data.md)

## Common mistakes to avoid

- Don't hand-roll "click to arm, click again to confirm"; use `confirmButton()`.
- Don't rebuild `buttons`/`details` arrays by hand for one insert/remove; use
  `addToastButton`/`removeToastButton`/`addToastDetail`/`removeToastDetail`.
- Don't call `resetToastTimer`/`extendToastTimer` expecting it to make a sticky (`duration: 0`)
  toast timed; it won't. Pass `duration` explicitly.
- Don't assume `updateToast({ buttons: [...] })` merges; it replaces the whole array.
- Don't reach for `setToastData`/`getToastData` as general app state; it's meant for one narrow
  case: a shared button handler looking up a per-toast payload by the `id` it already receives.
- When using a page-scoped `new Toasts()` instance, call `.closeButton()`/`.confirmButton()`/etc.
  on *that* instance, not the shared `toasts` singleton, so the button dismisses via the right
  instance.
