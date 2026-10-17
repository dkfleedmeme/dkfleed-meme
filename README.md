# D.K. FLEED ($DKF) — Official Website

> **THE MEME FROM DEEP SPACE** · *Community first. Token next.*

Official static website of **D.K. FLEED**, a community-first meme token planned on **Solana**.

| | |
|---|---|
| **Name** | D.K. FLEED |
| **Symbol** | $DKF |
| **Network** | Solana |
| **Planned supply** | 1,000,000,000 DKF |
| **Planned launch** | Pump.fun fair launch |
| **Presale** | None |
| **Status** | Community Building · Token Coming Soon |
| **Domain** | dkfleed.meme (see [DNS-SETUP.md](DNS-SETUP.md)) |
| **Live (GitHub Pages)** | https://dkfleedmeme.github.io/dkfleed-meme/ |

The token **has not been created yet**. There is no contract address, no price and no launch date.
Any contract address that is not published on the official website is not ours.

---

## Features

- Pure static site: semantic HTML5, modern CSS and a small vanilla JS file. No framework, no build step, no backend, no database, no third-party requests.
- Space theme: animated parallax starfield (canvas), nebula glows, drifting particles, original SVG spaceships crossing the sky, and the official token rotating in full, slow 3D.
- Full **EN / IT** language switch (detects the browser language, remembers the choice, `?lang=it` / `?lang=en` also work).
- Responsive from 320px phones to wide desktops; respects `prefers-reduced-motion` (animations off, static coin).
- Accessibility: skip link, landmarks, keyboard navigation, visible focus, `aria-*` attributes on the menu and language switch.
- Security: strict Content-Security-Policy (no inline scripts, no external origins), **no wallet connect, no blockchain calls, no transactions, no network requests**.
- SEO & social: title/description, canonical URL, Open Graph + Twitter card image, `robots.txt`, `sitemap.xml`, web manifest, favicons, custom 404 page.

## Project structure

```
.
├── site/                      ← published website (deployed by GitHub Actions)
│   ├── index.html
│   ├── 404.html
│   ├── robots.txt · sitemap.xml · site.webmanifest
│   ├── favicon.ico · favicon-32.png · apple-touch-icon.png · icon-*.png
│   ├── og-image.jpg           ← social preview 1200×630
│   └── assets/
│       ├── css/styles.css
│       ├── img/token-coin-*.webp
│       └── js/
│           ├── config.js      ← ALL public links live here
│           ├── i18n.js        ← EN / IT texts
│           └── main.js
├── tools/
│   ├── check-site.mjs         ← automated checks (run locally and in CI)
│   ├── build-images.sh        ← regenerates all web images from token.png
│   └── preview-build.sh       ← local preview build
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
  x: "",          // e.g. "https://x.com/<official_handle>"
  telegram: "",   // e.g. "https://t.me/<official_group>"
  instagram: "",
  tiktok: "",
  pumpfun: ""     // only when the token is really live
}
```

- An empty value shows **“Coming Soon”** and renders no link at all.
- Only `https://` URLs are accepted.
- When `pumpfun` is set, the disabled “Token Coming Soon” button becomes “View on Pump.fun”.

Commit and push to `main`: the site redeploys automatically.

## Editing texts

All visible texts are in [`site/assets/js/i18n.js`](site/assets/js/i18n.js) (`en` and `it`). The English text is also written in `index.html` so the page works without JavaScript and is indexed correctly. Keep both languages in sync — the checks fail if a key is missing.

Rules for content: do not add contract addresses, prices, dates, allocations, liquidity, audits, partnerships or any promise of profit unless they are real and verified.

## Local development

No dependencies are required (Node.js ≥ 18 only for the checks).

```bash
# 1. Automated checks: files, links, anchors, JS syntax, EN/IT keys, config, secrets, asset weight
node tools/check-site.mjs

# 2. Preview (replaces the __SITE_URL__ placeholder like the CI does)
tools/preview-build.sh http://localhost:8765
python3 -m http.server 8765 --directory _site
# open http://localhost:8765
```

You can also open `site/index.html` directly in a browser; only absolute social metadata uses the placeholder.

### Regenerating images

```bash
tools/build-images.sh   # requires ImageMagick; reads token.png, writes site/ images
```

## Deployment

Deployment is automatic through **GitHub Actions → GitHub Pages** ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)) on every push to `main`:

1. runs `tools/check-site.mjs` (the deploy stops if any check fails);
2. copies `site/` and replaces `__SITE_URL__` with the repository variable `SITE_URL` (default: `https://dkfleedmeme.github.io/dkfleed-meme`);
3. publishes to GitHub Pages.

When the custom domain is ready, follow [DNS-SETUP.md](DNS-SETUP.md).

## Disclaimer

D.K. FLEED ($DKF) is an experimental meme token with no intrinsic value and no expectation of financial return. It is not an investment, a security or financial advice. Crypto assets are highly volatile and high risk: you may lose all the money you use. Nothing in this repository or on the website is a promise of profit, return or future value.

D.K. FLEED is an original, independent project. It is not affiliated with, endorsed by or sponsored by any existing franchise, studio, producer or trademark owner.

## Safety

- There is **no presale** and no private sale.
- The team will never DM you first and will **never ask for a seed phrase or private keys**.
- This website has no wallet connection and performs no transactions.
- No secrets, keys or credentials are stored in this repository.
