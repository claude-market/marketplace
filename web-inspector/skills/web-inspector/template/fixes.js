// "How to fix it" text for the problems the scan finds, in plain words with a copy-paste example where
// there is one. fixFor(type, detail) returns a short string, or null when there is no general advice.
const HEADER_FIX = {
  'content-security-policy': 'Send a Content-Security-Policy header. Start in report-only mode so nothing breaks: nginx `add_header Content-Security-Policy-Report-Only "default-src \'self\'" always;`, then tighten it.',
  'x-content-type-options': 'Send `X-Content-Type-Options: nosniff` (nginx: `add_header X-Content-Type-Options nosniff always;`, Apache: `Header always set X-Content-Type-Options nosniff`).',
  'referrer-policy': 'Send `Referrer-Policy: strict-origin-when-cross-origin` (nginx: `add_header Referrer-Policy strict-origin-when-cross-origin always;`).',
  'strict-transport-security': 'Once the whole site works on HTTPS, send `Strict-Transport-Security: max-age=31536000; includeSubDomains`.',
  'x-frame-options': 'Send `X-Frame-Options: SAMEORIGIN` (or CSP `frame-ancestors \'self\'`) so other sites cannot frame your pages.',
};

const RULES = [
  // accessibility (axe rule ids)
  [/Accessibility .*: label$/, 'Give every input a label: `<label for="email">Email</label><input id="email">`, or `aria-label="Email"` when the design has no visible label.'],
  [/Accessibility .*: select-name$/, 'Name the dropdown: `<label for="type">Type</label><select id="type">`, or add `aria-label="Type"` to the `<select>`.'],
  [/Accessibility .*: html-has-lang$/, 'Add the page language: `<html lang="en">` (use your language code, for example `km` for Khmer).'],
  [/Accessibility .*: image-alt$/, 'Add `alt="short description"` to every meaningful image, and `alt=""` to purely decorative ones.'],
  [/Accessibility .*: (button-name|link-name)$/, 'Give the button or link visible text, or `aria-label="what it does"` when it only shows an icon.'],
  [/Accessibility .*: color-contrast$/, 'Make text darker or the background lighter until the contrast is at least 4.5:1 (3:1 for large text). Check with any "contrast checker".'],
  [/Accessibility .*: document-title$/, 'Add a `<title>` inside `<head>` that names the page.'],
  [/Accessibility .*: (heading-order|empty-heading)$/, 'Use headings in order (h1, then h2, then h3) and never leave one empty.'],
  [/Accessibility: keyboard focus not visible/, 'Do not remove the focus outline. If you hid it with `outline: none`, add `:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }`.'],
  [/Accessibility: keyboard trap/, 'Make sure a keyboard user can leave every widget with Tab or Esc. Check custom dialogs and menus.'],
  // SEO
  [/SEO: missing meta description/, 'Add `<meta name="description" content="One or two sentences, 50-160 characters, about this page">` inside `<head>`.'],
  [/SEO: meta description length/, 'Rewrite the meta description to 50-160 characters.'],
  [/SEO: no <h1>/, 'Add exactly one `<h1>` that says what the page is about.'],
  [/SEO: more than one <h1>/, 'Keep one `<h1>` per page; turn the others into `<h2>`.'],
  [/SEO: duplicate page title/, 'Give each page its own `<title>`.'],
  [/SEO: duplicate meta description/, 'Write a different meta description for each page.'],
  [/SEO: page hidden from search engines/, 'Remove `noindex` (the meta robots tag or X-Robots-Tag header) if you want this page found on Google.'],
  [/SEO: no viewport meta tag/, 'Add `<meta name="viewport" content="width=device-width, initial-scale=1">` inside `<head>`.'],
  [/SEO: missing social share tags/, 'Add `<meta property="og:title" content="Page title">` and `<meta property="og:image" content="https://your-site.com/share.png">` so shared links show a preview.'],
  [/SEO: robots\.txt blocks all/, 'Remove `Disallow: /` from robots.txt unless the site is meant to be hidden from Google.'],
  [/Missing favicon/, 'Add a `favicon.ico` at the site root, or `<link rel="icon" href="/icon.png">` in `<head>`.'],
  // security / HTTPS
  [/HTTP does not redirect to HTTPS/, 'Redirect all http:// traffic to https:// with a permanent 301 (hosting setting "Always use HTTPS", or a server redirect rule).'],
  [/Site not using HTTPS/, 'Install a free certificate (Let\'s Encrypt, or your host\'s "SSL" switch) and serve the whole site over HTTPS.'],
  [/HTTPS certificate expires soon/, 'Renew the certificate now and turn on automatic renewal.'],
  [/Invalid HTTPS certificate/, 'Install a valid certificate that matches the site name and includes the full chain.'],
  [/Mixed content/, 'Change the `http://` address of that file to `https://` (or a relative path).'],
  // speed
  [/Performance: file without cache rules/, 'Send `Cache-Control: public, max-age=31536000, immutable` for files with versioned names (and shorter for others).'],
  [/Performance: file not compressed/, 'Turn on gzip or brotli compression on the server or CDN for text files (nginx: `gzip on;`).'],
  [/Large image|Heavy page/, 'Resize images to the size they are shown, save them as WebP or AVIF, and add `loading="lazy"` to images below the first screen.'],
  [/Slow page|Very slow on phones|Core Web Vitals: (poor )?LCP/, 'Find the biggest item at the top of the page (usually a large image or slow server answer): compress it, preload it, and remove scripts that block rendering.'],
  [/Core Web Vitals: .*CLS/, 'Give images and ads a fixed `width` and `height` so the page does not jump while loading.'],
  [/Mobile layout overflow/, 'Find the element wider than the screen (a fixed width, a wide table or image) and use `max-width: 100%`.'],
  // broken things
  [/Broken (page|link|image|script|stylesheet|fetch|xhr|font)|Request failed|Page did not load/, 'Fix the address or restore the file, remove the link, or add a redirect from the old address to the new one. The report lists the page that links to it.'],
  [/JavaScript exception|^Console error/, 'Open the page, press F12, and look at the Console tab: the error names the file and line to fix.'],
  [/Third-party/, 'This comes from another company\'s script (ads, analytics, captcha, chat). Usually not yours to fix; check the provider\'s settings or remove the script if you do not need it.'],
];

function fixFor(type, detail = '') {
  if (type === 'Missing security header') {
    const name = String(detail).toLowerCase().match(/[a-z-]{6,}/)?.[0];
    return HEADER_FIX[name] || null;
  }
  for (const [pattern, text] of RULES) if (pattern.test(type)) return text;
  const axe = String(type).match(/^Accessibility \(\w+\): ([a-z-]+)$/);
  if (axe) return `See how to fix it: https://dequeuniversity.com/rules/axe/latest/${axe[1]}`;
  return null;
}

module.exports = { fixFor };
