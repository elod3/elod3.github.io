# Kusekwa · clasa a XII-a, Liceul Integritas

Pagina de strângere de fonduri pentru misiunea clasei a XII-a la **Școala Adventistă Kusekwa**
(lângă Bariadi, regiunea Simiyu, Tanzania): o biserică și un dispensar pentru 700 de elevi
și profesori.

Static, fără build: `index.html`, `style.css`, `app.js`, `print.js`, `cloth.js`, `assets/`.
Fonturile, bibliotecile și texturile sunt locale. 1,3 MB tot proiectul.

## Decizia estetică

**Pagina e o kanga tipărită pentru misiune.**

Kanga e pânza imprimată purtată în Tanzania. Are trei părți, și toate trei dau forma paginii:
- **pindo** — chenarul care înconjoară pânza pe toate patru laturile. La noi: chenarul pânzei
  din capul paginii și banda care desparte actele.
- **mji** — câmpul din mijloc. Cuvântul înseamnă „oraș", așa că în mijlocul pânzei noastre stă
  exact ce se construiește: biserica din Kusekwa, într-un medalion, ca pe kanga comemorative.
- **jina** — „numele": fraza tipărită pe pânză, după care se cere kanga la magazin. A noastră e
  <i lang="sw">haba na haba hujaza kibaba</i> — „puțin și puțin umple măsura". E un proverb
  swahili adevărat și e, cuvânt cu cuvânt, argumentul unei strângeri de fonduri.

De aici vine tot restul:

- **Public:** părinți, firme din Mureș, biserici, absolvenți. Oameni care dau bani dacă văd
  exact unde ajung.
- **Ton:** al elevilor, la persoana I. Fraze scurte, cifre reale, zero limbaj de instituție.
  Textele de pe site-ul școlii („misiune / viziune / valori") nu apar deloc.
- **Cinci cerneluri, ca la pânza adevărată:** bumbac nealbit (`#f2e9d8`), negru de tipar cald
  (`#14110f`), galben de crom, verde de frunză, albastru. Al cincilea, roșul, nu decorează:
  apare doar pe drumul parcurs, pe „de completat" și pe butonul de donație. Culorile sunt cele
  de pe kanga din piețele tanzaniene (vezi referințele din `Surse`), nu o paletă inventată.
- **Trei roluri de literă.** **Boldonse** (nou pe Google Fonts, puțin folosit) doar la titlurile
  de act, de două-trei cuvinte. **Big Shoulders** — condensata de afiș — la fraza de pe pânză,
  la etichete, la replici, la numele etapelor și la cifre: e vocea tiparului. **Archivo** la
  text. **Martian Mono** doar la IBAN, unde contează fiecare caracter. Toate locale, cu
  diacritice. *Atenție la Boldonse:* literele umplu caseta, iar diacriticele românești se
  ating sub `line-height: 1.3`; de aceea titlurile stau la 1.34 și replicile lungi sunt în
  Big Shoulders.
- **Elementul memorabil:** pânza. Nu e o poză de pânză — e o pânză. Tiparul e desenat în
  `print.js`, pus pe o țesătură de bumbac **scanată** (ambientCG Fabric019, CC0) și mișcat în
  WebGL scris de mână: atârnă de colțurile de sus, respiră, se îndoaie sub cursor și **se
  întinde pe măsură ce cobori** — din obiect devine foaia pe care scrie restul.
- **Al doilea:** măsura din proverb. În fișa de donație e desenat un *kibaba*, vasul cu care se
  măsoară cerealele; se umple cu suma aleasă, cu boabe care cad. Animația *este* argumentul.
- **Al treilea:** clădirile din actul al patrulea se **tipăresc** matriță cu matriță pe scroll:
  întâi zidurile, apoi acoperișurile, turnul, crucea, ferestrele. A construi și a tipări sunt
  aceeași mișcare.
- `slop_scan.py`: **P0 = 0, P1 = 0, P2 = 0.**

## Fișierele

| fișier | ce face |
|---|---|
| `print.js` | matrițele: floarea cu opt petale, crenguța, bobul de caju, biserica, dispensarul, cartea, casa, mistria, vasul *kibaba*, vehiculele. Și compoziția: `pindo`, `field`, `jina`, `medallion`, `kanga`. Tot ce se vede desenat vine de aici. |
| `cloth.js` | pânza: tiparul ajunge textură (`printToCanvas`), apoi un singur dreptunghi în WebGL cu unde în vertex shader, normale analitice și harta de normale a bumbacului scanat. Fără three.js, fără dependențe. |
| `app.js` | `CONFIG` + coregrafia: pânza, banda dintre acte, drumul, panourile, medalioanele vocilor, clădirile, măsura, plata, bara de jos. |

Biblioteci (locale, în `assets/vendor/`): GSAP 3.15 + ScrollTrigger + SplitText, Lenis 1.3.26.
Refuzate conștient: **three.js** (pentru o singură pânză ar fi adus 600 KB; shaderul scris de
mână are 120 de linii), **Lottie**, **d3**.

### Comutatoare utile

- `?still=1` — pagina fără intrări, cu tot ce depinde de derulare dus la capăt. Pentru capturi.
- `prefers-reduced-motion` — pânza rămâne tiparul plat (SVG întreg, cu tot cu frază), drumul e
  parcurs, clădirile sunt ridicate. Nimic nu se mișcă.
- fără WebGL sau fără JS — la fel: tiparul plat, pagina întreagă.

## Plata

Tot ce e de configurat stă în `CONFIG`, în capul lui `app.js`:

| cheie | ce e |
|---|---|
| `stripeLink` | Payment Link-ul școlii, cu „clientul alege suma". **Card, Google Pay și Apple Pay apar automat** pe pagina Stripe, fără backend și fără verificare de domeniu. Gol = butonul duce la `/donatii`. |
| `paypalLink` | buton separat; apare doar dacă e completat. PayPal **nu** merge prin Stripe pe un cont din România. |
| `sumFull` | suma la care măsura din proverb e plină (acum 400 lei, cât e și butonul mare). |
| `jina`, `selvedge` | fraza de pe pânză și rândul mărunt de lângă tiv. |

## Cifre și de unde vin

| etapă | km |
|---|---|
| Târgu Mureș → Budapesta (autocar) | 432 |
| Budapesta → Istanbul → Nairobi (avion) | 5.840 |
| Nairobi → Sirari → Bariadi → Kusekwa (mașină) | 466 |
| **total** | **6.737** |

Distanțele sunt calculate între coordonatele opririlor, **în linie dreaptă** (haversine); pe
șosea sunt mai mari, deci toate sunt afirmații prudente. Restul datelor (700 de elevi și
profesori, cele trei replici, biserica și dispensarul) vin din scenariul clipului scris de clasă.

## Surse

- Structura pânzei (pindo / mji / jina): Wikipedia, *Kanga (garment)*; Smithsonian Folklife,
  *A cloth of many meanings*; Aramco World, *Kanga's Woven Voices*.
- Proverbul *haba na haba hujaza kibaba*: colecțiile de methali swahili (Univ. of Illinois,
  Univ. of Wisconsin), unde e dat explicit ca frază care apare pe kanga.
- Culorile: kanga fotografiate în piețe din Tanzania și Kenya (Wikimedia Commons, CC BY-SA).
- Țesătura: ambientCG **Fabric019**, CC0 — folosită ca hartă de normale și ca fir pe fundalul
  paginii.
- Siluetele celor trei voci: Kwameghana (CC BY-SA 4.0), Masako Kato (CC BY-SA 4.0),
  Charles Roscoe Savage (domeniu public).
- Fotografiile cu elevi sunt din arhiva liceului, făcute în România. Singura poză din Africa e
  cea din Kenya, februarie 2025.

## De completat înainte de lansare

- `CONFIG.stripeLink` și, dacă există cont, `CONFIG.paypalLink`
- costurile din tabelul „Cât costă" (biserică, dispensar, drumul celor 30) și totalul de strâns
- mențiunea cerută la detaliile plății bancare
- data plecării și coordonatele exacte ale școlii Kusekwa
- confirmarea cu școala că donațiile pentru misiune merg în contul Fundației Educatio Plena
- **`noindex` e încă pus.** Se scoate când pagina se mută pe `liceulintegritas.ro`, sau mai
  devreme dacă școala vrea să fie găsită în Google.
