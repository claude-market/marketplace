# Buttons

## Plain action buttons

For simple actions (Undo, Dismiss, Expand, ...), use the native `buttons`
option instead of building a custom `Node`; it renders as plain, underlined
clickable text (not a native-looking button, by design), vertically centered
regardless of whether `title` is present:

```ts
toasts.showToast('Item deleted.', {
  title: 'Item deleted',
  buttons: [
    {
      label: 'Undo',
      onClick: (event, id) => {
        toasts.removeToast(id);
        toasts.showToast('Restored!', { color: ToastColor.SUCCESS });
      },
    },
  ],
});
```

`onClick` receives the click/keyboard-activation event and the toast's own
`id`, so you can dismiss it yourself, show a follow-up toast, or reach the
toast's DOM node directly (`document.getElementById(id)`) to update its
content in place. Button clicks never trigger the toast's own `closable`
dismiss behavior (`click`/`keydown` both `stopPropagation()` before reaching
the row's own listeners). `label` always renders as plain text, honoring
`\n`/`<br>` line breaks like `title`. Pass `className` for extra styling
hooks without losing the default plain-link look. Builder equivalent:
`.withButton(label, onClick, className)` (repeatable; call it once per
button).

For the common case of a button that just dismisses the toast, use
`toasts.closeButton(label?, className?)` instead of writing the `onClick`
yourself:

```ts
toasts.showToast('Saved.', { buttons: [toasts.closeButton()] });
```

`label` defaults to the resolved locale's translation (`"Close"` in `en`;
see [Localization](localization.md)) but is a normal parameter, not a
hardcoded string. If you're using a page-scoped `Toasts` instance (see
[Config](config.md)), call `.closeButton()` on that instance, not the
singleton, so it dismisses via the right instance. Builder equivalent:
`.withCloseButton(label?, className?)`.

## Confirm-before-action buttons

For an action that shouldn't fire on a single accidental click, use
`toasts.confirmButton(label, onConfirm, options?)` instead of hand-rolling
a "click once to arm, click again to confirm" button:

```ts
toasts.showToast('3 items selected.', {
  buttons: [
    toasts.confirmButton('Delete', async (event, id) => {
      await deleteSelectedItems();
    }),
  ],
});
```

Clicking it swaps out the *whole toast*, not just this button: `message`
becomes `confirmMessage` (default the locale's `"Are you sure?"`) and every
button on the toast is replaced with a `yesLabel`/`noLabel` (default
`"Yes"`/`"No"`) pair. Clicking "Yes" runs `onConfirm`, optionally flashes
`doneMessage` (default `"Done"`; pass `null` to skip it) for `doneTimeoutMs`
(default `2000`), then either **restores the toast's original `title`,
`message`, `buttons`, and `color`** (`doneAction: 'restore'`, the default;
note `color` is restored too, not just the content) or dismisses the toast
entirely (`doneAction: 'close'`). Clicking "No" restores immediately, without
ever running `onConfirm`; no revert timer needed, since the explicit "No"
*is* the revert. If `onConfirm` returns a `Promise` (as above), every button
on the toast disables itself until it settles, so "Yes" can't be
double-fired by an impatient second click and "No" can't race a running
confirm. A rejected `onConfirm` always restores (never closes), after
logging a console warning.

Each step of the flow can also change the toast's `color`, and the pending
step can show its own message instead of just disabling the buttons, handy
for something like a delete confirmation, where reverting to "Delete this
file?" after the file is already gone doesn't make sense:

```ts
toasts.showToast('Delete this file?', {
  color: ToastColor.WARNING,
  duration: 0,
  buttons: [
    toasts.confirmButton('Delete', () => deleteFile(), {
      confirmMessage: 'Are you sure you want to delete this file?',
      confirmColor: ToastColor.ERROR,
      pendingMessage: 'Processing, it might take a while.',
      pendingColor: ToastColor.INFO,
      doneMessage: 'File deleted successfully.',
      doneColor: ToastColor.SUCCESS,
      doneAction: 'close',
    }),
  ],
});
```

`pendingMessage`/`pendingColor` only apply while `onConfirm`'s `Promise` is
pending; left unset, the toast just stays on the confirm step's content
with every button disabled, same as before. `onConfirm` still receives the
toast's `id`, so if a static "Processing..." message isn't enough (e.g. a
real upload), call `toasts.setToastProgress(id, value)` from inside your own
async work instead; see [Progress bar](progress.md)'s `mode: 'manual'`.
Every click of the confirm/yes/no buttons also calls `resetToastTimer(id)`
(see [Timers](timers.md)), so the toast's own auto-dismiss timer can't fire
out from under the user mid-confirmation.

Full `options` shape (all optional):

| Field | Default | Notes |
|---|---|---|
| `confirmMessage` | locale `"Are you sure?"` | Message on the confirm step |
| `confirmColor` | unchanged | Toast color during the confirm step |
| `yesLabel` | locale `"Yes"` | Confirm button label |
| `noLabel` | locale `"No"` | Cancel button label |
| `pendingMessage` | `undefined` | Message while `onConfirm`'s promise is pending; unset just disables buttons |
| `pendingColor` | unchanged | Toast color while pending |
| `doneMessage` | locale `"Done"` | Flash message on success; `null` skips the flash entirely |
| `doneColor` | unchanged | Toast color during the done flash |
| `doneTimeoutMs` | `2000` | How long the done flash stays up before `doneAction` runs |
| `doneAction` | `'restore'` | `'restore'` (title/message/buttons/color) or `'close'` (dismiss) |
| `className` | `undefined` | Extra class(es) on the button itself |

Builder equivalent: `.withConfirmButton(label, onConfirm, options?)`.

## Multi-step buttons

For flows `confirmButton()` doesn't cover directly (it doesn't use
`stepButton()` under the hood; it swaps the toast's own content instead
of a single button's label), build them with `toasts.stepButton(steps,
className?)`, the same general-purpose primitive `detailsCopyButton()`
(see [Details](details.md)) is built on. Each `ToastButtonStep` has its own
`label` and optional `onClick`; a step's `onClick` can return (or resolve
to) `false` to stay on that step instead of advancing to the next one,
e.g. a guard that isn't met, or an action that failed:

```ts
toasts.showToast('Draft ready.', {
  buttons: [
    toasts.stepButton([
      { label: 'Publish', onClick: () => (isValid() ? undefined : false) },
      { label: 'Are you sure?', onClick: (event, id) => publish(), revertAfterMs: 4000 },
      { label: 'Published!', revertAfterMs: 2000 },
    ]),
  ],
});
```

Add `revertAfterMs` (and, if not step `0`, `revertToStep`, default `0`) to
a step to auto-advance after it's been active that long; cancelled if the
button is clicked again first. `revertAfterMs` has no effect on `steps[0]`:
the first step is applied when the button renders, not via a click, so no
timer ever starts for it. The returned `ToastButton` is safe to build once
and reuse across multiple simultaneously-visible toasts (e.g. hoisted out
of a loop); per-step state (current index, pending revert timer) lives in
a `WeakMap` keyed off the rendered `<button>` element itself, not the
`stepButton()` call's closure, so each rendered button tracks its own
current step independently. A step's `onClick` throwing, or its returned
promise rejecting, logs a console warning and leaves the button on its
current step. Builder equivalent: `.withStepButton(steps, className?)`.

## Pairing with pre-translated action words

`ToastQuickActions` (see [Localization](localization.md)) supplies
pre-translated common words like `"Yes"`/`"Cancel"`/`"Undo"` for your own
button labels, independent of `configure()`'s locale:

```ts
import { ToastQuickActions } from 'brents-toasts';

toasts.showToast('Delete this item?', {
  buttons: [
    { label: ToastQuickActions.yes(), onClick: (_e, id) => { doDelete(); toasts.removeToast(id); } },
    { label: ToastQuickActions.no(), onClick: (_e, id) => toasts.removeToast(id) },
  ],
});
```
