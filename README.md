# PBŘ generátor — koncept technické zprávy

A single-file web tool that drafts the **concept / outline of a Czech fire-safety
report** (požárně bezpečnostní řešení, technická zpráva). From a building type,
documentation stage and a few characteristics, a deterministic engine decides which
norms and chapters apply (§ 41 vyhl. 246/2001 Sb.), writes the repeatable prose, and
predicts what will most likely need solving. Every norm value stays a
`[DOPLŇ DLE ČSN …]` placeholder. No backend, no database, no LLM, nothing stored.

**The file to work on is [`pbr-generator-v3.html`](pbr-generator-v3.html)** — one
self-contained HTML file (currently Tailwind via CDN + inline `<script>`). Open it in
a browser; that is the whole app.

---

## ▶ Design brief (this is why the repo exists)

The current design is **generic and unconvincing** — stock Tailwind, red-600 + slate,
a flat two-column form/output layout that looks machine-made. The goal is a visual
redesign that makes it feel like a **credible, professional tool a Czech fire-safety
engineer would trust**.

Improve freely:
- Typography, color, spacing, hierarchy, density. Give it a real identity (it is a
  technical/legal instrument, not a marketing page — think calm, precise, document-like).
- The generated-report pane (right side): right now it is a raw monospace `<pre>`. It
  should read like an actual document.
- Form controls, the live "Co se uplatní" panel, the empty state.
- The comment overlay (`.pbrc-*`) and the onboarding tutorial (`.pbrt-*`) — restyle to
  match the new identity; keep their behavior.
- Responsive down to a tablet/phone is a plus (desktop-first is fine).

You may replace Tailwind with your own CSS. Keep it a **single static file with no
build step and no backend.** Czech UI strings stay Czech.

---

## ⛔ Structural contract — do NOT break these (functionality depends on them)

The redesign is **visual only**. Do not change the engine logic or these hooks, or the
generator / comments / tutorial stop working. After any edit, run the test (below) — it
must stay green.

**Generator engine** — the large inline `<script>` block beginning
`PBŘ GENERÁTOR v3 — deterministic`. Treat its JS as fixed; restyle the markup around it.
It reads the form by element **`name`** via `FormData`, so preserve these:
- `<form id="f">` wraps all inputs.
- Field `name`s: `nazev, druh, stupen, podlaziNad, podlaziPod, vyska, plocha, osoby,
  konstrukce, popis`. Characteristic checkboxes: `name="cf_*"` **and** `class="cf"`.
- `<select id="druh">` and `<select id="stupen">` — keep every `<option value="…">`
  string (those values key the engine; the visible label can be restyled).
- Output `<pre id="out">`, buttons `#genBtn` (generate), `#copy`, `#dl`, and the live
  panel `<div id="applic">` must keep their ids.

**Tutorial** targets elements by id: `#rowTypy` (the druh/stupeň row), `#applic`,
`#genBtn`, `#out`, `#pbrc-toggle` (the comment toggle, created by JS). If you move or
rename a target, update the `STEPS` array selectors in the tutorial script.

**Comment overlay + tutorial** live in their own `<style>`/`<script>` at the end of the
file (classes `.pbrc-*` and `.pbrt-*`). Restyle the look; keep the DOM roles (toolbar
buttons incl. `#pbrc-toggle`, the pins, popover, side panel, and the tutorial
mask/ring/card). The tutorial darkens the screen with four dim panels around a bright
ring on the target — **not** a giant `box-shadow` (that hangs screenshot capture).

**Hard rules (legal + product):**
- The tool must **never display a concrete ČSN normative value** (p_v, R/EI minutes,
  SPB as a value, odstupy in metres, …). They stay `[DOPLŇ DLE ČSN …]` placeholders.
  This is the entire legal basis of the tool — do not "helpfully" fill them in.
- Keep the **HITL disclaimer** ("KONCEPT / OSNOVA … není projektová dokumentace …").
- Czech UI only. Single file, no build, no backend, no analytics, no external calls
  beyond a CDN for styling if you keep one.

---

## Verify after editing

```bash
node test-pbr-generator-v3.mjs
```
Enumerates 864 building-type × stage × characteristic combinations and asserts the
engine still emits zero ČSN values, intact placeholders, the prediction block and the
§ 41 anchoring. Must print `PASS`. (The test only exercises the generator engine, not
the visual layer, so it is the safety net for "did my markup change break the wiring".)

## Files
- `pbr-generator-v3.html` — **current app** (redesign target).
- `pbr-generator-v2.html`, `pbr-generator.html` — earlier iterations, reference only.
- `test-pbr-generator-v3.mjs` — the 864-combo engine regression test.
- `server.js`, `Dockerfile`, `docker-compose.yml` — a trivial static server + container
  for hosting the file behind a tunnel. Not needed to work on the design.
- `RESEARCH-pbr-examples.md` — the real PBŘ examples the section spine was built from.

## The legal line (context for why placeholders matter)
MAY emit: document structure (§ 41), public-law prose, which-ČSN-applies decisions, ČSN
citations by number + článek/tabulka, public calculation formulas with blank
coefficients. MUST NOT emit: ČSN text/tables or any norm value. ČSN content is protected
(§ 5 odst. 8 zák. 22/1997 Sb.); a which-norm-applies decision tree copies none of the
protected expression. Output is a concept for an authorized person to complete, check
and stamp.
