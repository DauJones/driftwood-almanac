# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Jimmy's Rules" — a single-page static site styled as an official golf rulebook. No backend, no build step, no dependencies: plain HTML/CSS/JS deployed to GitHub Pages.

## Commands

- Run tests: `node script.test.js` — plain Node `assert`, zero dependencies. Expect the final line `All tests passed.` This is the only test file; ignore `test-render.js` if present — it's stale scratch from early development and references a data model (`chapters`/`toc`) that no longer exists.
- Local preview: open `index.html` directly in a browser, or serve the directory with any static file server. There is no dev server or build step.
- Deploy: `git push` to `main` — GitHub Pages serves directly from the repo root (account `DauJones`, repo `driftwood-almanac`). Nothing to build first.
- **After editing `script.js` or `style.css`, bump the `?v=` query param on the corresponding `<link>`/`<script>` tag in `index.html`** (e.g. to the current `date +%Y%m%d%H%M`). GitHub Pages serves these with `Cache-Control: max-age=600`; without a version bump, visitors can see a stale cached copy for up to 10 minutes after a deploy.

## Architecture

Three files make up the whole site — there is no `content.js`; rule text lives directly in the markup.

- **`index.html`** — the only place content lives: rule text, AND the amendment form's `<option>` list, are both plain static markup. Each rule is a `<li class="rule" id="...">` (rules are a list, not standalone sections) with a `.rule-number` span and `.rule-text` paragraph inside `<ul id="rules">`; a rule may instead be a `.rule.rule-group` containing a `.rule-group-header` (title) plus a nested `<ul class="subrules">` of `.subrule` `<li>`s (each with its own id), rendering as a sub-numbered clause (e.g. "1.1", "1.2"). Rule *numbers* are never hand-typed — they're CSS-generated (see `style.css`) from DOM order. The `#amendment-target` `<select>`'s `<option>` labels (e.g. "Rule 1.1", "Rule 2") ARE hand-typed and must be kept in sync by hand if a rule is added/removed/reordered — this is intentional: script.js does no rule-numbering or DOM-scraping of any kind, by design (see below), so there is no automatic way to keep them in sync.
- **`script.js`** — contains *only* the "Propose an Amendment" form's interactivity, nothing else. No rule data, no numbering, no DOM-scraping/reconstruction of content from markup. `handleAmendmentSubmit` reads the target label directly off the selected `<option>`'s own text (`targetSelect.options[targetSelect.selectedIndex].text`) rather than computing or looking it up — whatever the static HTML says the option is called is what gets used, verbatim. Pure logic functions (`validateAmendmentForm`, `formatAmendmentText`, `buildAmendmentMailto`, `escapeHTML`, `renderAmendmentLogHTML`) are exported and unit-tested; DOM-wiring (`handleAmendmentSubmit`, `wireCopyButton`, `renderAmendmentLog`) is deliberately unexported and untested — a scoping decision for a one-off personal project, not an oversight to fix. The recipient email for the amendment mailto is the `RECIPIENT_EMAIL` constant at the top of the file. **Do not add rule-numbering, rule-indexing, or content-scraping logic back into this file** — if the dropdown needs to change, edit the static `<option>`s in `index.html` directly.
- **`style.css`** — plain CSS, no preprocessor. Deliberate palette/typeface (serif type, navy `#1a2f4f` headings, red `#b8312f` rule numbers) chosen to read as an actual rulebook page rather than a generic site; preserve this direction unless asked to change it. Rule *display* numbering is implemented with CSS counters (`counter-reset`/`counter-increment` on `#rules`/`.rule`/`.rule-group`/`.subrule`, rendered via `::before` on `.rule-number`/`.subrule-number`) — don't reintroduce hand-typed numbers in the rule list itself (the dropdown's option labels are the one exception, per above).

### The amendment feature has no backend by design

"Propose an Amendment" builds a `mailto:` link (via `encodeURIComponent`, not `URLSearchParams` — `URLSearchParams` encodes spaces as `+`, which breaks `mailto:`'s expected `%20` encoding) and always shows the same composed text on-screen with a copy-to-clipboard button alongside the `mailto:` attempt, every time — never gated behind detecting whether `mailto:` succeeded, since browsers can't reliably report that. Don't turn this into a conditional fallback.

The on-page "Amendment Log" is session-only: submissions are pushed into an in-memory array (`amendmentLogEntries` in `script.js`) and re-rendered immediately, but nothing persists across a reload or for other visitors. There's no database to add here — that's the intended scope, not a gap.

### Design rationale

The original spec and implementation plans — including the reasoning behind the no-backend and mailto-fallback decisions above — are in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Read those before making structural changes, not just the code.
