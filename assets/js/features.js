/* ==========================================================================
   Funcționalitățile paginilor
   ========================================================================== */
(function () {
  "use strict";
  var $ = SOI.$, $$ = SOI.$$, esc = SOI.esc;

  /* ---------- donații locale (demo): sume adăugate de vizitator ---------- */
  function donatiiLocale() { return SOI.store.get("soi-donatii", {}); }
  function stransTotal(caz) { return caz.strans + (donatiiLocale()[caz.slug] || 0); }
  function pct(caz) { return Math.min(100, Math.round(stransTotal(caz) / caz.target * 100)); }
  function cazDupaSlug(slug) {
    return SOI.CAZURI.filter(function (c) { return c.slug === slug; })[0] || null;
  }

  /* ---------- card de caz (folosit peste tot) ---------- */
  function cardCaz(c, extraClass) {
    var p = pct(c), gata = !c.activ || p >= 100;
    return '<article class="card card--hover case-card ' + (extraClass || "") + '">' +
      '<a class="case-card__media" href="caz.html?c=' + esc(c.slug) + '" aria-label="' + esc(c.nume) + '">' +
        (gata ? '<span class="ribbon ribbon--done">Reușit</span>'
              : (c.urgent ? '<span class="ribbon">Urgent</span>' : "")) +
        SOI.imgSauInitiale("assets/img/cazuri/" + c.slug + ".jpg", "Fotografia campaniei " + c.nume, SOI.initiale(c.nume)) +
      '</a>' +
      '<div class="case-card__body">' +
        '<h3><a href="caz.html?c=' + esc(c.slug) + '">' + esc(c.nume) + ', ' + c.varsta + ' ani</a></h3>' +
        '<p class="case-card__dx">' + esc(c.diagnostic) + ' · ' + esc(c.oras) + '</p>' +
        '<div class="progress-line' + (gata ? " progress-line--done" : "") + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p + '" aria-label="Progres strângere">' +
          '<i data-pct="' + p + '"></i></div>' +
        '<div class="progress-meta"><span><strong>' + SOI.bani(stransTotal(c)) + '</strong> strânși</span>' +
          '<span class="pm-goal">' + p + '% din ' + SOI.bani(c.target) + '</span></div>' +
        '<div class="case-card__foot">' +
          '<span class="badge">' + c.donatori + ' donatori</span>' +
          '<a class="btn btn--sm" href="caz.html?c=' + esc(c.slug) + '#doneaza">' + (gata ? "Vezi povestea" : "Donează") + '</a>' +
        '</div>' +
      '</div></article>';
  }

  /* =========================================================
     ACASĂ
     ========================================================= */
  function initAcasa() {
    var heroHost = $("[data-hero-slider]");
    if (!heroHost) return;

    /* --- slide-uri hero --- */
    var urgente = SOI.CAZURI.filter(function (c) { return c.activ && c.urgent; });
    var primul = urgente[0];
    var slides = [
      { tag: "Împreună pentru inimi mici", titlu: 'Fiecare inimă merită <span class="shimmer-text">să bată</span>.',
        text: "Strângem fonduri pentru operațiile pe cord ale copiilor din familii care nu și le pot permite. 100% transparent, caz cu caz.",
        cta: [["cazuri.html", "Vezi cazurile active", ""], ["doneaza.html", "Donează acum", "btn--light"]],
        img: "assets/img/slides/1.jpg", grad: "linear-gradient(130deg,#1c060a 10%,#a30d1d 65%,#e41127)" },
      primul && { tag: "Caz urgent", titlu: esc(primul.nume) + " are nevoie de tine <em>acum</em>.",
        text: esc(primul.diagnostic) + ". S-au strâns " + SOI.bani(stransTotal(primul)) + " din " + SOI.bani(primul.target) + " — fiecare zi contează.",
        cta: [["caz.html?c=" + primul.slug + "#doneaza", "Donează pentru " + esc(primul.nume), ""], ["caz.html?c=" + primul.slug, "Citește povestea", "btn--light"]],
        img: "assets/img/slides/2.jpg", grad: "linear-gradient(130deg,#0c0506 10%,#5e0c15 60%,#c60e21)" },
      { tag: "Nu te costă nimic", titlu: 'Redirecționează <span class="hl-amber">3,5%</span> din impozit.',
        text: "Statul îți oprește oricum impozitul. Tu decizi unde ajunge o parte din el: completezi formularul 230 în 2 minute, noi facem restul.",
        cta: [["doneaza.html#trei-cinci", "Completează formularul", ""], ["doneaza.html#firme", "Ești firmă? 20%", "btn--light"]],
        img: "assets/img/slides/3.jpg", grad: "linear-gradient(130deg,#1c060a,#0e36bd 75%,#1142e4)" }
    ].filter(Boolean);

    $(".slider__track", heroHost).innerHTML = slides.map(function (s) {
      return '<div class="slider__slide"><div class="hero-slide">' +
        '<div class="hero-slide__bg" style="background:' + s.grad + '">' +
          '<img src="' + s.img + '" alt="" loading="eager" onerror="this.remove()">' +
        '</div>' +
        '<div class="hero-slide__in">' +
          '<span class="hero-slide__tag">' + s.tag + '</span>' +
          '<h2>' + s.titlu + '</h2><p>' + s.text + '</p>' +
          '<div class="row">' + s.cta.map(function (c) {
            return '<a class="btn btn--lg ' + c[2] + '" href="' + c[0] + '">' + c[1] + '</a>';
          }).join("") + '</div>' +
        '</div></div></div>';
    }).join("");
    new SOI.Slider(heroHost, { autoplay: 6500 });

    /* --- cazuri urgente: slider de carduri --- */
    var cazHost = $("[data-cazuri-slider]");
    if (cazHost) {
      var active = SOI.CAZURI.filter(function (c) { return c.activ; })
        .sort(function (a, b) { return (b.urgent - a.urgent) || (pct(a) - pct(b)); });
      $(".slider__track", cazHost).innerHTML = active.map(function (c) {
        return '<div class="slider__slide">' + cardCaz(c, c.urgent ? "shine-border" : "") + '</div>';
      }).join("");
      new SOI.Slider(cazHost, {
        autoplay: 5200, arrows: false,
        perView: function () { return window.innerWidth > 980 ? 3 : (window.innerWidth > 640 ? 2 : 1); }
      });
      SOI.initProgress(cazHost);
    }

    /* --- testimoniale --- */
    var tHost = $("[data-testimoniale-slider]");
    if (tHost) {
      $(".slider__track", tHost).innerHTML = SOI.TESTIMONIALE.map(function (t) {
        return '<div class="slider__slide"><figure class="quote-card">' +
          '<blockquote>' + esc(t.text) + '</blockquote>' +
          '<figcaption>— ' + esc(t.autor) + '</figcaption></figure></div>';
      }).join("");
      new SOI.Slider(tHost, { autoplay: 7000, arrows: false });
    }

    construiesteMarquee();
  }

  /* ---------- marquee sponsori (orice pagină cu [data-marquee]) ---------- */
  function construiesteMarquee() {
    var m = $("[data-marquee]");
    if (!m) return;
    var toti = SOI.SPONSORI.principali.concat(SOI.SPONSORI.sustinatori);
    var chips = toti.map(function (s) {
      return '<span class="logo-chip"><span class="logo-chip__dot" aria-hidden="true"></span>' + esc(s.nume) + '</span>';
    }).join("");
    m.innerHTML = '<div class="marquee__track">' + chips + chips + '</div>';
  }

  /* =========================================================
     CAZURI — listă cu filtre
     ========================================================= */
  function initCazuri() {
    var host = $("[data-cazuri]");
    if (!host) return;
    var q = $("[data-caz-q]", host), stare = $("[data-caz-stare]", host),
        sortare = $("[data-caz-sort]", host), list = $("[data-caz-list]", host),
        count = $("[data-caz-count]", host);

    function render() {
      var term = (q.value || "").trim().toLowerCase();
      var st = stare.value;
      var res = SOI.CAZURI.filter(function (c) {
        if (st === "active" && !c.activ) return false;
        if (st === "urgente" && !(c.activ && c.urgent)) return false;
        if (st === "incheiate" && c.activ) return false;
        if (!term) return true;
        return (c.nume + " " + c.diagnostic + " " + c.oras).toLowerCase().indexOf(term) !== -1;
      });
      var s = sortare.value;
      res.sort(function (a, b) {
        if (s === "aproape") return pct(b) - pct(a);
        if (s === "inceput") return pct(a) - pct(b);
        if (s === "suma") return b.target - a.target;
        return (b.urgent - a.urgent) || (b.activ - a.activ) || (pct(a) - pct(b)); /* relevanta */
      });
      count.textContent = res.length + (res.length === 1 ? " campanie" : " campanii");
      list.innerHTML = res.length
        ? res.map(function (c) { return cardCaz(c); }).join("")
        : '<div class="empty"><p><strong>Nicio campanie pentru filtrele alese.</strong></p></div>';
      SOI.initProgress(list);
    }
    q.addEventListener("input", SOI.debounce(render, 180));
    stare.addEventListener("change", render);
    sortare.addEventListener("change", render);
    render();
  }

  /* =========================================================
     CAZ — pagina unei campanii
     ========================================================= */
  function initCaz() {
    var host = $("[data-caz-pagina]");
    if (!host) return;
    var slug = new URLSearchParams(location.search).get("c");
    var c = cazDupaSlug(slug) || SOI.CAZURI.filter(function (x) { return x.activ; })[0];
    if (!c) return;
    var p = pct(c), gata = !c.activ || p >= 100;

    document.title = c.nume + " — campanie · Salvează o Inimă";
    $("[data-caz-crumb]").textContent = c.nume;

    $("[data-caz-continut]").innerHTML =
      '<div class="case-hero">' +
        '<div>' +
          '<div class="case-media">' +
            (gata ? '<span class="ribbon ribbon--done">Suma a fost strânsă</span>' : (c.urgent ? '<span class="ribbon">Caz urgent</span>' : "")) +
            SOI.imgSauInitiale("assets/img/cazuri/" + c.slug + ".jpg", "Fotografia campaniei " + c.nume, SOI.initiale(c.nume)) +
          '</div>' +
          '<h1 class="mt-3">' + esc(c.nume) + ', ' + c.varsta + ' ani</h1>' +
          '<p class="lead mt-1">' + esc(c.diagnostic) + ' · ' + esc(c.oras) + '</p>' +
          '<p class="mt-2" style="font-size:1.05rem">' + esc(c.poveste) + '</p>' +
          '<div class="mt-3">' +
            '<h3 class="mb-2">Actualizări</h3>' +
            '<div class="timeline">' + c.updates.map(function (u) {
              return '<div class="timeline__item"><div class="timeline__date">' +
                SOI.dateRO(new Date(u.data + "T00:00:00")) + '</div>' +
                '<div class="timeline__text">' + esc(u.text) + '</div></div>';
            }).join("") + '</div>' +
          '</div>' +
        '</div>' +
        '<aside class="donate-box" id="doneaza">' +
          '<div class="card' + (c.urgent && !gata ? " shine-border" : "") + '">' +
            '<div class="progress-line' + (gata ? " progress-line--done" : "") + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p + '"><i data-pct="' + p + '"></i></div>' +
            '<div class="progress-meta"><span><strong data-strans>' + SOI.bani(stransTotal(c)) + '</strong> strânși</span>' +
              '<span class="pm-goal">țintă ' + SOI.bani(c.target) + '</span></div>' +
            '<p class="small muted mt-1"><span data-pct-label>' + p + '</span>% · ' + c.donatori + ' donatori</p>' +
            (gata
              ? '<div class="alert alert--ok mt-2"><div><strong>Campania s-a încheiat cu succes.</strong>Mulțumim tuturor celor care au donat. Vezi celelalte cazuri active.</div></div>' +
                '<a class="btn btn--block mt-2" href="cazuri.html">Cazuri care încă au nevoie</a>'
              : '<form class="mt-3" data-doneaza-form>' +
                  '<p class="small muted mb-1" style="font-weight:700">Alege suma donației</p>' +
                  '<div class="amount-pills" data-sume></div>' +
                  '<label class="field mt-2"><span>Sau altă sumă (€)</span>' +
                    '<input class="input" type="number" min="1" step="1" name="suma" inputmode="numeric" placeholder="de ex. 75"></label>' +
                  '<div class="impact mt-1" data-impact hidden></div>' +
                  '<button class="btn btn--block btn--lg mt-2" type="submit">Donează<span aria-hidden="true"> ♥</span></button>' +
                  '<p class="hint center">Demo — nicio plată reală nu este procesată.</p>' +
                '</form>') +
            '<div class="row mt-2" style="justify-content:center">' +
              '<button class="btn btn--sm btn--ghost" type="button" data-share>Distribuie</button>' +
              '<a class="btn btn--sm btn--ghost" href="doneaza.html#trei-cinci">Redirecționează 3,5%</a>' +
            '</div>' +
          '</div>' +
        '</aside>' +
      '</div>';

    /* sume + impact */
    var SUME = [25, 50, 100, 250, 500];
    var IMPACT = {
      25: "acoperă o zi de medicație post-operatorie",
      50: "acoperă un set de analize preoperatorii",
      100: "acoperă o noapte de spitalizare pentru însoțitor",
      250: "acoperă transportul familiei către clinică",
      500: "acoperă o zi de terapie intensivă"
    };
    var form = $("[data-doneaza-form]", host);
    if (form) {
      var pills = $("[data-sume]", form), inp = $('[name="suma"]', form), impact = $("[data-impact]", form);
      pills.innerHTML = SUME.map(function (s) {
        return '<button type="button" class="amount-pill" data-s="' + s + '">' + s + ' €</button>';
      }).join("");
      function alege(s) {
        $$(".amount-pill", pills).forEach(function (b) { b.classList.toggle("is-on", +b.dataset.s === s); });
        if (s && IMPACT[s]) { impact.hidden = false; impact.innerHTML = '<strong>' + s + ' €</strong> — ' + IMPACT[s] + '.'; }
        else if (s) { impact.hidden = false; impact.innerHTML = '<strong>' + s + ' €</strong> — mulțumim din inimă.'; }
        else impact.hidden = true;
      }
      pills.addEventListener("click", function (e) {
        var b = e.target.closest(".amount-pill"); if (!b) return;
        inp.value = b.dataset.s; alege(+b.dataset.s);
      });
      inp.addEventListener("input", function () { alege(parseInt(inp.value, 10) || 0); });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var s = parseInt(inp.value, 10);
        if (!s || s < 1) { SOI.toast("Alege întâi o sumă.", "err"); inp.focus(); return; }
        var d = donatiiLocale(); d[c.slug] = (d[c.slug] || 0) + s;
        SOI.store.set("soi-donatii", d);
        var np = pct(c);
        $("[data-strans]", host).textContent = SOI.bani(stransTotal(c));
        $("[data-pct-label]", host).textContent = np;
        var barEl = $(".donate-box .progress-line > i", host);
        barEl.dataset.pct = np; barEl.style.width = np + "%";
        confetti();
        SOI.toast("Mulțumim! Donația demo de " + s + " € a fost înregistrată.", "ok");
        form.reset(); alege(0);
      });
    }

    /* share */
    var shareBtn = $("[data-share]", host);
    if (shareBtn) shareBtn.addEventListener("click", function () {
      var data = { title: document.title, text: "Ajută-l pe " + c.nume + "!", url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          SOI.toast("Linkul campaniei a fost copiat.", "ok");
        });
      }
    });

    /* alte cazuri */
    var alte = SOI.CAZURI.filter(function (x) { return x.slug !== c.slug && x.activ; }).slice(0, 3);
    var alteHost = $("[data-caz-alte]");
    if (alteHost && alte.length) {
      alteHost.innerHTML = '<h2 class="mb-3">Alți copii care așteaptă</h2>' +
        '<div class="grid g3">' + alte.map(function (x) { return cardCaz(x); }).join("") + '</div>';
    }

    /* bara lipita jos pe mobil */
    var sticky = $("[data-sticky-cta]");
    if (sticky && !gata) {
      sticky.innerHTML = '<div><strong>' + esc(c.nume) + '</strong> · <span class="small muted">' + p + '% strâns</span></div>' +
        '<a class="btn btn--sm" href="#doneaza">Donează</a>';
      sticky.classList.add("is-visible");
    }

    SOI.initProgress(host); SOI.reveal(host);
  }

  function confetti() {
    if (SOI.reduced) return;
    var cvs = document.createElement("canvas");
    cvs.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:200";
    cvs.width = innerWidth; cvs.height = innerHeight;
    document.body.appendChild(cvs);
    var ctx = cvs.getContext("2d");
    var parts = [], colors = ["#e41127", "#1142e4", "#feedba", "#fde6e9", "#67c42c"];
    for (var i = 0; i < 120; i++) {
      parts.push({ x: innerWidth / 2, y: innerHeight * 0.6,
        vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4,
        s: Math.random() * 7 + 3, c: colors[i % colors.length], r: Math.random() * Math.PI });
    }
    var t = 0;
    (function tick() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      parts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += .35; p.r += .1;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6);
        ctx.restore();
      });
      if (++t < 90) requestAnimationFrame(tick); else cvs.remove();
    })();
  }

  /* =========================================================
     DONEAZĂ — tab-uri: donație / 3,5% / 20% firme
     ========================================================= */
  function initDoneaza() {
    var host = $("[data-doneaza-pagina]");
    if (!host) return;

    /* tab-uri */
    var tabs = $$(".tab", host), panes = $$("[data-pane]", host);
    function arata(id) {
      tabs.forEach(function (t) { t.classList.toggle("is-on", t.dataset.tab === id); t.setAttribute("aria-selected", String(t.dataset.tab === id)); });
      panes.forEach(function (p) { p.classList.toggle("hidden", p.dataset.pane !== id); });
    }
    tabs.forEach(function (t) { t.addEventListener("click", function () { arata(t.dataset.tab); history.replaceState(null, "", "#" + t.dataset.tab); }); });
    var h = location.hash.replace("#", "");
    arata(["donatie", "trei-cinci", "firme"].indexOf(h) !== -1 ? h : "donatie");

    /* — donatie generala: alegere caz — */
    var sel = $('[name="caz"]', host);
    if (sel) {
      sel.innerHTML = '<option value="">Unde e nevoia mai mare (recomandat)</option>' +
        SOI.CAZURI.filter(function (c) { return c.activ; }).map(function (c) {
          return '<option value="' + c.slug + '">' + esc(c.nume) + ' — ' + esc(c.diagnostic) + '</option>';
        }).join("");
    }
    var fdon = $("[data-form-donatie]", host);
    if (fdon) fdon.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SOI.validate(fdon)) { SOI.toast("Completează câmpurile obligatorii.", "err"); return; }
      var slug = sel.value || SOI.CAZURI.filter(function (c) { return c.activ && c.urgent; })[0].slug;
      location.href = "caz.html?c=" + encodeURIComponent(slug) + "#doneaza";
    });

    /* — formular 230 (3,5%) — */
    var f230 = $("[data-form-230]", host);
    if (f230) {
      var prev = $("[data-f230-preview]", host);
      function refac() {
        var fd = new FormData(f230);
        var rows = [
          ["Nume și prenume", (fd.get("nume") || "") + ""],
          ["CNP", (fd.get("cnp") || "") + ""],
          ["Adresă", (fd.get("adresa") || "") + ""],
          ["E-mail", (fd.get("email") || "") + ""],
          ["Perioada", (fd.get("doiani") ? "2 ani (distribuire până la revocare)" : "1 an")],
          ["Organizația beneficiară", "Asociația Salvează o Inimă (demo)"],
          ["Procent direcționat", "3,5% din impozitul anual pe venit"]
        ];
        prev.innerHTML = '<div class="f230"><h3>Previzualizare — Formular 230 (demo)</h3>' +
          '<dl>' + rows.map(function (r) {
            return '<dt>' + esc(r[0]) + '</dt><dd>' + (esc(r[1]) || "&nbsp;") + '</dd>';
          }).join("") + '</dl>' +
          '<p class="hint mt-2">Aceasta este o machetă demonstrativă, nu formularul oficial ANAF.</p></div>';
      }
      f230.addEventListener("input", SOI.debounce(refac, 150));
      f230.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!SOI.validate(f230)) { SOI.toast("Verifică datele completate.", "err"); return; }
        refac();
        SOI.toast("Formularul e gata — folosește «Tipărește».", "ok");
      });
      var printBtn = $("[data-f230-print]", host);
      if (printBtn) printBtn.addEventListener("click", function () {
        if (!SOI.validate(f230)) { SOI.toast("Completează întâi câmpurile obligatorii.", "err"); return; }
        refac(); window.print();
      });
      refac();
    }

    /* — calculator 20% firme — */
    var f20 = $("[data-calc-20]", host);
    if (f20) {
      var out = $("[data-calc-out]", host);
      function calc() {
        var profitTax = parseFloat($('[name="impozit"]', f20).value) || 0;
        var cifra = parseFloat($('[name="cifra"]', f20).value) || 0;
        if (!profitTax || !cifra) { out.innerHTML = '<p class="muted small">Completează cele două sume ca să vezi cât poți sponsoriza fără niciun cost.</p>'; return; }
        var lim1 = profitTax * 0.20, lim2 = cifra * 0.0075;
        var suma = Math.max(0, Math.min(lim1, lim2));
        out.innerHTML =
          '<div class="alert alert--ok"><div><strong>Poți sponsoriza ' + suma.toLocaleString("ro-RO", { maximumFractionDigits: 0 }) + ' lei cu cost zero.</strong>' +
          'Limita este minimul dintre 20% din impozitul pe profit (' + lim1.toLocaleString("ro-RO", { maximumFractionDigits: 0 }) + ' lei) și 0,75% din cifra de afaceri (' +
          lim2.toLocaleString("ro-RO", { maximumFractionDigits: 0 }) + ' lei). Suma se scade integral din impozitul datorat.</div></div>' +
          '<a class="btn mt-2" href="contact.html">Cere contractul de sponsorizare</a>';
      }
      f20.addEventListener("input", SOI.debounce(calc, 200));
      calc();
    }
  }

  /* =========================================================
     SPONSORI
     ========================================================= */
  function initSponsori() {
    var host = $("[data-sponsori]");
    if (!host) return;
    function chip(s, mare) {
      return '<div class="card card--hover center" style="display:grid;place-items:center;gap:.6rem;' + (mare ? "padding:2rem 1.4rem" : "") + '">' +
        '<div style="width:' + (mare ? "4.4rem" : "3.2rem") + ';aspect-ratio:1;border-radius:50%;overflow:hidden">' +
          SOI.imgSauInitiale("assets/img/sponsori/" + s.id + ".png", "Logo " + s.nume, SOI.initiale(s.nume), "avatar-ph--sm") +
        '</div><strong style="font-size:' + (mare ? "1.05rem" : ".92rem") + '">' + esc(s.nume) + '</strong></div>';
    }
    $("[data-sp-principali]", host).innerHTML = SOI.SPONSORI.principali.map(function (s) { return chip(s, true); }).join("");
    $("[data-sp-sustinatori]", host).innerHTML = SOI.SPONSORI.sustinatori.map(function (s) { return chip(s); }).join("");
    construiesteMarquee();
  }

  /* =========================================================
     DESPRE (echipă + premii + testimoniale)
     ========================================================= */
  function initDespre() {
    var host = $("[data-despre]");
    if (!host) return;
    $("[data-echipa]", host).innerHTML = SOI.ECHIPA.map(function (m, i) {
      return '<article class="card card--hover center rv" data-delay="' + i * 70 + '">' +
        '<div style="width:5.4rem;aspect-ratio:1;border-radius:50%;overflow:hidden;margin:0 auto 1rem">' +
          SOI.imgSauInitiale("assets/img/echipa/" + m.id + ".jpg", m.nume, SOI.initiale(m.nume), "avatar-ph--sm") +
        '</div>' +
        '<h3 style="font-size:1.15rem">' + esc(m.nume) + '</h3>' +
        '<p class="blue-note small">' + esc(m.rol) + '</p>' +
        '<p class="small mt-1">' + esc(m.text) + '</p></article>';
    }).join("");
    $("[data-premii]", host).innerHTML = SOI.PREMII.map(function (p) {
      return '<div class="card row" style="gap:1rem;flex-wrap:nowrap">' +
        '<span class="badge badge--amber" style="font-size:.95rem;padding:.5rem .9rem">' + esc(p.an) + '</span>' +
        '<div><strong>' + esc(p.titlu) + '</strong><br><span class="small muted">' + esc(p.detaliu) + '</span></div></div>';
    }).join("");
    var t = $("[data-testimoniale-grid]", host);
    if (t) t.innerHTML = SOI.TESTIMONIALE.map(function (x, i) {
      return '<figure class="card rv" data-delay="' + i * 60 + '">' +
        '<blockquote style="font-size:.98rem">&bdquo;' + esc(x.text) + '&rdquo;</blockquote>' +
        '<figcaption class="mt-2" style="font-weight:700;color:var(--accent)">— ' + esc(x.autor) + '</figcaption></figure>';
    }).join("");
    SOI.reveal(host);
  }

  /* =========================================================
     FAQ + CONTACT
     ========================================================= */
  function initFaq() {
    var host = $("[data-faq]");
    if (!host) return;
    var list = $("[data-faq-list]", host), q = $("[data-faq-q]", host),
        cats = $("[data-faq-cats]", host), count = $("[data-faq-count]", host);
    var activeCat = "";
    var categorii = SOI.FAQ.map(function (f) { return f.c; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    cats.innerHTML = '<button type="button" class="amount-pill is-on" data-cat="">Toate</button>' +
      categorii.map(function (c) { return '<button type="button" class="amount-pill" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join("");

    function render() {
      var term = (q.value || "").trim().toLowerCase();
      var res = SOI.FAQ.filter(function (f) {
        if (activeCat && f.c !== activeCat) return false;
        if (!term) return true;
        return (f.q + " " + f.a).toLowerCase().indexOf(term) !== -1;
      });
      count.textContent = res.length + (res.length === 1 ? " întrebare" : " întrebări");
      list.innerHTML = res.length ? res.map(function (f, i) {
        return '<div class="acc"><button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq-p-' + i + '">' +
          '<span>' + esc(f.q) + '</span><span class="acc__ic" aria-hidden="true">+</span></button>' +
          '<div class="acc__body" id="faq-p-' + i + '"><div><p>' + esc(f.a) + '</p></div></div></div>';
      }).join("") : '<div class="empty"><p><strong>Nu am găsit nimic.</strong></p>' +
        '<a class="btn btn--sm mt-2" href="contact.html">Pune întrebarea direct</a></div>';
    }
    q.addEventListener("input", SOI.debounce(render, 160));
    cats.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]"); if (!b) return;
      activeCat = b.dataset.cat;
      $$(".amount-pill", cats).forEach(function (x) { x.classList.toggle("is-on", x === b); });
      render();
    });
    render();
  }

  function initContact() {
    var form = $("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SOI.validate(form)) { SOI.toast("Verifică datele completate.", "err"); return; }
      var nume = String(new FormData(form).get("nume") || "").split(" ")[0];
      form.innerHTML = '<div class="alert alert--ok"><div><strong>Mulțumim, ' + esc(nume) + '!</strong>' +
        'Mesajul a fost înregistrat. Răspundem în cel mult 3 zile lucrătoare.</div></div>';
      SOI.toast("Mesaj trimis.", "ok");
    });
  }

  /* ---------- pornire ---------- */
  function boot() {
    initAcasa(); initCazuri(); initCaz(); initDoneaza();
    initSponsori(); initDespre(); initFaq(); initContact();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
