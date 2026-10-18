# D.K. FLEED ($DKF) — Official Website

> **THE MEME FROM DEEP SPACE** · *The retro robot spirit returns from deep space.*

Official static website of **D.K. FLEED**, an original, community-driven meme token planned on **Solana** — a tribute to the imagination and atmosphere of classic 1970s and 1980s robot animation, reborn as a meme for a new digital generation.

| | |
|---|---|
| **Name** | D.K. FLEED |
| **Symbol** | $DKF |
| **Network** | Solana |
| **Planned supply** | 1,000,000,000 DKF |
| **Launch platform** | Pump.fun fair launch |
| **Presale** | None |
| **Status** | Community Building · Pump.fun page created |
| **Token address** | `BWTztkzazFd4vKgZy3gFqHTvs9dbN31drXGkRHw3pump` |
| **Website** | https://dkfleed.meme |

The official D.K. FLEED page was created on Pump.fun without an initial purchase. Onchain deployment and trading activity have **not been independently verified**, and no price, market data or performance figures are published here.
Any token address or Pump.fun link that is not published on the official website is not ours.

## Official links

| Channel | URL |
|---|---|
| Website | https://dkfleed.meme |
| X | https://x.com/dkfleedmeme |
| Telegram | https://t.me/dkfleedmeme |
| Instagram | https://www.instagram.com/dkfleedmeme/ |
| GitHub | https://github.com/dkfleedmeme/dkfleed-meme |
| TikTok | Coming Soon |
| Pump.fun | https://pump.fun/coin/BWTztkzazFd4vKgZy3gFqHTvs9dbN31drXGkRHw3pump |

Only the links listed here and on the website are official.

---

## Features

- Pure static site: semantic HTML5, modern CSS and a small vanilla JS file. No framework, no build step, no backend, no database, no tracking, no third-party requests.
- Retro space theme: animated parallax starfield (canvas), nebula glows, drifting particles, original SVG spaceships crossing the sky, and the official token rotating in full, slow 3D.
- English-only content, written directly in `index.html` (works without JavaScript and is fully indexable).
- Responsive from 320px phones to wide desktops; respects `prefers-reduced-motion` (animations off, static coin).
- Accessibility: skip link, landmarks, keyboard navigation, visible focus, `aria-*` attributes on the mobile menu.
- Security: strict Content-Security-Policy (no inline scripts, no external origins), **no wallet connect, no blockchain calls, no transactions, no network requests**.
- SEO & social: title/description, canonical URL `https://dkfleed.meme/`, Open Graph + Twitter card image, `robots.txt`, `sitemap.xml`, web manifest, favicons, custom 404 page.

## Project structure

```
.
├── site/                      ← published website (deployed as-is by GitHub Actions)
│   ├── index.html             ← all page content
│   ├── 404.html
│   ├── robots.txt · sitemap.xml · site.webmanifest
│   ├── favicon.ico · favicon-32.png · apple-touch-icon.png · icon-*.png
│   ├── og-image.jpg           ← social preview 1200×630
│   └── assets/
│       ├── css/styles.css
│       ├── img/token-coin-*.webp
│       └── js/
│           ├── config.js      ← ALL public links live here
│           └── main.js
├── tools/
│   ├── check-site.mjs         ← automated checks (run locally and in CI)
│   └── build-images.sh        ← regenerates all web images from token.png
├── token.png                  ← original official logo (master file, never modified)
├── .github/workflows/pages.yml
├── DNS-SETUP.md
└── README.md
```

## Updating links (X, Telegram, Instagram, TikTok, Pump.fun)

Edit **only** [`site/assets/js/config.js`](site/assets/js/config.js):

```js
links: {
  github: "https://github.com/dkfleedmeme/dkfleed-meme",
  x: "https://x.com/dkfleedmeme",
  telegram: "https://t.me/dkfleedmeme",
  instagram: "https://www.instagram.com/dkfleedmeme/",
  tiktok: "",     // Coming Soon
  pumpfun: "https://pump.fun/coin/BWTztkzazFd4vKgZy3gFqHTvs9dbN31drXGkRHw3pump"
}
```

- An empty value shows **“Coming Soon”** and renders no link at all.
- Only `https://` URLs are accepted. Configured links open in a new tab with `rel="noopener noreferrer"`.
- The official URLs are also enforced by `tools/check-site.mjs`: update the `OFFICIAL_LINKS` list there when a new channel goes live.
- The `pumpfun` link drives every “View on Pump.fun” button. The token address itself is written in `site/index.html` (Tokenomics → Token address) and checked by `tools/check-site.mjs`.

Commit and push to `main`: the site redeploys automatically.

## Editing texts

All copy lives in [`site/index.html`](site/index.html). Content rules:

- English only.
- Keep the story original: never mention or imitate existing cartoon titles, robot names, characters, studios, franchises, logos, slogans, costumes, weapons or storylines.
- Do not add other token addresses, prices, market data, dates, allocations, liquidity, audits, partnerships, verified-status claims or any promise of profit unless they are real and verified.
- Do not add personal information about the people behind the project.

## Local development

No dependencies are required (Node.js ≥ 18 only for the checks).

```bash
# Automated checks: files, links, anchors, JS syntax, English-only content,
# canonical/social metadata, config, secrets, protected names, asset weight
node tools/check-site.mjs

# Preview
python3 -m http.server 8765 --directory site
# open http://localhost:8765
```

### Regenerating images

```bash
tools/build-images.sh   # requires ImageMagick; reads token.png, writes site/ images
```

## Deployment

Every push to `main` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml):

1. `tools/check-site.mjs` — the deploy stops if any check fails;
2. the `site/` folder is published to GitHub Pages, served at **https://dkfleed.meme** (custom domain, HTTPS enforced).

DNS details: [DNS-SETUP.md](DNS-SETUP.md).

## Disclaimer

D.K. FLEED ($DKF) is an experimental meme token with no intrinsic value and no expectation of financial return. It is not an investment, a security or financial advice. Crypto assets are highly volatile and high risk: you may lose all the money you use. Nothing in this repository or on the website is a promise of profit, return or future value.

D.K. FLEED is an independent and original community project. It is not affiliated with, sponsored by or endorsed by any existing animation series, studio, publisher, creator, franchise or rights holder.

## Safety

- There is **no presale** and no private sale.
- The team will never DM you first and will **never ask for a seed phrase or private keys**.
- This website has no wallet connection and performs no transactions.
- No secrets, keys or credentials are stored in this repository.
