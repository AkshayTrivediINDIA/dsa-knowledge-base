#!/usr/bin/env node
/* ============================================================
   validate.js — static content validator (Node only, no installs)
   Checks the built app + authored content against Phase 1 rules:
   - expected page count
   - fence balance (~~~ / ~~~problem / ~~~explain)
   - internal links resolve (dead links)
   - ~~~explain blocks: meta present, per-line references
     (>= 1 link per ##N##, shorthand tokens resolve in REFS),
     line numbers point at real code lines
   - per-language structure heuristics
   Usage: node validate.js
   ============================================================ */

const path = require('path');
const PROJECT = path.join(__dirname, 'dist', 'script.js');
const app = require(PROJECT);

const { DB, refUrl } = app;

const EXPECTED_PAGES = 83;
const STRUCT_LANG = { c: 'c', cpp: 'cpp', java: 'java', python: 'python', dart: 'dart' };

let errors = 0;
const fail = (msg) => { errors++; console.log('FAIL: ' + msg); };
const ok = (msg) => console.log('ok:   ' + msg);

/* ---------- fence balance ---------- */
function fenceBalance(content) {
    const lines = content.split('\n');
    let open = 0;
    const seen = [];
    for (const ln of lines) {
        if (/^~~~[a-z]+\s*$/.test(ln)) open++;
        else if (/^~~~\s*$/.test(ln)) { open--; if (open < 0) return 'extra closer'; }
    }
    if (open !== 0) return 'unbalanced (open=' + open + ')';
    return null;
}

/* ---------- explain block parser (independent of renderer) ---------- */
function parseExplainBlocks(content) {
    const blocks = [];
    const lines = content.split('\n');
    let i = 0;
    while (i < lines.length) {
        const m = lines[i].match(/^~~~explain\s*$/);
        if (m) {
            const raw = [];
            i++;
            while (i < lines.length && !/^~~~\s*$/.test(lines[i])) {
                raw.push(lines[i]); i++;
            }
            blocks.push(parseExplainBlock(raw));
        }
        i++;
    }
    return blocks;
}

function parseExplainBlock(lines) {
    const meta = {};
    const code = [];
    const expl = [];
    let seenSeparator = false;
    for (const line of lines) {
        const mm = line.match(/^([a-z_]+)\s*:\s?(.*)$/i);
        if (!seenSeparator && mm && ['lang', 'group', 'level', 'topic'].includes(mm[1].toLowerCase())) {
            meta[mm[1].toLowerCase()] = mm[2].trim();
            continue;
        }
        if (!seenSeparator && /^---+\s*$/.test(line.trim())) { seenSeparator = true; continue; }
        if (seenSeparator) {
            const em = line.match(/^##(\d+)##\s*(.*)$/);
            if (em) expl.push({ n: parseInt(em[1], 10), text: em[2] });
        } else {
            code.push(line);
        }
    }
    return { meta, code, expl };
}

const FULL_PROGRAM = {
    c: [/#include\s*<stdio\.h>/, /int\s+main\s*\(/, /printf/],
    cpp: [/#include\s*<bits\/stdc\+\+\.h>/, /int\s+main\s*\(/, /(cout|cin|printf)/],
    java: [/import\s+java\.util\.\*;/, /public\s+static\s+void\s+main\s*\(/, /System\.out\.print/],
    python: [/def\s+main\s*\(/, /print\s*\(/],
    dart: [/void\s+main\s*\(/, /print\s*\(/]
};

/* group members must be full standalone programs (not fragments) */
function checkFullProgram(lang, code) {
    const src = code.join('\n');
    const checks = FULL_PROGRAM[lang];
    if (!checks) return 'unknown lang: ' + lang;
    return checks.every((r) => r.test(src)) ? null : 'full-program heuristics not met for ' + lang;
}

const FIVE_LANGS = ['c', 'cpp', 'java', 'python', 'dart'];

const REF_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;


function explainRefs(text) {
    const refs = [];
    let m;
    const copy = String(text);
    while ((m = REF_RE.exec(copy))) refs.push(m[2]);
    return refs;
}

function isShorthand(href) {
    const m = href.match(/^\{([a-z]+):([a-zA-Z0-9_]+)\}$/);
    return m ? { lang: m[1], token: m[2] } : null;
}

/* ---------- per-language structure heuristics ---------- */
function checkStructure(lang, code) {
    const src = code.join('\n');
    const rules = {
        c: [/#include\s*<stdio\.h>/],
        cpp: [/#include\s*<bits\/stdc\+\+\.h>/],
        java: [/import\s+java\.util\.\*;/, /class\s+Main/],
        python: [/def\s+main\s*\(/],
        dart: [/void\s+main\s*\(/]
    };
    const checks = rules[lang];
    if (!checks) return 'unknown lang: ' + lang;
    return checks.every((r) => r.test(src)) ? null : 'structure heuristics not met for ' + lang;
}

/* ============================================================
   Run
   ============================================================ */

const keys = Object.keys(DB);
console.log('\n== validate.js ==');

// 1. page count
console.log('\n[pages] ' + keys.length + ' pages');
if (keys.length !== EXPECTED_PAGES) fail('expected ' + EXPECTED_PAGES + ' pages, got ' + keys.length);
else ok('page count matches (' + EXPECTED_PAGES + ')');

// 2. per-page fence balance
keys.forEach((id) => {
    const err = fenceBalance(DB[id].content);
    if (err) fail(id + ': ' + err);
});
ok('fence balance across ' + keys.length + ' pages');

// 3. dead internal links (shorthand skipped, validated separately)
keys.forEach((id) => {
    const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    let m;
    while ((m = re.exec(DB[id].content))) {
        const href = m[2];
        if (/^https?:/.test(href)) continue;
        if (href.charAt(0) === '#') continue;
        if (isShorthand(href)) continue;
        if (!DB[href]) fail(id + ': dead internal link -> ' + href);
    }
});
ok('internal links resolve');

// 4. explain blocks
console.log('\n[~~~explain blocks]');
let blockCount = 0;
let refLineCount = 0;
const groups = {};
keys.forEach((id) => {
    parseExplainBlocks(DB[id].content).forEach((b) => {
        blockCount++;
        const lang = b.meta.lang;
        const group = b.meta.group;

        if (!lang) fail(id + ': explain block missing lang');
        if (!group) fail(id + ': explain block missing group');

        // per-line references
        b.expl.forEach((e) => {
            refLineCount++;
            const refs = explainRefs(e.text);
            if (!refs.length) {
                fail(id + ' [' + group + ' ' + lang + '] line ##' + e.n + '## has no reference');
                return;
            }
            refs.forEach((href) => {
                const sh = isShorthand(href);
                if (sh) {
                    if (!refUrl(sh.lang, sh.token)) {
                        fail(id + ' [' + group + ' ' + lang + '] line ##' + e.n + '## bad shorthand {' + sh.lang + ':' + sh.token + '}');
                    }
                } else if (!/^https?:/.test(href)) {
                    fail(id + ' [' + group + ' ' + lang + '] line ##' + e.n + '## non-http link: ' + href);
                }
            });
        });

        // line numbers point at real code lines
        b.expl.forEach((e) => {
            if (e.n < 1 || e.n > b.code.length) {
                fail(id + ' [' + group + ' ' + lang + '] ##' + e.n + '## out of range (code has ' + b.code.length + ' lines)');
            }
        });

        // structure heuristics
        if (lang) {
            const serr = checkStructure(lang, b.code);
            if (serr) fail(id + ' [' + group + ' ' + lang + ']: ' + serr);
        }

        // group members must be full standalone programs
        if (group && lang) {
            const fp = checkFullProgram(lang, b.code);
            if (fp) fail(id + ' [' + group + ' ' + lang + ']: ' + fp);
        }

        // group consistency (all members same page)
        if (group) {
            if (!groups[group]) groups[group] = { page: id, langs: [] };
            if (groups[group].page !== id) fail('group "' + group + '" spans pages ' + groups[group].page + ' and ' + id);
            groups[group].langs.push(lang);
        }
    });
});
ok(blockCount + ' explain blocks, ' + refLineCount + ' explained lines with references');

// 5. every program group has all 5 languages
Object.keys(groups).forEach((g) => {
    const langs = groups[g].langs;
    const missing = FIVE_LANGS.filter((l) => !langs.includes(l));
    if (missing.length) fail('group "' + g + '" missing languages: ' + missing.join(', '));
});
ok('all program groups cover all 5 languages');

// 6. every program group has exactly one matching ~~~io box
const pageGroupCount = {};
keys.forEach((id) => {
    const seen = {};
    parseExplainBlocks(DB[id].content).forEach((b) => {
        if (b.meta.group) seen[b.meta.group] = true;
    });
    pageGroupCount[id] = Object.keys(seen).length;
});
let ioChecked = 0;
keys.forEach((id) => {
    const ioCount = (DB[id].content.match(/^~~~io\s*$/gm) || []).length;
    const gc = pageGroupCount[id];
    if (gc > 0) {
        ioChecked++;
        if (ioCount !== gc) fail(id + ': ' + gc + ' program group(s) but ' + ioCount + ' ~~~io box(es)');
    }
});
ok(ioChecked + ' pages with program groups all have matching ~~~io boxes');

console.log('\n== ' + (errors ? errors + ' FAILURES' : 'ALL CHECKS PASSED') + ' ==');
process.exit(errors ? 1 : 0);
