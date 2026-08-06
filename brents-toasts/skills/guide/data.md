# Per-toast data (a shared handler instead of one closure per toast)

For a button that means something different on every toast ("Undo" needs to
know *which* item to restore), you don't have to give each toast its own
`onClick` closure just to capture that. Attach the payload as `data` at
`showToast()` time, then read it back by `id` inside a single handler
reused across every toast:

```ts
// Defined once: reused by every toast's Undo button, not recreated per toast.
function handleUndo(event, id) {
  const item = toasts.getToastData(id);
  toasts.removeToast(id);
  toasts.showToast(`Restored "${item.name}"!`, ToastColor.SUCCESS);
}

deletedItems.forEach((item) => {
  toasts.showToast(`${item.name} deleted.`, {
    data: item,
    buttons: [{ label: 'Undo', onClick: handleUndo }],
  });
});
```

`getToastData(id)` returns `undefined` if `id` doesn't exist or has no data
attached; `setToastData(id, data)` attaches or replaces it after the toast's
already showing (e.g. once an async step resolves the real payload).
Builder equivalent: `.withData(data)`. Pairs naturally with
[`getToastTimer()`](timers.md) for an "Undo"/"Time left" button pair, both
built from the same shared-handler pattern; see the live demo's Playground
for a runnable example.

> **⚠️ Not a good general-purpose state store.** Reaching into a specific
> toast by `id` to read/write its data from arbitrary code couples that code
> to the toast still being on screen, and doesn't compose; nothing stops two
> unrelated callers from clobbering the same toast's data. Keep this to the
> narrow case above (a payload a *shared* button handler looks up by the
> `id` it already receives); if you find yourself calling `setToastData`
> from outside the toast's own click handlers, you probably want your own
> app-level state instead.
