'use strict';

// PBŘ prototype — form -> public-law draft skeleton (osnova) with [DOPLŇ DLE ČSN …]
// placeholders. Deterministic templating only: no LLM, no ČSN text, no persistence.
// The tool authors a structure + the freely-usable public-law frame; every normová
// hodnota stays a blank the authorized person fills from their own ČSN access.

const http = require('http');

const PORT = process.env.PORT || 3000;

const DRUHY = {
  bytovy: 'bytový dům',
  rodinny: 'rodinný dům',
  administrativni: 'administrativní budova',
  vyrobni: 'výrobní / průmyslový objekt',
  shromazdovaci: 'shromažďovací prostor',
  ubytovaci: 'ubytovací zařízení',
  obchodni: 'obchodní / prodejní objekt',
  jiny: 'jiný objekt',
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function val(s, fallback) {
  s = (s == null ? '' : String(s)).trim();
  return s.length ? s : fallback;
}

// Build the draft. Returns plain text (Czech). Norm values are NEVER emitted —
// they are left as explicit [DOPLŇ …] placeholders citing the ČSN by number only.
function generateDraft(d) {
  const nazev = val(d.nazev, '[NÁZEV STAVBY]');
  const druh = DRUHY[d.druh] || val(d.druh, '[DRUH STAVBY]');
  const kategorie = val(d.kategorie, '[I/II/III]');
  const nad = val(d.podlaziNad, '[počet]');
  const pod = val(d.podlaziPod, '0');
  const vyska = val(d.vyska, '[DOPLŇ]');
  const plocha = val(d.plocha, '[DOPLŇ]');
  const osoby = val(d.osoby, '[DOPLŇ]');
  const konstrukce = val(d.konstrukce, '[nehořlavý / smíšený / hořlavý]');
  const popis = val(d.popis, 'Bez bližšího popisu.');
  const datum = new Date().toISOString().slice(0, 10);

  const P = '[DOPLŇ HODNOTU DLE ČSN'; // placeholder prefix

  return `TECHNICKÁ ZPRÁVA POŽÁRNĚ BEZPEČNOSTNÍHO ŘEŠENÍ
(osnova — koncept, k doplnění a posouzení autorizovanou osobou)

Stavba: ${nazev}
Druh stavby: ${druh}
Kategorie stavby: ${kategorie}
Datum zpracování konceptu: ${datum}

UPOZORNĚNÍ: Tento dokument je strojově generovaná OSNOVA a veřejnoprávní rámec.
Neobsahuje a nereprodukuje text technických norem (ČSN). Veškeré normové hodnoty
jsou ponechány jako placeholdery [DOPLŇ DLE ČSN …] a doplní je autorizovaná osoba
z vlastního přístupu k ČSN. Dokument není projektovou dokumentací; vyžaduje
posouzení, doplnění a autorizaci (razítko) oprávněnou osobou v oboru
požární bezpečnost staveb.

1. ÚVOD A PODKLADY
Požárně bezpečnostní řešení (PBŘ) je zpracováno v souladu s právními předpisy
v oblasti požární ochrany, zejména:
 - zákon č. 133/1985 Sb., o požární ochraně, ve znění pozdějších předpisů,
 - vyhláška č. 246/2001 Sb., o požární prevenci, ve znění pozdějších předpisů,
 - vyhláška č. 23/2008 Sb., o technických podmínkách požární ochrany staveb,
 - zákon č. 283/2021 Sb., stavební zákon, ve znění pozdějších předpisů.
Normové hodnoty se stanoví podle příslušných českých technických norem řady
ČSN 73 08xx (doplní zpracovatel z vlastního přístupu k ČSN).

2. STRUČNÝ POPIS OBJEKTU
Jedná se o ${druh}. Počet nadzemních podlaží: ${nad}; počet podzemních podlaží: ${pod}.
Požární výška objektu: ${vyska} m. Zastavěná / posuzovaná plocha: ${plocha} m².
Předpokládaný počet osob: ${osoby}. Konstrukční systém: ${konstrukce}.
Popis: ${popis}

3. ROZDĚLENÍ NA POŽÁRNÍ ÚSEKY
Objekt se člení na požární úseky podle ${P} 73 0802 / 73 0804, čl. …].
Mezní rozměry požárních úseků: ${P} 73 0802, čl. …].
Stupeň požární bezpečnosti (SPB) jednotlivých úseků: ${P} 73 0802, tab. …].

4. POŽÁRNÍ RIZIKO
Výpočtové požární zatížení pv: ${P} 73 0802, příloha …] kg/m².
Součinitele a, b, c: ${P} 73 0802, čl. …].
Stanovení SPB z požárního rizika: ${P} 73 0802, tab. …].

5. POŽADAVKY NA POŽÁRNÍ ODOLNOST KONSTRUKCÍ
Požadovaná požární odolnost stavebních konstrukcí (R/EI, min.):
${P} 73 0810 a ČSN 73 0802/73 0821, tab. …].
Druh konstrukčních částí (DP1/DP2/DP3): ${P} 73 0810, čl. …].

6. ÚNIKOVÉ CESTY
Typ, počet a mezní délky únikových cest: ${P} 73 0802, čl. …].
Mezní počet osob v únikových pruzích / šířka únikových cest:
${P} 73 0802, čl. …].
Doba evakuace / posouzení: ${P} 73 0802, příloha …].

7. ODSTUPOVÉ VZDÁLENOSTI
Požárně nebezpečný prostor a odstupové vzdálenosti: ${P} 73 0802, příloha …].
Vymezení vůči sousedním objektům a hranicím pozemku: doplní zpracovatel.

8. ZAŘÍZENÍ PRO PROTIPOŽÁRNÍ ZÁSAH A POŽÁRNĚ BEZPEČNOSTNÍ ZAŘÍZENÍ (PBZ)
Návrh PBZ (EPS, SOZ, ZOKT, SHZ, nouzové osvětlení apod.) dle charakteru objektu:
posoudí a navrhne zpracovatel; normové požadavky ${P} 73 0802 / 73 0810 a
souvisejících norem, čl. …].
Přenosné hasicí přístroje — druh a počet: ${P} 73 0802, čl. …].

9. ZÁSAH JEDNOTEK PO
Příjezdové a nástupní plochy, zásahové cesty, zásobování požární vodou
(vnější/vnitřní odběrná místa): ${P} 73 0802 a ČSN 73 0873, čl. …].

10. ZÁVĚR
Při splnění výše uvedených požadavků a po doplnění normových hodnot z platných
ČSN posuzovaná stavba vyhovuje požadavkům požární bezpečnosti. Konečné posouzení,
doplnění a autorizaci provede oprávněná osoba.

Zpracoval (osnova/koncept): nástroj PBŘ prototyp — k posouzení a autorizaci.
`;
}

const PAGE = `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PBŘ prototyp — generátor osnovy</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 text-slate-800">
<div class="max-w-5xl mx-auto p-6">
  <header class="mb-6">
    <h1 class="text-2xl font-bold">PBŘ prototyp — generátor osnovy</h1>
    <p class="text-sm text-slate-600 mt-1">
      Z parametrů stavby vygeneruje osnovu technické zprávy a veřejnoprávní rámec.
      Normové hodnoty zůstávají jako placeholdery <code>[DOPLŇ DLE ČSN …]</code> —
      doplní je autorizovaná osoba z vlastního přístupu k ČSN. Nástroj neukládá
      a nereprodukuje text ČSN. Prototyp, nikoli projektová dokumentace.
    </p>
  </header>

  <div class="grid md:grid-cols-2 gap-6">
    <form id="f" class="bg-white rounded-xl shadow p-5 space-y-4">
      <div>
        <label class="block text-sm font-medium">Název stavby / akce</label>
        <input name="nazev" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Novostavba …">
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">Druh stavby</label>
          <select name="druh" class="mt-1 w-full border rounded-lg px-3 py-2">
            <option value="bytovy">bytový dům</option>
            <option value="rodinny">rodinný dům</option>
            <option value="administrativni">administrativní budova</option>
            <option value="vyrobni">výrobní / průmyslový objekt</option>
            <option value="shromazdovaci">shromažďovací prostor</option>
            <option value="ubytovaci">ubytovací zařízení</option>
            <option value="obchodni">obchodní / prodejní objekt</option>
            <option value="jiny">jiný objekt</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Kategorie stavby</label>
          <select name="kategorie" class="mt-1 w-full border rounded-lg px-3 py-2">
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium">Nadz. podlaží</label>
          <input name="podlaziNad" type="number" min="0" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="3">
        </div>
        <div>
          <label class="block text-sm font-medium">Podz. podlaží</label>
          <input name="podlaziPod" type="number" min="0" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="1">
        </div>
        <div>
          <label class="block text-sm font-medium">Výška (m)</label>
          <input name="vyska" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="9,0">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium">Plocha (m²)</label>
          <input name="plocha" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="850">
        </div>
        <div>
          <label class="block text-sm font-medium">Počet osob</label>
          <input name="osoby" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="40">
        </div>
        <div>
          <label class="block text-sm font-medium">Konstrukce</label>
          <select name="konstrukce" class="mt-1 w-full border rounded-lg px-3 py-2">
            <option value="nehořlavý">nehořlavý</option>
            <option value="smíšený">smíšený</option>
            <option value="hořlavý">hořlavý</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium">Stručný popis</label>
        <textarea name="popis" rows="3" class="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Krátký popis objektu, provozu, specifik…"></textarea>
      </div>
      <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2">
        Vygenerovat osnovu
      </button>
    </form>

    <div class="bg-white rounded-xl shadow p-5">
      <div class="flex items-center justify-between mb-2">
        <h2 class="font-semibold">Vygenerovaná osnova</h2>
        <div class="space-x-2">
          <button id="copy" class="text-sm border rounded-lg px-3 py-1 hover:bg-slate-50" disabled>Kopírovat</button>
          <button id="dl" class="text-sm border rounded-lg px-3 py-1 hover:bg-slate-50" disabled>Stáhnout .doc</button>
        </div>
      </div>
      <pre id="out" class="text-xs whitespace-pre-wrap bg-slate-50 rounded-lg p-3 h-[32rem] overflow-auto">Vyplňte formulář a klikněte na „Vygenerovat osnovu“.</pre>
    </div>
  </div>
  <p class="text-xs text-slate-400 mt-4">Prototyp · generuje pouze osnovu a veřejnoprávní rámec · normové hodnoty doplní autorizovaná osoba · HITL.</p>
</div>

<script>
var out = document.getElementById('out');
var copyBtn = document.getElementById('copy');
var dlBtn = document.getElementById('dl');
var current = '';

document.getElementById('f').addEventListener('submit', function (e) {
  e.preventDefault();
  var fd = new FormData(e.target);
  var data = {};
  fd.forEach(function (v, k) { data[k] = v; });
  out.textContent = 'Generuji…';
  fetch('/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(function (r) { return r.json(); }).then(function (j) {
    current = j.draft || '';
    out.textContent = current;
    copyBtn.disabled = false;
    dlBtn.disabled = false;
  }).catch(function () { out.textContent = 'Chyba při generování.'; });
});

copyBtn.addEventListener('click', function () {
  navigator.clipboard.writeText(current);
  copyBtn.textContent = 'Zkopírováno';
  setTimeout(function () { copyBtn.textContent = 'Kopírovat'; }, 1500);
});

dlBtn.addEventListener('click', function () {
  var html = '<html><head><meta charset="utf-8"></head><body><pre>' +
    current.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
    '</pre></body></html>';
  var blob = new Blob([html], { type: 'application/msword' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'PBR-osnova.doc';
  a.click();
});
</script>
</body>
</html>`;

const server = http.createServer(function (req, res) {
  if (req.method === 'GET' && req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'alive' }));
  }
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(PAGE);
  }
  if (req.method === 'POST' && req.url === '/api/draft') {
    var body = '';
    req.on('data', function (c) { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', function () {
      var data = {};
      try { data = JSON.parse(body || '{}'); } catch (e) { data = {}; }
      var draft = generateDraft(data);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ draft: draft }));
    });
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('not found');
});

server.listen(PORT, '0.0.0.0', function () {
  console.log('pbr-prototyp listening on ' + PORT);
});
