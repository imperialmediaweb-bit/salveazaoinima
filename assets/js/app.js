/* ==========================================================================
   Nucleul site-ului: temă, navigație, animații, utilitare partajate
   ========================================================================== */
(function () {
  "use strict";

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.SOI = window.SOI || {};
  SOI.$ = $; SOI.$$ = $$;

  /* ---------- Stocare sigură (localStorage poate fi blocat) ---------- */
  var store = {
    get: function (k, fb) {
      try { var v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); }
      catch (e) { return fb; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
    }
  };
  SOI.store = store;

  /* ---------- Temă ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "dark" ? "#0a0b0f" : "#ffffff");
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
    applyTheme(next);
    store.set("soi-theme", next);
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

  /* ---------- Link activ în meniu ---------- */
  (function () {
    var here = location.pathname.split("/").pop() || "index.html";
    $$("[data-nav] a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === here) a.setAttribute("aria-current", "page");
    });
  })();

  /* ---------- Header lipit + bară de progres ---------- */
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

  /* ---------- Apariție la scroll ---------- */
  var rvs = $$(".rv");
  if (reduced || !("IntersectionObserver" in window)) {
    rvs.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = parseInt(en.target.dataset.delay || "0", 10);
        setTimeout(function () { en.target.classList.add("is-in"); }, d);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px" });
    rvs.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contoare animate ---------- */
  function runCounter(el) {
    var target = parseFloat(el.dataset.count || "0");
    var dur = parseInt(el.dataset.dur || "1600", 10);
    var suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = target.toLocaleString("ro-RO") + suffix; return; }
    var t0 = null;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ro-RO") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = $$("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) { counters.forEach(runCounter); }
    else {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  }

  /* ---------- Acordeon ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".acc__btn");
    if (!btn) return;
    var acc = btn.closest(".acc");
    var open = acc.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Notificări (toast) ---------- */
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

  /* ---------- Utilitare ---------- */
  SOI.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };
  SOI.slug = function (s) {
    return String(s).toLowerCase()
      .replace(/[ăâ]/g, "a").replace(/î/g, "i").replace(/ș|ş/g, "s").replace(/ț|ţ/g, "t")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };
  SOI.debounce = function (fn, ms) {
    var id; return function () {
      var a = arguments, c = this;
      clearTimeout(id); id = setTimeout(function () { fn.apply(c, a); }, ms || 220);
    };
  };
  SOI.dateRO = function (d) {
    try { return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(d); }
    catch (e) { return d.toLocaleDateString(); }
  };

  /* ---------- Validare formulare ---------- */
  SOI.validate = function (form) {
    var ok = true;
    $$("[data-required]", form).forEach(function (el) {
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

  /* ---------- Anul curent în subsol ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
