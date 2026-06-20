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

- **`index.html`** — the only place rule text/copy lives, as plain static markup. Each rule is a `<section class="rule" id="...">` with a `.rule-number` span and `.rule-text` paragraph; a rule may instead be a `.rule.rule-group` containing a `.rule-group-header` (title) plus nested `.subrule` divs (each with its own id), rendering as a sub-numbered clause (e.g. "1.1", "1.2"). Rule numbers are never hand-typed — they're CSS-generated (see `style.css`) from DOM order, so adding/removing/reordering a `<section class="rule">` renumbers automatically with no manual upkeep and no second source of truth to drift out of sync.
- **`script.js`** — exists only to support the "Propose an Amendment" form (the one genuinely interactive piece). Pure logic functions at the top (`validateAmendmentForm`, `formatAmendmentText`, `buildAmendmentMailto`, `escapeHTML`, `flattenRules`, `buildRuleIndex`, `describeTarget`, `renderAmendmentLogHTML`) operate on a `sections` array shaped like `{ id, text }` or `{ id, title, subrules: [...] }` — the same heterogeneous shape `index.html`'s markup encodes structurally. `getSectionsFromDOM()` reconstructs that array by reading `index.html`'s rendered structure back via `querySelector`/`querySelectorAll` (keyed off the `.rule-group-title`/`.subrule`/`.rule-text` classes), so there's exactly one place rule content is authored even though the logic functions still expect structured data. Anything that needs to walk all rules — numbering, amendment-target lookup — must go through `flattenRules`/`buildRuleIndex` rather than iterating `sections` directly, or it will skip the rules nested in `subrules`. DOM-wiring functions (`getSectionsFromDOM`, `populateAmendmentTargetSelect`, `renderAmendmentLog`, `handleAmendmentSubmit`, `wireCopyButton`) are deliberately unexported and untested — a scoping decision for a one-off personal project, not an oversight to fix. The recipient email for the amendment mailto is the `RECIPIENT_EMAIL` constant at the top of the file.
- **`style.css`** — plain CSS, no preprocessor. Deliberate palette/typeface (serif type, navy `#1a2f4f` headings, red `#b8312f` rule numbers) chosen to read as an actual rulebook page rather than a generic site; preserve this direction unless asked to change it. Rule numbering is implemented with CSS counters (`counter-reset`/`counter-increment` on `#rules`/`.rule`/`.rule-group`/`.subrule`, rendered via `::before` on `.rule-number`/`.subrule-number`) — don't reintroduce hand-typed numbers in the HTML.

### The amendment feature has no backend by design

"Propose an Amendment" builds a `mailto:` link (via `encodeURIComponent`, not `URLSearchParams` — `URLSearchParams` encodes spaces as `+`, which breaks `mailto:`'s expected `%20` encoding) and always shows the same composed text on-screen with a copy-to-clipboard button alongside the `mailto:` attempt, every time — never gated behind detecting whether `mailto:` succeeded, since browsers can't reliably report that. Don't turn this into a conditional fallback.

The on-page "Amendment Log" is session-only: submissions are pushed into an in-memory array (`amendmentLogEntries` in `script.js`) and re-rendered immediately, but nothing persists across a reload or for other visitors. There's no database to add here — that's the intended scope, not a gap.

### Design rationale

The original spec and implementation plans — including the reasoning behind the no-backend and mailto-fallback decisions above — are in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Read those before making structural changes, not just the code.
