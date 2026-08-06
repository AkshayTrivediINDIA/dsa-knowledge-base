# DSA Knowledge Base — Progress Report

## Project Overview
**Goal:** Build a modern, responsive static documentation website for DSA (Data Structures & Algorithms), DAA (Design & Analysis of Algorithms), Coding Interview preparation, and Competitive Programming.

**Technology:** HTML5, CSS3, Vanilla JavaScript — No frameworks, no backend, no database.

**Working Directory:** `/sdcard/Projects/dsa-knowledge-base/`

---

## ⏭️ RESUME HERE — Start Point for Next Session

### Current Snapshot (all green, verified 2026-08-06)
- **83-page hybrid MPA/SPA** (vanilla HTML/CSS/JS) **+ interactive visualizations**. Works as MPA over `http://` (serve `dist/`) and as a **single-file SPA** (`dist/index.standalone.html`) over `http://`, `file://` and Android `content://` — all navigation is hash-based (`#/path`), so **no web server or sibling files are required to browse the whole site**.
- **Every program group has its own page** (`20-split-codes.js`): 49 `code/<group>` pages. Topic/interview/snippet pages keep a **code card** that routes to the code page; problem-card **View code** buttons route too. Same behaviour in MPA and standalone (shared script).
- **Interactive visualizations (NEW — Phase 4, Stage A, all 14 topics):**
  - Shared GSAP engine `src/js/core/11-visualizer-engine.js` (`Visualizer` + `VizPlayer` + mounting/teardown wired into `07-router.js`; primitives: array cells, l/r pointers, sliding-window overlay, bars with labels, swap animation, second "sub" row, 2D matrix grid, vars chips, step narration, log; dark/light theming via CSS vars; respects `prefers-reduced-motion`).
  - **GSAP 3.12.5 vendored offline** at `src/vendor/gsap.min.js` (72 KB) and bundled into `dist/script.js` inside an IIFE that invokes GSAP with a plain-object `this` (jsdom-safe; the UMD `(this||self).window =` header no longer throws in test harnesses) then copies `gsap` onto the real global.
  - **All 14 topic pages have a runnable visualizer**: traversal, prefix-sum, difference-array, sliding-window, two-pointers, kadane, sorting (bubble/selection/insertion), binary-search, hashing, matrix (rotate), merge-intervals, dutch-national-flag, binary-search-answer, complexity — one config file each under `src/js/viz/topics/`, self-registered into `VIZ_CONFIG` (declared in `core/10-init.js`, exported for tests), each with play/pause/step/scrub/speed, custom input re-simulation, and per-page legend.
  - Every topic's trace uses the **same example data as its page's Step-by-Step table** (asserted by `test_viz_traces.js`).
- Build sizes: `dist/script.js` 890 KB, `dist/index.standalone.html` 966 KB, 98 static HTML pages, `dist/style.css` 55 KB.
- `validate.js` reports: **83 pages, ALL CHECKS PASSED** (205 explain blocks, 2738 explained lines, 49 pages with program groups).

### Test suites (all green, `/tmp/opencode/`)
- `validate.js` — 83 pages, ALL CHECKS PASSED.
- `test_app.js` (83 pages), `test_dom.js`, `test_mpa.js` (98 pages boot), `test_standalone.js` (content://), `test_android.js` (hostile file://).
- **Viz suites**: `test_viz.js` (two-pointers DOM: mount/step/scrub/apply/play), `test_viz_topics.js` (all 14 topic pages mount + step to last frame), `test_viz_traces.js` (every simulation's final result asserted), `test_standalone_viz.js` (standalone mounts a viz via hash nav).
- **Run command**: `node build.js && node validate.js && node /tmp/opencode/test_app.js && node /tmp/opencode/test_viz_traces.js && node /tmp/opencode/test_viz_topics.js && node /tmp/opencode/test_dom.js && node /tmp/opencode/test_mpa.js && node /tmp/opencode/test_standalone.js && node /tmp/opencode/test_android.js` (test_mpa needs ~2.5 min; test_dom/standalone/android ~1 min each — run them one at a time).

### Serving over HTTP
```
cd dist && python3 -m http.server 8000     # then open http://localhost:8000/index.html
# or, for a zero-dependency single file that works from anywhere (http / file / content://):
#   open http://localhost:8000/index.standalone.html
```
MPA pages (`index.html` + sibling `*.html`) need the whole `dist/` folder served; `index.standalone.html` is self-contained.

### This session's fixes (regressions found & fixed)
1. **GSAP UMD broke jsdom (and Node require) via `(this||self).window = ...`** — the UMD header tries to assign `window` on a non-configurable getter (jsdom) and on `module.exports` in Node. Fixed in `build.js`: GSAP is invoked with `(function(){…}).call(__g)` where `__g = {}`; afterwards `__global.gsap` is set from `__g.window.gsap`. Real browsers behave identically; the jsdom harness needs no shim.
2. **Scrub bar bug (real UX bug found by DOM test)** — the scrub `input` handler called `pause()` before reading `scrub.value`, and `pause()` → `updateControls()` resets `scrub.value = this.index`, so `goto(0)` early-returned and dragging snapped back. Fixed by capturing the index *before* pausing (`11-visualizer-engine.js` scrub handler + `wireScrubDrag` `onDown`).
3. **Standalone had no viz** — `build.js` section 7 inlines `dist/script.js`, so after the engine/viz modules landed the single file carries GSAP + all visualizations; verified via `test_standalone_viz.js` (hash-nav to a viz page mounts + animates).
4. **`VIZ_CONFIG` wasn't exported** — declared in `core/10-init.js` (so it exists before `module.exports`) and added to the export object; `src/js/viz/00-registry.js` is now comment-only.
5. **`test_mpa.js` slowed down** — with a visualizer on 28 pages, the `0ms` requestAnimationFrame stub made GSAP's ticker spin; stubbed rAF to a no-op and `dom.window.close()` after each page. Still ~2.5 min for 98 pages.
6. **Traversal suffix-max narration was wrong** — printed a constant array; now emits the true per-position suffix-max array `[8,8,8,8,3]`.

### Ground rules to keep (they hold up the validator)
- Every program group covers **all 5 languages** (C/C++/Java/Python/Dart) as **full standalone programs** (include/import + entry point + print/return).
- Exactly **one `~~~io` per group**; every page with groups needs matching io boxes.
- Full C/C++ programs need an entry point that exits successfully (`printf`/`cout` + `return 0`).
- Group names must be **unique app-wide** (a snippet group cannot reuse a topic group name — e.g. snippet Kadane is `maxsubarray`, not `kadane`).
- After every content edit: `node --check <file> && node build.js && node validate.js`, then the suites.
- Viz configs: one file per page under `src/js/viz/**`, self-registered into `VIZ_CONFIG` (container in `core/10-init.js`), `simulate(state, params) => frames`, engine primitives in `core/11-visualizer-engine.js`, `.viz` styles in `src/style.css`. Keep frame traces aligned with the page's Step-by-Step table.

### Next stages in order
1. **Phase 4, Stage B (problems)** — one viz config per problem page: interview problems first (16), then LeetCode (8), then snippets (11). Code pages already inherit their topic's viz (the lookup strips `code/`), so only problem/snippet pages need new files.
2. **Phase 4, Stage C (AI "Ask Doubt" panel)** — OpenAI-compatible endpoint (keys stay server-side in `server.js`, stdlib proxy to dodge CORS).
3. **Phase 5 (ship)** — device-test on Android Chrome (`dist/index.standalone.html` via file manager `content://`, and via an HTTP file-server app), then ship the standalone.
4. **Post-ship (P2/P3 backlog)** — reading time estimator, prev/next nav, more DSA topics (Linked List, Stack, Queue, Tree, Graph, DP, Greedy), problem difficulty filter, tag filtering, PWA manifest / service worker / system theme auto-detect. (Featured LeetCode/Codeforces problems w/ solutions is optional Stage C tail.)

---

## Phase 4, Stage A — Interactive Visualizations for every topic (14/14) ✅

### Engine (`src/js/core/11-visualizer-engine.js`)
- `Visualizer` (build → wireControls → rerun) with `Visualizer.prototype` primitives: `ensureCells` (array cells, diff-on-value, shrinks-async), `setHighlights`, `flashCells`, `movePointer`, `setWindow` (sliding-window overlay via scaleX), `ensureBars` (+ labels), `swapAnimate` (physical position exchange), `setVars`, `narrate`, `renderSubRow` (second labeled cell row: prefix table / hash buckets / merge result / part sums), `renderMatrix` (2D grid), `goto/next/prev/restart/applyInput`, `dispose`.
- `VizPlayer`: play/pause/next/prev/scrub/speed; reduced-motion → jump to last frame.
- Mounting: `vizInitForPage()` inserts the `.viz` mount right after the article's first `blockquote`; looks up `VIZ_CONFIG[currentPath]` (strips `code/` for code pages); teardown via `vizTeardownAll()` at the top of every render. `IntersectionObserver` pauses the player off-screen; `ResizeObserver` relayouts. Autoplay after 350 ms unless reduced motion.
- GSAP is used only for transforms/opacity (never top/left); wrapped in `build.js` so the UMD header is jsdom/Node-safe.

### Topic configs (`src/js/viz/topics/`, 14 files, `01`–`14` + two-pointers)
Each registers `VIZ_CONFIG['topics/<name>']` (plus a bare `<name>` alias for the code page) with `title`, `family`, `defaultState`, `inputs` (custom-input re-simulation), `legend`, `stepMs`, `simulate(state)`.

| Topic | What it animates | Sample outcome (asserted) |
|---|---|---|
| traversal | forward sum + reverse suffix max | sum 19; suffix `[8,8,8,8,3]` |
| prefix-sum | build pref row + range queries | sum(1..3)=6, sum(0..4)=14 |
| difference-array | O(1) range updates on diff + materialize | `[5,8,5,5,3,0]` |
| sliding-window | window slides, O(1) sum update | best 9 at `[2..4]` |
| two-pointers | l/r converge on sorted pair | found `[2,3]` |
| kadane | cur/best with current-subarray window | 6 at `[3..6]` |
| sorting | bubble / selection / insertion | sorted `[1..6]` |
| binary-search | probes with eliminated-half dimming | found idx 4 |
| hashing | hash-map bucket row grows | best 4 × 4 |
| matrix | 90° rotate (transpose + reverse rows) | `[[7,4,1],[8,5,2],[9,6,3]]` |
| merge-intervals | sort + merge, result sub-row | `[1,6] [8,10] [15,18]` |
| dutch-national-flag | lo/mid/hi one-pass swap | `[0,0,1,1,2,2]` |
| binary-search-answer | BS on answer + greedy feasibility | answer 18 |
| complexity | O(1)/O(n)/O(n²)/O(log n) bars vs n | bars at n=16 |

### CSS
`.viz` block appended in `src/style.css` before Print Styles: `.viz-head/.title/.legend`, `.viz-stage`, `.viz-cell` (+ `vz-left/right/compare/swap/found/active/pivot/dim`), `.viz-ptr`, `.viz-window`, `.viz-bar` (+ name), `.viz-sub` (+ label/cells), `.viz-matrix`, `.viz-vars`, `.viz-narr`, `.viz-log`, `.viz-controls`, `.viz-input`, theme-scoped soft-color vars, `prefers-reduced-motion` + print guards.

### Verification (all green)
- Build: `dist/script.js` 890 KB, `index.standalone.html` 966 KB, 98 HTML pages.
- `validate.js` → ALL CHECKS PASSED (83 pages).
- Suites: `test_app` ✓, `test_viz_traces` ✓ (14 traces), `test_viz_topics` ✓ (14 pages), `test_viz` ✓, `test_dom` ✓, `test_mpa` ✓ (98 pages), `test_standalone` ✓, `test_android` ✓, `test_standalone_viz` ✓.

### Next
- **Stage B (problems):** one viz per problem page — interview (16) → LeetCode (8) → snippets (11). Code pages already inherit topic vizes.



## Phase 3, Stage B (continued) — Learn pages (33 pages) ✅

## Current Build State — Phase 1 (Modular Architecture + Explained-Code Engine) ✅

The monolithic `script.js` was split into ordered modules and assembled by `build.js` into one offline file.

### Repo Layout
```
/sdcard/Projects/dsa-knowledge-base/
├── src/
│   ├── index.html          app shell (sidebar, search modal, bookmarks)
│   ├── style.css           theme + all component styles (incl. explained-code CSS)
│   └── js/
│       ├── core/           01-lang-tables (REFS library), 02-utils, 03-content-db,
│       │                   04-highlight, 05-renderer, 06-search, 07-router,
│       │                   08-ui, 09-langtabs, 10-init
│       └── content/        11-home … 19-learn (DB page modules, 34 pages today)
├── dist/                   build output: script.js + index.html + style.css + index.standalone.html
├── build.js                concat (numeric order) → dist; inlines → standalone
├── validate.js             static content validator (Node only, no installs)
└── progress.md
```

### Phase 1 Feature: Explained Code Engine
- New `~~~explain` fence: `lang:` + `group:` meta, `---` separator, per-line `##N## <explanation>`.
- Every explained line carries ≥1 reference: inline `[label](https://…)` or shorthand `[label]({lang:token})` expanded at render time from the `REFS` library in `01-lang-tables.js`.
- Blocks sharing a `group:` render as **C · C++ · Java · Python · Dart** tabs (`09-langtabs.js`), default C++, preference remembered per group.
- Problem cards accept `solution: <groupid>` → **View code** button scrolls to and flashes the group.
- Renderer: `renderExplain()` in `05-renderer.js`; `renderMarkdown()` branches `~~~explain` / `~~~problem` / `~~~lang`.
- Sample group landed: `twosum` (5 langs, brute force) attached to the Two Sum card in `interview/easy`.
- `validate.js` checks: page count (34), sequential fence balance, dead links, refs-per-line (≥1 per `##N##`, shorthand resolves), line-number bounds, per-language structure heuristics (`<stdio.h>` / `<bits/stdc++.h>` / `import java.util.*;`+`class Main` / `def main():` / `void main()`), group/page consistency.

### Verification (all green)
- `node build.js` → `dist/script.js` (150 KB), `index.standalone.html` (199 KB), `node --check` clean.
- `node validate.js` → ALL CHECKS PASSED.
- `test_app.js`, `test_dom.js` (incl. new explain/tabs/View-code cases), `test_android.js`, `test_standalone.js` → all pass.

---

## Current Build State — Phase 2 (Preferred Language + Language Switch on Every Code Block) ✅

### Preferred-language preference
- First visit to the **home page** opens a modal asking which language (C / C++ / Java / Python / Dart) the user prefers; choice persists via safe storage (`dsa_lang`, in-memory fallback on hostile `file://`).
- A persistent **Preferred language** control (`#langPrefSelect`) sits at the top of the home page so the choice can be changed anytime.
- The preference drives **explain-group default tabs**: a group defaults to the preferred language when present (falling back to C++, then first available). Changing the preference re-applies to any visible groups.

### Language switcher on every code block
- Every `.code-block` header now renders a `.lang-switch` `<select>` (C · C++ · Java · Python · Dart) in addition to the language label and copy/expand buttons.
- **Inside an explain group** → the select switches that group's active tab (synced with the tab bar).
- **Standalone block** → switching language:
  - jumps to the same snippet in that language when a block under the **same heading context** exists on the page (scroll + flash), otherwise
  - navigates to that language's snippet page (`#/snippets/<lang>`).
- Snippet pages (`snippets/c … dart`) get a **top language bar** (`.snippet-lang-bar`) with 5 buttons to jump between the parallel snippet pages.

### Implementation notes
- `LANG_ORDER` + `LANG_TAB_LABELS` + `langName()`/`langSelectOptions()` moved to `01-lang-tables.js` (module 1) so the renderer can build `<select>` options safely.
- `05-renderer.js`: `renderCodeBlock()` emits the `.lang-switch` select.
- `09-langtabs.js`: rewrite — pref get/set/apply, block switcher (`switchBlockLanguage` → group tab / `findTwinBlock` same-heading twin / snippet-page fallback), snippet lang bar, modal wiring (bound on home too), `flashBlock` shared with View-code.
- `07-router.js`: `renderHome()` calls `initLangPref()` (bar + first-visit modal); `renderPage()` calls `renderSnippetLangBar(path)`.
- `index.html`: `#langPrefModal` overlay added (backdrop, 5 option buttons, "Maybe later").
- CSS: `.lang-switch`, `.lang-pref-bar/-select/-hint`, `.snippet-lang-bar/-btn`, `.lang-pref-modal` styles; print rules hide the new chrome.

### Verification (all green)
- Build clean: `dist/script.js` (157 KB), `index.standalone.html` (212 KB).
- `validate.js`, `test_app.js`, `test_dom.js` (new cases: first-visit modal, pref persists, home control reflects choice, group default = python after choice, per-block switcher, standalone fallback navigation, snippet page bar), `test_android.js`, `test_standalone.js` → all pass.

### Next steps (later phases)
- Phase 3: convert topic/interview pages to structured sections (Prerequisites → Intuition → Trace → 5-lang tabs → Complexity → Edge cases → Pitfalls → Practice) + expand explained groups with per-line references.
- Phase 3: `19-learn.js` content — 3 new learn pages (getting-started, glossary, references) → 37 pages; bump `EXPECTED_PAGES` in `validate.js`.
- Phase 4: final QA on device + single-file distribution.

---

## Current Build State — Phase 3, Stage A (Mechanism: `~~~io` + Merged Snippets Page) ✅

### `~~~io` sample-input/output fence
- New fence type `~~~io` renders a **Sample Input / Sample Output (expected)** box (`.io-box`). Input section starts at `input:` (first line after it, further lines appended), output at `output:`.
- Renderer: `renderIo()` in `05-renderer.js`; `renderMarkdown()` now branches `~~~explain` / `~~~problem` / `~~~io` / `~~~lang`.
- CSS: `.io-box`, `.io-section`, `.io-input`/`.io-output`, `.io-label` (output label uses accent-success); print rules untouched (box survives printing).
- First live data: `twosum` (interview/easy) and the new `sumarray` group both carry `~~~io`.

### Merged Snippets page (34 → 30 pages)
- `snippets/c … dart` collapsed into one page `snippets` — one page, five languages per snippet.
- `14-snippets.js` rewritten: intro + the **Sum of Array** program as a full 5-language `sumarray` group (C/C++/Java/Python/Dart), each with per-line explanations and a matching `~~~io` (15).
- Removed: sidebar snippet children + top language bar (`.snippet-lang-bar`) — no longer needed; `renderSnippetLangBar()` deleted from `09-langtabs.js`, router call dropped, CSS and print rules cleaned.
- Standalone `.lang-switch` fallback no longer navigates to `snippets/<lang>`; without a same-heading twin it toasts "No <lang> version on this page".
- `03-content-db.js`: `HOME_CARDS` snippets entries merged into one card (26 cards); sidebar leaf now points at `snippets`.

### validate.js Phase A rules
- `EXPECTED_PAGES` 34 → 30.
- `checkFullProgram()`: group members must be **full standalone programs** (include/import + entry point + print) per language.
- Every program group must cover **all 5 languages** (`FIVE_LANGS`).
- Every page with program groups must have **exactly one `~~~io` per group**.

### Verification (all green)
- Build: `dist/script.js` (151 KB), `index.standalone.html` (206 KB).
- `validate.js` → ALL CHECKS PASSED (10 explain blocks, 91 explained lines, 2 groups).
- `test_app.js` (30 pages, highlight pulled from merged snippets page, sidebar links), `test_dom.js` (26 home cards; io-box output `0 1` / `15`; snippets page 5-lang group + tabs default python + io + lang-switch; standalone switcher stays on page), `test_android.js`/`test_standalone.js` (26 cards) → all pass.

### Next
- **Stage B (topics):** convert Kadane fully as the template (5-lang full programs + `~~~io` + per-line refs + enriched prose: Definition · History · Intuition · Trace · Complexity proof · Variants · Edge cases · Mistakes · Applications), then the remaining 13 topics + expand the merged Snippets page to ~10–12 groups.
- **Stage C (problems):** all 16 interview cards (5-lang full solution + `~~~io` + per-line + approach steps) + featured LeetCode/Codeforces problems.

---

## Current Build State — Phase 3, Stage B (Kadane topic = full template) ✅

### `topics/kadane` rebuilt as the standard topic template
The page now follows a fixed structure that every remaining topic will replicate:
1. **Definition** (callout box with complexity + optimality claim)
2. **History & Origin** — web-sourced narrative with citations:
   - Grenander 1977 (Brown, image pattern matching; O(n³) brute force → O(n²) prefix sums),
   - Shamos's overnight O(n log n) divide-and-conquer,
   - Jay Kadane's within-a-minute O(n) algorithm at a CMU seminar — [Bentley, "Programming Pearls: Algorithm Design Techniques", CACM 27(9):865, 1984](https://www.cs.rpi.edu/~moorthy/Courses/CSCI2300/p865-bentley.pdf),
   - Gries 1982 (Dijkstra's strategy), Bird 1989 (Bird–Meertens),
   - Footnote: Kadane's own 2023 retrospective [MDPI](https://www.mdpi.com/1999-4893/16/11/519) — the taught variant differs from his original only on all-negative input.
3. **Intuition** — plain-language dynamic programming framing (ending-here vs. starting-fresh).
4. **Step-by-Step Trace** — table for `[-2,1,-3,4,-1,2,1,-5,4]` showing `cur`/`best` → answer 6, subarray `[4,-1,2,1]`.
5. **The Program** — full `kadane` group: 5-language complete programs with per-line explanations (12 lines each C/C++, 11 Java, 14 Python, 16 Dart) + `~~~io` (output 6). Total 50 explained lines with references.
6. **Proof** — recurrence `dp[i] = max(a[i], dp[i-1] + a[i])`, induction, correctness over all ending positions.
7. **Complexity** — O(n) time / O(1) space, Ω(n) lower bound → optimal.
8. **Variants** — circular, max-product, 2D rectangle, recover subarray, length ≥ k (table with complexities).
9. **Edge cases** — all-negative (returns least-negative; original algorithm would give 0), single element, empty, overflow (64-bit), all zeros/positives.
10. **Common Mistakes** — best=0 seeding, forgetting to update `best`, looping from 0, subarray vs subsequence, missing restart.
11. **Applications** — image/astronomy (MDPI), genomics (Wikipedia), stock trading, ML subroutine.

### Verification (all green)
- Build: `dist/script.js` (167 KB), `index.standalone.html` (222 KB).
- `validate.js` → ALL CHECKS PASSED (15 explain blocks, 150 explained lines, 3 groups with matching `~~~io`).
- All 5 suites (test_app / test_dom / test_android / test_standalone) pass; Kadane search still tops "kadane" query.

### Next
- Apply the template to the remaining 13 topics, then expand the merged Snippets page to ~10–12 groups (Reverse, Prefix Sum, Difference Array, Kadane, Sliding Window, Two Pointers, Binary Search, Frequency/Hashing, Sorting, Two Sum).

---

## Phase 3, Stage B (continued) — All 12 topics converted + Snippets page expanded ✅

### Topic conversions (Kadane template applied to every array topic)
Each of the 14 array topics in `13-topics.js` now follows the full template (Definition · History & Origin with citations · Intuition · Step-by-Step Trace table · The Program as 5 full programs with per-line `##N##` references + `~~~io` · Why It Works/proof · Complexity table · Variants · Edge cases · Common mistakes · Applications · Try-it tip). Verified per-topic after each conversion (`node --check` + `build.js` + `validate.js` green), with cumulative explain-block / explained-line / io-group counts:

| Topic | blocks | lines | io groups |
|-------|--------|-------|-----------|
| traversal | 20 | 228 | 4 |
| prefix-sum | 25 | 285 | 5 |
| difference-array | 30 | 373 | 6 |
| sliding-window | 35 | 447 | 7 |
| two-pointers | 40 | 534 | 8 |
| sorting | 45 | 607 | 9 |
| binary-search | 50 | 694 | 10 |
| hashing | 55 | 779 | 11 |
| matrix | 60 | 896 | 12 |
| merge-intervals | 65 | 972 | 13 |
| dutch-national-flag | 70 | 1072 | 14 |
| binary-search-answer | 75 | 1186 | 15 |
| complexity | 80 | 1273 | 16 |

Sources woven into History/Origin sections: binary search = Mauchly 1946 Moore School Lectures; prefix sums = Hillis–Steele; hashing = Hans Peter Luhn/IBM; Dutch National Flag = Dijkstra *A Discipline of Programming* 1976; Big O = Bachmann 1894 *Die Analytische Zahlentheorie*; merge intervals = Wikipedia/LC 56; binary-search-answer = Mauchly + LC 410/875/1011.

### Merged Snippets page expanded (1 → 11 groups)
- `14-snippets.js` grew from the single `sumarray` group to **11 groups**: `sumarray`, `reverse`, `prefixsum`, `diffarray`, `maxsubarray` (Kadane), `windowmax`, `twopointer`, `binsearch`, `freqcount`, `selsort`, `intervalmerge` — each a 5-language full-program group with per-line references and a matching `~~~io` box.
- Sample outputs covered: reverse `5 4 3 2 1`, prefix sum `[2, 5, 10, 11]`, diffarray `0 3 5 5 2`, kadane 6, windowmax 39, freqcount `2: 3 / 4: 4 / 5: 1`, intervalmerge `[1,6] [8,10] [15,18]`.
- **Name fix:** the snippet Kadane group was `group: kadane`, which collided with the `topics/kadane` group (validator: "spans pages topics/kadane and snippets"); renamed to `maxsubarray` → validate green.

### Verification (all green)
- Build: `dist/script.js` (465 KB), `index.standalone.html` (519 KB).
- `validate.js` → ALL CHECKS PASSED: 30 pages, 130 explain blocks, 1842 explained lines with references, every program group covers all 5 languages, 16 pages with program groups all have matching `~~~io`.
- All 4 suites pass at `dist/`: test_app.js (30 pages, search tops: "kadane" → topics/kadane, "dart" → topics/traversal), test_dom.js (snippets page 5-lang group + tabs + io), test_android.js (hostile file://), test_standalone.js (content://) — all green.

### Next
- **Stage C (problems):** all 16 interview cards (5-lang full solution + `~~~io` + per-line + approach steps) + featured LeetCode/Codeforces problems.
- Later: 3 learn pages (`getting-started`, `glossary`, `references`) → 37 pages; bump `EXPECTED_PAGES`.



## Phase 1: Research ✅ COMPLETED

### Sources Consulted
- GeeksforGeeks (Array storage, Dutch National Flag, Difference Array, Prefix Sum)
- LeetCode Official Editorials (LC 121, LC 283, LC 169, LC 56)
- Codeforces Editorials (Div 3/Div 2 patterns, Binary Search on Answer)
- Academic Papers (Kadane's Algorithm proof — UMD CMSC 351, Bitner 1982)
- The DSA Handbook (Prefix sums, Binary Search variants)
- TechInterview.org (Prefix Sum patterns, Merge Intervals)

### Key Findings Verified
| Topic | Verified Complexity | Source |
|-------|---------------------|--------|
| Kadane's Algorithm | O(n) time, O(1) space | UMD CMSC 351, Wikipedia, MDPI 2023 |
| Dutch National Flag | O(n) time, O(1) space | Dijkstra, NIST DADS, Bitner 1982 |
| Reversal Rotation | O(n) time, O(1) space | GeeksforGeeks, CS StackExchange |
| Prefix Sum (1D) | Build O(n), query O(1) | DSA Handbook, TechInterview |
| Prefix Sum (2D) | Build O(mn), query O(1) | DSA Handbook, LeetCode 304 |
| Difference Array | Update O(1), rebuild O(n) | Codeforces 86420, GeeksforGeeks |
| Binary Search on Answer | O(F·log W) | Codeforces 143038, DSA Handbook |
| Merge Intervals | O(n log n) time | LeetCode 56 editorial, InterviewLoop |

---

## Phase 2: Architecture ✅ COMPLETED

### Structure
```
/sdcard/Projects/dsa-knowledge-base/
├── index.html      (8KB - Main HTML structure)
├── style.css       (14KB - Complete styling)
└── script.js       (35KB - Content DB + App logic)
```

### Design Decisions
- **Single Page Application (SPA):** All content embedded in JavaScript `DB` object
- **No build step required:** Works directly via `file://` protocol
- **Scalable architecture:** New topics require only DB entry + nav item
- **Android compatible:** Touch-friendly, viewport optimized, `-webkit-overflow-scrolling: touch`
- **Light theme default:** `data-theme="light"` on `<html>` element
- **Theme switch in header:** Visible on every page via `#themeToggle` button

---

## Phase 3: Implementation Status

### Files Created

| File | Size | Status | Notes |
|------|------|--------|-------|
| `index.html` | ~20KB | ✅ Complete | Complete structure with sidebar, search modal, bookmarks panel |
| `style.css` | ~28KB | ✅ Complete | Light theme default, dark mode support, Android optimized, print styles |
| `script.js` | ~52KB | ✅ Complete | Content DB (34 pages), markdown renderer, router, search, bookmarks, theme, syntax highlighting |

### Features Implemented

#### Core Features
- ✅ **Homepage** with topic cards (Array, Linked List, Stack, Queue, Tree, Graph, DP, Greedy)
- ✅ **Sidebar Navigation** with collapsible sections
- ✅ **Breadcrumb Navigation** showing current path
- ✅ **Search Modal** with instant search across all content (`/` shortcut)
- ✅ **Bookmarks System** with `Ctrl+B` shortcut and slide-out panel
- ✅ **Theme Toggle** (Light/Dark) with localStorage persistence
- ✅ **Scroll Progress Bar** at top of content area
- ✅ **Back to Top** button
- ✅ **Copy Code** buttons on all code blocks
- ✅ **Expand/Collapse** code blocks
- ✅ **Syntax Highlighting** for C, C++, Java, Python, Dart
- ✅ **Keyboard Shortcuts:** `/` (search), `Esc` (close), `Ctrl+B` (bookmark)
- ✅ **Print-Friendly Styles:** Hide UI chrome, show only article content
- ✅ **Responsive Design:** Mobile hamburger menu, adaptive layouts
- ✅ **Android Optimization:** Touch targets (44px min), safe scrolling, viewport locked

### Content Completeness

#### Array Topic Sections
| Section | Status | Pages |
|---------|--------|-------|
| **Research** | ✅ Complete | Memory layout, static/dynamic, complexity, cache, FAQ |
| **DSA Topics** | ✅ 14 topics | Traversal, Prefix Sum, Difference Array, Sliding Window, Two Pointers, Kadane, Sorting, Binary Search, Hashing, Matrix, Merge Intervals, Dutch National Flag, Binary Search on Answer, Complexity |
| **Interview Questions** | ✅ 3 sections | Easy, Medium, Hard |
| **LeetCode** | ✅ 3 sections | Easy, Medium, Hard |
| **Codeforces** | ✅ 3 sections | Div 3, Div 2, Patterns |
| **Code Snippets** | ✅ 5 languages | C, C++, Java, Python, Dart |
| **Patterns** | ✅ Complete | All 9 patterns with cheat sheet |

### Content Database Keys (18 pages)
1. `home` — Dashboard
2. `research/array` — Array Research Notes
3. `topics/traversal` — Array Traversal
4. `topics/prefix-sum` — Prefix Sum
5. `topics/sliding-window` — Sliding Window
6. `topics/two-pointers` — Two Pointers
7. `topics/kadane` — Kadane's Algorithm
8. `topics/sorting` — Array Sorting
9. `topics/binary-search` — Binary Search
10. `topics/hashing` — Hashing & Frequency Arrays
11. `topics/matrix` — Matrix / 2D Array
12. `topics/merge-intervals` — Merge Intervals
13. `topics/dutch-national-flag` — Dutch National Flag
14. `topics/binary-search-answer` — Binary Search on Answer
15. `topics/complexity` — Complexity Analysis
16. `topics/difference-array` — Difference Array
17. `interview/easy` — Easy Interview Questions
18. `interview/medium` — Medium Interview Questions
19. `interview/hard` — Hard Interview Questions
20. `interview/company` — Company Wise Questions
21. `interview/theory` — Theory Questions
22. `leetcode/easy` — LeetCode Easy
23. `leetcode/medium` — LeetCode Medium
24. `leetcode/hard` — LeetCode Hard
25. `leetcode/topic-wise` — LeetCode Topic Wise
26. `codeforces/div3` — Codeforces Div 3
27. `codeforces/div2` — Codeforces Div 2
28. `codeforces/patterns` — Codeforces Patterns
29. `snippets/c` — C Snippets
30. `snippets/cpp` — C++ Snippets
31. `snippets/java` — Java Snippets
32. `snippets/python` — Python Snippets
33. `snippets/dart` — Dart Snippets
34. `patterns/overview` — Array Patterns Overview

---

## Phase 4: Android Compatibility ✅ COMPLETED

### Optimizations Applied
- **Viewport:** `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- **Touch Targets:** All interactive elements ≥ 44px (Android design guideline)
- **Scrolling:** `-webkit-overflow-scrolling: touch` for smooth momentum scrolling
- **Tap Highlight:** `-webkit-tap-highlight-color: transparent` to remove blue flash
- **Font Sizing:** `-webkit-text-size-adjust: 100%` prevents auto-zoom
- **Safe Areas:** Padding respects Android navigation bars
- **Header:** Fixed 56px height, `-webkit-app-region: drag` for potential PWA wrapping
- **Sidebar:** Fixed position overlay on mobile with `transform: translateX(-100%)` transition
- **Code Blocks:** Horizontal scroll with `-webkit-overflow-scrolling: touch`
- **Tables:** Horizontal scroll wrapper for small screens
- **Print Styles:** `@media print` hides UI chrome, shows only article

### Theme Implementation
- **Default:** Light theme (`data-theme="light"` on `<html>`)
- **Toggle:** Sun/Moon icon button in header, visible on every page
- **Persistence:** `localStorage.setItem('dsa_theme', theme)`
- **Colors:** High contrast, WCAG AA compliant

---

## Phase 5: Verification ✅ COMPLETED

### Android Chrome Fixes Applied
1. ✅ **`localStorage` SecurityError on `file://`** — Android Chrome treats `file://` pages as opaque origins; any `localStorage` access throws and previously crashed `init()`. Replaced all direct access with a safe storage layer (`storage.get/set`) that uses an in-memory fallback when storage is unavailable. Verified in a jsdom hostile `file://` environment.
2. ✅ **Render-blocking Google Fonts** — the `<link rel="stylesheet">` to fonts.googleapis.com blocked first render and hung blank when offline. Now loaded asynchronously (`media="print" onload="this.media='all'"` + `display=swap`) so the page renders instantly even without network.
3. ✅ **Hardened `init()`** — every subsystem bind is wrapped in a `safe()` guard; a single failure can no longer blank the whole app.
4. ✅ **`<noscript>` fallback** in the article area for diagnostics.

### Test Results (jsdom integration suite + Node unit checks)

1. ✅ All 34 DB pages render with valid `h1` content
2. ✅ No console errors across all routes
3. ✅ All 34 sidebar leaf links navigate correctly (34/34)
4. ✅ Syntax highlighting produces `.hl-*` spans in C, C++, Java, Python, Dart
5. ✅ Copy buttons copy exact code text; expand/collapse toggles
6. ✅ Theme toggle persists via `dsa_theme` in localStorage
7. ✅ Search returns scored results with previews; click navigates
8. ✅ Bookmarks persist via `dsa_bookmarks`; panel lists items; Ctrl+B works
9. ✅ Responsive sidebar: parent expand/collapse, mobile toggle, auto-close on nav
10. ✅ Breadcrumb, copy-path, scroll-progress, back-to-top all functional
11. ✅ Keyboard shortcuts: `/` opens search, `Esc` closes, `Ctrl+B` bookmarks
12. ✅ All internal `[text](path)` links resolve to valid DB keys
13. ✅ All code fences balanced across every content page

### Markdown Renderer Extensions Verified
- Callouts `> [!info|warning|success|danger]` → `.callout` divs
- Problem cards `~~~problem` → `.problem-card` with difficulty badge + tags
- Tables, nested lists, blockquotes, inline code, bold/italic, external/internal links
- Code blocks `~~~lang` → `.code-header` + `.lang-label` + copy/expand actions

### Unit Tests
- `node --check script.js` → syntax clean
- 34-page render, search-index, dead-link, fence-balance checks → all pass

### Single-File Build (`index.standalone.html`) ✅ VERIFIED
`content://` URIs (e.g. Android file-manager open) cannot load sibling `style.css`/`script.js`, so `build.js` inlines both into one self-contained HTML (171 KB) that works from any URI.

- **Bug found & fixed:** `build.js` used `String.prototype.replace` with string replacements, which interprets `$$`, `$&`, `$1`, etc. — the `function $$()` helper was being collapsed to `function $()`, making every `$('#id')` return a `querySelectorAll` array (no `.style`/`.classList`), crashing `setProgress`/`updateBookmarkBtn`. Fixed by using replacement functions instead of strings.
- **Verified under `content://` + no `localStorage`:** 30 home cards, nav, theme, in-memory bookmarks, code copy, search (13 hits), 34/34 sidebar pages, zero console errors.
- Regression suites all still pass: `test_app.js`, `test_dom.js`, `test_android.js`, `test_standalone.js`.

---

## Known Issues / Future Improvements

### P1 (Medium Priority)
- None currently identified

### P2 (Low Priority)
- Add reading time estimator
- Add previous/next navigation buttons
- Add more DSA topics (Linked List, Stack, Queue, Tree, Graph, DP, Greedy)
- Add more code snippet variants
- Add problem difficulty filter in search
- Add tag-based filtering

### P3 (Nice to Have)
- Progressive Web App (PWA) manifest for Android home screen
- Offline support via Service Worker
- Dark/light theme auto-detect based on system preference
- Search history
- Recently visited pages
- Keyboard navigation for search results

---

## How to Use

1. Navigate to `/sdcard/Projects/dsa-knowledge-base/`
2. Open `index.html` in any modern browser
3. No server, build tool, or dependencies required
4. Works completely offline after first load (fonts cached)

---

## Next Steps (full roadmap)

1. **[DONE] Phase 3 Stage B — content build:** all 14 array topics converted to the full template; merged Snippets page expanded to 11 groups. Verified green (130 blocks / 1842 lines / 16 io pages).
2. **[DONE] Phase 4 Stage A — interactive visualizations for all 14 topics:** GSAP engine + one config per topic, mount/teardown wired into the router, vendored offline GSAP, 14 traces asserted correct, standalone carries the vizes too. (2026-08-06.)
3. **Phase 4 Stage B — problems:** one viz per problem page — interview (16) → LeetCode (8) → snippets (11). Code pages already inherit their topic's viz.
4. **Phase 4 Stage C — AI "Ask Doubt" panel:** OpenAI-compatible endpoint (`https://vedalabs-vedika-advanced-ai-4-1-flash.hf.space/v1/chat/completions`), keys server-side in a stdlib `server.js` proxy to dodge CORS.
5. **Phase 5 — ship:** re-verify all suites, device-test on Android Chrome, ship `dist/index.standalone.html`.
6. **Post-ship (P2/P3 backlog):** reading time, prev/next nav, more DSA topics (Linked List, Stack, Queue, Tree, Graph, DP, Greedy), problem difficulty filter, tag filtering, PWA manifest / service worker / theme auto-detect.

---

*Last Updated: 2026-08-06 (Phase 4 Stage A complete — GSAP visualizer engine + all 14 topic animations, traces asserted, standalone includes vizes. **Next session: Phase 4 Stage B — viz configs for the 16 interview problem pages in `15-interview.js`, see "RESUME HERE" at top.**)*
