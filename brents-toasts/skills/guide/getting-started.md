# Getting started

## Install

```bash
npm install brents-toasts
```

```ts
// TypeScript / bundlers: types come free from dist/index.d.ts
import { toasts, ToastColor, ToastBuilder, Toasts } from 'brents-toasts';
```

Or drop it straight into a page with no build step, no module system required:

```html
<script src="https://unpkg.com/brents-toasts/dist/index.umd.min.js"></script>
<script>
  BrentsToasts.toasts.showToast('Hello, toast.');
</script>
```

`BrentsToasts` (the UMD global) mirrors the npm named exports 1:1:
`BrentsToasts.toasts` (the ready-to-use instance), `BrentsToasts.Toasts`
(the class), plus `ToastColor`, `ToastPosition`, `ToastAnimation`,
`ToastTransition`, `ToastBuilder`, `ToastQuickActions`, and the rest of
`src/index.ts`'s exports. There is no separate CSS file to `<link>`; the
stylesheet is bundled into the JS and injected into `<head>` the first time
a toast is shown.

## Showing a toast

`toasts` is a ready-to-use singleton; just call `showToast`. The API scales
from a single argument up to full control, in whatever form fits the call
site:

```ts
// 1. Just a message
toasts.showToast('Saved!');

// 2. + a color
toasts.showToast('Saved!', ToastColor.SUCCESS);

// 3. Legacy positional form: message, color, duration (ms), closable, allowHtml
toasts.showToast('Saved!', ToastColor.SUCCESS, 5000, false, false);

// 4. Options object: the recommended form once you need more than color
toasts.showToast('Saved!', {
  color: ToastColor.SUCCESS,
  duration: 5000,
  closable: false,
  title: 'Done',
});

// 5. Fluent builder: same options under the hood, chainable
new ToastBuilder('Saved!')
  .asSuccess()
  .withTitle('Done')
  .withDuration(5000)
  .show();
```

All three call shapes (legacy positional, options object, `ToastBuilder`)
normalize into the exact same internal options and are permanently
supported side by side; pick whichever reads better at the call site. Note
the legacy positional form has **five** parameters, not four:
`showToast(message, color?, duration?, closable?, allowHtml?)`.

Defaults (from `Toasts.ts`'s `DEFAULT_CONFIG`, overridable via
[`configure()`](config.md)): `color` `ToastColor.INFO`, `duration` `3000`ms,
`closable` `true`, `allowHtml` `false`, `allowLineBreaks` `true`.

See [`docs/guide/builder-reference.md`](builder-reference.md) for the full
`ToastBuilder` method list.

## Custom content

As plain text (`allowHtml: false`, the default), `message` still honors line
breaks: a literal `\n` or `<br>`/`<br/>` in the string renders as a real line
break; everything else in the string stays inert text, no other markup is
parsed. `title`, every button label (`buttons`, `closeButton()`,
`detailsCopyButton()`, `confirmButton()`, `stepButton()`, the auto-added
details toggle, ...), and each `details` item's `label`/`value` follow the
same rule, regardless of `allowHtml`; none of them otherwise render HTML,
but all of them still honor `\n`/`<br>` line breaks.

Set `allowLineBreaks: false` (per-toast, or as a `configure()` default) to
turn that off: `\n`/`<br>` then render as inert text everywhere above,
same as any other character:

```ts
toasts.showToast('literal \\n stays as text', { allowLineBreaks: false });
```

For a simple HTML string, opt in with `allowHtml` (sanitize the input
yourself; this renders via `innerHTML`):

```ts
toasts.showToast('<b>Saved!</b> Undo?', { allowHtml: true });
```

For fully custom, interactive content (buttons, links, anything), pass a
real DOM node instead of a string. It's appended directly: no `innerHTML`,
no `allowHtml`, no XSS surface:

```ts
const content = document.createElement('span');
content.textContent = 'Undo? ';
const undoBtn = document.createElement('button');
undoBtn.textContent = 'Undo';
undoBtn.onclick = () => restore();
content.appendChild(undoBtn);

toasts.showToast(content, { closable: true });
```

`title` always renders as plain text regardless of `allowHtml`, by design
(same `\n`/`<br>` line-break exception as `message` above). A `ToastBuilder`
constructed with no message (`new ToastBuilder()`) defaults `message` to
`''`, useful for a title-only toast.

## Title mode

By default (`titleMode: 'stacked'`), a `title` renders on its own bold line
above `message`, conceptually `<b>Title</b><br>message`. Set `titleMode:
'inline'` (per-toast, via `ToastBuilder.withTitle(title, 'inline')` or the
standalone `ToastBuilder.withTitleMode('inline')`, or as a `configure()`
default) to have it share the message's own line instead, as a bold lead-in,
conceptually `<b>Title</b> message`:

```ts
toasts.showToast('has been saved.', { title: 'File', titleMode: 'inline' });
// or:
new ToastBuilder('has been saved.').withTitle('File', 'inline').show();
// or, set independently of withTitle():
new ToastBuilder('has been saved.').withTitle('File').withTitleMode('inline').show();
```

`titleMode` has no effect when `title` is unset, and, like `title` itself,
is never affected by `allowHtml`.

## Where to go next

- [Buttons](buttons.md): action buttons, confirm-before-action, multi-step buttons
- [Details](details.md): expandable extra info
- [Lifecycle](lifecycle.md): removing/updating toasts, transitions, promise-based toasts
- [Timers](timers.md): controlling the auto-dismiss countdown
- [Per-toast data](data.md): a shared handler instead of one closure per toast
- [Progress bar](progress.md)
- [Animations](animations.md): entrance/exit animation engine
- [Config](config.md): library-wide/page-scoped defaults, positions
- [Theming](theming.md)
- [Localization](localization.md)
- [ToastBuilder reference](builder-reference.md): every builder method
