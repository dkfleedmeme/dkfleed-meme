# DNS setup for `dkfleed.meme` (GitHub Pages)

The site is served by GitHub Pages at **https://dkfleed.meme** (custom domain set in the repository Pages settings, HTTPS enforced). No VPS is used.
Canonical, Open Graph, `robots.txt` and `sitemap.xml` already point to `https://dkfleed.meme`.

DNS records are managed at the domain registrar / DNS provider — they are never changed from this repository.

## Required records

### Apex domain `dkfleed.meme`

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | Auto / 3600 |
| A | `@` | `185.199.109.153` | Auto / 3600 |
| A | `@` | `185.199.110.153` | Auto / 3600 |
| A | `@` | `185.199.111.153` | Auto / 3600 |
| AAAA *(recommended, IPv6)* | `@` | `2606:50c0:8000::153` | Auto / 3600 |
| AAAA *(recommended, IPv6)* | `@` | `2606:50c0:8001::153` | Auto / 3600 |
| AAAA *(recommended, IPv6)* | `@` | `2606:50c0:8002::153` | Auto / 3600 |
| AAAA *(recommended, IPv6)* | `@` | `2606:50c0:8003::153` | Auto / 3600 |

### Subdomain `www.dkfleed.meme`

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| CNAME | `www` | `dkfleedmeme.github.io` | Auto / 3600 |

Notes:
- The CNAME value is `dkfleedmeme.github.io` — **without** `/dkfleed-meme` and without `https://`.
- Remove registrar parking records (for example a `www` CNAME to `parkingpage.namecheap.com`) and any URL-redirect records for `@` or `www`.
- Do **not** use wildcard records (`*.dkfleed.meme`).
- If a proxy/CDN is used (e.g. Cloudflare), keep these records **DNS only**.

## Recommended: verify the domain on GitHub

Protects against domain takeover. GitHub (account `dkfleedmeme`) → **Settings** → **Pages** → **Add a domain** → `dkfleed.meme`, then add the TXT record GitHub shows:

| Type | Name / Host | Value |
|---|---|---|
| TXT | `_github-pages-challenge-dkfleedmeme` | *(code shown by GitHub)* |

## Check

```bash
dig +short dkfleed.meme A          # four 185.199.10x.153 addresses
dig +short dkfleed.meme AAAA       # four 2606:50c0:800x::153 addresses (if added)
dig +short www.dkfleed.meme CNAME  # dkfleedmeme.github.io.
curl -I https://dkfleed.meme/      # HTTP/2 200
curl -I https://www.dkfleed.meme/  # redirect to https://dkfleed.meme/
```

## GitHub Pages settings (already applied)

Repository **dkfleedmeme/dkfleed-meme** → **Settings** → **Pages**:
- Source: **GitHub Actions**
- Custom domain: `dkfleed.meme`
- **Enforce HTTPS**: on

With Actions-based deployment no `CNAME` file is needed in the repository.

CLI equivalents:

```bash
gh api -X PUT repos/dkfleedmeme/dkfleed-meme/pages -f cname=dkfleed.meme
gh api -X PUT repos/dkfleedmeme/dkfleed-meme/pages -F https_enforced=true
```
