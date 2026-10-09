# Kusekwa · clasa a XII-a, Liceul Integritas

Pagina de strângere de fonduri pentru misiunea clasei a XII-a la **Școala Adventistă Kusekwa**
(lângă Bariadi, regiunea Simiyu, Tanzania): o biserică și un dispensar pentru 700 de elevi
și profesori. Nu mai e concept — intră live.

Static: `index.html`, `style.css`, `app.js`, `globe.js`, `assets/`.
Fără CDN: GSAP 3.15 + ScrollTrigger, Lenis 1.3.26 și three.js 0.186 stau în `assets/vendor/`.
Fonturile sunt ale școlii (Lora, Montserrat), locale.

## Decizia estetică

- **Public:** părinți, firme din Mureș, biserici, absolvenți, plus oricine primește linkul pe
  Instagram. Oameni care dau bani dacă văd exact unde ajung.
- **Ton:** al elevilor, la persoana I. Fraze scurte, cifre reale, zero limbaj de instituție.
  Textele vechi luate de pe site-ul școlii („misiune / viziune / valori”) au fost scoase: sunt
  corporate și nu le-ar spune niciun elev cu voce tare.
- **Trei lumini, în ordinea drumului:** spațiu (globul) → apus de savană (oamenii) → hârtie
  (cifrele și donația). Fiecare schimbare de lumină marchează o schimbare de loc, nu un efect.
- **Elementul memorabil:** globul. Pământul adevărat, cu drumul desenat peste el, parcurs de
  cele trei vehicule reale — autocar până la Budapesta, avion până la Nairobi, mașină prin
  savană până la școală. Camera merge cu ei, ca în Google Earth. Animația *este* argumentul:
  arată cât de departe pleacă treizeci de adolescenți.
- **Al doilea element:** biserica izometrică din actul IV, cu linii groase, care se construiește
  sub cursor (pe telefon, la derulare). Donația e clădirea care crește.
- **Montserrat** iese la `slop_scan.py` ca „font sigur”, dar e fontul real al școlii, din CSS-ul
  lor live. Scanner: **P0 = 0, P1 = 2 (ambele Montserrat), P2 = 0**.

## Globul

`globe.js` e un modul ES care primește lista de opriri și întoarce `render(t, spin)`.

- Textura: **Blue Marble** (NASA, domeniu public), redimensionată la 4096×2048 WebP (664 KB);
  sub 820 px lățime se încarcă varianta 2k (208 KB). Luminile de noapte, tot NASA.
- Zi/noapte vin dintr-un shader mic. **Soarele urmează drumul**, ca locul despre care vorbește
  textul să fie mereu luminat.
- Traseul e desenat din coordonatele reale, cu interpolare pe cercul mare; etapele cu avionul
  se arcuiesc, cele pe uscat stau pe sol.
- Vehiculele își păstrează mărimea pe ecran: `scale = base × distanța camerei`.
- `CONFIG.pace` mapează scroll-ul la drum **neliniar**. Liniar, zborul ar fi mâncat 87% din
  scroll, iar etapa prin savană n-ar fi apucat să se vadă.
- Fără WebGL sau dacă modulul nu se încarcă: `body.no-globe`, iar etapele devin blocuri de text
  una sub alta. Cu `prefers-reduced-motion` globul se desenează o singură dată, static.

## Plata

Fișa stă fix în dreapta de la 1180 px în sus (intră abia după glob, ca să nu-i fure scena);
sub, coboară în secțiunea de donație și apare o bară de CTA jos.

Tot ce e de configurat stă în `CONFIG`, în capul lui `app.js`:

| cheie | ce e |
|---|---|
| `stripeLink` | Payment Link-ul școlii, cu „clientul alege suma”. **Card, Google Pay și Apple Pay apar automat** pe pagina Stripe, fără backend și fără verificare de domeniu. Gol = butonul duce la `/donatii`. |
| `paypalLink` | buton separat; apare doar dacă e completat. PayPal **nu** merge prin Stripe pe un cont din România. |
| `stops` | opririle, cu `mode: 'road' \| 'air'`. Schimbi lista, se redesenează tot drumul. |
| `pace` | ritmul scroll → drum. |

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
