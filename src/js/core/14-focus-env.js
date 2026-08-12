/* ============================================================
   DSA Knowledge Base - script.js (module: focus-env)
   Focus Mode — full-screen teaching environment.
   Mounts a normal Visualizer on a .focus-stage mount, prefaces it
   with an animated "why this approach" comparison (brute force vs
   the real solution, as a pair of operation-count bars) and follows
   it with a plain-English concept recap + the synced code panel.

   Config-driven: every problem that registers a FOCUS_CONFIG entry
   (see src/js/viz/problems/**) automatically gets a focus/<id> page.
   - Reuses the existing Visualizer + VIZ_CONFIG simulate() pattern.
   - Reuses the existing .code-explain[data-group] blocks (pulled from
     the generated code/<group> DB entry, never duplicated by hand).
   - Reuses the immersive-layer Cockpit Bridge beam via data-group.
   - Reduced motion (VIZ_REDUCED) jumps to final states, no tweens.
   Only transform/opacity are ever animated.
   ============================================================ */

/* ---------- helpers ---------- */

function focusIdFromPath(path) {
    return String(path || '').replace(/^focus\//, '');
}

function focusConfigFor(path) {
    var id = focusIdFromPath(path);
    return (typeof FOCUS_CONFIG !== 'undefined' && FOCUS_CONFIG[id]) ? FOCUS_CONFIG[id] : null;
}

function focusBackHref(cfg) {
    if (cfg && cfg.from) return pageFile(cfg.from);
    if (cfg && cfg.codeGroup) return pageFile('code/' + cfg.codeGroup);
    return pageFile('home');
}

/* grab every ~~~explain fence out of a code page's raw content so the
   focus page can re-render the exact same blocks (lang tabs + beam) */
function focusExplainMarkdown(codeGroup) {
    var page = (typeof DB !== 'undefined') ? DB['code/' + codeGroup] : null;
    var src = (page && page.content) ? page.content : '';
    var out = [];
    var lines = src.split('\n');
    var i = 0;
    while (i < lines.length) {
        var m = lines[i].match(/^~~~(\w*)\s*$/);
        if (m && m[1] === 'explain') {
            var buf = [lines[i]];
            i++;
            while (i < lines.length && !/^~~~\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
            if (i < lines.length) buf.push(lines[i]);
            i++;
            out.push(buf.join('\n'));
        } else {
            i++;
        }
    }
    return out.join('\n\n');
}

/* ---------- comparison widget ("why, not just what") ----------
   The widget always compares two approaches: the baseline "brute"
   bar and the intended "opt" bar. Labels are config-driven so the
   same component narrates Two Sum (Hash map), Move Zeroes (Two
   pointers), Boyer-Moore, etc. */

function focusCompareInit(widget, cfg) {
    var beats = cfg.beats;
    var bruteLabel = cfg.bruteLabel || 'Brute force';
    var optLabel = cfg.optLabel || 'Optimal';
    if (!widget || !beats || !beats.length) return;
    var idx = 0;
    var maxOps = 1;
    beats.forEach(function (b) {
        if (b.brute > maxOps) maxOps = b.brute;
        if (b.opt > maxOps) maxOps = b.opt;
    });

    var narr = widget.querySelector('[data-focus-narr]');
    var step = widget.querySelector('[data-focus-step]');
    var prevBtn = widget.querySelector('[data-focus-prev]');
    var nextBtn = widget.querySelector('[data-focus-next]');
    var fills = {
        brute: widget.querySelector('[data-focus-fill="brute"]'),
        opt: widget.querySelector('[data-focus-fill="opt"]')
    };
    var counts = {
        brute: widget.querySelector('[data-focus-count="brute"]'),
        opt: widget.querySelector('[data-focus-count="opt"]')
    };
    var labels = {
        brute: widget.querySelector('[data-focus-label="brute"]'),
        opt: widget.querySelector('[data-focus-label="opt"]')
    };
    if (labels.brute) labels.brute.textContent = bruteLabel;
    if (labels.opt) labels.opt.textContent = optLabel;

    function setBeat(i, animate) {
        var b = beats[i];
        idx = i;
        if (narr) narr.textContent = b.narr;
        if (step) step.textContent = (i + 1) + ' / ' + beats.length;
        var setBar = function (key, val) {
            var pct = val / maxOps;
            if (fills[key]) {
                if (animate && !VIZ_REDUCED) {
                    vizTween(fills[key], { scaleY: pct }, 0.5, 'power2.out');
                } else {
                    (function (el) { var g = VIZ_GSAP(); if (g) g.set(el, { scaleY: pct }); else el.style.transform = 'scaleY(' + pct + ')'; })(fills[key]);
                }
            }
            if (counts[key]) counts[key].textContent = val;
        };
        setBar('brute', b.brute);
        setBar('opt', b.opt);
        if (prevBtn) prevBtn.disabled = (i === 0);
        if (nextBtn) nextBtn.disabled = (i >= beats.length - 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { if (idx > 0) setBeat(idx - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { if (idx < beats.length - 1) setBeat(idx + 1, true); });

    /* reduced motion jumps straight to the final beat (the "answer") */
    setBeat(VIZ_REDUCED ? beats.length - 1 : 0, false);
}

/* ---------- renderer ---------- */

function renderFocus(path) {
    var cfg = focusConfigFor(path);
    if (!cfg) { renderHome(); return; }
    var id = focusIdFromPath(path);

    currentPath = path;
    document.title = cfg.title + ' — DSA Knowledge Base';
    safe(immersiveExit);
    safe(vizTeardownAll);
    focusExit();

    var vizCfg = (typeof VIZ_CONFIG !== 'undefined') ? VIZ_CONFIG[cfg.viz || id] : null;

    var beatRows = '';
    if (cfg.beats && cfg.beats.length) {
        beatRows =
            '<p class="focus-narr" data-focus-narr></p>' +
            '<div class="focus-compare">' +
                '<div class="focus-compare-row">' +
                    '<span class="focus-compare-label" data-focus-label="brute">Brute force</span>' +
                    '<span class="focus-compare-track"><span class="focus-compare-fill focus-brute" data-focus-fill="brute"></span></span>' +
                    '<span class="focus-compare-count" data-focus-count="brute">0</span>' +
                '</div>' +
                '<div class="focus-compare-row">' +
                    '<span class="focus-compare-label" data-focus-label="opt">Optimal</span>' +
                    '<span class="focus-compare-track"><span class="focus-compare-fill focus-hash" data-focus-fill="opt"></span></span>' +
                    '<span class="focus-compare-count" data-focus-count="opt">0</span>' +
                '</div>' +
                '<div class="focus-compare-controls">' +
                    '<button type="button" class="focus-btn" data-focus-prev>&#8249; Prev</button>' +
                    '<span class="focus-compare-step" data-focus-step></span>' +
                    '<button type="button" class="focus-btn" data-focus-next>Next &#8250;</button>' +
                '</div>' +
            '</div>';
    }

    var stageHtml = vizCfg
        ? '<div class="focus-block focus-stage-block">' +
              '<h2 class="focus-h2">Watch it one step at a time</h2>' +
              '<div class="viz focus-stage" data-focus-stage></div>' +
              '<button type="button" class="focus-btn focus-btn-start" data-focus-start>&#9654; Start simulation</button>' +
          '</div>'
        : '';

    var recapHtml = cfg.recap
        ? '<section class="focus-block focus-recap-block">' +
              '<details class="focus-recap">' +
                  '<summary>' + escapeHtml(cfg.recapTitle || 'Concept recap') + '</summary>' +
                  '<p>' + escapeHtml(cfg.recap) + '</p>' +
              '</details>' +
          '</section>'
        : '';

    var codeMd = focusExplainMarkdown(cfg.codeGroup || id);
    var codeHtml = codeMd
        ? '<section class="focus-block focus-code-block">' +
              '<details class="focus-code" open>' +
                  '<summary>The code, line by line</summary>' +
                  '<div class="focus-code-body">' + renderMarkdown(codeMd) + '</div>' +
              '</details>' +
          '</section>'
        : '';

    $('#article').innerHTML =
        '<div class="focus-env"' + ' data-focus-id="' + escapeHtml(id) + '">' +
            '<header class="focus-env-head">' +
                '<a class="focus-back" href="' + focusBackHref(cfg) + '">&#8592; Back</a>' +
                '<span class="focus-env-title">' + escapeHtml(cfg.title || 'Focus Mode') + '</span>' +
            '</header>' +
            '<section class="focus-block focus-intro-block">' +
                '<h1 class="focus-h1">' + escapeHtml(cfg.tagline || 'Why one pass, not two?') + '</h1>' +
                '<p class="focus-lead">' + escapeHtml(cfg.lead || 'Compare the naive approach with the efficient one before looking at the code.') + '</p>' +
                beatRows +
            '</section>' +
            stageHtml +
            recapHtml +
            codeHtml +
        '</div>';

    document.body.classList.add('focus-mode');

    if (vizCfg) {
        var mount = $('#article [data-focus-stage]');
        if (mount) {
            var viz = new Visualizer(mount, vizCfg);
            focusWireStart(viz);
        }
    }

    if (beatRows) {
        var widget = $('#article [data-focus-narr]');
        focusCompareInit(widget ? widget.parentNode : null, cfg);
    }

    safe(function () { initLangTabs(document); initBlockSwitchers(document); });
    safe(initScrollReveal);
}

/* "Start simulation": scroll the stage into view and let it play.
   Paused by default so the learner can finish the intro first. */
function focusWireStart(viz) {
    var btn = $('#article [data-focus-start]');
    if (!btn) return;
    btn.addEventListener('click', function () {
        if (viz.stage) viz.stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!viz.reduced) setTimeout(function () { viz.play(); }, 350);
        else viz.goto(viz.frames.length - 1);
    });
}

function focusExit() {
    if (typeof document !== 'undefined') document.body.classList.remove('focus-mode');
}

function focusInitForPage() {
    var path = (typeof currentPath !== 'undefined') ? currentPath : '';
    if (path.indexOf('focus/') === 0) renderFocus(path);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports.renderFocus = renderFocus;
    module.exports.focusInitForPage = focusInitForPage;
    module.exports.focusExit = focusExit;
}