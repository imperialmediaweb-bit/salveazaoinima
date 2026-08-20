/* ==========================================================================
   Funcționalitățile interactive ale site-ului
   ========================================================================== */
(function () {
  "use strict";
  var $ = SOI.$, $$ = SOI.$$, esc = SOI.esc;

  /* =========================================================
     1. Test de eligibilitate
     ========================================================= */
  function initEligibilitate() {
    var host = $("[data-eligibilitate]");
    if (!host) return;
    var list = $("[data-elig-list]", host);
    var out  = $("[data-elig-result]", host);
    var bar  = $("[data-elig-bar]", host);

    list.innerHTML = SOI.CRITERII.map(function (c, i) {
      return '<label class="check" data-crit="' + c.id + '">' +
        '<input type="checkbox" data-blocant="' + (c.blocant ? "1" : "0") + '" aria-describedby="crit-' + i + '">' +
        '<span id="crit-' + i + '">' + esc(c.text) + (c.blocant ? ' <span class="badge badge--accent">obligatoriu</span>' : '') + '</span>' +
        '</label>';
    }).join("");

    function evaluate() {
      var boxes = $$('input[type="checkbox"]', list);
      var total = boxes.length;
      var bifate = boxes.filter(function (b) { return b.checked; });
      var blocanteLipsa = boxes.filter(function (b) { return b.dataset.blocant === "1" && !b.checked; });

      boxes.forEach(function (b) { b.closest(".check").classList.toggle("is-on", b.checked); });

      var pct = Math.round((bifate.length / total) * 100);
      if (bar) { bar.style.width = pct + "%"; bar.parentElement.setAttribute("aria-valuenow", String(pct)); }

      if (bifate.length === 0) { out.innerHTML = ""; return; }

      if (blocanteLipsa.length === 0 && bifate.length === total) {
        out.innerHTML = '<div class="alert alert--ok"><div><strong>Arăți ca un donator eligibil.</strong>' +
          'Ai bifat toate criteriile. Următorul pas: alege un centru și fă-ți o programare. ' +
          'Decizia finală aparține medicului din centru, după consultul și chestionarul medical.</div></div>' +
          '<a class="btn mt-2" href="programare.html">Fă-ți programare<span aria-hidden="true">→</span></a>';
      } else if (blocanteLipsa.length === 0) {
        var recomandariLipsa = total - bifate.length;
        out.innerHTML = '<div class="alert alert--warn"><div><strong>Probabil poți dona, cu mici ajustări.</strong>' +
          'Criteriile obligatorii sunt îndeplinite, dar ' +
          (recomandariLipsa === 1 ? 'o recomandare încă nu este bifată' : recomandariLipsa + ' recomandări încă nu sunt bifate') + '. ' +
          'Odihnește-te, mănâncă ușor și hidratează-te înainte să vii.</div></div>' +
          '<a class="btn btn--ghost mt-2" href="programare.html">Vezi programările disponibile</a>';
      } else {
        var n = blocanteLipsa.length;
        out.innerHTML = '<div class="alert alert--err"><div><strong>Momentan nu îndeplinești ' +
          (n === 1 ? 'un criteriu obligatoriu' : n + ' criterii obligatorii') + '.</strong>' +
          'Asta nu înseamnă „niciodată” — cele mai multe restricții sunt temporare. ' +
          'Verifică din nou după perioada de așteptare sau întreabă medicul centrului.</div></div>';
      }
    }

    list.addEventListener("change", evaluate);
    var reset = $("[data-elig-reset]", host);
    if (reset) reset.addEventListener("click", function () {
      $$('input[type="checkbox"]', list).forEach(function (b) { b.checked = false; });
      evaluate();
    });
    evaluate();
  }

  /* =========================================================
     2. Calculator interval până la următoarea donare
     ========================================================= */
  function initInterval() {
    var host = $("[data-interval]");
    if (!host) return;
    var input = $("[data-interval-date]", host);
    var sex   = $("[data-interval-sex]", host);
    var out   = $("[data-interval-out]", host);

    function calc() {
      if (!input.value) { out.innerHTML = '<p class="muted small">Alege data ultimei donări pentru a vedea când poți dona din nou.</p>'; return; }
      var last = new Date(input.value + "T00:00:00");
      if (isNaN(last.getTime())) return;
      var luni = sex.value === "f" ? 4 : 3;
      var next = new Date(last); next.setMonth(next.getMonth() + luni);
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var zile = Math.ceil((next - today) / 86400000);

      if (zile <= 0) {
        out.innerHTML = '<div class="alert alert--ok"><div><strong>Poți dona din nou.</strong>' +
          'Intervalul minim de ' + luni + ' luni a trecut pe ' + SOI.dateRO(next) + '.</div></div>' +
          '<a class="btn mt-2" href="programare.html">Programează-te acum<span aria-hidden="true">→</span></a>';
      } else {
        out.innerHTML = '<div class="alert alert--warn"><div><strong>Mai ai ' + zile + ' ' + (zile === 1 ? 'zi' : 'zile') + '.</strong>' +
          'Prima dată la care poți dona din nou este <strong>' + SOI.dateRO(next) + '</strong> ' +
          '(interval minim de ' + luni + ' luni). Îți recomandăm să-ți notezi data.</div></div>' +
          '<button class="btn btn--ghost mt-2" data-ics="' + next.toISOString().slice(0, 10) + '">Adaugă în calendar (.ics)</button>';
      }
    }
    input.addEventListener("change", calc);
    sex.addEventListener("change", calc);
    host.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ics]"); if (!b) return;
      downloadICS(b.dataset.ics, "Pot dona sânge din nou", "Intervalul minim de la ultima donare a trecut. salveazaoinima.ro");
    });
    calc();
  }

  function downloadICS(dateISO, title, desc) {
    var d = dateISO.replace(/-/g, "");
    var end = new Date(dateISO + "T00:00:00"); end.setDate(end.getDate() + 1);
    var d2 = end.toISOString().slice(0, 10).replace(/-/g, "");
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//salveazaoinima.ro//RO",
      "BEGIN:VEVENT", "UID:" + d + "-soi@salveazaoinima.ro",
      "DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + d2,
      "SUMMARY:" + title, "DESCRIPTION:" + desc,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "donare-sange.ics";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    SOI.toast("Fișierul de calendar a fost descărcat.", "ok");
  }

  /* =========================================================
     3. Compatibilitate grupe sanguine
     ========================================================= */
  function initCompatibilitate() {
    var host = $("[data-compat]");
    if (!host) return;
    var pills = $("[data-compat-pills]", host);
    var out   = $("[data-compat-out]", host);
    var modeBtns = $$("[data-compat-mode]", host);
    var tableHost = $("[data-compat-table]", host);
    var state = { grupa: "0-", mod: "donez" };

    pills.innerHTML = SOI.GRUPE.map(function (g) {
      return '<button type="button" class="bg-pill" data-g="' + g + '" aria-pressed="false">' + g + '</button>';
    }).join("");

    function render() {
      $$(".bg-pill", pills).forEach(function (b) {
        var on = b.dataset.g === state.grupa;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      modeBtns.forEach(function (b) {
        var on = b.dataset.compatMode === state.mod;
        b.classList.add("btn"); b.classList.toggle("btn--ghost", !on);
        b.setAttribute("aria-pressed", String(on));
      });

      var lista, titlu, plasma;
      if (state.mod === "donez") {
        lista = SOI.DONEAZA_CATRE[state.grupa];
        titlu = "Cu grupa <strong>" + state.grupa + "</strong> poți dona globule roșii către " + lista.length + " din 8 grupe:";
        plasma = SOI.PLASMA_DONEAZA_CATRE[state.grupa];
      } else {
        lista = SOI.PRIMESTE_DE_LA[state.grupa];
        titlu = "Cu grupa <strong>" + state.grupa + "</strong> poți primi globule roșii de la " + lista.length + " din 8 grupe:";
        plasma = null;
      }

      var pillsHtml = SOI.GRUPE.map(function (g) {
        var ok = lista.indexOf(g) !== -1;
        return '<span class="bg-pill' + (ok ? " is-on" : "") + '" style="cursor:default' + (ok ? "" : ";opacity:.35") + '">' + g + '</span>';
      }).join("");

      var extra = "";
      if (state.grupa === "0-" && state.mod === "donez") {
        extra = '<div class="alert alert--ok mt-2"><div><strong>Ești donator universal.</strong>Globulele tale roșii pot fi transfuzate oricărui pacient. De aceea grupa 0 negativ este prima cerută în urgențe, când nu e timp pentru determinarea grupei.</div></div>';
      } else if (state.grupa === "AB+" && state.mod === "primesc") {
        extra = '<div class="alert alert--ok mt-2"><div><strong>Ești primitor universal.</strong>Poți primi globule roșii de la orice grupă sanguină.</div></div>';
      } else if (state.grupa === "AB+" && state.mod === "donez") {
        extra = '<div class="alert alert--warn"><div><strong>Plasma ta este universală.</strong>Deși globulele roșii AB+ merg doar către AB+, plasma ta poate ajunge la orice pacient. Întreabă centrul despre donarea de plasmă.</div></div>';
      }

      var plasmaHtml = plasma
        ? '<p class="small muted mt-2">Plasmă: poți dona către ' + plasma.join(", ") + '.</p>' : "";

      out.innerHTML = '<p class="mb-2">' + titlu + '</p><div class="bg-pills">' + pillsHtml + '</div>' +
        plasmaHtml +
        '<p class="small muted mt-2">Grupa ta apare în aproximativ <strong>' + (SOI.FRECVENTA[state.grupa] || "?") +
        '%</strong> din populație.</p>' + extra;

      renderTable();
    }

    function renderTable() {
      var rows = SOI.GRUPE.map(function (donator) {
        var tds = SOI.GRUPE.map(function (primitor) {
          var ok = SOI.PRIMESTE_DE_LA[primitor].indexOf(donator) !== -1;
          var hl = (state.mod === "donez" && donator === state.grupa) ||
                   (state.mod === "primesc" && primitor === state.grupa);
          return '<td class="' + (ok ? "yes" : "no") + (hl ? " hl" : "") + '">' + (ok ? "✓" : "·") + '</td>';
        }).join("");
        return '<tr><th scope="row">' + donator + '</th>' + tds + '</tr>';
      }).join("");

      tableHost.innerHTML = '<div class="table-wrap"><table>' +
        '<caption class="sr-only">Compatibilitatea grupelor sanguine la transfuzia de globule roșii</caption>' +
        '<thead><tr><th scope="col">Donator ↓ / Primitor →</th>' +
        SOI.GRUPE.map(function (g) { return '<th scope="col">' + g + '</th>'; }).join("") +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    }

    pills.addEventListener("click", function (e) {
      var b = e.target.closest(".bg-pill"); if (!b) return;
      state.grupa = b.dataset.g; render();
    });
    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () { state.mod = b.dataset.compatMode; render(); });
    });
    render();
  }

  /* =========================================================
     4. Centre de donare — căutare și filtrare
     ========================================================= */
  function initCentre() {
    var host = $("[data-centre]");
    if (!host) return;
    var q      = $("[data-centre-q]", host);
    var judet  = $("[data-centre-judet]", host);
    var list   = $("[data-centre-list]", host);
    var count  = $("[data-centre-count]", host);

    var judete = SOI.CENTRE.map(function (c) { return c.judet; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
    judet.innerHTML = '<option value="">Toate județele</option>' +
      judete.map(function (j) { return '<option value="' + esc(j) + '">' + esc(j) + '</option>'; }).join("");

    function render() {
      var term = (q.value || "").trim().toLowerCase();
      var jv = judet.value;
      var res = SOI.CENTRE.filter(function (c) {
        if (jv && c.judet !== jv) return false;
        if (!term) return true;
        return (c.nume + " " + c.oras + " " + c.judet).toLowerCase().indexOf(term) !== -1;
      });

      count.textContent = res.length + (res.length === 1 ? " centru găsit" : " centre găsite");

      if (!res.length) {
        list.innerHTML = '<div class="empty"><p><strong>Niciun centru pentru căutarea ta.</strong></p>' +
          '<p class="small">Încearcă alt județ sau șterge filtrele.</p></div>';
        return;
      }

      list.innerHTML = res.map(function (c) {
        return '<article class="card card--hover centre">' +
          '<div class="centre__top"><h3>' + esc(c.nume) + '</h3>' +
          '<span class="badge badge--accent">' + esc(c.judet) + '</span></div>' +
          '<dl>' +
          '<dt>Oraș</dt><dd>' + esc(c.oras) + '</dd>' +
          '<dt>Program</dt><dd>' + esc(c.program) + '</dd>' +
          '<dt>Telefon</dt><dd>' + esc(c.telefon) + '</dd>' +
          (c.obs && c.obs !== "—" ? '<dt>Observații</dt><dd>' + esc(c.obs) + '</dd>' : "") +
          '</dl>' +
          '<div class="row mt-1">' +
          '<a class="btn btn--sm" href="programare.html?centru=' + encodeURIComponent(c.id) + '">Programează-te aici</a>' +
          '<a class="btn btn--sm btn--ghost" target="_blank" rel="noopener noreferrer" href="https://www.openstreetmap.org/search?query=' +
            encodeURIComponent(c.nume + " " + c.oras) + '">Vezi pe hartă</a>' +
          '</div></article>';
      }).join("");
    }

    q.addEventListener("input", SOI.debounce(render, 180));
    judet.addEventListener("change", render);
    var reset = $("[data-centre-reset]", host);
    if (reset) reset.addEventListener("click", function () { q.value = ""; judet.value = ""; render(); });
    render();
  }

  /* =========================================================
     5. Cereri urgente
     ========================================================= */
  var URG_ORD = { critica: 0, ridicata: 1, medie: 2 };
  var URG_LABEL = { critica: "Critică", ridicata: "Ridicată", medie: "Medie" };
  var URG_CLASS = { critica: "badge--err", ridicata: "badge--warn", medie: "badge" };

  function cereri() {
    var extra = SOI.store.get("soi-cereri", []);
    return SOI.CERERI_SEED.concat(Array.isArray(extra) ? extra : []);
  }

  function initUrgente() {
    var host = $("[data-urgente]");
    if (!host) return;
    var list  = $("[data-urg-list]", host);
    var fg    = $("[data-urg-grupa]", host);
    var fo    = $("[data-urg-oras]", host);
    var fc    = $("[data-urg-compat]", host);
    var count = $("[data-urg-count]", host);

    fg.innerHTML = '<option value="">Toate grupele</option>' +
      SOI.GRUPE.map(function (g) { return '<option value="' + g + '">' + g + '</option>'; }).join("");

    function refreshOrase() {
      var orase = cereri().map(function (c) { return c.oras; })
        .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
      var cur = fo.value;
      fo.innerHTML = '<option value="">Toate orașele</option>' +
        orase.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join("");
      fo.value = cur;
    }

    function render() {
      var g = fg.value, o = fo.value, compatGrupa = fc.value;
      var res = cereri().filter(function (c) {
        if (g && c.grupa !== g) return false;
        if (o && c.oras !== o) return false;
        if (compatGrupa) {
          /* pot ajuta acest pacient cu grupa mea? */
          if (SOI.DONEAZA_CATRE[compatGrupa].indexOf(c.grupa) === -1) return false;
        }
        return true;
      }).sort(function (a, b) {
        var d = URG_ORD[a.urgenta] - URG_ORD[b.urgenta];
        return d !== 0 ? d : a.zileRamase - b.zileRamase;
      });

      count.textContent = res.length + (res.length === 1 ? " cerere activă" : " cereri active");

      if (!res.length) {
        list.innerHTML = '<div class="empty"><p><strong>Nicio cerere pentru filtrele alese.</strong></p>' +
          '<p class="small">Încearcă să elimini un filtru — nevoia de sânge există permanent.</p></div>';
        return;
      }

      list.innerHTML = res.map(function (c) {
        return '<article class="card card--hover req-card">' +
          '<div class="blood-tag" aria-label="Grupa ' + c.grupa + '">' + c.grupa + '</div>' +
          '<div><h3>' + esc(c.pacient) + '</h3>' +
          '<p class="small muted">' + esc(c.nevoie) + '</p>' +
          '<div class="row mt-1">' +
            '<span class="badge ' + URG_CLASS[c.urgenta] + '">Urgență ' + URG_LABEL[c.urgenta] + '</span>' +
            '<span class="badge">' + esc(c.spital) + ', ' + esc(c.oras) + '</span>' +
            '<span class="badge">' + c.unitati + ' unități necesare</span>' +
            '<span class="badge">' + c.zileRamase + ' ' + (c.zileRamase === 1 ? "zi" : "zile") + ' rămase</span>' +
          '</div></div>' +
          '<a class="btn btn--sm" href="programare.html?grupa=' + encodeURIComponent(c.grupa) +
            '&amp;oras=' + encodeURIComponent(c.oras) + '">Vreau să ajut</a>' +
          '</article>';
      }).join("");
    }

    fc.innerHTML = '<option value="">Grupa mea (toate)</option>' +
      SOI.GRUPE.map(function (g) { return '<option value="' + g + '">Am grupa ' + g + '</option>'; }).join("");

    [fg, fo, fc].forEach(function (el) { el.addEventListener("change", render); });
    var reset = $("[data-urg-reset]", host);
    if (reset) reset.addEventListener("click", function () { fg.value = ""; fo.value = ""; fc.value = ""; render(); });

    /* --- formular de adăugare cerere --- */
    var form = $("[data-urg-form]", host);
    if (form) {
      var gsel = $('[name="grupa"]', form);
      gsel.innerHTML = SOI.GRUPE.map(function (g) { return '<option value="' + g + '">' + g + '</option>'; }).join("");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!SOI.validate(form)) { SOI.toast("Completează câmpurile obligatorii.", "err"); return; }
        var fd = new FormData(form);
        var nou = {
          id: "u" + Date.now(),
          grupa: fd.get("grupa"),
          pacient: String(fd.get("pacient")).trim(),
          spital: String(fd.get("spital")).trim(),
          oras: String(fd.get("oras")).trim(),
          nevoie: String(fd.get("nevoie")).trim() || "Necesar transfuzie",
          unitati: Math.max(1, parseInt(fd.get("unitati"), 10) || 1),
          urgenta: fd.get("urgenta"),
          zileRamase: Math.max(1, parseInt(fd.get("zile"), 10) || 7)
        };
        var extra = SOI.store.get("soi-cereri", []);
        extra.push(nou);
        SOI.store.set("soi-cereri", extra);
        form.reset();
        refreshOrase(); render();
        SOI.toast("Cererea a fost publicată pe listă.", "ok");
      });
    }

    refreshOrase();
    render();
  }

  /* =========================================================
     6. Programare — formular în pași
     ========================================================= */
  function initProgramare() {
    var host = $("[data-programare]");
    if (!host) return;
    var form   = $("[data-prog-form]", host);
    var panels = $$("[data-step]", host);
    var steps  = $$("[data-stepper] .stepper__i", host);
    var btnPrev = $("[data-prog-prev]", host);
    var btnNext = $("[data-prog-next]", host);
    var btnSend = $("[data-prog-send]", host);
    var sumHost = $("[data-prog-summary]", host);
    var doneHost = $("[data-prog-done]", host);
    var idx = 0;

    /* populare selecturi */
    var selCentru = $('[name="centru"]', form);
    selCentru.innerHTML = '<option value="">Alege un centru…</option>' +
      SOI.CENTRE.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.nume) + " — " + esc(c.oras) + '</option>';
      }).join("");

    var selGrupa = $('[name="grupa"]', form);
    selGrupa.innerHTML = '<option value="">Nu știu / se determină la centru</option>' +
      SOI.GRUPE.map(function (g) { return '<option value="' + g + '">' + g + '</option>'; }).join("");

    /* zile disponibile: următoarele 21 de zile lucrătoare */
    var selData = $('[name="data"]', form);
    (function () {
      var opts = [], d = new Date(); d.setHours(0, 0, 0, 0);
      var added = 0;
      while (added < 21) {
        d.setDate(d.getDate() + 1);
        var wd = d.getDay();
        if (wd === 0 || wd === 6) continue;
        var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        opts.push('<option value="' + iso + '">' + SOI.dateRO(new Date(iso + "T00:00:00")) + '</option>');
        added++;
      }
      selData.innerHTML = '<option value="">Alege ziua…</option>' + opts.join("");
    })();

    var selOra = $('[name="ora"]', form);
    (function () {
      var ore = [];
      for (var h = 7; h <= 12; h++) {
        ["00", "30"].forEach(function (m) {
          if (h === 7 && m === "00") return;
          if (h === 12 && m === "30") return;
          ore.push(String(h).padStart(2, "0") + ":" + m);
        });
      }
      selOra.innerHTML = '<option value="">Alege ora…</option>' +
        ore.map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join("");
    })();

    /* preselecție din querystring */
    (function () {
      var p = new URLSearchParams(location.search);
      if (p.get("centru")) selCentru.value = p.get("centru");
      if (p.get("grupa") && SOI.GRUPE.indexOf(p.get("grupa")) !== -1) selGrupa.value = p.get("grupa");
      var oras = p.get("oras");
      if (oras && !selCentru.value) {
        var m = SOI.CENTRE.filter(function (c) { return c.oras === oras; })[0];
        if (m) selCentru.value = m.id;
      }
    })();

    function show(i) {
      idx = Math.max(0, Math.min(i, panels.length - 1));
      panels.forEach(function (p, n) { p.classList.toggle("hidden", n !== idx); });
      steps.forEach(function (s, n) {
        s.classList.toggle("is-on", n === idx);
        s.classList.toggle("is-done", n < idx);
      });
      btnPrev.classList.toggle("hidden", idx === 0);
      btnNext.classList.toggle("hidden", idx === panels.length - 1);
      btnSend.classList.toggle("hidden", idx !== panels.length - 1);
      if (idx === panels.length - 1) buildSummary();
      var h = $("h2, h3", panels[idx]); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      host.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function validStep() {
      var ok = true;
      $$("[data-required]", panels[idx]).forEach(function (el) {
        var field = el.closest(".field") || el.parentElement;
        var val = (el.type === "checkbox") ? el.checked : String(el.value || "").trim();
        var bad = !val;
        if (!bad && el.dataset.pattern) bad = !new RegExp(el.dataset.pattern).test(val);
        field.classList.toggle("is-invalid", bad);
        el.setAttribute("aria-invalid", String(bad));
        if (bad && ok) { ok = false; try { el.focus(); } catch (e) {} }
      });
      return ok;
    }

    function buildSummary() {
      var fd = new FormData(form);
      var centru = SOI.CENTRE.filter(function (c) { return c.id === fd.get("centru"); })[0];
      var rows = [
        ["Nume", fd.get("nume")],
        ["E-mail", fd.get("email")],
        ["Telefon", fd.get("telefon")],
        ["Grupa sanguină", fd.get("grupa") || "Se determină la centru"],
        ["Centru", centru ? centru.nume + " — " + centru.oras : "—"],
        ["Data", fd.get("data") ? SOI.dateRO(new Date(fd.get("data") + "T00:00:00")) : "—"],
        ["Ora", fd.get("ora") || "—"],
        ["Prima donare", fd.get("prima") ? "Da" : "Nu"]
      ];
      sumHost.innerHTML = '<div class="table-wrap"><table style="min-width:0"><tbody>' +
        rows.map(function (r) {
          return '<tr><th scope="row" style="width:38%">' + esc(r[0]) + '</th><td style="text-align:left">' + esc(r[1] || "—") + '</td></tr>';
        }).join("") + '</tbody></table></div>';
    }

    btnNext.addEventListener("click", function () { if (validStep()) show(idx + 1); });
    btnPrev.addEventListener("click", function () { show(idx - 1); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validStep()) { SOI.toast("Mai sunt câmpuri de completat.", "err"); return; }
      var fd = new FormData(form);
      var centru = SOI.CENTRE.filter(function (c) { return c.id === fd.get("centru"); })[0];
      var rec = {
        cod: "SOI-" + String(Date.now()).slice(-6),
        nume: fd.get("nume"), email: fd.get("email"), telefon: fd.get("telefon"),
        grupa: fd.get("grupa") || "necunoscută",
        centru: centru ? centru.nume : "", oras: centru ? centru.oras : "",
        data: fd.get("data"), ora: fd.get("ora")
      };
      var istoric = SOI.store.get("soi-programari", []);
      istoric.push(rec);
      SOI.store.set("soi-programari", istoric);

      form.classList.add("hidden");
      $("[data-stepper]", host).classList.add("hidden");
      doneHost.classList.remove("hidden");
      doneHost.innerHTML = '<div class="card center">' +
        '<div class="card__icon" style="margin-inline:auto">✓</div>' +
        '<h2 class="mb-2">Programarea ta este înregistrată</h2>' +
        '<p class="lead">Cod programare: <strong>' + esc(rec.cod) + '</strong></p>' +
        '<p class="mt-2">' + esc(rec.nume) + ', te așteptăm pe <strong>' +
          esc(SOI.dateRO(new Date(rec.data + "T00:00:00"))) + '</strong> la ora <strong>' + esc(rec.ora) + '</strong>' +
          (rec.centru ? ' la ' + esc(rec.centru) : "") + '.</p>' +
        '<div class="alert alert--warn mt-3" style="text-align:left"><div><strong>Nu uita:</strong>' +
          'buletinul, o masă ușoară înainte, multe lichide și fără alcool în ultimele 48 de ore.</div></div>' +
        '<div class="row mt-3" style="justify-content:center">' +
          '<button class="btn" data-prog-ics>Adaugă în calendar</button>' +
          '<a class="btn btn--ghost" href="doneaza.html">Cum mă pregătesc</a>' +
        '</div></div>';
      doneHost.querySelector("[data-prog-ics]").addEventListener("click", function () {
        downloadICS(rec.data, "Donare de sânge — " + rec.ora,
          "Programare " + rec.cod + (rec.centru ? " la " + rec.centru : "") + ". Adu buletinul.");
      });
      doneHost.scrollIntoView({ behavior: "smooth", block: "center" });
      SOI.toast("Programare confirmată: " + rec.cod, "ok");
    });

    show(0);
  }

  /* =========================================================
     7. Întrebări frecvente — căutare + categorii
     ========================================================= */
  function initFaq() {
    var host = $("[data-faq]");
    if (!host) return;
    var list = $("[data-faq-list]", host);
    var q    = $("[data-faq-q]", host);
    var cats = $("[data-faq-cats]", host);
    var count = $("[data-faq-count]", host);
    var activeCat = "";

    var categorii = SOI.FAQ.map(function (f) { return f.c; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
    cats.innerHTML = '<button type="button" class="bg-pill is-on" data-cat="">Toate</button>' +
      categorii.map(function (c) { return '<button type="button" class="bg-pill" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join("");

    function render() {
      var term = (q.value || "").trim().toLowerCase();
      var res = SOI.FAQ.filter(function (f) {
        if (activeCat && f.c !== activeCat) return false;
        if (!term) return true;
        return (f.q + " " + f.a).toLowerCase().indexOf(term) !== -1;
      });
      count.textContent = res.length + (res.length === 1 ? " întrebare" : " întrebări");

      if (!res.length) {
        list.innerHTML = '<div class="empty"><p><strong>Nu am găsit nimic pentru „' + esc(q.value) + '”.</strong></p>' +
          '<p class="small">Scrie-ne direct — răspundem în cel mult o zi lucrătoare.</p>' +
          '<a class="btn btn--sm mt-2" href="contact.html">Pune întrebarea</a></div>';
        return;
      }

      list.innerHTML = res.map(function (f, i) {
        return '<div class="acc">' +
          '<button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq-p-' + i + '">' +
          '<span>' + esc(f.q) + '</span><span class="acc__ic" aria-hidden="true">+</span></button>' +
          '<div class="acc__body" id="faq-p-' + i + '"><div><p>' + esc(f.a) + '</p></div></div>' +
          '</div>';
      }).join("");
    }

    q.addEventListener("input", SOI.debounce(render, 160));
    cats.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]"); if (!b) return;
      activeCat = b.dataset.cat;
      $$(".bg-pill", cats).forEach(function (x) { x.classList.toggle("is-on", x === b); });
      render();
    });
    render();
  }

  /* =========================================================
     8. Formular de contact
     ========================================================= */
  function initContact() {
    var form = $("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SOI.validate(form)) { SOI.toast("Verifică datele completate.", "err"); return; }
      var nume = String(new FormData(form).get("nume") || "").split(" ")[0];
      form.innerHTML = '<div class="alert alert--ok"><div><strong>Mulțumim, ' + esc(nume) + '!</strong>' +
        'Mesajul tău a fost înregistrat. Îți răspundem pe e-mail în cel mult o zi lucrătoare.</div></div>';
      SOI.toast("Mesaj trimis.", "ok");
    });
  }

  /* =========================================================
     9. Mituri (pagina „Donează”)
     ========================================================= */
  function initMituri() {
    var host = $("[data-mituri]");
    if (!host) return;
    host.innerHTML = SOI.MITURI.map(function (m, i) {
      return '<article class="card rv" data-delay="' + (i * 70) + '">' +
        '<span class="badge badge--err mb-2">Mit</span>' +
        '<h3 style="font-size:1.05rem">' + esc(m.mit) + '</h3>' +
        '<span class="badge badge--ok mt-2 mb-2">Realitate</span>' +
        '<p>' + esc(m.adevar) + '</p></article>';
    }).join("");
    $$(".rv", host).forEach(function (el) { el.classList.add("is-in"); });
  }

  /* =========================================================
     10. Distribuția grupelor (pagina compatibilitate)
     ========================================================= */
  function initFrecventa() {
    var host = $("[data-frecventa]");
    if (!host) return;
    var max = Math.max.apply(null, SOI.GRUPE.map(function (g) { return SOI.FRECVENTA[g]; }));
    host.innerHTML = SOI.GRUPE.map(function (g) {
      var v = SOI.FRECVENTA[g];
      return '<div style="display:grid;grid-template-columns:3rem 1fr 3rem;gap:.8rem;align-items:center;margin-bottom:.55rem">' +
        '<strong>' + g + '</strong>' +
        '<div style="height:.7rem;background:var(--surface-2);border-radius:99px;overflow:hidden">' +
        '<div style="height:100%;width:' + (v / max * 100) + '%;background:linear-gradient(90deg,var(--red-400),var(--red-700));border-radius:99px"></div></div>' +
        '<span class="small muted" style="text-align:right">' + v + '%</span></div>';
    }).join("");
  }

  /* ---------- pornire ---------- */
  function boot() {
    initEligibilitate();
    initInterval();
    initCompatibilitate();
    initCentre();
    initUrgente();
    initProgramare();
    initFaq();
    initContact();
    initMituri();
    initFrecventa();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
