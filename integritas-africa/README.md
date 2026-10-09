# Kusekwa · clasa a XII-a, Liceul Integritas

Pagina de strângere de fonduri pentru misiunea clasei a XII-a la **Școala Adventistă Kusekwa**
(lângă Bariadi, regiunea Simiyu, Tanzania): o biserică și un dispensar pentru 700 de elevi
și profesori. Nu mai e concept — intră live.

Static: `index.html`, `style.css`, `app.js`, `atlas.js`, `assets/`.
Fonturile și bibliotecile sunt locale, în `assets/`. Vezi mai jos.

## Decizia estetică

- **Public:** părinți, firme din Mureș, biserici, absolvenți, plus oricine primește linkul pe
  Instagram. Oameni care dau bani dacă văd exact unde ajung.
- **Ton:** al elevilor, la persoana I. Fraze scurte, cifre reale, zero limbaj de instituție.
  Textele de pe site-ul școlii („misiune / viziune / valori”) nu apar deloc: sunt corporate și
  nu le-ar spune niciun elev cu voce tare.
- **Paletă: noapte de savană.** Fundal cald-închis (`#0b0a09`), subiectul în chihlimbar
  (`#e8742b`) și aur (`#c9a868`), apa și gradele în rece (`#4a7c80`). Contrastul cald/rece e
  gradarea de film, obținută din culoare, nu din gradiente decorative. Aurul vine din identitatea
  școlii; restul e ales pentru ecran, nu copiat de pe site-ul lor.
- **Trei roluri de literă, niciunul implicit:** **Fraunces** (variabilă) la titluri — are
  caracter, nu e un default; **Archivo** la text; **Martian Mono** la cifre, etichete și butoane,
  ca la un aparat de măsură. Toate locale, cu diacritice, 184 KB în total.
- **Se derulează și pe orizontală.** „Ce facem acolo” trece prin fața ta, nu pe sub ea: patru
  panouri pinned, mutate pe axa X cu scroll-ul.
- **Elementul memorabil:** atlasul. Globul se desenează singur cu linia, apoi pleacă punctul din
  Târgu Mureș: autocar la Budapesta, avion la Nairobi, mașină prin savană. Titlul se retrage în
  stânga-jos și se micșorează, iar globul intră în prim-plan. Animația *este* argumentul.
- **Al doilea:** linia de monitor din actul II. Bate la 68–77 pe minut, curge la nesfârșit în
  spatele textului și e acolo cu motiv: la standul din centru se măsoară tensiunea și saturația.
- **Al treilea:** biserica izometrică, cu linii groase, care se construiește sub cursor.
- `slop_scan.py`: **P0 = 0, P1 = 0, P2 = 0**.

## Bibliotecile

Toate locale, în `assets/vendor/`, fără CDN:

| ce | de ce |
|---|---|
| GSAP 3.15 + ScrollTrigger | coregrafia, pin-ul și scroll-ul pe orizontală |
| GSAP SplitText | titlurile intră pe rânduri, ca la generic de film (gratuit de la 3.13) |
| Lenis 1.3.26 | scroll lin |

Evaluate și refuzate: **three.js** (globul 3D se mișca sacadat și nu arăta a desen — scos),
**Lottie** (ar fi adus ~250 KB și un stil care nu se potrivește cu linia desenată de noi),
**d3-geo** (proiecția ortografică are 20 de linii scrise de mână, nu merită dependența).

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
