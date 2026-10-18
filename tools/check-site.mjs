#!/usr/bin/env node
// D.K. FLEED — dependency-free static site checks (run locally and in CI).
// Usage: node tools/check-site.mjs
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "site");
const OFFICIAL_GITHUB = "https://github.com/dkfleedmeme/dkfleed-meme";
const SITE_URL = "https://dkfleed.meme";
const MAX_ASSET_BYTES = 300 * 1024;

let errors = 0;
let checks = 0;
const fail = (msg) => { errors++; console.error("  ✗ " + msg); };
const ok = (msg) => { checks++; console.log("  ✓ " + msg); };
const read = (p) => readFileSync(p, "utf8");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === ".git" || name === "node_modules" || name === "_site") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const TEXT_EXT = new Set([".html", ".css", ".js", ".mjs", ".json", ".webmanifest", ".xml", ".txt", ".md", ".yml", ".yaml", ".sh"]);
const siteFiles = walk(SITE);
const repoTextFiles = walk(ROOT).filter((p) => TEXT_EXT.has(extname(p)) || p.endsWith(".gitignore"));

// 1. Required files ---------------------------------------------------------
console.log("Required files");
for (const f of ["index.html", "404.html", "robots.txt", "sitemap.xml", "site.webmanifest", "favicon.ico",
  "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "og-image.jpg",
  "assets/css/styles.css", "assets/js/config.js", "assets/js/main.js"]) {
  existsSync(join(SITE, f)) ? ok(f) : fail("missing site/" + f);
}
if (siteFiles.some((p) => /website-reference/i.test(p))) fail("website-reference.png must not be published");
else ok("reference image not published");

// 2. Local references --------------------------------------------------------
console.log("Local references");
function resolveRef(fromFile, ref) {
  if (ref.startsWith(SITE_URL + "/")) ref = ref.slice(SITE_URL.length);
  if (/^(https?:|mailto:|data:|#|javascript:)/i.test(ref)) return null;
  if (ref.startsWith("/")) return join(SITE, ref.split(/[?#]/)[0].slice(1) || "index.html");
  return join(dirname(fromFile), ref.split(/[?#]/)[0]);
}
for (const file of siteFiles.filter((p) => /\.(html|css|webmanifest)$/.test(p))) {
  const src = read(file);
  const refs = new Set();
  for (const m of src.matchAll(/\s(?:href|src)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of src.matchAll(/srcset="([^"]+)"/g)) m[1].split(",").forEach((s) => refs.add(s.trim().split(/\s+/)[0]));
  for (const m of src.matchAll(/url\(["']?([^"')]+)["']?\)/g)) refs.add(m[1]);
  for (const m of src.matchAll(/"src":\s*"([^"]+)"/g)) refs.add(m[1]);
  let bad = 0;
  for (const ref of refs) {
    const target = resolveRef(file, ref);
    if (!target) continue;
    const t = target.endsWith("/") ? join(target, "index.html") : target;
    if (!existsSync(t)) { bad++; fail(`${relative(ROOT, file)} → ${ref} not found`); }
  }
  if (!bad) ok(`${relative(ROOT, file)} (${refs.size} refs)`);
}

// 3. Anchors, sprite symbols, basic HTML a11y -------------------------------
console.log("HTML structure");
const index = read(join(SITE, "index.html"));
const ids = new Set([...index.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchorRefs = [...index.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
const missingAnchors = anchorRefs.filter((a) => !ids.has(a));
missingAnchors.length ? fail("missing anchors: " + missingAnchors.join(", ")) : ok(`${anchorRefs.length} in-page links resolve`);
const mainJs = read(join(SITE, "assets/js/main.js"));
const usedIcons = new Set([...mainJs.matchAll(/"(i-[a-z]+)"/g)].map((m) => m[1]));
const missingIcons = [...usedIcons].filter((i) => !ids.has(i));
missingIcons.length ? fail("icons used by main.js missing in sprite: " + missingIcons.join(", ")) : ok("all JS icons exist in sprite");
for (const sec of ["home", "story", "community", "tokenomics", "roadmap", "safety", "socials"]) {
  ids.has(sec) ? ok("section #" + sec) : fail("missing section #" + sec);
}
for (const file of siteFiles.filter((p) => p.endsWith(".html"))) {
  const html = read(file);
  const name = relative(ROOT, file);
  if (!/<html lang="[a-z]{2}">/.test(html)) fail(name + ": missing <html lang>");
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(name + ": must contain exactly one <h1>");
  const imgsNoAlt = [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\salt="/.test(m[0]));
  if (imgsNoAlt.length) fail(name + ": <img> without alt");
  const btnNoType = [...html.matchAll(/<button\b[^>]*>/g)].filter((m) => !/\stype="/.test(m[0]));
  if (btnNoType.length) fail(name + ": <button> without type");
  if (/\sstyle="/.test(html)) fail(name + ": inline style attribute blocked by CSP");
  if (/<script(?![^>]*\ssrc=)[^>]*>/.test(html)) fail(name + ": inline <script> blocked by CSP");
  const blank = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].filter((m) => !/rel="[^"]*noopener/.test(m[0]));
  if (blank.length) fail(name + ": target=_blank without rel=noopener");
  ok(name + " basic accessibility/CSP checks");
}

// 4. JavaScript syntax --------------------------------------------------------
console.log("JavaScript");
for (const file of siteFiles.filter((p) => p.endsWith(".js"))) {
  try { execFileSync(process.execPath, ["--check", file], { stdio: "pipe" }); ok(relative(ROOT, file) + " parses"); }
  catch (e) { fail(relative(ROOT, file) + " syntax error\n" + e.stderr); }
}

// 5. English only, metadata and config ---------------------------------------
console.log("English only & metadata");
if (existsSync(join(SITE, "assets/js/i18n.js"))) fail("translation file assets/js/i18n.js must not exist"); else ok("no translation file");
const htmlFiles = siteFiles.filter((p) => p.endsWith(".html"));
for (const file of htmlFiles) {
  const html = read(file);
  const name = relative(ROOT, file);
  if (!html.includes('<html lang="en">')) fail(name + ': document language must be "en"');
  if (/\slang="(?!en")[a-z-]+"/i.test(html)) fail(name + ": contains a non-English lang attribute");
  if (/data-i18n|data-lang|class="lang|lang-btn|hreflang|og:locale:alternate/i.test(html)) fail(name + ": language selector or i18n markup found");
  else ok(name + ": no language selector, English only");
}
if (/DKF_I18N|data-i18n|localStorage|navigator\.language|[?&]lang=|applyLang|detectLang/.test(mainJs)) fail("main.js still contains language-switch logic");
else ok("main.js has no language logic");
// Distinctly Italian words/phrases that must never appear in the public site.
const ITALIAN = /\b(della|delle|degli|nella|nelle|questa|questo|anche|perch[eé]|sicurezza|storia|lingua|prevendita|avvertenze|errore|unisciti|torna|in arrivo|prima la|poi il|canali|equipaggio|rischio|nessuna|nessun|progetto|rete|lancio|stato)\b|it_IT|[àèìòù]/i;
let italianHits = 0;
for (const file of siteFiles.filter((p) => /\.(html|js|css|xml|txt|webmanifest)$/.test(p))) {
  const m = read(file).match(ITALIAN);
  if (m) { italianHits++; fail(`${relative(ROOT, file)}: Italian text found ("${m[0]}")`); }
}
if (!italianHits) ok("no Italian text in public files");
const canonical = (index.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
canonical === SITE_URL + "/" ? ok("canonical " + canonical) : fail("canonical must be " + SITE_URL + "/ (found " + canonical + ")");
for (const prop of ["og:url", "og:image", "twitter:image"]) {
  const v = (index.match(new RegExp(`(?:property|name)="${prop}" content="([^"]+)"`)) || [])[1] || "";
  v.startsWith(SITE_URL + "/") ? ok(`${prop} ${v}`) : fail(`${prop} must start with ${SITE_URL}/ (found "${v}")`);
}
read(join(SITE, "sitemap.xml")).includes(`<loc>${SITE_URL}/</loc>`) ? ok("sitemap uses " + SITE_URL) : fail("sitemap must list " + SITE_URL + "/");
read(join(SITE, "robots.txt")).includes(`Sitemap: ${SITE_URL}/sitemap.xml`) ? ok("robots.txt sitemap URL") : fail("robots.txt must reference " + SITE_URL + "/sitemap.xml");
if (siteFiles.filter((p) => TEXT_EXT.has(extname(p))).some((p) => read(p).includes("__SITE_URL__"))) fail("leftover __SITE_URL__ placeholder");
else ok("no URL placeholders left");
if (!/Token Coming Soon/.test(index) || /\b(token is (now )?live|buy now|now live)\b/i.test(index)) fail('must show "Token Coming Soon" and must not claim the token is live');
else ok('"Token Coming Soon" shown, no live-token claims');
if (!/not affiliated with, sponsored by or endorsed by any existing animation series, studio, publisher, creator/.test(index)) fail("independence disclaimer missing");
else ok("independence disclaimer present");
const NAV = ["Home", "Story", "Community", "Tokenomics", "Roadmap", "Safety", "Socials"];
const navHtml = (index.match(/<nav class="nav"[\s\S]*?<\/nav>/) || [""])[0];
NAV.every((t) => navHtml.includes(`>${t}</a>`)) ? ok("navigation labels in English") : fail("navigation labels must be: " + NAV.join(", "));

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read(join(SITE, "assets/js/config.js")), sandbox);
const links = (sandbox.window.DKF_CONFIG || {}).links || {};
links.github === OFFICIAL_GITHUB ? ok("GitHub link is the official repository") : fail("GitHub link must be " + OFFICIAL_GITHUB);
// Verified official links. Every other social must stay "" (Coming Soon) until verified and added here.
const OFFICIAL_LINKS = {
  x: "https://x.com/dkfleedmeme",
  telegram: "https://t.me/dkfleedmeme",
  instagram: "https://www.instagram.com/dkfleedmeme/"
};
for (const k of ["x", "telegram", "instagram", "tiktok", "pumpfun"]) {
  const expected = OFFICIAL_LINKS[k] || "";
  if (!(k in links)) fail(`config.links.${k} missing`);
  else if (links[k] !== expected) fail(`config.links.${k} must be ${expected ? '"' + expected + '"' : '"" (Coming Soon)'}, found "${links[k]}"`);
  else ok(`config.links.${k}: ${links[k] ? links[k] : "Coming Soon"}`);
}
const extraLinks = Object.keys(links).filter((k) => !["github", "x", "telegram", "instagram", "tiktok", "pumpfun"].includes(k));
extraLinks.length ? fail("unexpected config links: " + extraLinks.join(", ")) : ok("no unexpected config links");
/card\.target = "_blank";\s*card\.rel = "noopener noreferrer";/.test(mainJs)
  ? ok('social links open in a new tab with rel="noopener noreferrer"')
  : fail('social links must use target="_blank" and rel="noopener noreferrer"');
/card\.setAttribute\("aria-label", "Official D\.K\. FLEED " \+ s\.name \+ " \(opens in a new tab\)"\)/.test(mainJs)
  ? ok("enabled social links have an accessible English label")
  : fail("enabled social links need an aria-label announcing the new tab");
// Telegram must always use the public t.me channel URL, never the web client.
const webTelegram = [...siteFiles.filter((p) => TEXT_EXT.has(extname(p))), join(ROOT, "README.md")].filter((p) => /web\.telegram\.org/i.test(read(p)));
webTelegram.length ? fail("web.telegram.org URL found in: " + webTelegram.map((p) => relative(ROOT, p)).join(", ")) : ok("no web.telegram.org URLs");
/Telegram[^\n]*https:\/\/t\.me\/dkfleedmeme/.test(read(join(ROOT, "README.md")))
  ? ok("README lists the official Telegram channel")
  : fail("README must list Telegram as https://t.me/dkfleedmeme");

// 6. Safety: no secrets, no wallet/blockchain code, no protected names -----------
console.log("Safety");
const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bgh[pousr]_[A-Za-z0-9]{30,}/, /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-[A-Za-z0-9]{32,}/, /"?(seed|mnemonic|secret_?key|private_?key)"?\s*[:=]\s*["'][^"']{12,}/i
];
const WALLET_PATTERNS = [/walletconnect/i, /@solana\/web3/i, /window\.solana/i, /phantom\.app/i, /signTransaction|sendTransaction|requestAccounts/];
// Third-party protected names are stored encoded so they never appear in plain text in this repository.
const PROTECTED = ["Z29sZHJha2U=", "Z3JlbmRpemVy", "ZHVrZVxzKmZsZWVk", "dWZvXHMqcm9ibw==", "dG9laQ==", "Z28gbmFnYWk="]
  .map((b) => new RegExp(Buffer.from(b, "base64").toString("utf8"), "i"));
let safetyIssues = 0;
for (const file of repoTextFiles) {
  const txt = read(file);
  const name = relative(ROOT, file);
  for (const re of SECRET_PATTERNS) if (re.test(txt)) { safetyIssues++; fail(`${name}: possible secret (${re})`); }
  for (const re of PROTECTED) if (re.test(txt)) { safetyIssues++; fail(`${name}: contains a protected third-party name`); }
  if (file.startsWith(SITE)) for (const re of WALLET_PATTERNS) if (re.test(txt)) { safetyIssues++; fail(`${name}: wallet/blockchain code (${re})`); }
}
if (!safetyIssues) ok(`${repoTextFiles.length} text files: no secrets, no wallet code, no protected names`);
if (/\bfetch\(|XMLHttpRequest|WebSocket\(/.test(mainJs)) fail("main.js must not make network requests"); else ok("no network requests in JS");

// 7. Asset weight ---------------------------------------------------------------
console.log("Asset weight");
let total = 0;
for (const f of siteFiles) {
  const size = statSync(f).size;
  total += size;
  if (size > MAX_ASSET_BYTES) fail(`${relative(ROOT, f)} is ${(size / 1024).toFixed(0)} KB (> ${MAX_ASSET_BYTES / 1024} KB)`);
}
ok(`total site weight ${(total / 1024).toFixed(0)} KB across ${siteFiles.length} files`);

console.log(errors ? `\n${errors} problem(s) found.` : `\nAll ${checks} checks passed.`);
process.exit(errors ? 1 : 0);
