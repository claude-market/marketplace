# Controlling the auto-dismiss timer

A timed toast (`duration > 0`) pauses its own countdown while hovered and
resumes where it left off on mouseleave, no config needed; this is
`pauseOnHover`, on by default (`toasts.showToast(msg, { pauseOnHover: false })`
or `toasts.configure({ pauseOnHover: false })` to turn it off). A sticky toast
(`duration: 0`) is unaffected either way; hovering and un-hovering it never
starts a timer, since it never gets timer state in the first place, so it
can't suddenly disappear after a hover.

`pauseOnHover` covers keyboard/screen-reader focus too, not just the mouse:
tabbing to the toast itself or anything inside it (its close button, an
action button, the "Details" toggle) pauses the countdown the same way,
resuming once focus leaves the toast entirely. Hovering and focusing are
tracked independently under the hood - either one pausing is enough to stop
the countdown, and both have to release before it resumes (e.g. clicking a
button leaves it focused even after the mouse moves away, so the timer stays
paused until that button loses focus too).

For anything else (reset on a button click, extend while a related async
action is running, pause while a dropdown opened from the toast is open), call
the same timer controls the built-in hover behavior is built on, using the
toast's own `id`:

```ts
const id = toasts.showToast('Uploading…', { duration: 5000 });

toasts.pauseToastTimer(id);   // stop the countdown, remembering time left
toasts.resumeToastTimer(id);  // continue from where it was paused
toasts.resetToastTimer(id);   // back to the full duration, right now
toasts.resetToastTimer(id, 8000); // ...or a new duration, which sticks for future resets
toasts.extendToastTimer(id, 2000); // add (or, negative, remove) time
toasts.removeToastTimer(id);  // cancel it entirely: the toast becomes sticky
```

All six are no-ops on a sticky toast: there's nothing to pause, resume,
reset, extend, or remove, because a sticky toast (`duration: 0`) never gets
a timer-state entry in the first place; and `resetToastTimer`/
`extendToastTimer` won't turn a sticky toast into a timed one; pass
`duration` at `showToast()`/via `updateToast(id, { duration })` for that
instead. Every built-in that shows a temporary, click-driven state calls
`resetToastTimer()` for exactly this reason: `confirmButton()` on every
click (so it can't time out from under the user mid-confirmation),
`detailsCopyButton()` on click (so the "Copied!" flash can't get cut short),
and opening the auto-added "Details" toggle (so a toast doesn't vanish
mid-read; closing it does not reset the timer). Plain buttons you supply
yourself (the top-level `buttons` option, or a details item's own) never do
this automatically; call `resetToastTimer(id)` from your own `onClick` if you
want the same behavior.

Reading the countdown back (instead of just controlling it) works the same
way: `toasts.getToastTimer(id)` returns `{ duration, remaining, paused }`
as a fresh snapshot (not a live-updating subscription), or `null` if `id`
doesn't exist or is sticky:

```ts
const info = toasts.getToastTimer(id);
if (info) console.log(`closes in ${(info.remaining / 1000).toFixed(1)}s`);
```

A common use: reflecting the countdown back onto the toast itself via
[`updateToast`](lifecycle.md) instead of spawning a new one every time:

```ts
const timer = toasts.getToastTimer(id);
const ratio = timer.remaining / timer.duration;
toasts.updateToast(id, {
  message: `Closes in ${(timer.remaining / 1000).toFixed(1)}s`,
  color: ratio > 0.5 ? ToastColor.SUCCESS : ratio > 0.2 ? ToastColor.WARNING : ToastColor.ERROR,
});
```
