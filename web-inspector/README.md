# web-inspector

**Find what's broken on your website before your visitors do.**

web-inspector is a skill for [Claude Code](https://claude.com/claude-code). Give Claude your website's
address and it opens the site in a real Chrome browser, visits every page, and tells you in plain words
what to fix: broken links, errors, slow pages, accessibility and SEO problems, security gaps, and whether
the site holds up when many people visit at once.

```
You:     check my website https://my-shop.com, it's mine
Claude:  Verdict: FAILED. 3 errors, 12 warnings across 18 pages.
         1. /checkout returns HTTP 500 (linked from the cart page)
         2. The login page takes 4.2 s on a phone (good is under 2.5 s)
         3. The "Search" box has no label, so screen readers can't name it
         ...
```

Every run also saves an **HTML report with charts** you can open in a browser or send to someone.

---

## What it checks

| Check | What it finds |
|---|---|
| **Site scan** | Broken pages and links (with the page that links to them), broken images, scripts and APIs, JavaScript errors, console errors, slow and heavy pages, layout that is too wide on phones |
| **Phone speed** | Core Web Vitals (LCP, CLS) measured as a phone on a slow 4G network, the same settings Google's Lighthouse uses |
| **Accessibility** | Keyboard focus you cannot see, keyboard traps, missing alt text and labels, low contrast, missing page language, buttons with no name and more (WCAG 2.x A/AA, using [axe-core](https://github.com/dequelabs/axe-core)) |
| **Speed hygiene** | Files sent uncompressed or without cache rules |
| **SEO** | Missing or duplicate titles and descriptions, missing headings, pages hidden from Google by mistake, robots.txt blocking everything |
| **Security (read-only)** | Exposed secret files (`.env`, `.git`, database dumps), unsafe cookies, missing security headers, HTTPS and certificate problems |
| **Lighthouse scores** | Google's 0-100 scores for performance, accessibility, SEO and best practices, the same numbers as PageSpeed Insights |
| **Visual comparison** | Screenshots on phone and desktop compared with the last approved look, with pictures of what changed |
| **How to fix** | Every problem comes with plain-words advice and, where possible, a line of code to copy |
| **Many sites** | List your sites once and check them all with one command, with one summary page |
| **Journeys** | Forms, search and checkout tested by clicking and typing, from steps you write in plain words |
| **Load test** | Hundreds to thousands of visitors at once, plus a few real browsers, with one PASSED / FAILED verdict |
| **Before and after** | Each scan is compared with the last one: "New problems: 0, Fixed: 5" |

It ignores problems in other companies' scripts (ads, analytics, chat widgets) so you only see what you can fix.

---

## Install

You need:
- [Claude Code](https://claude.com/claude-code) (the terminal app, the desktop app, or the IDE extension)
- [Node.js](https://nodejs.org) 18 or newer
- [Google Chrome](https://www.google.com/chrome/)

In Claude Code, run these two commands:

```
/plugin marketplace add HengRatana404/web-inspector
/plugin install web-inspector@web-inspector
```

Then restart Claude Code. That's it.

---

## How to use it

Just ask Claude in your own words. For example:

- *"check my website https://my-site.com for anything broken"*
- *"my site is slow on phones, can you find out which pages?"*
- *"test that the contact form on https://my-site.com/contact actually sends"*
- *"can https://my-site.com handle 1000 visitors at once? it's my site"*
- *"check my site for security problems"*
- *"I fixed the broken links, check again"*

Claude sets up the kit in your project the first time (it takes a few minutes to install), runs the right
checks, and explains the results. It will ask you to confirm the site is yours before testing it.

### Pages behind a login

Claude will open a Chrome window where **you** log in yourself. Your session is saved to a local file so
the scan can see the pages behind the login. Claude never sees or types your password. Use a test account
if you can, and delete `auth.json` afterwards.

### Automatic weekly checks

Ask Claude to *"set up automatic website checks on GitHub"*. It explains how to add the included GitHub
Actions file: the checks then run every week, GitHub emails you when something breaks, and the reports are
attached to each run.

---

## Using it without Claude

The tools are plain Node.js scripts, so you can also run them yourself. Copy the
[`template`](skills/web-inspector/template) folder into your project, then:

```
npm install
npm run scan -- https://your-site.com
npm run security -- https://your-site.com --i-own-this
npm run journeys -- https://your-site.com
npm run test:smoke -- https://your-site.com
```

The [template README](skills/web-inspector/template/README.md) explains every
command and option.

---

## Safety and fair use

- **Only test websites you own, or have written permission to test.** Load tests on someone else's site
  are an attack, and scanning a site for weaknesses without permission can be illegal.
- **The security check only looks, it never attacks.** It reads headers, cookies and a short list of
  files that should never be public. It does not try SQL injection, XSS, password guessing or any other
  attack, and it refuses to run without `--i-own-this`. For real penetration testing, use a tool built for
  it, such as [OWASP ZAP](https://www.zaproxy.org/), against a staging copy you own.
- **It does not get around bot protection.** If your site is behind Cloudflare or a firewall, the tests
  report **BLOCKED**. Let them through from your side (allow-list your IP, or a firewall rule for a secret
  header), or test a staging copy.
- **Journeys really submit forms.** Run them on staging, or use test data on a live site.
- **Start load tests small** (`smoke`), and watch your server while they run.

---

## What it can't do

- Sites that require a CAPTCHA
- Judging visual design (whether it *looks* good); it only notices when a page *changes*
- Active security testing on a live site. On a staging copy you own, `npm run zap` runs OWASP ZAP for you (needs Docker); a code security review is the safer alternative
- Accessibility issues only a person can judge; automated checks find roughly half
- More than about 1,000 visitors at the same moment from one laptop; for more, run the load test from the
  cloud (`npx artillery run-fargate`)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Chrome not found" | Install Google Chrome, or ask Claude to switch the kit to Playwright's own Chromium |
| Errors about long paths on Windows | Put the kit in a short folder, like `C:\web-inspector` |
| Result says **BLOCKED** | Your site's bot protection refused the test; see "Safety and fair use" above |
| Load test warns the PC was overloaded | Close other apps or use a smaller test: the numbers measured your computer, not the site |
| Phone speed looks worse than on your own phone | Expected: it simulates a slower phone and network on purpose, as Google does |

---

## Project layout

```
.claude-plugin/
├── marketplace.json                 the list Claude Code reads when you add this repository
├── plugin.json                      plugin name and version
└── icon.png                         plugin icon
skills/web-inspector/
├── SKILL.md                         instructions Claude follows
└── template/                        the kit Claude copies into your project
    ├── scan.js + fixes.js           site scan, with "How to fix" advice
    ├── sites.js + sites.txt         check several of your sites in one go
    ├── lighthouse.js                Lighthouse 0-100 scores
    ├── visual.js                    screenshot comparison
    ├── security.js                  read-only security check
    ├── zap.js                       OWASP ZAP launcher (staging only)
    ├── journeys.js + journeys.txt   click-and-type tests
    ├── run-all.js, load.yml, browser.yml   load test
    ├── report-html.js, site.js      HTML reports, shared helpers
    └── github-workflow.yml          automatic GitHub checks
```

Built with [Playwright](https://playwright.dev), [Artillery](https://www.artillery.io) and
[axe-core](https://github.com/dequelabs/axe-core).

## License

All rights reserved. You may install and use web-inspector on websites you own. Please ask the author before
copying, changing or sharing the code. (Earlier versions, up to 1.3.2, were published under the MIT license;
copies made from those versions keep that license.)
