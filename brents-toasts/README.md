# brents-toasts

Claude Skill for writing correct code against [brents-toasts](https://github.com/brentspine/brents-toasts), a zero-dependency, framework-agnostic toast/snackbar UI library for JavaScript/TypeScript. Works as an ESM/CJS import or a plain `<script>` tag (UMD), with no CSS to link since the stylesheet is bundled into the JS.

## Installation

```bash
/plugin install brents-toasts
```

## Skills

- **brents-toasts** (`skills/brents-toasts.md`): covers install, the `showToast`/`ToastBuilder` call shapes, buttons (plain/confirm/multi-step), details, updating/removing toasts, promise-based toasts, timers, progress bars, animations, theming, localization, and config. Claude uses it automatically whenever a task involves adding, changing, or debugging toast/snackbar notifications built with brents-toasts.

The skill's supporting reference pages live under `skills/guide/`, one per topic (getting started, buttons, details, lifecycle, timers, data, progress, animations, config, theming, localization, builder reference).

## Requirements

None — brents-toasts itself is zero-dependency. No environment variables or external tools are needed to use this skill.

## Source

This is a vendored snapshot of the `docs/` directory from [brentspine/brents-toasts](https://github.com/brentspine/brents-toasts) at the time it was submitted. For the always-current version, install directly from the library's own plugin marketplace: `/plugin marketplace add brentspine/brents-toasts` then `/plugin install brents-toasts@brents-toasts`.

## License

Apache-2.0 - see [LICENSE](./LICENSE).
