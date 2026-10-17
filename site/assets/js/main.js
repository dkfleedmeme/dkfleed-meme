/* D.K. FLEED — site script. No wallet, no blockchain calls, no network requests. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var CONFIG = window.DKF_CONFIG || { links: {} };
  var I18N = window.DKF_I18N || {};
  var LANGS = ["en", "it"];
  var STORAGE_KEY = "dkf-lang";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  window.addEventListener("error", function () { doc.setAttribute("data-js-error", "1"); });

  /* ---------- Links (from config.js) ---------- */
  function safeUrl(value) {
    if (typeof value !== "string" || !value) return "";
    try {
      var u = new URL(value);
      return u.protocol === "https:" ? u.href : "";
    } catch (e) { return ""; }
  }

  var SOCIALS = [
    { key: "x", name: "X", icon: "i-x" },
    { key: "telegram", name: "Telegram", icon: "i-telegram" },
    { key: "instagram", name: "Instagram", icon: "i-instagram" },
    { key: "tiktok", name: "TikTok", icon: "i-tiktok" },
    { key: "github", name: "GitHub", icon: "i-github" }
  ];

  function svgIcon(id, extra) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon" + (extra ? " " + extra : ""));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function el(tag, cls, i18nKey) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (i18nKey) node.setAttribute("data-i18n", i18nKey);
    return node;
  }

  function renderSocials() {
    var grid = document.getElementById("social-grid");
    if (!grid) return;
    grid.textContent = "";
    SOCIALS.forEach(function (s) {
      var url = safeUrl(CONFIG.links[s.key]);
      var li = el("li", "reveal");
      var card;
      var state = el("span", "social-state", url ? "socials.open" : "socials.soon");
      if (url) {
        card = el("a", "social-card social-card--" + s.key);
        card.href = url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
      } else {
        card = el("div", "social-card social-card--" + s.key + " is-soon");
        card.setAttribute("aria-disabled", "true");
      }
      card.appendChild(svgIcon(s.icon, "icon--lg"));
      var name = el("span", "social-name");
      name.textContent = s.name;
      card.appendChild(name);
      card.appendChild(state);
      if (url) card.appendChild(svgIcon("i-arrow", "icon--sm"));
      li.appendChild(card);
      grid.appendChild(li);
    });

    // Keep header/hero GitHub buttons in sync with config.
    var gh = safeUrl(CONFIG.links.github);
    document.querySelectorAll('[data-link="github"]').forEach(function (a) {
      if (gh) a.href = gh; else a.removeAttribute("href");
    });
  }

  function renderPump() {
    var url = safeUrl(CONFIG.links.pumpfun);
    document.querySelectorAll("[data-pump-slot]").forEach(function (slot) {
      slot.textContent = "";
      var node;
      if (url) {
        node = el("a", "btn btn--gold");
        node.href = url;
        node.target = "_blank";
        node.rel = "noopener noreferrer";
      } else {
        node = el("button", "btn btn--gold");
        node.type = "button";
        node.disabled = true;
      }
      node.appendChild(svgIcon("i-pill"));
      node.appendChild(el("span", "", url ? "socials.pumpOpen" : "socials.pumpSoon"));
      slot.appendChild(node);
    });
  }

  /* ---------- i18n ---------- */
  function detectLang() {
    var fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.indexOf(fromUrl) > -1) return fromUrl;
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (LANGS.indexOf(stored) > -1) return stored;
    } catch (e) { /* storage blocked */ }
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return nav === "it" ? "it" : "en";
  }

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.en;
    if (!dict) return;
    doc.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var v = dict[node.getAttribute("data-i18n")];
      if (typeof v === "string") node.textContent = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (node) {
      node.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        var v = dict[parts[1]];
        if (parts[0] && typeof v === "string") node.setAttribute(parts[0], v);
      });
    });
    if (dict["meta.title"]) document.title = dict["meta.title"];
    var desc = document.querySelector('meta[name="description"]');
    if (desc && dict["meta.description"]) desc.setAttribute("content", dict["meta.description"]);
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("site-nav");
    var header = document.querySelector(".site-header");
    function close() {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 10); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!("IntersectionObserver" in window)) return;
    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) {
          if (id === entry.target.id) links[id].setAttribute("aria-current", "true");
          else links[id].removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    doc.classList.add("reveal-ready");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Starfield with parallax, twinkle and drifting embers ---------- */
  function initStarfield() {
    var canvas = document.getElementById("starfield");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1, stars = [], embers = [], raf = 0, running = false;
    var pointerX = 0, pointerY = 0, curX = 0, curY = 0;
    var LAYERS = [
      { count: 0.00011, size: [0.4, 1.0], speed: 0.04, depth: 6 },
      { count: 0.00006, size: [0.8, 1.6], speed: 0.09, depth: 14 },
      { count: 0.00002, size: [1.3, 2.3], speed: 0.16, depth: 26 }
    ];
    var COLORS = ["255,255,255", "190,210,255", "255,226,170", "255,190,190"];

    function rand(a, b) { return a + Math.random() * (b - a); }

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [];
      var area = w * h;
      LAYERS.forEach(function (layer, li) {
        var n = Math.max(20, Math.round(area * layer.count));
        for (var i = 0; i < n; i++) {
          stars.push({
            x: Math.random() * w, y: Math.random() * h,
            r: rand(layer.size[0], layer.size[1]),
            c: COLORS[Math.random() < 0.8 ? 0 : 1 + Math.floor(Math.random() * 3)],
            tw: rand(0.6, 2.2), ph: Math.random() * 6.28,
            layer: li
          });
        }
      });
      embers = [];
      var en = w < 700 ? 10 : 22;
      for (var j = 0; j < en; j++) embers.push(newEmber(true));
    }

    function newEmber(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: rand(0.8, 2.2),
        vy: rand(0.12, 0.35), vx: rand(-0.08, 0.08),
        c: Math.random() < 0.5 ? "255,90,60" : "255,207,90",
        a: rand(0.25, 0.6)
      };
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      curX += (pointerX - curX) * 0.04;
      curY += (pointerY - curY) * 0.04;
      var scroll = window.scrollY || 0;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], L = LAYERS[s.layer];
        var y = (s.y - scroll * L.speed) % h;
        if (y < 0) y += h;
        var x = s.x + curX * L.depth;
        y += curY * L.depth;
        var a = 0.55 + 0.45 * Math.sin(t * 0.001 * s.tw + s.ph);
        ctx.fillStyle = "rgba(" + s.c + "," + a.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, 6.2832);
        ctx.fill();
        if (s.layer === 2 && a > 0.92) {
          ctx.fillStyle = "rgba(" + s.c + ",0.12)";
          ctx.beginPath();
          ctx.arc(x, y, s.r * 4, 0, 6.2832);
          ctx.fill();
        }
      }
      for (var k = 0; k < embers.length; k++) {
        var e = embers[k];
        e.y -= e.vy; e.x += e.vx;
        if (e.y < -10) embers[k] = e = newEmber(false);
        ctx.fillStyle = "rgba(" + e.c + "," + e.a + ")";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, 6.2832);
        ctx.fill();
      }
    }

    function loop(t) {
      draw(t);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduceMotion.matches) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    build();
    draw(0);
    start();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { build(); draw(0); }, 150);
    });
    window.addEventListener("pointermove", function (e) {
      pointerX = (e.clientX / w - 0.5);
      pointerY = (e.clientY / h - 0.5);
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    window.addEventListener("scroll", function () { if (!running) draw(0); }, { passive: true });
    var onMotionChange = function () { if (reduceMotion.matches) { stop(); draw(0); } else start(); };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", onMotionChange);
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderSocials();
    renderPump();
    applyLang(detectLang());
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
    });
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
    initNav();
    initReveal();
    initStarfield();
    doc.setAttribute("data-ready", "1");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
