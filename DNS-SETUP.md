# Connecting `dkfleed.meme` to GitHub Pages

The site is currently published at **https://dkfleedmeme.github.io/dkfleed-meme/**.
This guide connects the custom domain **dkfleed.meme** without any VPS. Nothing here has been applied yet: the DNS records must be created by the domain owner at the registrar / DNS provider.

> Order matters: **1) DNS records → 2) wait for propagation → 3) set the custom domain on GitHub → 4) enforce HTTPS → 5) set `SITE_URL`.**

---

## 0. (Recommended) Verify the domain on GitHub

Protects against domain takeover.

1. GitHub → avatar → **Settings** → **Pages** (account settings of `dkfleedmeme`, not the repository) → **Add a domain** → `dkfleed.meme`.
2. GitHub shows a **TXT** record like:

   | Type | Name / Host | Value |
   |---|---|---|
   | TXT | `_github-pages-challenge-dkfleedmeme` | *(code shown by GitHub)* |

3. Add it at the DNS provider, wait, then click **Verify**.

## 1. DNS records

At the DNS provider of `dkfleed.meme`, **remove any existing A / AAAA / CNAME records for `@` and `www`** (e.g. parking pages), then create:

### Apex domain `dkfleed.meme`

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 3600 (or Auto) |
| A | `@` | `185.199.109.153` | 3600 |
| A | `@` | `185.199.110.153` | 3600 |
| A | `@` | `185.199.111.153` | 3600 |
| AAAA | `@` | `2606:50c0:8000::153` | 3600 |
| AAAA | `@` | `2606:50c0:8001::153` | 3600 |
| AAAA | `@` | `2606:50c0:8002::153` | 3600 |
| AAAA | `@` | `2606:50c0:8003::153` | 3600 |

### Subdomain `www.dkfleed.meme`

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| CNAME | `www` | `dkfleedmeme.github.io` | 3600 |

Notes:
- The CNAME value is `dkfleedmeme.github.io` — **without** `/dkfleed-meme` and without `https://`.
- Do **not** use wildcard records (`*.dkfleed.meme`).
- If the provider uses Cloudflare proxy, set these records to **DNS only** (grey cloud) at least until GitHub issues the HTTPS certificate.

## 2. Check propagation

```bash
dig +short dkfleed.meme A
dig +short dkfleed.meme AAAA
dig +short www.dkfleed.meme CNAME
```

Expected: the four `185.199.10x.153` addresses, the four `2606:50c0:800x::153` addresses and `dkfleedmeme.github.io.`
Propagation can take from a few minutes to 24–48 hours.

## 3. Set the custom domain on GitHub

Repository **dkfleedmeme/dkfleed-meme** → **Settings** → **Pages** → **Custom domain** → `dkfleed.meme` → **Save**.

Because the site is deployed with GitHub Actions, **no `CNAME` file is needed** in the repository — the setting above is enough. GitHub will automatically redirect `www.dkfleed.meme` and `dkfleedmeme.github.io/dkfleed-meme/` to `https://dkfleed.meme/`.

CLI alternative:

```bash
gh api -X PUT repos/dkfleedmeme/dkfleed-meme/pages -f cname=dkfleed.meme
```

## 4. Enforce HTTPS

When the DNS check passes and the certificate is issued (can take up to ~1 hour), tick **Enforce HTTPS** in the same Pages settings, or:

```bash
gh api -X PUT repos/dkfleedmeme/dkfleed-meme/pages -F https_enforced=true
```

## 5. Update canonical / social URLs

Canonical URL, Open Graph image, `robots.txt` and `sitemap.xml` use the placeholder `__SITE_URL__`, filled during deployment. Switch them to the custom domain by setting a repository variable:

Repository → **Settings** → **Secrets and variables** → **Actions** → **Variables** → **New repository variable**

| Name | Value |
|---|---|
| `SITE_URL` | `https://dkfleed.meme` |

or:

```bash
gh variable set SITE_URL --repo dkfleedmeme/dkfleed-meme --body "https://dkfleed.meme"
gh workflow run pages.yml --repo dkfleedmeme/dkfleed-meme
```

## 6. Final check

- https://dkfleed.meme loads with a valid padlock.
- https://www.dkfleed.meme redirects to https://dkfleed.meme.
- https://dkfleed.meme/sitemap.xml lists `https://dkfleed.meme/`.
- https://dkfleed.meme/does-not-exist shows the custom 404 page.

## Rollback

Remove the custom domain in **Settings → Pages** and delete the `SITE_URL` variable; the site returns to `https://dkfleedmeme.github.io/dkfleed-meme/` after the next deployment.
