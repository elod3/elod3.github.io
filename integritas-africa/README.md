# Kusekwa · clasa a XII-a, Liceul Integritas

Pagina de strângere de fonduri pentru misiunea clasei a XII-a la **Școala Adventistă Kusekwa**
(lângă Bariadi, regiunea Simiyu, Tanzania): o biserică și un dispensar pentru 700 de elevi
și profesori. Nu mai e concept — intră live.

Static: `index.html`, `style.css`, `app.js`, `atlas.js`, `assets/`.
Fără CDN: GSAP 3.15 + ScrollTrigger și Lenis 1.3.26 stau în `assets/vendor/`.
Fonturile sunt ale școlii (Lora, Montserrat), locale.

## Decizia estetică

- **Public:** părinți, firme din Mureș, biserici, absolvenți, plus oricine primește linkul pe
  Instagram. Oameni care dau bani dacă văd exact unde ajung.
- **Ton:** al elevilor, la persoana I. Fraze scurte, cifre reale, zero limbaj de instituție.
  Textele vechi luate de pe site-ul școlii („misiune / viziune / valori”) au fost scoase: sunt
  corporate și nu le-ar spune niciun elev cu voce tare.
- **Trei lumini, în ordinea drumului:** hârtie crem (drumul desenat) → apus de savană (oamenii)
  → hârtie (cifrele și donația). Fiecare schimbare de lumină marchează o schimbare de loc.
- **Elementul memorabil:** atlasul. Globul se desenează singur cu linia, pe hârtie crem, apoi
  pleacă punctul din Târgu Mureș: autocar până la Budapesta, avion până la Nairobi, mașină prin
  savană până la școală. Camera coboară și urcă odată cu ei. Animația *este* argumentul: arată
  cât de departe pleacă treizeci de adolescenți.
- **Al doilea element:** biserica izometrică din actul IV, cu linii groase, care se construiește
  sub cursor (pe telefon, la derulare). Donația e clădirea care crește.
- **Montserrat** iese la `slop_scan.py` ca „font sigur”, dar e fontul real al școlii, din CSS-ul
  lor live. Scanner: **P0 = 0, P1 = 2 (ambele Montserrat), P2 = 0**.

## Atlasul

`atlas.js` e un modul ES. Desenează globul cu linia, pe hârtie crem, în limbajul hairline:
trei greutăți de linie — `lo` punctat (paralele, meridiane, granițe), `edge` (țărmuri),
`hi` (drumul și vehiculele) — toate cu capete rotunde.

- **Fără 3D, fără WebGL, fără texturi.** Proiecție ortografică scrisă de mână (vreo 20 de linii),
  fără d3. De aici vine și mersul lin: 940 KB tot proiectul, în loc de 3,5 MB.
- Geografia: **Natural Earth 110m** (domeniu public) — țărmuri, granițe, lacuri — simplificată
  cu Douglas-Peucker la 9.671 de puncte, 120 KB în `assets/atlas.json`.
- **Se desenează singur**: cercul, apoi paralelele și meridianele unul câte unul, apoi țărmurile,
  fiecare ca din creion. O parte la intrarea în pagină, restul din scroll.
- Drumul apare întâi **punctat**, ca un plan, apoi se umple pe măsură ce îl parcurgem.
- Coregrafia apropierii, în `CONFIG.zoomPace`: desenăm lumea întreagă → **coborâm la Târgu Mureș**
  (autocarul se vede mergând până la Budapesta) → **urcăm la decolare**, globul se deschide →
  zborul până la Nairobi → **coborâm în savană** pentru ultima etapă cu mașina.
  Fără coborâre, Mureș și Budapesta sunt la 15 px distanță și totul se calcă.
- Vehiculele sunt desenate tot din linii și își păstrează mărimea pe ecran. Autobuzul și mașina
  se leagănă puțin; avionul se întoarce după direcția de mers.
- Urmărirea e amortizată exponențial, nu legată direct de scroll — de aici vine mersul „frumos”.
- Liniile complet în afara ecranului nu se mai desenează (contează la zoom 9).
- Fără modul sau cu `prefers-reduced-motion`: `body.no-atlas`, etapele devin blocuri de text.

## Plata

Fișa stă fix în dreapta de la 1180 px în sus (intră abia după glob, ca să nu-i fure scena);
sub, coboară în secțiunea de donație și apare o bară de CTA jos.

Tot ce e de configurat stă în `CONFIG`, în capul lui `app.js`:

| cheie | ce e |
|---|---|
| `stripeLink` | Payment Link-ul școlii, cu „clientul alege suma”. **Card, Google Pay și Apple Pay apar automat** pe pagina Stripe, fără backend și fără verificare de domeniu. Gol = butonul duce la `/donatii`. |
| `paypalLink` | buton separat; apare doar dacă e completat. PayPal **nu** merge prin Stripe pe un cont din România. |
| `stops` | opririle, cu `mode: 'road' \| 'air'`. Schimbi lista, se redesenează tot drumul. |
| `pace`, `drawPace`, `zoomPace` | ritmul scroll → drum, desen, apropiere. |

## Cifre și de unde vin

Distanțele sunt calculate între coordonatele opririlor, **în linie dreaptă** (haversine).
Pe șosea sunt mai mari, deci toate sunt afirmații prudente.

| etapă | km |
|---|---|
| Târgu Mureș → Budapesta (autocar) | 432 |
| Budapesta → Istanbul → Nairobi (avion) | 5.840 |
| Nairobi → Sirari → Bariadi → Kusekwa (mașină) | 466 |
| **total** | **6.737** |

Restul datelor: 700 de elevi și profesori, replicile celor trei voci, biserica și dispensarul,
cele patru clase care au mers în Africa — din scenariul clipului scris de clasă.
IBAN-urile, beneficiarul și contactul: pagina de donații a școlii.
Conturile de Instagram, YouTube și Facebook: pagina /media a școlii.

Fotografia din Kenya e singura poză reală din Africa pe care o avem. Pozele din galeria școlii
au fost scoase: nu sunt din Africa.

## De completat înainte de lansare

- `CONFIG.stripeLink` și, dacă există cont, `CONFIG.paypalLink`
- costurile din tabelul „Cât costă” (biserică, dispensar, drumul celor 30) și totalul de strâns
- mențiunea cerută la detaliile plății bancare
- data plecării și coordonatele exacte ale școlii Kusekwa (acum e aproximativă)
- confirmarea cu școala că donațiile pentru misiune merg în contul Fundației Educatio Plena
- **`noindex` e încă pus.** Pagina stă pe domeniul de portofoliu, nu pe al școlii. Se scoate
  când se mută pe `liceulintegritas.ro`, sau mai devreme dacă școala vrea să fie găsită în Google.
