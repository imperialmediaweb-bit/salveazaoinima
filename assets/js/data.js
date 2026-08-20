/* ==========================================================================
   Date demonstrative pentru salveazaoinima.ro
   IMPORTANT: adresele, telefoanele si programul sunt DATE DE TEST (demo).
   Inlocuieste-le cu datele reale ale centrelor inainte de publicare.
   ========================================================================== */
window.SOI = window.SOI || {};

/* --- Grupe sanguine --------------------------------------------------- */
SOI.GRUPE = ["0-", "0+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

/* Cine poate PRIMI de la cine (globule rosii).
   donatori[grupa] = lista grupelor de la care grupa respectiva poate primi. */
SOI.PRIMESTE_DE_LA = {
  "0-":  ["0-"],
  "0+":  ["0-", "0+"],
  "A-":  ["0-", "A-"],
  "A+":  ["0-", "0+", "A-", "A+"],
  "B-":  ["0-", "B-"],
  "B+":  ["0-", "0+", "B-", "B+"],
  "AB-": ["0-", "A-", "B-", "AB-"],
  "AB+": SOI.GRUPE.slice()
};

/* Cine poate DONA catre cine — derivat din tabelul de mai sus. */
SOI.DONEAZA_CATRE = (function () {
  var out = {};
  SOI.GRUPE.forEach(function (g) { out[g] = []; });
  SOI.GRUPE.forEach(function (primitor) {
    SOI.PRIMESTE_DE_LA[primitor].forEach(function (donator) {
      out[donator].push(primitor);
    });
  });
  return out;
})();

/* Plasma merge invers fata de globulele rosii. */
SOI.PLASMA_DONEAZA_CATRE = {
  "AB+": SOI.GRUPE.slice(), "AB-": SOI.GRUPE.slice(),
  "A+":  ["A+", "A-", "0+", "0-"], "A-": ["A+", "A-", "0+", "0-"],
  "B+":  ["B+", "B-", "0+", "0-"], "B-": ["B+", "B-", "0+", "0-"],
  "0+":  ["0+", "0-"], "0-": ["0+", "0-"]
};

/* Raspandirea aproximativa a grupelor in populatia Romaniei (%) — orientativ. */
SOI.FRECVENTA = {
  "0+": 32, "A+": 34, "B+": 15, "AB+": 6,
  "0-": 5,  "A-": 5,  "B-": 2,  "AB-": 1
};

/* --- Centre de donare (DEMO) ------------------------------------------ */
SOI.CENTRE = [
  { id: "buc-1", nume: "Centrul de Transfuzie Sanguină București", oras: "București", judet: "București",
    program: "Luni–Vineri 07:30–13:00", telefon: "—", obs: "Programare online recomandată", capacitate: "mare" },
  { id: "cluj-1", nume: "Centrul de Transfuzie Sanguină Cluj", oras: "Cluj-Napoca", judet: "Cluj",
    program: "Luni–Vineri 07:30–12:30", telefon: "—", obs: "Parcare gratuită pentru donatori", capacitate: "mare" },
  { id: "iasi-1", nume: "Centrul de Transfuzie Sanguină Iași", oras: "Iași", judet: "Iași",
    program: "Luni–Vineri 07:30–12:30", telefon: "—", obs: "Acces persoane cu dizabilități", capacitate: "mare" },
  { id: "tm-1", nume: "Centrul de Transfuzie Sanguină Timiș", oras: "Timișoara", judet: "Timiș",
    program: "Luni–Vineri 07:00–12:00", telefon: "—", obs: "Campanii mobile în weekend", capacitate: "mare" },
  { id: "ct-1", nume: "Centrul de Transfuzie Sanguină Constanța", oras: "Constanța", judet: "Constanța",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "Program prelungit vara", capacitate: "medie" },
  { id: "bv-1", nume: "Centrul de Transfuzie Sanguină Brașov", oras: "Brașov", judet: "Brașov",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "—", capacitate: "medie" },
  { id: "dj-1", nume: "Centrul de Transfuzie Sanguină Dolj", oras: "Craiova", judet: "Dolj",
    program: "Luni–Vineri 07:30–12:30", telefon: "—", obs: "—", capacitate: "medie" },
  { id: "sb-1", nume: "Centrul de Transfuzie Sanguină Sibiu", oras: "Sibiu", judet: "Sibiu",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "—", capacitate: "medie" },
  { id: "bh-1", nume: "Centrul de Transfuzie Sanguină Bihor", oras: "Oradea", judet: "Bihor",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "—", capacitate: "medie" },
  { id: "gl-1", nume: "Centrul de Transfuzie Sanguină Galați", oras: "Galați", judet: "Galați",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "—", capacitate: "medie" },
  { id: "ms-1", nume: "Centrul de Transfuzie Sanguină Mureș", oras: "Târgu Mureș", judet: "Mureș",
    program: "Luni–Vineri 07:30–12:30", telefon: "—", obs: "—", capacitate: "medie" },
  { id: "ph-1", nume: "Centrul de Transfuzie Sanguină Prahova", oras: "Ploiești", judet: "Prahova",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "—", capacitate: "mica" },
  { id: "ar-1", nume: "Centrul de Transfuzie Sanguină Arad", oras: "Arad", judet: "Arad",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "—", capacitate: "mica" },
  { id: "bc-1", nume: "Centrul de Transfuzie Sanguină Bacău", oras: "Bacău", judet: "Bacău",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "—", capacitate: "mica" },
  { id: "ag-1", nume: "Centrul de Transfuzie Sanguină Argeș", oras: "Pitești", judet: "Argeș",
    program: "Luni–Vineri 07:30–12:00", telefon: "—", obs: "—", capacitate: "mica" }
];

/* --- Cereri urgente (DEMO — se completeaza si din formularul din pagina) */
SOI.CERERI_SEED = [
  { id: "c1", grupa: "0-",  pacient: "Andrei M., 34 ani", spital: "Spital Județean", oras: "Cluj-Napoca",
    nevoie: "Politraumatism după accident rutier", unitati: 6, urgenta: "critica", zileRamase: 1 },
  { id: "c2", grupa: "A-",  pacient: "Maria T., 7 ani", spital: "Spital de Copii", oras: "București",
    nevoie: "Intervenție chirurgicală programată", unitati: 3, urgenta: "critica", zileRamase: 2 },
  { id: "c3", grupa: "B+",  pacient: "Ion V., 58 ani", spital: "Institut de Oncologie", oras: "Iași",
    nevoie: "Tratament oncologic — transfuzii repetate", unitati: 4, urgenta: "ridicata", zileRamase: 5 },
  { id: "c4", grupa: "0+",  pacient: "Elena R., 29 ani", spital: "Maternitate", oras: "Timișoara",
    nevoie: "Hemoragie post-partum", unitati: 2, urgenta: "ridicata", zileRamase: 3 },
  { id: "c5", grupa: "AB-", pacient: "Cristian P., 41 ani", spital: "Spital Municipal", oras: "Brașov",
    nevoie: "Anemie severă", unitati: 2, urgenta: "medie", zileRamase: 9 },
  { id: "c6", grupa: "A+",  pacient: "Gabriela S., 63 ani", spital: "Spital Județean", oras: "Constanța",
    nevoie: "Operație cardiovasculară", unitati: 5, urgenta: "ridicata", zileRamase: 4 }
];

/* --- Criterii de eligibilitate (chestionar) ---------------------------- */
SOI.CRITERII = [
  { id: "varsta",   text: "Am între 18 și 60 de ani (peste 60 doar cu avizul medicului).", blocant: true },
  { id: "greutate", text: "Am cel puțin 50 kg.", blocant: true },
  { id: "sanatate", text: "Mă simt sănătos/sănătoasă azi — fără febră, răceală sau infecție.", blocant: true },
  { id: "odihna",   text: "Am dormit cel puțin 6 ore în noaptea precedentă.", blocant: false },
  { id: "masa",     text: "Am mâncat ceva ușor și am băut lichide în ultimele ore.", blocant: false },
  { id: "alcool",   text: "Nu am consumat alcool în ultimele 48 de ore.", blocant: true },
  { id: "tatuaj",   text: "Nu mi-am făcut tatuaj, piercing sau tratament stomatologic major în ultimele 6 luni.", blocant: true },
  { id: "operatie", text: "Nu am suferit o intervenție chirurgicală în ultimele 6 luni.", blocant: true },
  { id: "sarcina",  text: "Nu sunt însărcinată și nu alăptez (dacă e cazul).", blocant: true },
  { id: "interval", text: "Au trecut cel puțin 3 luni de la ultima mea donare de sânge.", blocant: true }
];

/* --- Intrebari frecvente ---------------------------------------------- */
SOI.FAQ = [
  { c: "Donare", q: "Cât durează o donare de sânge?",
    a: "Recoltarea propriu-zisă durează 8–12 minute. Cu tot cu completarea chestionarului, consultul medical și cele 10–15 minute de odihnă de după, rezervă-ți aproximativ o oră." },
  { c: "Donare", q: "Cât sânge se recoltează?",
    a: "Aproximativ 450 ml, adică sub 10% din volumul total de sânge al unui adult. Organismul reface volumul de lichid în 24–48 de ore, iar globulele roșii în câteva săptămâni." },
  { c: "Donare", q: "Doare?",
    a: "Senzația este comparabilă cu o analiză de sânge obișnuită: o înțepătură scurtă la introducerea acului. Restul procedurii este nedureroasă." },
  { c: "Eligibilitate", q: "Cât de des pot dona?",
    a: "În general este necesar un interval de minimum 3 luni între donările de sânge integral. Numărul maxim de donări pe an diferă pentru bărbați și femei — medicul din centru îți confirmă intervalul potrivit pentru tine." },
  { c: "Eligibilitate", q: "Pot dona dacă am tatuaje?",
    a: "Da, dar de regulă după o perioadă de așteptare de 6 luni de la efectuarea tatuajului sau piercingului. Aceeași regulă se aplică pentru unele tratamente stomatologice." },
  { c: "Eligibilitate", q: "Pot dona dacă iau medicamente?",
    a: "Depinde de medicament. Unele tratamente nu reprezintă un impediment, altele impun o pauză. Menționează medicul din centru toate medicamentele pe care le iei — el decide." },
  { c: "Eligibilitate", q: "Pot dona dacă am avut COVID sau altă infecție?",
    a: "Da, după vindecarea completă și o perioadă de așteptare stabilită de medic. Prezintă-te la centru doar dacă te simți complet sănătos." },
  { c: "Pregătire", q: "Ce trebuie să fac înainte de donare?",
    a: "Dormi bine, mănâncă o masă ușoară (evită mâncarea grasă), bea multe lichide, evită alcoolul 48 de ore și fumatul cu o oră înainte. Nu veni pe stomacul gol." },
  { c: "Pregătire", q: "Ce acte îmi trebuie?",
    a: "Cartea de identitate. În unele centre îți poate fi cerut și cardul de sănătate — verifică telefonic înainte." },
  { c: "După donare", q: "Ce fac după ce donez?",
    a: "Rămâi 10–15 minute la centru, bea lichide, evită efortul fizic intens și consumul de alcool în ziua respectivă și nu fuma în prima oră. Dacă ameșești, întinde-te și ridică picioarele." },
  { c: "După donare", q: "Ce se întâmplă cu sângele donat?",
    a: "Este testat pentru boli transmisibile, apoi separat în componente: globule roșii, plasmă și trombocite. Astfel, o singură donare poate ajuta până la trei pacienți diferiți." },
  { c: "Beneficii", q: "Ce primesc ca donator?",
    a: "Analize gratuite ale sângelui donat, o zi liberă de la locul de muncă în ziua donării și beneficiile prevăzute de lege pentru donatori. Cel mai important beneficiu rămâne însă cel pe care nu-l vezi: un pacient care apucă ziua de mâine." },
  { c: "Grupe", q: "Ce înseamnă „donator universal”?",
    a: "Grupa 0 negativ poate dona globule roșii oricărei alte grupe, de aceea este cea mai căutată în urgențe. La plasmă lucrurile stau invers: AB este donatorul universal." },
  { c: "Grupe", q: "Nu-mi știu grupa de sânge. Pot dona?",
    a: "Da. Grupa se determină gratuit în centrul de donare, înainte de recoltare. Nu ai nevoie de analize făcute în prealabil." }
];

/* --- Mituri ------------------------------------------------------------ */
SOI.MITURI = [
  { mit: "Donarea te slăbește pentru mult timp.",
    adevar: "Volumul de lichid se reface în 24–48 de ore. Majoritatea donatorilor își reiau activitățile normale în aceeași zi." },
  { mit: "Poți lua o boală donând sânge.",
    adevar: "Tot materialul folosit este steril și de unică folosință. Riscul de infectare prin donare este zero." },
  { mit: "Dacă am o grupă comună, sângele meu nu e necesar.",
    adevar: "Exact invers: grupele comune sunt cele mai cerute, pentru că cei mai mulți pacienți le au. Nevoia este permanentă." },
  { mit: "Sângele se poate produce în laborator.",
    adevar: "Nu există încă niciun substitut. Singura sursă de sânge pentru un pacient este un alt om." }
];
