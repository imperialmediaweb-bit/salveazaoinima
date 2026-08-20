/* ==========================================================================
   Date demonstrative — platforma Salvează o Inimă
   TOATE cazurile, sumele, sponsorii și testimonialele sunt DATE DE TEST.
   Înlocuiește-le cu datele reale înainte de publicare.

   IMAGINI: fiecare caz caută poza în assets/img/cazuri/<slug>.jpg.
   Dacă poza lipsește, apare automat un substitut cu inițialele.
   La fel: sponsori -> assets/img/sponsori/<id>.png,
           echipă   -> assets/img/echipa/<id>.jpg,
           slider   -> assets/img/slides/<n>.jpg.
   ========================================================================== */
window.SOI = window.SOI || {};

/* --- Cazuri (campanii) -------------------------------------------------- */
SOI.CAZURI = [
  { slug: "david-t", nume: "David T.", varsta: 6, oras: "Cluj-Napoca",
    diagnostic: "Malformație cardiacă congenitală",
    poveste: "David s-a născut cu o inimă care bate altfel. Operația care i-ar da o copilărie normală se poate face într-o clinică din Italia, iar familia nu poate acoperi singură costul.",
    target: 45000, strans: 31200, donatori: 412, urgent: true, activ: true,
    updates: [
      { data: "2026-08-12", text: "Am primit programarea la clinică pentru luna octombrie." },
      { data: "2026-07-28", text: "S-a strâns 60% din suma necesară. Mulțumim!" },
      { data: "2026-07-02", text: "Campania a fost lansată." }
    ] },
  { slug: "diana-c", nume: "Diana C.", varsta: 4, oras: "București",
    diagnostic: "Tetralogie Fallot",
    poveste: "Diana obosește după câțiva pași de joacă. Intervenția pe cord deschis îi poate reda energia oricărui copil de vârsta ei. Fiecare donație o aduce mai aproape de operație.",
    target: 60000, strans: 18750, donatori: 263, urgent: true, activ: true,
    updates: [
      { data: "2026-08-05", text: "Dosarul medical a fost acceptat de clinică." },
      { data: "2026-07-15", text: "Campania a fost lansată." }
    ] },
  { slug: "matei-t", nume: "Matei T.", varsta: 9, oras: "Iași",
    diagnostic: "Cardiomiopatie dilatativă",
    poveste: "Matei visează să joace fotbal cu colegii. Tratamentul de specialitate și monitorizarea lunară costă mai mult decât își permite familia lui.",
    target: 30000, strans: 27900, donatori: 388, urgent: false, activ: true,
    updates: [
      { data: "2026-08-10", text: "Mai avem nevoie de doar 2.100 € — suntem aproape!" },
      { data: "2026-06-20", text: "Campania a fost lansată." }
    ] },
  { slug: "larisa-n", nume: "Larisa N.", varsta: 2, oras: "Timișoara",
    diagnostic: "Defect septal ventricular",
    poveste: "La doi ani, Larisa a petrecut mai mult timp în spitale decât acasă. O singură intervenție îi poate închide „gaura din inimă” despre care vorbesc medicii.",
    target: 38000, strans: 9350, donatori: 141, urgent: true, activ: true,
    updates: [ { data: "2026-08-01", text: "Campania a fost lansată." } ] },
  { slug: "rafael-c", nume: "Rafael C.", varsta: 7, oras: "Brașov",
    diagnostic: "Stenoză aortică severă",
    poveste: "Rafael desenează inimi pe toate caietele lui — spune că așa o încurajează pe a lui. Operația trebuie făcută înainte ca inima să obosească de tot.",
    target: 52000, strans: 41600, donatori: 529, urgent: false, activ: true,
    updates: [
      { data: "2026-08-14", text: "80% strâns. Operația a fost programată provizoriu." },
      { data: "2026-05-30", text: "Campania a fost lansată." }
    ] },
  { slug: "ana-s", nume: "Ana S.", varsta: 12, oras: "Constanța",
    diagnostic: "Aritmie ventriculară — necesită defibrilator implantabil",
    poveste: "Ana a leșinat de două ori la școală. Un mic aparat implantat i-ar păzi inima zi și noapte, dar dispozitivul și intervenția depășesc puterile familiei.",
    target: 25000, strans: 25000, donatori: 344, urgent: false, activ: false,
    updates: [
      { data: "2026-07-19", text: "SUMA A FOST STRÂNSĂ. Operația a reușit — Ana e acasă!" },
      { data: "2026-04-11", text: "Campania a fost lansată." }
    ] },
  { slug: "andrei-l", nume: "Andrei L.", varsta: 5, oras: "Oradea",
    diagnostic: "Transpoziție de vase mari, operată — recuperare",
    poveste: "Operația lui Andrei a reușit. Acum are nevoie de un an de recuperare cardiologică și controale trimestriale în străinătate.",
    target: 15000, strans: 15000, donatori: 209, urgent: false, activ: false,
    updates: [ { data: "2026-06-02", text: "Campanie încheiată cu succes. Mulțumim!" } ] },
  { slug: "sara-h", nume: "Sara H.", varsta: 8, oras: "Sibiu",
    diagnostic: "Insuficiență mitrală",
    poveste: "Sara cântă în corul școlii, dar vocea ei obosește odată cu inima. Repararea valvei i-ar reda suflul — la propriu.",
    target: 47000, strans: 6100, donatori: 87, urgent: false, activ: true,
    updates: [ { data: "2026-08-16", text: "Campania a fost lansată." } ] }
];

/* --- Sponsori (DEMO) ---------------------------------------------------- */
SOI.SPONSORI = {
  principali: [
    { id: "s1", nume: "TermoPlus Energy" }, { id: "s2", nume: "Banca Crescendo" },
    { id: "s3", nume: "Farmacia Vitalis" }, { id: "s4", nume: "AutoDrive Group" }
  ],
  sustinatori: [
    { id: "s5", nume: "Panificația Spicul" }, { id: "s6", nume: "IT Nova Software" },
    { id: "s7", nume: "Transporturi Rapid" }, { id: "s8", nume: "Clinica San-Med" },
    { id: "s9", nume: "Librăria Pagina" }, { id: "s10", nume: "GreenBuild Construct" },
    { id: "s11", nume: "Hotel Belvedere" }, { id: "s12", nume: "Radio Armonia" },
    { id: "s13", nume: "Tipografia Color" }, { id: "s14", nume: "AgroFerm SRL" },
    { id: "s15", nume: "Optica Clara" }, { id: "s16", nume: "Cafeneaua Centrală" }
  ]
};

/* --- Echipa (DEMO) ------------------------------------------------------ */
SOI.ECHIPA = [
  { id: "e1", nume: "Ioana Marinescu", rol: "Președinte fondator",
    text: "A pornit asociația după ce propriul copil a trecut printr-o operație pe cord." },
  { id: "e2", nume: "Dr. Radu Popa", rol: "Consultant medical",
    text: "Cardiolog pediatru. Evaluează fiecare dosar înainte de lansarea campaniei." },
  { id: "e3", nume: "Elena Dobre", rol: "Coordonator campanii",
    text: "Ține legătura cu familiile și publică actualizările fiecărui caz." },
  { id: "e4", nume: "Mihai Stancu", rol: "Relația cu sponsorii",
    text: "Construiește parteneriatele care susțin cazurile fără vizibilitate." }
];

/* --- Testimoniale (DEMO) ------------------------------------------------ */
SOI.TESTIMONIALE = [
  { autor: "Mama lui David", text: "Când am primit diagnosticul, ni s-a părut că lumea se oprește. Oamenii care au donat ne-au arătat că nu suntem singuri. Fiecare leu a fost o îmbrățișare." },
  { autor: "Familia Anei", text: "Ana e acasă, aleargă și râde. Asta au făcut donațiile voastre. Nu există cuvinte pentru recunoștința noastră." },
  { autor: "Un donator lunar", text: "Donez 50 de lei pe lună, cât două cafele pe săptămână. Când citesc actualizările campaniilor, știu exact unde a ajuns fiecare leu." },
  { autor: "Sponsor — IT Nova", text: "Am redirecționat 20% din impozitul pe profit. Ne-a costat zero și a plătit o treime dintr-o operație. Orice firmă poate face asta." }
];

/* --- Premii / recunoașteri (DEMO) --------------------------------------- */
SOI.PREMII = [
  { an: "2025", titlu: "Gala Societății Civile", detaliu: "Premiul I — secțiunea Sănătate" },
  { an: "2024", titlu: "ONG-ul Anului", detaliu: "Nominalizare — campanii medicale" },
  { an: "2023", titlu: "Premiul Comunității", detaliu: "Pentru transparență în raportare" }
];

/* --- Statistici (DEMO) --------------------------------------------------- */
SOI.STATS = { copiiAjutati: 214, stransTotal: 3800000, donatori: 46500, sponsori: 180 };

/* --- Întrebări frecvente ------------------------------------------------- */
SOI.FAQ = [
  { c: "Donații", q: "Cum ajunge donația mea la copil?",
    a: "Fiecare campanie are un cont dedicat. Banii se folosesc exclusiv pentru costurile medicale ale cazului respectiv — clinică, transport, tratament — iar fiecare plată este documentată în actualizările campaniei." },
  { c: "Donații", q: "Pot dona lunar?",
    a: "Da. Donația recurentă este forma de sprijin cea mai valoroasă, pentru că ne permite să ne angajăm la cazuri noi știind pe ce ne putem baza. O poți opri oricând." },
  { c: "Donații", q: "Primesc dovada donației?",
    a: "Da, primești automat pe e-mail confirmarea fiecărei donații. La cerere, eliberăm și documente pentru deducerea fiscală." },
  { c: "Redirecționare 3,5%", q: "Ce este formularul 230?",
    a: "Salariații pot direcționa 3,5% din impozitul pe venit deja plătit statului către o organizație nonprofit. Nu te costă nimic — e o parte din impozit care oricum s-a reținut. Se depune o dată pe an." },
  { c: "Redirecționare 3,5%", q: "Până când pot depune formularul 230?",
    a: "De regulă până pe 25 mai a anului curent, pentru veniturile anului precedent. Îl poți depune online prin SPV, prin noi sau direct la ANAF." },
  { c: "Sponsorizări", q: "Cum funcționează sponsorizarea de 20% pentru firme?",
    a: "Firmele plătitoare de impozit pe profit pot direcționa 20% din impozitul datorat (în limita a 0,75% din cifra de afaceri) către un ONG, în baza unui contract de sponsorizare. Suma se scade din impozit — costul real pentru firmă este zero." },
  { c: "Sponsorizări", q: "Ce primește firma în schimb?",
    a: "Contract de sponsorizare, raport de utilizare a fondurilor, prezența în galeria sponsorilor și, la campaniile mari, menționarea în comunicarea publică. Dar cel mai important: un copil operat." },
  { c: "Transparență", q: "De unde știu că banii ajung unde trebuie?",
    a: "Fiecare caz este verificat medical înainte de lansare, plățile se fac direct către clinici acolo unde este posibil, iar rapoartele anuale sunt publice. Actualizările campaniilor arată stadiul fiecărui caz." },
  { c: "Transparență", q: "Cine alege cazurile?",
    a: "Un consultant medical evaluează dosarul, iar echipa verifică situația familiei. Prioritate au urgențele — cazurile în care întârzierea operației pune viața în pericol." },
  { c: "Cazuri", q: "Am un copil bolnav. Cum deschid o campanie?",
    a: "Scrie-ne prin pagina de contact, cu diagnosticul și documentele medicale. Răspundem în cel mult 3 zile lucrătoare. Dacă dosarul este eligibil, campania se lansează în aproximativ o săptămână." },
  { c: "Cazuri", q: "Ce se întâmplă dacă se strânge mai mult decât suma necesară?",
    a: "Surplusul se mută, cu acordul donatorilor exprimat la donare, către următorul caz urgent de pe platformă. Totul se anunță transparent în actualizările campaniei." }
];
