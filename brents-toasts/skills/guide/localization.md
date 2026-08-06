# Localization

## The library's own chrome text

The library's own text (`closeButton()`'s `"Close"`, `detailsLabel`
(`"Details"`) / `detailsHideLabel` (`"Hide details"`), `detailsCopyButton()`'s
`"Copy"`/`"Copied!"`, `confirmButton()`'s `confirmMessage` (`"Are you
sure?"`) / `yesLabel`/`noLabel` (`"Yes"`/`"No"`) / `doneMessage` (`"Done"`),
and the snackbar region's `aria-label` (`"Notifications, <position>"`)) is
auto-translated based on the browser's `navigator.language`(s), no config
required. Bundled packs today: `en` (default/fallback), `de`, `es`, `fr`
(see `ToastLocales` in `dist/index.d.ts`, or `src/locales/toast/*.json`).
Everything else (`title`, `message`, per-button/detail text,
`confirmButton()`'s own `label` (e.g. `"Delete"`)) is your own application
text and is never auto-translated.

Each of the 6 positions gets its own `role="region"` snackbar container, and
each one's `aria-label` is suffixed with a localized position name (e.g.
`"Notifications, top right"` vs. `"Notifications, bottom center"`) so
screen readers can tell simultaneously-visible regions apart instead of
announcing several identically-named "Notifications" landmarks.

To force a specific bundled pack instead of auto-detecting:

```ts
toasts.configure({ locale: 'de' });
```

To add a language that isn't bundled, or tweak individual strings, layer a
partial override on top of the resolved pack:

```ts
toasts.configure({ translations: { close: 'Schließen', done: 'Erledigt' } });
```

An unrecognized `locale` falls back to `en` with a one-time console warning,
same as an unimplemented `position`/`animation`/`transition` value. Locale
matching is case-insensitive and falls back from a full tag (`"de-CH"`) to
its base language (`"de"`) if the exact tag isn't bundled. Per-call params
(`detailsLabel`, `closeButton(label)`, `detailsCopyButton(text, label,
copiedLabel)`, `confirmButton(label, onConfirm, { confirmMessage, yesLabel,
noLabel, doneMessage })`) still win over the resolved translations, same
precedence as every other option.

The full `ToastTranslations` shape: `close`, `details`, `hideDetails`,
`copy`, `copied`, `areYouSure`, `done`, `yes`, `no`, `notificationsRegion`,
`positions` (a `Record` of all 6 `ToastPosition` values to a localized
position name, appended to `notificationsRegion` for each snackbar's
`aria-label`), `progress` (default accessible name for a progress bar - see
[`ToastProgressOptions.label`](progress.md)).

## Quick action strings

`ToastQuickActions` is a separate, standalone utility for pre-translated
*common action words* (`"Yes"`, `"Cancel"`, `"Undo"`, ...) for your own
`title`/`message`/button labels. It's intentionally independent of `toasts`/
`configure()`: no `Toasts` instance is involved, calling it never reads or
changes any instance's locale, and it ships its own small bundle of `en`/
`de`/`es`/`fr` strings (`QuickActionLocales`, from
`src/locales/quick-actions/*.json`), separate from `ToastLocales`; adding a
bundled language to one never silently affects the other.

```ts
import { ToastQuickActions } from 'brents-toasts';

toasts.showToast('Delete this item?', {
  buttons: [
    { label: ToastQuickActions.yes(), onClick: (_e, id) => { doDelete(); toasts.removeToast(id); } },
    { label: ToastQuickActions.no(), onClick: (_e, id) => toasts.removeToast(id) },
  ],
});
```

Every method (`yes`, `no`, `ok`, `cancel`, `confirm`, `dismiss`, `undo`,
`retry`, `save`, `delete`) takes an optional `locale` override; omitted, it
auto-detects from `navigator.language`(s) the same way `configure()`'s
`locale` does, falling back to `en`. `ToastQuickActions.all(locale)` returns
every string at once as a `QuickActionStrings` object.
