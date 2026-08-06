# Theming

`color` sets the accent bar/indicator, same as always. For the rest of a
toast's look (card background, text, the details block, action button
text), there's `theme`, settable library-wide (`configure({ theme })`),
per-toast (`showToast(msg, { theme })`), or entirely in plain CSS with no
API involvement at all:

```ts
// Library-wide default
toasts.configure({
  theme: { background: '#1e1e2e', text: '#cdd6f4', actionColor: '#89b4fa' },
});

// Per-toast: merges key-by-key over the configured default, so you only
// need to give the field(s) you want to change
toasts.showToast('Heads up.', {
  theme: { background: '#2a2a3d' },
});
```

## Fields

| Field | CSS var | Default |
|---|---|---|
| `background` | `--bt-background` | `#333` |
| `text` | `--bt-text` | `#fff` |
| `detailsBackground` | `--bt-details-background` | `rgba(0, 0, 0, 0.15)` |
| `actionColor` | `--bt-action-color` | defaults to `text` |
| `closeIcon` | `--bt-close-icon` | auto-computed for contrast (see below) |

Every field except `closeIcon` mirrors a `--bt-*` custom property on
`.bt-toast`, so a plain stylesheet rule works just as well if you'd rather
not touch the JS API at all:

```css
.bt-toast {
  --bt-background: #1e1e2e;
  --bt-text: #cdd6f4;
}
```

A key left unset in `theme` is actively cleared (not just skipped), so a
later `updateToast` that drops a previously-set field falls back to plain
CSS: the stylesheet default, or your own `.bt-toast { --bt-background: ...
}` rule, rather than leaving a stale inline value behind.

## Automatic close-icon contrast

`closeIcon` is the one exception: its color is always picked for you, dark
(`#333`) or light (`#fff`), based on a perceived-brightness (luma) check
against the toast's own `color`, so a light accent (e.g. `#fff`) never
renders an invisible white-on-white close icon. The threshold is tuned so
every bundled `ToastColor` (info/success/warning/error, all in the ~120-171
luma range) keeps the light icon, while true light colors (white, pastels)
correctly flip to the dark one. Set `theme.closeIcon` to override the
automatic pick with a specific color instead:

```ts
toasts.showToast('Heads up.', {
  color: '#fff',
  theme: { closeIcon: '#000' }, // skip the automatic contrast pick
});
```

Builder equivalent: `.withTheme(theme)`.
