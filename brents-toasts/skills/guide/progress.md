# Progress bar

Pass `progress: true` (or a `ToastProgressOptions` object) for a thin bar on
the toast card. By default it's synced to the toast's own auto-dismiss
countdown via the same timer state [`getToastTimer`/`pauseToastTimer`/etc.](timers.md)
use; no extra wiring needed:

```ts
toasts.showToast('Uploading…', {
  duration: 6000,
  progress: { mode: 'drain', color: ToastColor.INFO },
});
```

## Options (`ToastProgressOptions`)

| Field | Default | Notes |
|---|---|---|
| `mode` | `'drain'` | `'fill'` starts empty and grows to full over the toast's remaining lifetime; `'drain'` starts full and shrinks to empty; `'manual'` doesn't move on its own, driven via `setToastProgress()` |
| `position` | `'bottom'` | `'top'` or `'bottom'` edge of the toast card |
| `origin` | `'left'` | `'left'`/`'right'`/`'center'`: anchor point the bar grows from/shrinks toward. Always physical, not RTL-aware. For `origin: 'center'`, fill grows outward from a zero-width center sliver; drain shrinks inward from both edges toward the center |
| `value` | `0` | Initial fill fraction (0-1), only meaningful for `mode: 'manual'` |
| `color` | the toast's resolved `color` | Fill color; stays linked to the toast's `color` if left unset, so a later `updateToast({ color })` re-syncs it too |
| `trackColor` | `'transparent'` | Color of the unfilled track |
| `height` | `3` | Bar thickness in px |
| `label` | resolved locale's `"Progress"` | Accessible name for the bar, e.g. `"Uploading file"` |

`'fill'`/`'drain'` are no-ops on a sticky toast (`duration: 0`); there's no
countdown for them to track, so the bar stays hidden. Builder equivalent:
`.withProgress(progress?)`.

## Accessibility

The bar renders with `role="progressbar"` and `aria-valuemin="0"`/
`aria-valuemax="100"`, and keeps `aria-valuenow` in sync with the fill
(as a 0-100 integer percentage) every time the bar's config changes
(`showToast`/`updateToast`), the timer state changes (pause/resume/reset/
extend/remove), or `setToastProgress()` is called. Its accessible name comes
from `label` (see above) - set it to something more specific than the
generic default when the bar represents a particular operation, so a screen
reader user hears e.g. "Uploading file, 45 percent" instead of a bare
percentage.

## Manual progress

For a bar that reflects *real* progress instead of a duration guess (an
upload's `progress` event, a multi-step job), use `mode: 'manual'` and drive
it yourself with `toasts.setToastProgress(id, value)` (`value` clamped to
`0`-`1`). Unlike `'fill'`/`'drain'`, a manual bar ignores the auto-dismiss
timer entirely, so it stays visible on a sticky toast too:

```ts
const id = toasts.showToast('Uploading…', {
  duration: 0,
  progress: { mode: 'manual' },
});

await uploadFile(file, {
  onProgress: (fraction) => toasts.setToastProgress(id, fraction),
});
toasts.updateToast(id, { message: 'Upload complete!', color: ToastColor.SUCCESS });
```

`setToastProgress` is a no-op if the toast's `progress.mode` isn't
`'manual'`, or if `id`/its progress bar don't exist. It patches the stored
config and re-syncs the bar directly, without the full DOM rebuild
`updateToast(id, { progress })` would do; cheap to call repeatedly from a
frequent progress event.

This pairs naturally with [`confirmButton()`'s](buttons.md)
`pendingMessage`/`pendingColor`: `onConfirm` already receives the toast's
`id`, so a slow action confirmed via `confirmButton()` can report real
progress the same way instead of just showing static pending text.
