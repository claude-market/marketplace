# Removing, updating, and promise-based toasts

## Removing toasts

`toasts.removeToast(id)` dismisses a single toast by the id returned from
`showToast`. To clear everything at once, across all positions, use
`toasts.removeAllToasts()`:

```ts
const id = toasts.showToast('Uploading...', { duration: 0 });
// ...
toasts.removeAllToasts(); // fades out every currently visible toast
```

Each toast still animates out individually via `removeToast` under the hood
(`removeAllToasts` queries the DOM for every `.bt-snackbar`'s children
rather than iterating a fixed list, so it also reaches toasts created by a
different page-scoped `Toasts` instance sharing the same physical
snackbar). `showToast(msg, { removeOtherToasts: true })` does the same thing
before showing its own toast, for the common "replace whatever's on screen"
case.

## Updating a toast

`toasts.updateToast(id, update)` changes an already-shown toast in place,
instead of removing it and showing a new one. `update` is the same shape as
`showToast`'s `options` (plus `message`, since that's normally the separate
first argument); only the keys you pass change, everything else about the
toast stays as it was:

```ts
const id = toasts.showToast('Uploading…', { color: ToastColor.INFO, duration: 5000 });

toasts.updateToast(id, {
  message: 'Upload complete!',
  color: ToastColor.SUCCESS,
});
```

A common use: reflecting `getToastTimer(id)`'s countdown back onto the toast
itself instead of spawning a new one every time; see [Timers](timers.md).

`buttons`/`details`/`theme` passed to `updateToast` **replace the whole
array/object** (unlike the key-by-key merge `theme` gets against
`configure()`'s default at creation time). To append or insert/remove a
single button or detail line without reconstructing the current array
yourself, use:

```ts
toasts.addToastButton(id, { label: 'Retry', onClick: retry });     // append
toasts.addToastButton(id, { label: 'Retry', onClick: retry }, 0);  // insert at index 0
toasts.removeToastButton(id, 0);

toasts.addToastDetail(id, 'Retried once already');
toasts.removeToastDetail(id, 1);
```

`position`, `animation`, `removeOtherToasts`, and `reverseOrder` are
accepted (for shape-compatibility with `ToastOptions`) but are no-ops here;
they only describe how a toast is shown, not a state it can be updated
into. `updateToast` is a no-op if `id` doesn't exist.

Passing `duration` restarts the countdown at the new value (or cancels/starts
a timer outright, if the toast was sticky or vice versa); see
[Timers](timers.md) for finer-grained alternatives like `extendToastTimer`,
which adjust the countdown without also touching the toast's content.

## Transitions (animating an update)

Pass `transition` alongside a visual change (`message`, `color`, `title`,
`buttons`, `progress`, ...) to animate into it instead of swapping
instantly:

```ts
toasts.updateToast(id, {
  message: 'Upload complete!',
  color: ToastColor.SUCCESS,
  transition: ToastTransition.FADE,
});
```

- `ToastTransition.FADE`: the toast fades out (150ms), the update applies,
  then it fades back in (150ms).
- `ToastTransition.SHAKE_LR`: the update applies immediately and the toast
  shakes left-right over it (7 steps, 60ms each), to draw attention to the
  change rather than hide it.
- `ToastTransition.NONE`, or omitting `transition` entirely, applies
  instantly (the default). `NONE` is registered like any other named
  transition, so it can be overridden via `registerToastTransition('none',
  ...)` if you really want that.

Register a custom one with `registerToastTransition(name, { run(toast, mutate) { ... } })`;
call `mutate()` whenever the new content should appear, and pass its
`name` anywhere `transition` is accepted. `run` receives the `.bt-toast`
card element and a `mutate` callback that applies every visual field the
update touched in one go, so a multi-field patch (message *and* color
changing together, say) reads as one clean change instead of pieces
settling at different times.

It's a no-op passed to `showToast`/`ToastBuilder`; there's nothing to
transition from on a toast's first render (`ToastBuilder.withTransition()`
only takes effect if the built options object later reaches `updateToast`/
`promise()` some other way).

Call `toasts.playToastTransition(id, transition)` to play a transition by
itself, with no content change, e.g. to shake a toast that's still waiting
on the user, without patching it via `updateToast`:

```ts
toasts.playToastTransition(id, ToastTransition.SHAKE_LR);
```

## Promise-based toasts

`toasts.promise(promise, messages, options?)` ties a toast to a `Promise`'s
lifecycle; this is the built-in version of the "show a pending toast, then
patch it to success/error" pattern above, for the common case of wrapping a
single `fetch`/async call:

```ts
toasts.promise(
  fetch('/api/posts').then(r => r.json()),
  {
    loading: 'Fetching posts...',
    success: (posts) => `Fetched ${posts.length} posts`,
    error: (err) => `Failed to fetch posts: ${err.message}`,
  }
);
```

It shows `loading` right away as a forced-sticky toast (`duration: 0`;
there's nothing sensible to auto-dismiss into while the promise is still
pending), then, once `promise` settles, patches that same toast via
`updateToast` to `success` or `error`, defaulting the toast's `color` to
`ToastColor.SUCCESS`/`ToastColor.ERROR` and its `duration` back to
`configure()`'s current default (so the resolved toast auto-dismisses
normally, unless overridden) unless overridden. `loading`/`success`/`error`
each accept a plain message (shorthand for `{ message }`), a full
`updateToast`-shaped options object, or, for `success`/`error`, a function
of the resolved value/rejection reason returning either, for outcome
messages that depend on the result:

```ts
toasts.promise(uploadFile(file), {
  loading: { message: 'Uploading…', closable: false },
  success: { message: 'Uploaded!', duration: 4000 },
  error: { message: 'Upload failed.', duration: 6000 },
});
```

Omit `success` or `error` to just dismiss the toast on that outcome instead
of showing one. A third `options` argument is shared `ToastOptions` applied
under the loading toast and both outcomes alike (`position`, `theme`, ...);
per-state entries in `messages` win over it:

```ts
toasts.promise(
  savePost(post),
  { loading: 'Saving...', success: 'Saved!', error: 'Could not save.' },
  { position: ToastPosition.TOP_RIGHT }
);
```

Set `transition` (on `options`, or per-outcome in `messages`) to animate the
loading→success/error swap instead of an instant jump. Different outcomes
can use different transitions, e.g. fading in on success but shaking on
error:

```ts
toasts.promise(
  savePost(post),
  {
    loading: 'Saving...',
    success: { message: 'Saved!', transition: ToastTransition.FADE },
    error: { message: 'Could not save.', transition: ToastTransition.SHAKE_LR },
  }
);
```

`promise()` returns `promise` itself, unchanged, so it still resolves/rejects
and can be `await`ed/chained normally; turning a rejection into an `error`
toast here doesn't count as handling it for `promise` itself, so you still
need your own `.catch`/try-catch around it to avoid an unhandled rejection.

### Timeout

`options.timeout` bounds how long the loading toast is allowed to stay
sticky - if `promise` hasn't settled within `timeout` ms, the toast is
patched to a fourth `messages.timeout` entry instead (same shapes as
`success`/`error`, minus the resolved value/reason - just a plain
message/options patch/zero-arg thunk), defaulting the toast's `color` to
`ToastColor.WARNING`:

```ts
toasts.promise(
  fetch('/api/posts').then(r => r.json()),
  {
    loading: 'Fetching posts...',
    success: (posts) => `Fetched ${posts.length} posts`,
    error: (err) => `Failed to fetch posts: ${err.message}`,
    timeout: 'Still working on it...',
  },
  { timeout: 8000 }
);
```

Omit `messages.timeout` to just dismiss the loading toast on timeout instead
of showing one. `promise` itself is never touched by a timeout - it's purely
about what the toast shows; if `promise` settles later anyway, that's
ignored, since the toast has already moved on. `options.timeout` falls back
to `configure()`'s `promiseTimeout` (default `0`, disabled) for a
library-wide default across every `promise()` call.
