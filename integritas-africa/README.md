# Integritas · Africa (concept)

Pagina „Africa” propusă pentru site-ul Liceului Internațional Integritas (Budiu Mic, Mureș):
strângere de fonduri pentru misiunea clasei a XII-a la **Școala Adventistă Kusekwa**. Concept,
deocamdată neoficial, `noindex`. Doar în română; versiunile HU/EN vin după aprobare.
Clipul are deja comutator pentru engleză, maghiară și spaniolă.

Static: `index.html`, `style.css`, `app.js`, `assets/`. Bibliotecile sunt **locale**, în
`assets/vendor/` (fără CDN): GSAP 3.15.0 cu ScrollTrigger, DrawSVG și MotionPath, plus Lenis 1.3.26.
Fonturi locale: Lora și Montserrat, fonturile din CSS-ul site-ului școlii.

## Decizia estetică

- **Public:** părinți, firme din Mureș, biserici adventiste, absolvenți. Oameni care dau bani
  pentru ceva concret și vor să vadă unde ajung.
- **Ton:** dosar de misiune. Sobru, cu cifre și nume; vocea e a elevilor de a XII-a, la persoana I.
- **Elementul memorabil:** linia traseului. O singură linie subțire, desenată din coordonatele
  reale ale celor șapte opriri, la aceeași scară pe ambele axe — deci forma ei *este* distanța.
  Se desenează pe scroll (DrawSVG) și un semn o parcurge (MotionPath). Aceeași linie, îndoită în
  izometrie, ridică biserica din secțiunea 05 sub cursor: donația *este* clădirea care crește.
  Două apariții, un singur limbaj de desen.
- **Ales conștient împotriva șablonului:** fără hero centrat și fără carduri de feature; cifrele
  stau într-un cartuș de document, nu în contoare animate; panoul de plată e o fișă de vărsământ
  prinsă pe marginea din dreapta, nu un card cu umbră; galeria e un contact sheet desfăcut în
  evantai, nu un bento grid; animalele și loaderul de 4,6 s au fost scoase de tot.
- **Montserrat** iese la scanerul anti-slop ca „font sigur”. E păstrat fiindcă e fontul real al
  școlii, luat din CSS-ul lor live — nu o alegere implicită. `slop_scan.py`: P0=0, P1=2 (ambele
  Montserrat), P2=0.

## Structura

| # | Secțiune | Ce face |
|---|---|---|
| — | Hero | 700 / 30 / 4 / 2 în cartuș, CTA dublu |
| — | Vocile | trei replici din scenariul clipului, pe un cadru lipit (280vh, trei bătăi) |
| 01 | Drumul | traseul desenat din coordonate + tabelul etapelor |
| 02 | Cine suntem | misiunea școlii, citată; tradiția de 4 ani; „Nu suntem… dar vrem să facem ceva” |
| 03 | Clipul | slot cu comutator RO / EN / HU / ES |
| 04 | Din anii trecuți | galerie în evantai, 11 poze reale + 2 locuri goale |
| 05 | Visul mare | biserica izometrică, se construiește sub cursor; tabelul de costuri |
| 06 | Parteneri | firme / părinți / biserici |
| 07 | Donează | CTA lângă fișă |

Scroll total: ~9,8 ecrane pe desktop, ~11,6 pe telefon (înainte: ~14, plus un loader de 4,6 s).

## Plata

Panoul stă fix în dreapta de la 1180 px în sus; sub, coboară în secțiunea 07 și apare o bară
de jos cu CTA. Sumele: 50 / 150 / 400 lei sau sumă liberă.

Totul se configurează din `CONFIG`, în capul lui `app.js`:

| cheie | ce e |
|---|---|
| `stripeLink` | Payment Link-ul școlii, cu „clientul alege suma”. **Card, Google Pay și Apple Pay apar automat** pe pagina Stripe, fără backend și fără verificare de domeniu. Gol = butonul duce la `/donatii`. |
| `paypalLink` | buton separat; apare doar dacă e completat. PayPal **nu** merge prin Stripe pe un cont din România, deci are nevoie de contul PayPal al fundației (`paypal.com/donate/?hosted_button_id=…`). |
| `clip.ro/en/hu/es` | ID-uri YouTube; gol = „clipul se montează”. |
| `route` | coordonatele opririlor; schimbi lista, se redesenează linia și tabelul rămâne de completat. |
| `gallery` | pozele și legendele; `slot:` lasă un loc gol marcat. |

Pe scurt: **Stripe Payment Link acoperă card + Google Pay + Apple Pay dintr-o pagină statică.
PayPal e al doilea buton, separat.** Vezi [docs.stripe.com/payment-links/create](https://docs.stripe.com/payment-links/create)
și [docs.stripe.com/apple-pay](https://docs.stripe.com/apple-pay).

## Surse de date

| ce | sursa |
|---|---|
| misiune/viziune/valori, meniu, echipa | liceulintegritas.ro, citit 9 oct. 2026 (site-ul e în spatele unui challenge Cloudflare; citit din browser) |
| săptămâna de misiune și cele 3–4 săptămâni în Africa în clasa a XII-a | blog „Misiunea la Integritas” (Coman Lorena / Rebecca Pari) |
| Kenya, Pipeline Adventist Primary School, pachete pentru 50 de familii, feb. 2025 | articolul școlii despre Pipeline |
| 700 de elevi și profesori, replicile, biserica și dispensarul, traseul | scenariul clipului scris de clasă |
| culori `#A18854`, `#f2e1bd`, `#723837`; fonturi Lora + Montserrat; logo SVG | CSS-ul live al școlii |
| IBAN RON/EUR, Fundația Educatio Plena, BIC, contact Goran Teodora | pagina /donatii |
| Instagram `@integritashighschool`, YouTube `@LiceulIntegritas`, Facebook `liceulintegritas` | pagina /media |

## Imagini

Cele 10 poze din `assets/img/galerie/` sunt din galeria școlii (liceulintegritas.ro/galerie),
redimensionate la 1500 px și convertite în WebP. `misiune-kenya-2025.webp` e din articolul despre
Pipeline. Siluetele din primul act: [Kwameghana](https://commons.wikimedia.org/wiki/File:A_boy_standing_front_of_a_house.jpg)
(CC BY-SA 4.0), [Charles Roscoe Savage](https://commons.wikimedia.org/wiki/File:286_MSS_P_24_B2_F12.jpg)
(domeniu public), [Masako Kato](https://commons.wikimedia.org/wiki/File:Outside_teacher.jpg)
(CC BY-SA 4.0), toate decupate cu `rembg` și reduse la siluetă. Sursele și scripturile:
`~/Projects/integritas-africa/src/`.

Replicile din primul act sunt din scenariul clipului, nu citate ale unor persoane din Kusekwa;
siluetele sunt ilustrative. Mențiunea e în subsolul paginii.

## De completat înainte de publicare

- `CONFIG.stripeLink` și, dacă există cont, `CONFIG.paypalLink`
- `CONFIG.clip` — ID-urile YouTube pe cele patru limbi
- durata fiecărei etape din tabelul „Drumul”, plus coordonatele exacte ale școlii Kusekwa
- costurile din tabelul secțiunii 05 (biserică, dispensar, drumul celor 30) și totalul
- mențiunea cerută în detaliile plății bancare pentru misiunea din Africa
- ce oferă școala firmelor partenere
- numărul exact de elevi care pleacă (în pagină: 30) și data plecării
- pozele din Namibia și, la întoarcere, din Kusekwa, în `assets/img/galerie/` + `CONFIG.gallery`
- confirmarea cu școala că donațiile pentru misiune merg în contul Fundației Educatio Plena
