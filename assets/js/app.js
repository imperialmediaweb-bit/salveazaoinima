/* ==========================================================================
   Nucleul site-ului: temă, navigație, animații, slider, utilitare
   ========================================================================== */
(function () {
  "use strict";

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.SOI = window.SOI || {};
  SOI.$ = $; SOI.$$ = $$; SOI.reduced = reduced;

  /* ---------- Stocare sigură ---------- */
  var store = {
    get: function (k, fb) { try { var v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  SOI.store = store;

  /* ---------- Temă ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "dark" ? "#150c0f" : "#ffffff");
    $$("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-label", t === "dark" ? "Comută pe tema deschisă" : "Comută pe tema închisă");
      b.setAttribute("aria-pressed", String(t === "dark"));
    });
  }
  var saved = store.get("soi-theme", null);
  applyTheme(saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next); store.set("soi-theme", next);
  });

  /* ---------- Meniu mobil ---------- */
  var burger = $("[data-burger]"), nav = $("[data-nav]");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.focus();
      }
    });
  }

  /* ---------- Link activ ---------- */
  (function () {
    var here = location.pathname.split("/").pop() || "index.html";
    $$("[data-nav] a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("?")[0];
      if (href === here) a.setAttribute("aria-current", "page");
    });
  })();

  /* ---------- Header + bară progres ---------- */
  var hdr = $("[data-hdr]"), bar = $("[data-progress]");
  function onScroll() {
    var y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle("is-stuck", y > 8);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal la scroll ---------- */
  SOI.reveal = function (root) {
    var els = $$(".rv", root || document).filter(function (el) { return !el.classList.contains("is-in"); });
    if (reduced || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = parseInt(en.target.dataset.delay || "0", 10);
        setTimeout(function () { en.target.classList.add("is-in"); }, d);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px" });
    els.forEach(function (el) { io.observe(el); });
  };

  /* ---------- Contoare ---------- */
  function runCounter(el) {
    var target = parseFloat(el.dataset.count || "0");
    var dur = parseInt(el.dataset.dur || "1700", 10);
    var suffix = el.dataset.suffix || "", prefix = el.dataset.prefix || "";
    var dec = parseInt(el.dataset.dec || "0", 10);
    function fmt(v) { return v.toLocaleString("ro-RO", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
    if (reduced) { el.textContent = prefix + fmt(target) + suffix; return; }
    var t0 = null;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      el.textContent = prefix + fmt(dec ? v : Math.round(v)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  SOI.initCounters = function (root) {
    var counters = $$("[data-count]", root || document);
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) { counters.forEach(runCounter); return; }
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  };

  /* ---------- Bare de progres animate ---------- */
  SOI.initProgress = function (root) {
    var bars = $$(".progress-line > i[data-pct]", root || document);
    function fill(el) { el.style.width = Math.min(100, parseFloat(el.dataset.pct)) + "%"; }
    if (reduced || !("IntersectionObserver" in window)) { bars.forEach(fill); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { io.observe(b); });
  };

  /* ---------- Acordeon ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".acc__btn");
    if (!btn) return;
    var acc = btn.closest(".acc");
    var open = acc.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Toast ---------- */
  SOI.toast = function (msg, kind) {
    var host = $(".toast-host");
    if (!host) { host = document.createElement("div"); host.className = "toast-host"; host.setAttribute("role", "status"); host.setAttribute("aria-live", "polite"); document.body.appendChild(host); }
    var t = document.createElement("div");
    t.className = "toast toast--" + (kind || "ok");
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(function () {
      t.style.transition = "opacity .35s, transform .35s";
      t.style.opacity = "0"; t.style.transform = "translateY(8px)";
      setTimeout(function () { t.remove(); }, 380);
    }, 4200);
  };

  /* ==========================================================
     SLIDER generic
     new SOI.Slider(rootEl, { autoplay: 6000, perView: fn|num })
     Structura: .slider > .slider__viewport? > .slider__track > .slider__slide*
     ========================================================== */
  function Slider(root, opts) {
    opts = opts || {};
    var track = $(".slider__track", root);
    var slides = $$(".slider__slide", track);
    if (!track || slides.length < 2) return;
    var self = this;
    var i = 0, timer = null, startX = null, dx = 0;
    var perView = function () {
      if (typeof opts.perView === "function") return opts.perView();
      return opts.perView || 1;
    };
    var pages = function () { return Math.max(1, Math.ceil(slides.length / perView())); };

    /* nav */
    var nav = document.createElement("div");
    nav.className = "slider__nav";
    root.appendChild(nav);
    function renderNav() {
      nav.innerHTML = "";
      for (var p = 0; p < pages(); p++) {
        var d = document.createElement("button");
        d.type = "button"; d.className = "slider__dot" + (p === i ? " is-on" : "");
        d.setAttribute("aria-label", "Slide " + (p + 1));
        (function (p) { d.addEventListener("click", function () { go(p, true); }); })(p);
        nav.appendChild(d);
      }
    }
    if (opts.arrows !== false) {
      ["prev", "next"].forEach(function (dir) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "slider__arrow slider__arrow--" + dir;
        b.innerHTML = dir === "prev" ? "&#8592;" : "&#8594;";
        b.setAttribute("aria-label", dir === "prev" ? "Anterior" : "Următor");
        b.addEventListener("click", function () { go(i + (dir === "prev" ? -1 : 1), true); });
        root.appendChild(b);
      });
    }

    function go(n, manual) {
      var P = pages();
      i = ((n % P) + P) % P;
      var pct = 100 / perView();
      slides.forEach(function (s) { s.style.flex = "0 0 " + pct + "%"; });
      track.style.transform = "translateX(-" + (i * 100) + "%)";
      slides.forEach(function (s, k) {
        var vis = k >= i * perView() && k < (i + 1) * perView();
        s.setAttribute("aria-hidden", String(!vis));
      });
      renderNav();
      if (manual) restart();
    }
    function restart() {
      if (!opts.autoplay || reduced) return;
      clearInterval(timer);
      timer = setInterval(function () { go(i + 1); }, opts.autoplay);
    }

    /* swipe */
    root.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; dx = 0; }, { passive: true });
    root.addEventListener("touchmove", function (e) { if (startX !== null) dx = e.touches[0].clientX - startX; }, { passive: true });
    root.addEventListener("touchend", function () {
      if (Math.abs(dx) > 48) go(i + (dx < 0 ? 1 : -1), true);
      startX = null; dx = 0;
    });
    root.addEventListener("mouseenter", function () { clearInterval(timer); });
    root.addEventListener("mouseleave", restart);
    window.addEventListener("resize", (SOI.debounce || function (f) { return f; })(function () { go(i); }, 200));

    this.go = go;
    go(0); restart();
    return self;
  }
  SOI.Slider = Slider;

  /* ---------- Utilitare ---------- */
  SOI.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };
  SOI.debounce = function (fn, ms) {
    var id; return function () { var a = arguments, c = this; clearTimeout(id); id = setTimeout(function () { fn.apply(c, a); }, ms || 220); };
  };
  SOI.bani = function (n) { return Math.round(n).toLocaleString("ro-RO") + " €"; };
  SOI.dateRO = function (d) {
    try { return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(d); }
    catch (e) { return d.toLocaleDateString(); }
  };
  SOI.initiale = function (nume) {
    return String(nume).split(/\s+/).map(function (w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase();
  };
  /* imagine cu substitut automat: dacă fișierul lipsește, apar inițialele */
  SOI.imgSauInitiale = function (src, alt, initiale, extraClass) {
    return '<img src="' + SOI.esc(src) + '" alt="' + SOI.esc(alt) + '" loading="lazy"' +
      ' onerror="this.outerHTML=\'<div class=&quot;avatar-ph ' + (extraClass || "") + '&quot; aria-hidden=&quot;true&quot;>' + SOI.esc(initiale) + '</div>\'">';
  };

  /* ---------- Validare ---------- */
  SOI.validate = function (scope) {
    var ok = true;
    $$("[data-required]", scope).forEach(function (el) {
      var field = el.closest(".field") || el.parentElement;
      var val = (el.type === "checkbox") ? el.checked : String(el.value || "").trim();
      var bad = !val;
      if (!bad && el.dataset.pattern) bad = !new RegExp(el.dataset.pattern).test(val);
      field.classList.toggle("is-invalid", bad);
      el.setAttribute("aria-invalid", String(bad));
      if (bad && ok) { ok = false; try { el.focus(); } catch (e) {} }
    });
    return ok;
  };
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (!el.hasAttribute || !el.hasAttribute("data-required")) return;
    var field = el.closest(".field") || el.parentElement;
    if (field && field.classList.contains("is-invalid")) {
      var val = (el.type === "checkbox") ? el.checked : String(el.value || "").trim();
      if (val) { field.classList.remove("is-invalid"); el.setAttribute("aria-invalid", "false"); }
    }
  });

  /* ---------- Înclinare 3D după cursor ---------- */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  SOI.initTilt = function (root) {
    if (reduced || !fine) return;
    $$("[data-tilt]", root || document).forEach(function (el) {
      if (el.__tilt) return; el.__tilt = 1;
      el.classList.add("tilt");
      var raf = null;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--gx", (px * 100) + "%");
        el.style.setProperty("--gy", (py * 100) + "%");
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var rx = (py - .5) * -8, ry = (px - .5) * 9;
          el.style.transform = "perspective(950px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateZ(6px)";
        });
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  };

  /* ---------- An curent ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Pornire comună ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    SOI.reveal(); SOI.initCounters(); SOI.initProgress(); SOI.initTilt();
  });
})();
