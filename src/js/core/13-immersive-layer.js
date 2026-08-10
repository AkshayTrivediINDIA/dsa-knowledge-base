/* ============================================================
   DSA Knowledge Base - script.js (module: immersive-layer)
   Immersive Visual Layer — premium "cinematic world" feel layered
   ON TOP of the visualizer engine (core/11-visualizer-engine.js).
   Never edits the engine; plugs in via a runtime wrapper on
   Visualizer.prototype.goto (the single step chokepoint).

   - Focus Mode: spotlight entry, blur+dim site, vignette on stage
   - Physics motion: organic easing via IMMERSIVE_CONFIG presets
   - Micro-feedback: compare pulse, success burst, backtrack flash,
     step tick on the narration chip
   - Ambient living background (CSS @keyframes only, zero per-tick JS)
   - Cinematic step transitions: camera settle, narration fade/slide,
     code "glow travel" via the Cockpit Bridge
   - Single IMMERSIVE_CONFIG = one visual identity for 90+ pages

   Guardrails: prefers-reduced-motion disables everything; only
   transform/opacity animate; observers are disconnected on exit.
   ============================================================ */

/* ============================================================
   Design-system lock — the one config every page reads.
   No hardcoded timings/easings/colors elsewhere in this module.
   ============================================================ */

var IMMERSIVE_CONFIG = {
    ease: {
        elastic: 'elastic.out(1, 0.5)',
        back: 'back.out(1.7)',
        settle: 'power2.inOut',
        soft: 'power2.out',
        jiggle: 'elastic.out(1, 0.35)'
    },
    dur: {
        fast: 0.18,
        normal: 0.4,
        slow: 0.6
    },
    burst: {
        min: 6,
        max: 14
    },
    beam: {
        height: 20
    },
    focus: {
        threshold: 0.1
    }
};

function immDur(key) {
    return IMMERSIVE_CONFIG.dur[key] || IMMERSIVE_CONFIG.dur.normal;
}

function immEas(key) {
    return IMMERSIVE_CONFIG.ease[key] || IMMERSIVE_CONFIG.ease.soft;
}

function immReduced() {
    return typeof VIZ_REDUCED !== 'undefined' && VIZ_REDUCED === true;
}

function immCssVar(name, fallback) {
    if (typeof document === 'undefined' || !document.documentElement) return fallback;
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) ? v.trim() : fallback;
}

function immGlow(kind) {
    if (kind === 'success') return immCssVar('--accent-success', '#1a7f37');
    if (kind === 'danger') return immCssVar('--accent-danger', '#cf222e');
    return immCssVar('--accent-primary', '#0969da');
}

/* ============================================================
   Focus Mode — "Spotlight Entry"
   A fixed overlay blurs the whole page behind a radial vignette
   centred on the cockpit stage. Driven by an IntersectionObserver
   on the .viz mount; auto fades back out on scroll-away.
   ============================================================ */

function immOverlay() {
    if (typeof document === 'undefined') return null;
    var ov = document.getElementById('imm-focus-overlay');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'imm-focus-overlay';
    ov.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ov);
    return ov;
}

function immInst() {
    var g = (typeof document !== 'undefined') ? document.body : null;
    if (!g) return { obs: null };
    if (!g.__imm) g.__imm = { obs: null };
    return g.__imm;
}

function immFocusOn(mount) {
    if (immReduced()) return;
    var st = (typeof document !== 'undefined') ? (mount || document.querySelector('.viz')) : null;
    if (!st) return;
    var r = st.getBoundingClientRect();
    var ov = immOverlay();
    if (ov) {
        ov.style.setProperty('--imm-cx', Math.round(r.left + r.width / 2) + 'px');
        ov.style.setProperty('--imm-cy', Math.round(r.top + r.height / 2) + 'px');
    }
    document.body.classList.add('imm-focus');
    var g = VIZ_GSAP();
    if (g && ov) g.to(ov, { opacity: 1, duration: immDur('normal'), ease: immEas('soft') });
    else if (ov) ov.style.opacity = '1';
}

function immFocusOff() {
    if (typeof document === 'undefined') return;
    var ov = document.getElementById('imm-focus-overlay');
    document.body.classList.remove('imm-focus');
    if (!ov) return;
    var g = VIZ_GSAP();
    if (g) g.to(ov, { opacity: 0, duration: immDur('normal'), ease: immEas('soft') });
    else ov.style.opacity = '0';
}

function immObserve() {
    if (immReduced()) return;
    if (typeof IntersectionObserver === 'undefined') return;
    var mount = document.querySelector('.viz');
    if (!mount) return;
    var inst = immInst();
    if (inst.obs) { try { inst.obs.disconnect(); } catch (e) {} }
    inst.obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (en.isIntersecting && en.intersectionRatio >= 0.1) immFocusOn(mount);
            else immFocusOff();
        });
    }, { threshold: [0.05, 0.1, 0.25, 0.5] });
    inst.obs.observe(mount);
}

/* ============================================================
   Cinematic step transitions + micro-feedback.
   Wraps Visualizer.prototype.goto once (module load). From the
   old and new frames we infer the event kind from the raw frame
   fields, so no viz config or engine file needs to change.
   ============================================================ */

var IMM_BRIDGE = { beam: null, lineIndex: -1 };

(function () {
    if (typeof Visualizer === 'undefined' || !Visualizer.prototype) return;
    var orig = Visualizer.prototype.goto;
    Visualizer.prototype.goto = function (i) {
        var prev = this.index;
        var stepping = (i !== prev);
        if (stepping) {
            var f = this.frames && this.frames[i];
            immStepIn(this, f, this.frames[prev]);
        }
        orig.call(this, i);
        if (stepping) {
            var nf = this.frames && this.frames[i];
            immJuice(this, nf, this.frames[prev]);
        }
    };
})();

function immStepIn(viz, frame, prevFrame) {
    if (immReduced() || !viz || !viz.stage) return;
    var g = VIZ_GSAP();
    if (!g) return;
    /* camera settle: stage breathes in 0.985 -> 1 with soft fade */
    g.fromTo(viz.stage,
        { opacity: 0.5, scale: 0.985 },
        { opacity: 1, scale: 1, duration: immDur('slow'), ease: immEas('settle') });
    /* narration chip: fade + slight slide, never a hard cut */
    if (viz.narrEl) {
        g.fromTo(viz.narrEl,
            { opacity: 0.25, y: 6 },
            { opacity: 1, y: 0, duration: immDur('normal'), ease: immEas('soft') });
    }
    /* code "glow travel" beam (Cockpit Bridge, best-effort) */
    immCodeGlow(viz, frame);
}

/* ---------- micro-feedback juice ---------- */

function immJuice(viz, frame) {
    if (immReduced() || !frame || !viz || !viz.stage) return;
    if (frame.found) immBurst(viz, frame.found);
    else if (frame.swap) immSwapPulse(viz, frame.swap);
    else if (frame.highlight) {
        var compare = false;
        var dim = false;
        Object.keys(frame.highlight).forEach(function (k) {
            var c = frame.highlight[k];
            if (c === 'compare' || c === 'pivot') compare = true;
            if (c === 'dim') dim = true;
        });
        if (compare) immComparePulse(viz, frame.highlight);
        else if (dim) immBackFlash(viz);
    }
    immStepTick(viz);
}

function immComparePulse(viz, highlight) {
    var g = VIZ_GSAP();
    if (!g) return;
    Object.keys(highlight).forEach(function (i) {
        var c = highlight[i];
        if ((c === 'compare' || c === 'pivot') && viz.cells && viz.cells[i]) {
            g.fromTo(viz.cells[i], { scale: 1.12 }, { scale: 1, duration: immDur('fast'), ease: immEas('jiggle') });
        }
    });
}

function immSwapPulse(viz, swap) {
    var g = VIZ_GSAP();
    if (!g) return;
    (swap || []).forEach(function (i, n) {
        var el = viz.cells && viz.cells[i];
        if (!el) return;
        g.fromTo(el,
            { scale: 1.14, rotation: n ? 3 : -3 },
            { scale: 1, rotation: 0, duration: immDur('fast') + 0.06, ease: immEas('elastic') });
    });
}

function immBackFlash(viz) {
    var g = VIZ_GSAP();
    if (!g || !viz.stage) return;
    g.fromTo(viz.stage, { x: -3 }, { x: 0, duration: 0.16, ease: immEas('back') });
}

/* narration chip "tick" — a checkmark pops beside the narration */
function immStepTick(viz) {
    if (!viz.narrEl) return;
    var g = VIZ_GSAP();
    if (!g) return;
    var tick = viz.narrEl.querySelector('.imm-tick');
    if (!tick) {
        tick = document.createElement('span');
        tick.className = 'imm-tick';
        tick.setAttribute('aria-hidden', 'true');
        tick.textContent = '\u2713';
        viz.narrEl.appendChild(tick);
    }
    g.fromTo(tick, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.24, ease: immEas('settle') });
}

/* ---------- success burst: glow ring + particle dust ---------- */

function immBurst(viz, found) {
    if (!viz || !viz.stage) return;
    var st = viz.stage;
    var sr = st.getBoundingClientRect();
    (found || []).forEach(function (i) {
        var el = viz.cells && viz.cells[i];
        if (!el) return;
        var pr = el.getBoundingClientRect();
        var cx = pr.left - sr.left + pr.width / 2;
        var cy = pr.top - sr.top + pr.height / 2;

        /* expanding glow ring (CSS transition only — no GSAP tween) */
        var ring = document.createElement('span');
        ring.className = 'imm-ring';
        ring.style.left = cx + 'px';
        ring.style.top = cy + 'px';
        ring.style.transition = 'transform 0.7s ease-out, opacity 0.7s ease-out';
        st.appendChild(ring);
        requestAnimationFrame(function () {
            ring.style.transform = 'scale(6)';
            ring.style.opacity = '0';
        });
        setTimeout(removeNode(ring), 700);

        /* particle dust (CSS transition per particle — no GSAP tweens) */
        var min = IMMERSIVE_CONFIG.burst.min;
        var max = IMMERSIVE_CONFIG.burst.max;
        var count = Math.min(Math.max(9 + Math.round(Math.random() * 6), min), max);
        for (var n = 0; n < count; n++) {
            var p = document.createElement('span');
            p.className = 'imm-particle';
            p.style.left = cx + 'px';
            p.style.top = cy + 'px';
            st.appendChild(p);
            (function (node) {
                var a = Math.random() * Math.PI * 2;
                var d = 26 + Math.random() * 36;
                var ms = 500 + Math.round(Math.random() * 300);
                node.style.transition = 'transform ' + ms + 'ms ease-out, opacity ' + ms + 'ms ease-out';
                requestAnimationFrame(function () {
                    node.style.transform = 'translate(' + Math.cos(a) * d + 'px, ' + Math.sin(a) * d + 'px) scale(0.3)';
                    node.style.opacity = '0';
                });
                setTimeout(removeNode(node), ms);
            })(p);
        }
    });
}

function removeNode(node) {
    return function () { if (node && node.parentNode) node.parentNode.removeChild(node); };
}

/* ============================================================
   Cockpit Bridge — code "glow travel" beam.
   Locates the active ~~~explain group whose data-group equals the
   page's viz family, then drifts an accent beam over the matched
   code line as narration advances. Explain-line match is inferred
   from the narration text (best effort): no match => beam dims.
   ============================================================ */

function immBridgeGroup() {
    if (typeof currentPath === 'undefined') return '';
    var cfg = null;
    if (typeof VIZ_CONFIG !== 'undefined') {
        cfg = VIZ_CONFIG[currentPath] ||
            (currentPath.indexOf('code/') === 0 ? VIZ_CONFIG[currentPath.slice(5)] : null);
    }
    if (cfg && cfg.family) return cfg.family;
    if (currentPath.indexOf('code/') === 0) return currentPath.slice(5);
    return '';
}

function immBridgeBlock() {
    var gk = immBridgeGroup();
    if (!gk) return null;
    return document.querySelector('.code-explain[data-group="' + gk + '"]');
}

function immBridgePre() {
    var b = immBridgeBlock();
    return b ? b.querySelector('pre') : null;
}

function immExplainItems() {
    var b = immBridgeBlock();
    return b ? toArray(b.querySelectorAll('.explain-lines li')) : [];
}

function toArray(nl) {
    var out = [];
    if (!nl) return out;
    for (var i = 0; i < nl.length; i++) out.push(nl[i]);
    return out;
}

function immMatchLine(frame) {
    if (!frame || !frame.narr) return null;
    var lis = immExplainItems();
    if (!lis.length) return null;
    var tokens = String(frame.narr).toLowerCase().split(/[^a-z0-9]+/).filter(function (t) { return t.length > 2; });
    var best = null;
    var bestScore = 0;
    lis.forEach(function (li) {
        var text = String(li.textContent || '').toLowerCase();
        var score = 0;
        tokens.forEach(function (t) { if (text.indexOf(t) !== -1) score++; });
        if (score > bestScore) { bestScore = score; best = li; }
    });
    if (!best || bestScore === 0) return null;
    var n = best.querySelector('.line-num');
    return n ? parseInt(n.textContent, 10) : null;
}

/* highlight the explain-line with class active for this symbol */
function immMarkExplain(ln) {
    var b = immBridgeBlock();
    if (!b) return;
    var lis = b.querySelectorAll('.explain-lines li');
    toArray(lis).forEach(function (li) {
        var num = li.querySelector('.line-num');
        var match = num && parseInt(num.textContent, 10) === ln;
        li.classList.toggle('active', !!match);
    });
}

function immClearExplain() {
    var b = immBridgeBlock();
    if (!b) return;
    var lis = b.querySelectorAll('.explain-lines li.active');
    toArray(lis).forEach(function (li) { li.classList.remove('active'); });
}

function immCodeGlow(viz, frame) {
    if (immReduced()) return;
    var g = VIZ_GSAP();
    if (!g) return;
    var pre = immBridgePre();
    if (!pre) return;

    var beam = (IMM_BRIDGE.beam && IMM_BRIDGE.beam.parentNode === pre) ? IMM_BRIDGE.beam : null;
    if (!beam) {
        pre.style.position = 'relative';
        beam = document.createElement('div');
        beam.className = 'imm-beam';
        beam.setAttribute('aria-hidden', 'true');
        pre.appendChild(beam);
        IMM_BRIDGE.beam = beam;
    }

    var ln = immMatchLine(frame);
    var lh = 20;
    if (pre && typeof getComputedStyle !== 'undefined') {
        var fl = parseFloat(getComputedStyle(pre).lineHeight);
        if (fl && !isNaN(fl) && fl > 0) lh = fl;
    }

    if (ln == null) {
        immClearExplain();
        g.to(beam, { opacity: 0, duration: immDur('fast'), ease: immEas('soft') });
        return;
    }

    var y = immCodeY(ln, pre);
    if (IMM_BRIDGE.lineIndex === ln) {
        g.set(beam, { opacity: 1, y: y, height: lh });
        immMarkExplain(ln);
        return;
    }
    g.to(beam, { opacity: 1, y: y, height: lh, duration: immDur('slow'), ease: immEas('settle') });
    IMM_BRIDGE.lineIndex = ln;
    immMarkExplain(ln);
}

function immCodeY(ln, pre) {
    var lh = 20;
    if (pre && typeof getComputedStyle !== 'undefined') {
        var fl = parseFloat(getComputedStyle(pre).lineHeight);
        if (fl && !isNaN(fl) && fl > 0) lh = fl;
    }
    return (ln - 1) * lh;
}

/* ============================================================
   Entry / exit hooks — wired into 07-router renderPage flow
   ============================================================ */

function immersiveEnter() {
    immObserve();
}

function immersiveExit() {
    try { immFocusOff(); } catch (e) {}
    try {
        var inst = immInst();
        if (inst.obs) { inst.obs.disconnect(); inst.obs = null; }
    } catch (e) {}
    try {
        if (IMM_BRIDGE.beam && IMM_BRIDGE.beam.parentNode) IMM_BRIDGE.beam.parentNode.removeChild(IMM_BRIDGE.beam);
        IMM_BRIDGE.beam = null;
        IMM_BRIDGE.lineIndex = -1;
    } catch (e) {}
}

/* ============================================================
   Exports — IMMERSIVE_CONFIG is var-assigned at module 13 load,
   so it must be attached to module.exports here (module 10's
   export object is created before this file evaluates).
   ============================================================ */

if (typeof module !== 'undefined' && module.exports) {
    module.exports.IMMERSIVE_CONFIG = IMMERSIVE_CONFIG;
}