# UI Anti-Slop Ruleset

The single canonical anti-AI-slop ruleset for every UI task. This is the **union** of the anti-slop, quality, and accessibility rules formerly duplicated across `design-taste-frontend`, `high-end-visual-design`, `redesign-existing-projects`, and Pylon's Design Guardrails. A skill or assistant that names this file applies every rule here, then layers its own distinctive directives on top.

Load mode: on-demand. Consulted whenever Pylon (or any assistant) does UI build, polish, or redesign work.

## 1. Typography

- Never browser-default fonts or Inter. Banned outright: Inter, Roboto, Arial, Open Sans, Helvetica. Use character fonts: Geist, Outfit, Cabinet Grotesk, Satoshi, Clash Display, PP Editorial New, Plus Jakarta Sans.
- Pair a display font with a body font. Never a single default web font alone.
- Serif is banned on data/dashboard/software UI; use high-end sans pairings (Geist + Geist Mono, Satoshi + JetBrains Mono). Serif only for editorial/creative work, and there pair a serif header with a sans body.
- Headlines need presence: large display size, tight negative tracking (about `-0.03em` on large headings), reduced line-height, intentional weight. Achieve presence through weight/tracking/color, not scale-scream alone.
- Body text capped at roughly 60-75ch, generous line-height (about `1.7`).
- Use Medium (500) and SemiBold (600), not only 400/700.
- Data-heavy numbers use monospace or `font-variant-numeric: tabular-nums`.
- Negative tracking on large headers; positive tracking on small caps and labels.
- Avoid blanket all-caps subheaders; try lowercase italics, sentence case, or small-caps.
- Fix orphaned last-line words with `text-wrap: balance` / `pretty`.
- No large gradient text-fill on headers.
- Headers in sentence case, not Title Case.

## 2. Color & Surfaces

- 2-3 color palette derived from brand/tone, exposed via CSS variables. Never default to Tailwind's built-in named colors.
- Max 1 accent color, saturation under 80%; desaturate so it blends with neutrals.
- LILA ban: no "AI purple/blue" gradient aesthetic, no purple button glows, no neon gradients. Neutral bases (Zinc/Slate) plus one considered accent.
- No neon/outer glows; use inner borders or tinted shadows.
- Never pure `#000000`. Use off-black, charcoal, zinc-950, or tinted dark (`#0a0a0a`, `#121212`).
- One gray family only; never mix warm and cool grays in the same project.
- Color-tinted shadows matching the background hue, never flat black at low opacity. Shadows imply one consistent light source.
- No generic 1px solid gray borders; no harsh dark drop shadows (`shadow-md`, `rgba(0,0,0,0.3)`).
- Cards only when elevation communicates hierarchy. Otherwise group via `border-t` / `divide-y` / whitespace; remove the border or use background only.
- Add subtle noise/grain/micro-pattern to flat backgrounds (on fixed, `pointer-events-none` layers).
- Break even gradients with radial/mesh/noise, not flat 45deg linear fades.
- No single dark section orphaned in a light page (or vice versa); commit to one mode or use a slightly darker shade of the same palette.
- Empty flat sections need depth: blurred/overlaid/masked background imagery, patterns, or ambient gradients.

## 3. Layout & Spacing

- Never `h-screen` for full-height; always `min-h-[100dvh]` (iOS Safari viewport bug).
- CSS Grid over flexbox percentage math.
- Max-width container (~1200-1440px, `max-w-7xl` / `max-w-[1400px]`) with auto margins.
- Anti-center, anti-symmetry default: offset margins, mixed aspect ratios, left-aligned headers over centered content. No centered hero at high layout variance.
- No generic 3-equal-card feature row; use 2-col zig-zag, asymmetric grid, horizontal scroll, or masonry.
- No edge-to-edge sticky navbar glued to the top.
- Vary border-radius (tighter inner, softer container); concentric radii when nested.
- Negative-margin overlap/layering for depth.
- Optical adjustments: bottom padding often slightly larger than top; 1-2px optical centering for icons/text in buttons.
- Mobile: any asymmetric layout above `md:` collapses to single-column `w-full px-4 py-8` below 768px; remove rotations and negative-margin overlaps on mobile.
- Aggressive whitespace on marketing pages (double standard spacing). Dense layouts only for data dashboards.
- Bottom-align card-group CTAs; feature lists start at the same Y; align shared elements (titles/prices/buttons) across side-by-side items.
- Dashboards: do not default to a left sidebar; consider top nav, floating command menu, collapsible panel.
- Mathematically precise padding/margins; consistent 4/8/16/24/32px spacing scale; use asymmetry/overlap/diagonal flow where appropriate.
- Scannability: every page and section surfaces its main message at a skim (a lead line plus bullets or icon strips, never a wall of text). Break dense info (safety, specs, pricing) into labelled rows, not paragraphs.

## 4. Motion & Performance

- Animate exclusively `transform` and `opacity`. Never `top`/`left`/`width`/`height`, never `transition-all`.
- No `linear` or `ease-in-out` default; no instant state changes. Use custom cubic-bezier or spring physics.
- Staggered entry (Y-translate + opacity, sequential delays). Never mount lists/grids all at once.
- Scroll reveals via `IntersectionObserver` or framework `whileInView`. Never `window.addEventListener('scroll')`.
- Smooth scroll behavior for anchor jumps; optional inertia for a cinematic feel.
- `will-change: transform` sparingly, only on elements actively animating.
- Grain/noise overlays and `backdrop-blur` only on fixed `pointer-events-none` or fixed/sticky elements; never on scrolling containers or large content areas.
- Z-index discipline: no arbitrary `z-50` / `z-[9999]`; reserve for systemic layers (sticky nav, modal, overlay, tooltip); keep a clean scale in the theme.
- No custom mouse cursors.

## 5. Interactive States

- Every link, button, and input needs `hover:`, `focus-visible:`, and `active:` states.
- Pressed feedback: `scale(0.98)` or `translateY(1px)` on `:active`.
- Transitions 150-300ms on interactive elements; never zero-duration instant.
- Visible keyboard focus ring (accessibility requirement, not optional).
- Loading: skeleton loaders matching layout shape, not generic spinners.
- Empty states: composed "getting started" view, not a blank screen.
- Error states: clear inline messages. Never `window.alert()`, never "Oops!". Be direct ("Connection failed. Please try again.").
- No dead `#` links; link to a real destination or visually disable.
- Indicate the current page in navigation.
- Forms: label above input, helper text in markup, error text below input, `gap-2` blocks, client-side validation.
- Multi-line text inputs auto-grow to fit their content — a textarea never shows its own inner scrollbar. Grow the field as the text grows (let the surrounding card/panel scroll if it must), and keep placeholder text short enough to fit the resting height. (Locked 2026-06-01.)

## 6. Content & Copy

- No generic names ("John Doe", "Jane Smith", "Sarah Chan"); realistic, diverse names.
- No fake round numbers (`99.99%`, `50%`, `$100.00`, `1234567`); organic messy data (`47.2%`, `$99.00`, `+1 (312) 847-1928`).
- No startup-slop brand names ("Acme", "Nexus", "SmartFlow"); invent contextual, believable names.
- No AI copy clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve", "Tapestry", "In the world of...". Use concrete, specific verbs.
- No exclamation marks in success messages; confident, not loud.
- Active voice, not passive.
- Randomize dates (blog posts, etc.); never all identical.
- No Lorem Ipsum; write real draft copy.

## 7. Icons & Imagery

- Never emoji as functional UI icons (banned in code, markup, text content, alt text).
- No default Lucide/Feather/FontAwesome/Material or thick-stroke icons. Use Phosphor, Radix, Heroicons, or a custom set; one consistent stroke width (1.5 or 2.0), single 24px viewBox.
- No cliché metaphor icons (rocket = launch, shield = security); use less obvious (bolt, fingerprint, spark, vault).
- No generic "egg"/Lucide-user avatars; unique believable assets per person; squircle or rounded-square over exclusive circles.
- No Unsplash links; use `https://picsum.photos/seed/{id}/W/H` or SVG avatars.
- No stock "diverse team" photos; real/candid shots or a consistent illustration style.
- Always include a branded favicon.
- `shadcn/ui` never in default state; customize radii, colors, shadows to the project aesthetic.

## 8. Code Quality & Accessibility

- Semantic HTML (`nav`, `main`, `article`, `aside`, `section`); no div soup.
- No inline styles mixed with classes; use the project styling system.
- Relative units (`%`, `rem`, `em`, `max-width`), not hardcoded pixel widths.
- Meaningful images need real alt text; never `alt=""` or `alt="image"`.
- No commented-out dead code or debug artifacts before shipping.
- Verify every import exists in `package.json`. Check Tailwind v3 vs v4 before config changes; for v4 use `@tailwindcss/postcss` (not the `tailwindcss` plugin).
- Proper meta tags: `title`, `description`, `og:image`, social sharing.

## 9. Strategic Omissions (what AI typically forgets)

- Footer legal links (privacy, terms); simplify footer link farms.
- "Back" navigation on every page; no dead-end flows.
- Custom branded 404 page.
- "Skip to content" link for keyboard users.
- Cookie consent where the jurisdiction requires it.
- Client-side form validation (email, required fields, format checks).
