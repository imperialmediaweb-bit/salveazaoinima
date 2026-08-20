# Salvează o Inimă — site v2

Platformă demonstrativă de strângere de fonduri pentru operațiile pe cord ale
copiilor — reconstrucția modernă a salveazaoinima.ro. Opt pagini statice, fără
build, fără dependențe externe.

## Identitate preluată din site-ul original

- **Culori** (extrase din CSS-ul original): roșu `#E41127`, albastru `#1142E4`,
  galben `#FEEDBA`, roz pal `#FDE6E9`, gri `#333` / `#F2F2F2`.
- **Fonturi**: Bree Serif (titluri) + Open Sans (text) — găzduite local în
  `assets/fonts/` (subset latin + latin-ext, ~100 KB total).

## Pagini

| Fișier | Ce conține |
| --- | --- |
| `index.html` | Slider hero (3 slide-uri), statistici animate, slider cazuri urgente, cum funcționează, CTA 3,5%/20%, testimoniale, marquee sponsori |
| `cazuri.html` | Toate campaniile: căutare, filtru stare, sortare, bare de progres |
| `caz.html?c=slug` | Pagina campaniei: poveste, cronologie actualizări, casetă de donație cu sume și impact, confetti, share, bara mobilă lipită jos |
| `doneaza.html` | Trei tab-uri: donație directă · formular 230 (3,5%) cu previzualizare tipăribilă · calculator sponsorizare 20% firme |
| `sponsori.html` | Sponsori principali + susținători, marquee, CTA firme |
| `despre.html` | Principii, echipă, premii, testimoniale |
| `faq.html` | Întrebări cu căutare și categorii |
| `contact.html` | Formular validat + date donații + deschidere campanie |

## Imagini

Site-ul funcționează fără nicio imagine: unde lipsește poza apare un substitut
cu inițialele, pe gradient. Ca să folosești pozele reale, pune fișierele așa:

```
assets/img/cazuri/<slug>.jpg     fotografia fiecărui caz (ex. david-t.jpg)
assets/img/slides/1.jpg …3.jpg   fundalurile sliderului de pe prima pagină
assets/img/sponsori/<id>.png     logo-urile sponsorilor (ex. s1.png)
assets/img/echipa/<id>.jpg       pozele echipei (ex. e1.jpg)
```

Apar automat, fără nicio modificare de cod. Atenție: repo-ul e public — nu
urca fotografii cu minori fără acordul familiilor.

## Structură

```
assets/css/style.css   sistemul de design (tokens = culorile, într-un singur loc)
assets/css/fonts.css   @font-face pentru fonturile locale
assets/js/data.js      cazuri, sponsori, echipă, testimoniale, FAQ — TOATE DEMO
assets/js/app.js       temă light/dark, slider generic, animații, validare
assets/js/features.js  logica fiecărei pagini
tools/copiaza-site.sh  descarcă o copie statică a unui site public (wget/curl)
```

## Rulare locală

```bash
npx http-server -p 8080    # sau: python3 -m http.server 8080
```

## Înainte de publicare

1. **Toate datele din `assets/js/data.js` sunt fictive** — cazuri, sume,
   sponsori, testimoniale, premii. Înlocuiește-le cu cele reale.
2. **Formularele nu trimit nimic** — donația e simulată local, formularul 230
   e o machetă tipăribilă, nu cel oficial ANAF. Pentru funcționare reală e
   nevoie de procesator de plăți și backend.
3. IBAN-ul și contactele din `contact.html` sunt substituenți.
4. Copia site-ului vechi este pe branch-ul `copie-site`.

## Licențe

Bree Serif (SIL OFL 1.1), Open Sans (SIL OFL 1.1) — via Google Fonts.
