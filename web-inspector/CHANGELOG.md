# Changelog

## 1.3.2 — 2026-10-30

- Plugin description and keywords now describe everything the kit does (Lighthouse, screenshot comparison,
  keyboard check, how-to-fix advice, many sites).

## 1.3.1 — 2026-10-30

- Fix: `npm run visual` could cut very long pages short (only what fit on screen was captured).
- Fix: `npm run lighthouse` picks a free port instead of always using 9333, so it no longer fails when
  another program uses that port.
- Tidy-up: the "which pages to check" code shared by Lighthouse and the visual comparison now lives in one
  place (`site.js`); removed unused variables; corrected a wrong option description; the README file list now
  shows every tool.

## 1.3.0 — 2026-10-30

- Every scan finding now has a "How to fix" line (plain words, with a code example where possible) in the
  Markdown, HTML and JSON reports.
- New `npm run sites`: scans every site in `sites.txt` and writes one summary page. Each site keeps its own
  new / fixed history.
- `SKILL.md` has a "fix it and prove it" workflow: fix the findings in the site's code, re-scan, and show
  that they are Fixed with no New problems.

## 1.2.1 — 2026-10-30

- Fix: `npm run lighthouse` and `npm run visual` could not open the extra pages found by the scan (they were
  saved as paths like `/login`). Both now score and compare every scanned page.
- Fix: the keyboard check no longer reports a false "keyboard trap" inside widgets such as captchas, and a
  trap is now a warning, not an error.
- GitHub Actions file now also runs Lighthouse and the visual comparison.
- `SKILL.md` documents `npm run zap` (the user runs it, on staging only), Lighthouse, the visual comparison
  and the new scan checks. Added a plugin icon.

## 1.2.0 — 2026-10-30

- Site scan has new checks, ideas taken from similar tools: keyboard check (Tab shows no visible focus, or a
  keyboard trap), files sent without compression or cache rules, missing viewport tag, missing social share
  tags (og:title / og:image), and `--fail-on-new` to fail a CI run only when a problem is new.
- New `npm run zap`: runs OWASP ZAP (in Docker) as an active security scan of a STAGING copy of your site and
  rewrites its findings in plain words. Refuses to run without `--i-own-this` and `--staging`. The kit
  contains no attack code of its own: ZAP does the testing.
- New `npm run lighthouse`: Google Lighthouse scores (0-100) for Performance, Accessibility, SEO and Best
  practices, on a phone or desktop, with an HTML report. Same numbers as PageSpeed Insights.
- New `npm run visual`: screenshots of your pages (phone and desktop) compared with the last approved look,
  with pictures of what changed. Catches broken layouts that other checks cannot see.

## 1.1.1 — 2026-10-29

- Simpler repository layout: the plugin now sits at the top of the repository instead of under
  `plugins/web-inspector/`. Nothing changes for users: install and update the same way.

## 1.1.0 — 2026-10-29

- Read-only security check (`npm run security -- <url> --i-own-this`): exposed secret files, unsafe
  cookies, missing security headers, HTTPS and certificate problems, directory listing, mixed content.

## 1.0.0 — 2026-10-29

First public release.

- Site scan: broken pages and links, broken resources and APIs, JavaScript and console errors, slow and
  heavy pages, mobile layout overflow, accessibility (axe-core), SEO, HTTPS and security headers.
- Phone speed: Core Web Vitals measured on a simulated slow-4G phone.
- Comparison with the previous scan.
- Journeys: plain-word click-and-type tests.
- Load test with fast HTTP users and real browsers, one PASSED / FAILED verdict.
- HTML reports with charts; GitHub Actions workflow for weekly checks.
