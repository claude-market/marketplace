# web-inspector

Finds bugs on any website (broken pages and links, errors, accessibility, SEO, speed on phones, HTTPS),
tests the things visitors click and type through, then checks how the site holds up with many users at once.
**Only test websites you own or have permission to test.**

| Command | What it does |
|---|---|
| `npm run scan -- <url>` | **Site scan**: one real Chrome visits every page it can find and reports what is broken |
| `npm run journeys -- <url>` | **Journeys**: runs the click-and-type steps you write in `journeys.txt` (search, forms, checkout) |
| `npm run security -- <url> --i-own-this` | **Security check**: safe, read-only surface check (headers, cookies, exposed files, HTTPS) |
| `npm run test:smoke -- <url>` | **Load test**: many users at once (also `test:medium`, `test:heavy`) |

Every command prints a summary and saves reports in `results/`: an **HTML report with charts** to open in a
browser or send to someone, plus Markdown and JSON copies.

## Requirements

- Node.js 18 or newer
- Google Chrome installed (the tests use it with a fresh, empty profile; your own Chrome, tabs and logins
  are not touched)

```
npm install
```

On Windows, keep the folder path short (for example `C:\web-inspector`): very deep paths hit Windows' path-length limit.

## 1. Site scan

```
npm run scan -- https://your-site.com
npm run scan -- https://your-site.com --max-pages 300
npm run scan -- https://your-site.com --show
npm run scan -- https://your-site.com --no-external --no-a11y --no-phone   # faster, skips those checks
```

| Errors (fail the scan) | Warnings |
|---|---|
| Broken pages and links (404, 500...), with the page that links to them | Mobile layout overflow (page scrolls sideways on a phone) |
| Broken images, scripts, CSS, fonts and API calls (4xx/5xx) | Accessibility problems rated serious, moderate or minor |
| Requests that fail completely (DNS, refused, CORS, blocked) | Heavy pages (over 3 MB) and large images (over 500 KB) |
| JavaScript exceptions | Missing security headers (HSTS, CSP, X-Content-Type-Options, Referrer-Policy, framing) |
| Console errors logged by the site | HTTP that does not redirect to HTTPS; certificate expiring within 21 days |
| Pages slower than 3 seconds, or that never load | External links that block checking (403, 429...) or cannot be reached |
| Broken links to other websites (404 / 410) | Missing favicon |
| Mixed content (HTTP files on an HTTPS page) | Problems in third-party files (ads, analytics, widgets) |
| Invalid HTTPS certificate (self-signed, expired, wrong domain, incomplete chain); site not on HTTPS | Links that redirect to another site |
| Accessibility problems rated critical | Core Web Vitals: LCP over 2.5 s or CLS over 0.1 (main content slow to appear, layout jumping) |
| | SEO: missing or badly sized meta description, duplicate titles or descriptions, no `<h1>` or more than one, pages hidden from search (noindex), robots.txt blocking everything, canonical pointing to another site |

**Speed on phones:** up to 10 pages are opened again as a phone on a slow 4G network with a 4x slower
processor (the same settings Google's Lighthouse uses for mobile), and that is where the LCP numbers come
from. This is much closer to what real visitors see than a fast desktop. Layout jumps (CLS) are reported
from either measurement. INP (reaction to clicks) is not measured: it needs real visitors.

**Accessibility** uses [axe-core](https://github.com/dequelabs/axe-core) with the WCAG 2.x A/AA rules (alt
text, labels, contrast, page language, titles, button names and more). Up to 200 external links are checked.

**How it finds pages:** links on every page, plus `sitemap.xml` (and sitemaps listed in `robots.txt`), so it
also finds pages that menus open with buttons or JavaScript. `example.com` → `www.example.com` and
http → https redirects are followed automatically.

**Before and after:** every scan is compared with the previous scan of the same site, so after a fix you
see "New problems: 0, Fixed: 5, Still there: 12" and the list of what changed. Keep the `results/` folder
to keep that history.

Exit code: 0 passed, 1 errors found, 3 blocked by bot protection.

Safe for live sites: it only opens pages. It never clicks buttons, fills forms or types, and skips links
that look like logout / delete / add-to-cart / downloads.

### Pages behind a login

```
npm run login -- https://your-site.com
```

A Chrome window opens: log in yourself, then close the window. Your session is saved to `auth.json`.
Then add `--auth auth.json` to the scan or journeys:

```
npm run scan -- https://your-site.com --auth auth.json
```

Use a test account. `auth.json` holds your session, so keep it private (it is in `.gitignore`) and delete it
when done.

The scan also presses Tab through each page (keyboard focus must be visible, and focus must not get stuck),
checks that scripts, styles and images are compressed and cacheable, and checks for the viewport and social
share (Open Graph) tags. Add `--fail-on-new` to make the command fail only when a problem is new since the last
scan, which suits automatic checks on an older site with known problems.

## Several websites at once

Put your own sites in `sites.txt` (one address per line), then `npm run sites -- --i-own-this`. Each site is
scanned in turn and you get one summary page (pass/fail, errors, warnings, new and fixed since last time per
site). Options such as `--no-external` and `--no-phone` are passed on to the scan.

## How to fix

Every problem in the scan reports has a "How to fix" line in plain words, often with a line of code to copy.

## Lighthouse scores

`npm run lighthouse -- https://your-site.com` scores up to 5 pages (the ones the scan found) from 0 to 100 for
Performance, Accessibility, SEO and Best practices, as a phone on slow 4G. Options: `--desktop`,
`--max-pages N`, `--min-score N` (default 90). Same numbers as PageSpeed Insights.

## Visual comparison

`npm run visual -- https://your-site.com` takes screenshots on phone and desktop. The first run saves them as
the approved look; later runs say which pages look different and save pictures of the changes in
`results/visual/diff`. After a change you wanted, run it again with `--update`. Options: `--threshold P`
(percent of changed pixels, default 0.5), `--max-pages N`, `--auth auth.json`.

## 2. Journeys (click and type)

The scan never clicks or types. For search, sign-up, contact forms and checkout, write the steps in plain
words in `journeys.txt` (the file explains every step and has examples):

```
journey: Search finds products
open /
fill "Search" with "apple"
press Enter
expect text "results"
```

```
npm run journeys -- https://your-site.com
npm run journeys -- https://your-site.com --show      # watch it in a visible Chrome window
```

A journey fails when a step cannot be done, an `expect` is not met, or the site throws a JavaScript error or
answers 4xx/5xx along the way. Failures show the exact line, the reason and a screenshot.
**These steps really submit forms:** run them on staging, or use test data on live (a live "Buy" button
really buys).

## 3. Security check (read-only)

A safe surface check of a site **you own**. It only looks — it reads headers, cookies, forms, the HTTPS
certificate and a short list of files that should never be public. It never sends attack traffic (no SQL
injection, no XSS payloads, no password guessing, no fuzzing).

```
npm run security -- https://your-site.com --i-own-this
```

`--i-own-this` is required: it is your statement that you own the site or have written permission. The
check refuses to run without it, because scanning a site you don't own can be illegal.

| Finds | Severity |
|---|---|
| A public `.env`, `.git`, database dump or config backup (secrets exposed) | High |
| Session cookie without HttpOnly / Secure; password form not on HTTPS; bad or expired certificate | High |
| Missing security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, clickjacking) | Medium |
| Directory listing on; mixed content; old TLS version | Medium |
| Software version leaked in headers; cookie without SameSite; no security.txt | Low |

Verdict: **PASSED** (nothing found), **REVIEW** (only medium/low), or **FAILED** (at least one high).

### Deep security testing (active): `npm run zap`

`npm run zap -- https://staging.your-site.com --i-own-this --staging` runs OWASP ZAP in Docker (Docker Desktop
must be installed and running) and writes its findings as a plain-words report. It really attacks the site,
so both flags are required: `--i-own-this` (you own it) and `--staging` (it is a test copy, not the live
site). It can take from minutes to an hour. Details of ZAP itself:

### OWASP ZAP

This kit stops at safe, read-only checks. To actually probe for injection, XSS and other vulnerabilities,
use [OWASP ZAP](https://www.zaproxy.org/), the standard free tool — **only against a staging copy you own**,
never production or anyone else's site. The baseline scan (mostly passive) with Docker:

```
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://staging.your-site.com
```

For a full active scan (sends test attacks; can change data, so staging only), swap `zap-baseline.py` for
`zap-full-scan.py`. ZAP is a separate tool with its own learning curve; its docs walk through reading the
report and tuning what it tests.

## 4. Load test

```
npm run test:smoke -- https://your-site.com
npm run test:medium -- https://your-site.com
npm run test:heavy -- https://your-site.com
```

Run the scan first: the load test then spreads users across the real pages and APIs it found. Without a
scan it only loads the homepage. Always start with `smoke`, then go up.

| Profile | Fast users | Total fast users | Real browsers | Time |
|---|---|---|---|---|
| smoke | 5 new/sec | ~150 | 3 | 30 s |
| medium | 10 → 50 new/sec, then 50/sec | ~4,800 | 12 | 2 min |
| heavy | 50 → 200 new/sec, then 200/sec | ~31,500 | 18 | 3 min |

Each fast user requests 3 pages. Add `--show` to watch the real browser users in visible, slowed-down
Chrome windows (smoke only).

### The verdict

- **Fast users FAIL** if more than 1% of requests get 4xx/5xx or network errors, or if 95% of requests are
  not faster than 1 second. Failures are listed per page/API. Change limits in `run-all.js` (`LIMITS`).
- **Real browser users FAIL** on any JavaScript exception, console error, 4xx/5xx response or failed request
  from the site itself, or a browser user that could not finish. Problems from third-party files are shown
  but do not fail the test. Details with URLs: `results/browser-issues-*.log`.
- **Blocked**: if the site's bot protection, firewall or rate limit refuses the test, the verdict says so
  instead of blaming the site.
- **PC overload warning**: if the testing computer's CPU stays above 90%, the verdict warns that the
  results measure the computer, not the site. Use a smaller profile or a stronger machine.

While a test runs, watch your server's CPU, memory and logs: the test shows *what* breaks, the server
shows *why*.

## Automatic checks with GitHub Actions

`github-workflow.yml` runs the scan and your journeys every Monday and whenever you start it by hand, and
can add a smoke load test. A failed check marks the run red and GitHub emails you; the HTML reports are
attached to each run. Setup steps are at the top of that file (copy it to `.github/workflows/`, then add a
`SITE_URL` variable in your repository settings).

## Bot protection (Cloudflare and similar)

If the site shows a "checking your browser" page, nothing can be tested and the tools report **BLOCKED**.
The kit never tries to get past bot checks. As the site owner, let the test through on your side: allow-list
your IP, add a firewall skip rule (for example for a secret header added under `config.defaults.headers` in
`load.yml`), or test a staging copy without protection. Remove the rule afterwards.

## What it cannot test

- Sites that require a CAPTCHA
- Visual design, and active security testing (injection, XSS, auth): the `security` check is read-only;
  use OWASP ZAP against staging for active testing
- Accessibility problems that need a human (screen-reader flow, meaning of alt text): axe finds roughly
  half of real-world accessibility issues
- More than about 1,000 users at the same moment from one laptop: for 10,000+, run Artillery from the
  cloud (`npx artillery run-fargate`, cloud costs apply)
