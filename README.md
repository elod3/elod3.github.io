# elod3.github.io

Portofoliul lui Koreh Elod: https://elod3.github.io/

Un catalog de lucrări: hârtie caldă, fișe numerotate, un index la final. Pe măsură ce derulezi,
pagina ia culorile site-ului prezentat (fundal, text, accent, luate din fiecare proiect), iar
ecranul fix din dreapta rulează înregistrarea lui. Pe telefon, fiecare fișă are clipul ei.

Trucurile mici, fiecare cu motivul lui:
- în intro, lucrările sunt împărțite ca un teanc de cărți: se desfac la hover, se înclină după
  cursor, click pe o carte duce la fișa ei (munca se vede din prima secundă);
- ecranul fix e link spre proiectul activ, cu eticheta „Deschide site-ul” lângă cursor; barele de
  sub el se umplu odată cu clipul, ca la story-uri, și duc la proiectul ales;
- în index, posterul proiectului urmează cursorul;
- pagina ține minte ce ai văzut (după 1,2 s pe o fișă): titlul tab-ului spune câte lucrări mai ai
  când pleci, iar finalul spune ce ți-a scăpat, cu link spre ele.

- `index.html`, `style.css`, `app.js` — pagina; proiectele, cu textele și culorile lor, sunt în lista `P` din `app.js`
- `media/` — câte un video (7–11 s, fără sunet) și un poster WebP pentru fiecare proiect
- `fonts/` — Bricolage Grotesque (titluri și text) și JetBrains Mono (cifre, etichete), găzduite local
- `og.jpg` — imaginea de share, captură a introducerii la 1200×630
- `alo/` — site-ul agentului vocal AI pentru cabinete (apel demo care se poate întrerupe, calculator de minute)
- `media/planificatorul-casei-tale.*` — clipul paginii de vânzare din repo-ul `planificatorul-casei-tale`
- `fara-platou/` — site-ul agenției de reclame AI (monitor cu scenariul pe 15 secunde, foaie AV, claqueta)

Butoanele de WhatsApp din `alo/app.js` și `fara-platou/app.js` citesc constanta `WA` (număr fără „+”);
cât e goală, duc la contactul din portofoliu.
- `riseup/` — site-ul vechi RiseUp (stâlpul de foc cu scântei, tabăra, cele 12 triburi), păstrat în portofoliu; cel live e pe riseupmovement.ro. `noindex`, ca să nu concureze cu el
- `minicurs/` — redesign de concept (neoficial, `noindex`) al inhabitstudio.ro/minicurs/: planșa care se desenează în ordinea lecțiilor; sursa preluată e în `~/Projects/minicurs-sursa/`
- Arcadian Residence e în repo-ul `sitehuni-` (path în lista `P`), clipul în `media/arcadian.*`
- `integritas-africa/` — concept de pagină de strângere de fonduri pentru misiunea în Africa a clasei a XII-a de la Liceul Integritas (`noindex`); sursele și licențele pozelor în README-ul lui
