# Details (expandable extra info)

For information that shouldn't clutter the main message (a status code, a
backend error, anything only needed on request), pass `details` instead of
building your own button. A "Details" toggle button is added automatically;
clicking it reveals a block below the message that's visually distinct
(bordered, monospace) and structurally separate from the clickable/
dismissable part of the toast (`.bt-toast-details` is a DOM *sibling* of
`.bt-toast-row`, not a descendant of it), so it never accidentally triggers
dismissal:

```ts
toasts.showToast('Account settings could not be updated.', {
  title: 'Action Failed',
  color: ToastColor.ERROR,
  details: [
    { label: 'Error', value: '500 Internal Server Error' },
    { label: 'Status', value: 'failed' },
  ],
});
```

Strings are shorthand for `{ value: '...' }` with no label. `label`/`value`
render as plain text, honoring `\n`/`<br>` line breaks the same as `title`.
Nothing is copyable by default; like `closeButton()`, a "Copy" button is
opt-in via `toasts.detailsCopyButton(text, label?, copiedLabel?,
className?)`, appended to a specific item's `buttons` (or every item's, via
`.map()`) rather than happening automatically:

```ts
toasts.showToast('Account settings could not be updated.', {
  title: 'Action Failed',
  color: ToastColor.ERROR,
  details: [
    { label: 'Error', value: '500', buttons: [toasts.detailsCopyButton('500')] },
    { label: 'Status', value: 'failed' }, // no copy button for this one
  ],
});
```

It copies `text` via the Clipboard API (no-op if unavailable, e.g. an
insecure context) and flashes its own label to `copiedLabel` (default the
locale's `"Copied!"`) for 2s, built on the `stepButton()` primitive (see
[Buttons](buttons.md)). It also calls `resetToastTimer(id)` on click, so the
"Copied!" flash can't get cut short by the toast auto-dismissing underneath
it. Toggling details open/closed (or mutating a toast's own content some
other way) automatically repositions the whole stack via the toast's own
`ResizeObserver`, so an expanded toast never overlaps the ones above it.
Opening the details toggle also calls `resetToastTimer(id)`, so a toast
whose details someone just asked to read doesn't vanish mid-read; closing
details does not.

Customize the toggle button text with `detailsLabel`/`detailsHideLabel`
(default the locale's `"Details"`/`"Hide details"`). Builder equivalent:
`.withDetails(details, detailsLabel?, detailsHideLabel?)`.

Each detail item's `buttons` works like the top-level `buttons` option;
`detailsCopyButton()` is just the first ready-made entry for it, mix in your
own alongside it:

```ts
toasts.showToast('Payment failed.', {
  title: 'Payment Failed',
  color: ToastColor.ERROR,
  details: [
    {
      label: 'Transaction',
      value: 'tx_8f2a1c',
      buttons: [
        toasts.detailsCopyButton('tx_8f2a1c'),
        { label: 'Retry', onClick: (event, id) => retryPayment('tx_8f2a1c') },
      ],
    },
  ],
});
```
