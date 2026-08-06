# ToastBuilder reference

`ToastBuilder` is a fluent wrapper that accumulates the exact same
`ToastOptions` object `showToast()` accepts, then calls `showToast` with it
on `.show()`; it never has behavior independent of the options-object form.

```ts
new ToastBuilder('Saved!', toastsInstance?) // message defaults to '', instance defaults to the shared `toasts` singleton
  .withTitle('Done')
  .asSuccess()
  .show();
```

Pass a second constructor argument to target a [page-scoped `Toasts`
instance](config.md) instead of the shared singleton.

Every method returns `this` (chainable) except `.show()`, which returns the
toast's id, same as `showToast()`.

| Method | Mirrors | Notes |
|---|---|---|
| `withTitle(title, mode?)` | `ToastOptions.title`/`titleMode` | `mode` is optional; omitted leaves the configured `titleMode` default in place |
| `withTitleMode(mode)` | `ToastOptions.titleMode` | Standalone alternative to `withTitle()`'s second argument. No effect when `title` is unset |
| `withColor(color)` | `ToastOptions.color` | |
| `asInfo()` / `asSuccess()` / `asWarning()` / `asError()` | `ToastOptions.color` | Shorthand for `withColor(ToastColor.INFO / SUCCESS / WARNING / ERROR)` |
| `withDuration(durationMs)` | `ToastOptions.duration` | |
| `withClosable(closable = true)` | `ToastOptions.closable` | Called with no argument, enables closability |
| `withAllowHtml(allowHtml = true)` | `ToastOptions.allowHtml` | Called with no argument, enables HTML rendering |
| `withAllowLineBreaks(allowLineBreaks = true)` | `ToastOptions.allowLineBreaks` | Called with no argument, enables it |
| `withPosition(position)` | `ToastOptions.position` | |
| `withAnimation(animation)` | `ToastOptions.animation` | See [Animations](animations.md) |
| `withOnClose(onClose)` | `ToastOptions.onClose` | |
| `withPauseOnHover(pauseOnHover = true)` | `ToastOptions.pauseOnHover` | Called with no argument, enables it; also governs focus-to-pause |
| `withProgress(progress = true)` | `ToastOptions.progress` | See [Progress bar](progress.md) |
| `withData(data)` | `ToastOptions.data` | See [Per-toast data](data.md) |
| `withTheme(theme)` | `ToastOptions.theme` | Merges key-by-key over the configured default at `.show()` time |
| `withTransition(transition = ToastTransition.FADE)` | `ToastOptions.transition` | No-op via `.show()`: nothing to transition from on first render. Only takes effect if the built options later reach `updateToast`/`promise()` some other way |
| `andRemoveOtherToasts()` | `ToastOptions.removeOtherToasts` | Sets it to `true` |
| `andReverseOrder()` | `ToastOptions.reverseOrder` | Sets it to `true` |
| `withButton(label, onClick?, className?)` | `ToastOptions.buttons` | Appends one button; repeatable, call once per button |
| `withDetails(details, detailsLabel?, detailsHideLabel?)` | `ToastOptions.details`/`detailsLabel`/`detailsHideLabel` | See [Details](details.md) |
| `withCloseButton(label?, className?)` | `Toasts.closeButton()` | Appends a ready-made dismiss button |
| `withConfirmButton(label, onConfirm, options?)` | `Toasts.confirmButton()` | Appends a ready-made confirm-before-action button; see [Buttons](buttons.md) for the full `options` shape |
| `withStepButton(steps, className?)` | `Toasts.stepButton()` | Appends a general-purpose multi-step button |
| `show()` | `Toasts.showToast()` | Terminal call: returns the toast's id |

`withButton`/`withCloseButton`/`withConfirmButton`/`withStepButton` all
append to the same underlying `buttons` array, so they can be freely mixed
in one chain and called multiple times.
