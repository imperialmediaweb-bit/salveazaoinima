# Salvează o Inimă

Site de campanie pentru donarea de sânge — 8 pagini, complet static, fără build,
fără dependențe externe. Se deschide direct în browser sau se pune pe orice hosting.

## Pagini

| Fișier | Ce conține |
| --- | --- |
| `index.html` | Pagina principală: hero animat, statistici cu contoare, de ce contează, cum funcționează |
| `doneaza.html` | Test de eligibilitate, pregătirea înainte/după, ce se întâmplă la centru, mituri |
| `programare.html` | Formular de programare în 4 pași, cu validare și confirmare |
| `urgente.html` | Cereri urgente filtrabile + formular de publicare a unei cereri |
| `compatibilitate.html` | Calculator de compatibilitate a grupelor + tabelul complet |
| `centre.html` | Lista centrelor, cu căutare și filtrare pe județ |
| `faq.html` | Întrebări frecvente cu căutare și filtrare pe categorii |
| `contact.html` | Formular de contact și secțiunea „despre proiect” |

## Funcționalități

- **Test de eligibilitate** — 10 criterii, verdict în timp real, criterii obligatorii vs. recomandări.
- **Calculator compatibilitate** — mod „donez” / „primesc”, globule roșii și plasmă, tabel 8×8, frecvența grupelor.
- **Calculator interval** — când poți dona din nou, cu export `.ics` pentru calendar.
- **Programare în 4 pași** — validare per pas, sumar înainte de trimitere, cod de programare, export `.ics`.
- **Cereri urgente** — sortate după urgență, filtrare pe grupă / oraș, plus filtrul „cui pot dona cu grupa mea”.
- **Publicare cerere** — formular care adaugă cererea în listă.
- **Căutare** — în centre și în întrebările frecvente.
- **Temă deschisă / închisă** — comutator persistent, respectă și preferința sistemului.
- **Animații** — apariție la scroll, contoare, bară de progres, toate dezactivate automat la `prefers-reduced-motion`.
- **Accesibilitate** — navigare la tastatură, `aria-*`, link „sari la conținut”, focus vizibil, contrast verificat în ambele teme.

## Structură

```
index.html … contact.html      paginile
assets/css/style.css           sistemul de design (tokens, componente, layout)
assets/css/fonts.css           @font-face pentru fontul local
assets/fonts/*.woff2           Plus Jakarta Sans (variabil, subset latin + latin-ext)
assets/js/data.js              datele: grupe, centre, cereri, criterii, întrebări
assets/js/app.js               nucleul: temă, navigație, animații, validare, utilitare
assets/js/features.js          funcționalitățile fiecărei pagini
```

## Rulare locală

```bash
npx http-server -p 8080     # sau: python3 -m http.server 8080
```

Apoi deschide <http://localhost:8080>.

> Deschiderea directă prin `file://` funcționează, dar browserul blochează
> preîncărcarea fontului din motive de CORS. Folosește un server local.

## Înainte de publicare

1. **Datele centrelor din `assets/js/data.js` sunt demonstrative.** Înlocuiește adresele,
   telefoanele și programul cu datele reale. Pagina `centre.html` afișează un avertisment
   până când faci asta — șterge-l după.
2. **Formularele nu trimit nimic către un server.** Programările, cererile și mesajele se
   salvează doar în `localStorage`, în browserul vizitatorului. Pentru funcționare reală,
   conectează-le la un backend sau la un serviciu de formulare.
3. **Cererile urgente sunt exemple.** Șterge `SOI.CERERI_SEED` sau înlocuiește-l cu date reale.
4. Verifică textele medicale cu un cadru medical din centrul de transfuzie.

## Licențe

Fontul Plus Jakarta Sans este distribuit sub SIL Open Font License 1.1.
