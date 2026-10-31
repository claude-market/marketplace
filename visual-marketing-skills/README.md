# Visual Marketing Skills

Agency-grade visual marketing pieces **for any brand**, made by Claude Code: product-in-context heroes, social posts,
banners, stories, HTML emails and Instagram carousels. Five campaign looks, a selector that picks the right one for
your brand and goal, and a polish loop that compares every piece with a reference before it is delivered.

Your brand is a parameter (`marca.json`: colors, fonts, logo, tone). All the brands in the examples are fictional.

| Product in context | Dark glow |
|---|---|
| ![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/demos/09-producto-en-contexto-hero.jpg) | ![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/demos/07-oscuro-glow-hero.jpg) |
| **Editorial cutout** | **3D product + mascot** |
| ![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/demos/05-editorial-recorte-hero.jpg) | ![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/demos/01-producto-3d-mascota-hero.jpg) |
| **Tech grid** | **Same templates, another brand** |
| ![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/demos/03-tech-grid-hero.jpg) | ![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/ejemplos/looks-otra-marca.jpg) |

## Installation

```bash
/plugin marketplace add claude-market/marketplace
/plugin install visual-marketing-skills@claude-market
```

The [full marketplace](https://github.com/C4rI0s/visual-marketing-skills) has the same skills split by plugin, plus
reels: `/plugin marketplace add C4rI0s/visual-marketing-skills`.

The first time a skill renders, Claude runs `npm install` in that skill's `scripts/` folder (it only installs
`playwright-core`, plus `three` for the 3D library and `@imgly/background-removal-node` for cutouts).

## Usage examples

Ask in plain language. Claude picks the skill, asks for what is missing (brand, logo, screenshots or photos) and
reviews every PNG before delivering.

| You ask | You get |
|---|---|
| "Launch hero and post for my invoicing app, Proton style. Brand: Pliego, orange #FF5B2E" | 16:9 hero, 1:1 and 4:5 with the real app over a gradient and floating layers |
| "Referral campaign in dark, with two big figures: 0 € fee and 1 % back" | dark-glow pieces: navy, blurred data, two glowing cards |
| "Email announcing automatic payment reminders, with the app in the header" | an HTML email checked in Gmail, Outlook, mobile and dark mode |
| "A 7-slide Instagram carousel: get paid in 7 days, not 45" | 1080x1350 slides, a contact sheet and the profile-grid preview |
| "Black Friday banner for my peripherals store, no product photos" | tech-grid pieces with the 3D library (keyboard, mouse, headset) in your colors |
| "Which look suits this brand?" | the look selector's recommendation and why |

Clean-room run (fresh Claude Code, only this plugin, one normal brief each, brands it had never seen):

![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/ejemplos/prueba-en-limpio.jpg)

| HTML email | Instagram carousel |
|---|---|
| ![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/ejemplos/correo-producto.png) | ![](https://raw.githubusercontent.com/C4rI0s/visual-marketing-skills/main/docs/ejemplos/carrusel-hoja.png) |

## Skills

| Skill | What it does | When Claude uses it |
|---|---|---|
| `direccion-de-arte` | brand brief to `marca.json` (with a contrast checker), look selector, copy, typography, grids, color and the mandatory visual review | always first: any visual piece for a brand |
| `piezas-graficas` | shared exporter (HTML to PNG 2x with real Chrome), automatic checks, polish loop (`comparar.mjs`), subject tools (cutouts, light matching), covers, OG images, thumbnails | any static piece; it routes to a look |
| `producto-en-contexto` | look 1: the app over a soft gradient with 1-2 floating layers (Proton Pass style) | SaaS and app launches |
| `oscuro-glow` | look 2: navy, blurred data, two cards with a contained glow and big figures | fintech, trading, referral campaigns |
| `editorial-recorte` | look 3: cutout collage on black with thin construction lines | gaming, esports, lifestyle |
| `producto-3d-mascota` | look 4: 3D product and mascot on a rounded gradient banner, with a 3D library in your colors | physical products and stores |
| `tech-grid` | look 5: fine grid, thin frames, circuit traces, wide uppercase headline | peripherals and hardware deals |
| `imagen-ia` | AI subjects (people, product, mascot) through the Higgsfield API with a spending cap, plus background removal | only when there are no photos and the user agrees |
| `correo-marketing-html` | marketing emails for Gmail, Outlook and Apple Mail, brand applier and a checker that renders 4 views | newsletters, launches, offers |
| `carrusel-instagram` | 1080x1350 carousels with product slides, PNG export, automatic review and profile-grid preview | Instagram carousels |

Every look exports **16:9 hero, 1:1, 4:5, X banner and story**. The exporter fails on cut text, collisions, low
contrast, missing cutouts or flat silhouettes, and leftovers from the example template; the polish loop scores the
piece against the look's golden reference (two rounds minimum, everything 8/10 or more).

## Requirements

- Node 18+ and a recent Chrome or Edge (set `CHROME_PATH` if it is not found).
- Optional, AI subjects: `HIGGSFIELD_API_KEY` (spending cap with `IMAGEN_IA_TOPE_USD`, default $0.50). Without it the
  skills use your photos or the 3D library.
- Background removal installs a local model (about 330 MB, from npm) on first use and then runs offline.

## What it runs and sends

- **Runs**: Node scripts inside the skill folders (export, checks, cutouts, 3D renders) and the Chrome or Edge already
  installed on your machine, headless, to render your HTML pieces. No hooks, no MCP servers, nothing runs on its own.
- **Installs**: `npm install` in a skill's `scripts/` folder the first time it is used (packages from the public npm
  registry: `playwright-core`, `three`, `@imgly/background-removal-node`).
- **Network**: Google Fonts when your brand uses them, and `api.higgsfield.ai` only if you set `HIGGSFIELD_API_KEY`
  and approve an AI image (the prompt goes to Higgsfield; the key is read from your environment and only sent there).
- **Your files** stay on your machine: brand file, photos and the PNGs are written in your working folder.

Skill instructions are written in Spanish; Claude follows them and answers in your language. Reels and short videos
(`video-marketing`, built on Remotion) live in the [full marketplace](https://github.com/C4rI0s/visual-marketing-skills).

## License

[MIT](LICENSE) © C4rI0s. Source and changelog: https://github.com/C4rI0s/visual-marketing-skills
