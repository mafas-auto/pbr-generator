// Regression harness for pbr-generator-v3.html — the LEGAL INVARIANT is the product.
// Extracts the deterministic engine from the HTML (everything before the UI wiring),
// then enumerates building-type × stupeň × characteristic combinations and asserts:
//   1. NO ČSN normative VALUE ever leaks (pv, R/REI/EI/EW minutes, SPB value, odstup m, …)
//   2. placeholders [DOPLŇ DLE ČSN …] present
//   3. the "co se nejspíš…" prediction block present
//   4. §41 anchoring present + závěr present
//   5. per-type norm signatures correct
// Run: node test-pbr-generator-v3.mjs   (exit 0 = pass, 1 = fail)
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const html = readFileSync(new URL('./pbr-generator-v3.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let engine = scripts.find(s => s.includes('generateDraft'));
engine = engine.split('var out=document.getElementById')[0]; // drop UI wiring (needs DOM)
const ctx = {};
createContext(ctx);
runInContext(engine, ctx);

const DRUHY = ['rodinny','bytovy','ubytovaci','administrativni','skolni','zdravotnicke',
  'shromazdovaci','obchodni','vyrobni','sklad','garaz','zemedelsky'];
const STUPNE = ['studie','dur','dsp','dps','zmena-uziti','zmena-dokoncene'];
const FLAGS = ['latky','shz','vyska225','luzko','zvirata','lpg','soubehpbz','neschopne','garaz','odlisny'];

// Flag scenarios: none, each single flag, all flags on.
const flagScenarios = [{}];
for (const f of FLAGS) flagScenarios.push({ ['cf_'+f]: true });
flagScenarios.push(Object.fromEntries(FLAGS.map(f => ['cf_'+f, true])));

// A leak = a concrete normative VALUE attached to a normative quantity. Public formula
// constants (0,75…), law/norm numbers (246/2001, 73 0802…), dates, OB/DP/SPB/CHÚC labels
// without a number, and the user-echoed "22,5 m" threshold are NOT leaks.
const LEAK_PATTERNS = [
  { re: /p_v\s*[=:]\s*\d/, name: 'pv value' },
  { re: /\d\s*kg\s*[·*]?\s*m/, name: 'kg·m^-2 value' },          // a digit before kg·m⁻²
  { re: /\b(REI|REW|EI|EW|R)\s?\d{2,3}\b/, name: 'R/REI/EI minutes' },
  { re: /odstup\s*d\s*=\s*\d/, name: 'odstup metres' },
  { re: /\bSPB\s*[=:]\s*(I{1,3}|IV)\b/, name: 'assigned SPB value' },
  { re: /součinitel[a-z]*\s*[=:]\s*\d/i, name: 'coefficient value' },
];

let failures = [];
let count = 0;
const sampleLens = {};

for (const druh of DRUHY) {
  for (const stupen of STUPNE) {
    for (const fl of flagScenarios) {
      count++;
      const d = Object.assign({
        druh, stupen, nazev: 'TEST', podlaziNad: '2', podlaziPod: '0', vyska: '6,0',
        plocha: '180', osoby: '30', konstrukce: 'DP1 (nehořlavý)', popis: 'test'
      }, fl);
      let out;
      try { out = ctx.generateDraft(d); }
      catch (e) { failures.push(`${druh}/${stupen}/${JSON.stringify(fl)} THREW: ${e.message}`); continue; }

      const id = `${druh}/${stupen}/${Object.keys(fl).join('+')||'none'}`;
      for (const p of LEAK_PATTERNS) {
        const m = out.match(p.re);
        if (m) failures.push(`${id} LEAK[${p.name}]: "${m[0]}"`);
      }
      if (!out.includes('[DOPLŇ DLE ČSN')) failures.push(`${id}: no placeholders`);
      if (!out.includes('CO SE U TOHOTO TYPU NEJSPÍŠ BUDE MUSET VYŘEŠIT')) failures.push(`${id}: no prediction block`);
      if (!/§ 41 odst\./.test(out)) failures.push(`${id}: no §41 anchor`);
      if (!/ZÁVĚR/.test(out)) failures.push(`${id}: no závěr`);
      sampleLens[druh] = out.length;
    }
  }
}

// Per-type norm signatures (the which-ČSN-applies decision must be right).
const sig = (druh, must) => {
  const o = ctx.generateDraft({ druh, stupen: 'dsp', nazev: 'x', konstrukce: 'DP1 (nehořlavý)' });
  for (const s of must) if (!o.includes(s)) failures.push(`signature ${druh}: missing "${s}"`);
};
sig('rodinny',     ['ČSN 73 0833', 'OB 1']);
sig('bytovy',      ['ČSN 73 0833']);
sig('zdravotnicke',['ČSN 73 0835']);
sig('shromazdovaci',['ČSN 73 0831']);
sig('vyrobni',     ['ČSN 73 0804', 'ekonomické riziko']);
sig('sklad',       ['ČSN 73 0845']);
sig('zemedelsky',  ['ČSN 73 0842']);
sig('garaz',       ['ČSN 73 0804']);

console.log(`Enumerated ${count} druh×stupeň×flag combinations.`);
console.log(`Output lengths sampled per type:`, Object.fromEntries(DRUHY.map(t => [t, sampleLens[t]])));
if (failures.length) {
  console.log(`\nFAIL — ${failures.length} issue(s):`);
  for (const f of failures.slice(0, 40)) console.log('  - ' + f);
  if (failures.length > 40) console.log(`  … +${failures.length - 40} more`);
  process.exit(1);
} else {
  console.log(`\nPASS — no ČSN value leaks, placeholders + prediction block + §41 anchors intact across all ${count} combinations.`);
  process.exit(0);
}
