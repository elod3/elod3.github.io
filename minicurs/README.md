# Minicurs — concept de redesign

Concept neoficial pentru https://inhabitstudio.ro/minicurs/ (Inhabit Studio, arh. Alin Ionescu și
arh. Anca Oprea). `noindex`, cu notă în footer și link spre pagina oficială. Toate butoanele de
înscriere duc la formularul real: `https://inhabitstudio.ro/minicurs/#ff_3_email`.

## Decizia estetică

Publicul e un cuplu care își face prima casă și se teme că depășește bugetul, nu un pasionat de
arhitectură. Tonul e calm, de birou de proiectare: hârtia și verdele-cerneală vin din tema lor
(`#f5f5f2`, `#203524`), galbenul lor `#fecd22` e folosit ca marker pe planșă, fontul e Urbanist,
tot al lor. Elementul memorabil e planșa care se desenează pe scroll în ordinea lecțiilor: teren,
buget, proiect și contract, anvelopa (izolație → ferestre → etanșeitate), autorizație, deviz.
Cartușul numără cele 22 de lecții și le marchează pe cele pe care le predă fiecare strat, deci
animația e chiar programa cursului. Pe telefon „camera” se mută pe detaliul care se trasează.

Finalul închide ideea: liniile se trag peste randarea lor reală, apoi casa apare din desen.

## Fișiere

- `index.html`, `style.css`, `app.js` — fără biblioteci; scroll-ul conduce direct `stroke-dashoffset`
- `assets/fonts/` — Urbanist (fontul site-ului lor) + JetBrains Mono pentru cote și etichete
- `assets/img/` — randarea `ext2` (1920/1000 px), portretele, cele 9 capturi WhatsApp (WebP)
- `assets/video/alin-loop.mp4` — 8 s mut din reelul lor; clipul întreg, cu sunet, pornește din YouTube (nocookie)

Sursa (text verbatim, asseturi originale, transcrieri ale capturilor): `~/Projects/minicurs-sursa/`.
