/* ============================================================
   DSA Knowledge Base - script.js (module: visualizer-engine)
   Reusable animation engine built on bundled GSAP.
   - Visualizer: array/pointer/window/bar/swap primitives, all
     tweened via transform/opacity (never top/left).
   - VizPlayer: play/pause/next/prev/scrub/speed step controller.
   - Mounting + teardown hooks wired into 07-router renderPage.
   - Dark/light theming via CSS variables; respects reduced motion.
   ============================================================ */

/* ---------- shared state ---------- */

var ACTIVE_VIS = [];
var VIZ_REDUCED = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var AUTON_KEY = 'dsa_auto_narrate';
var VIZ_INSTANCE_SEQ = 0;

function VIZ_GSAP() {
    return (typeof window !== 'undefined' && window.gsap) ? window.gsap : null;
}

function vizClamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
}

function vizParseList(str) {
    var out = [];
    String(str || '').split(/[\s,]+/).forEach(function (t) {
        if (t === '') return;
        var n = Number(t);
        if (!isNaN(n)) out.push(n);
    });
    return out;
}

/* ---------- tiny tween helper (GSAP or reduced-motion jump) ---------- */

function vizTween(el, props, dur, ease) {
    var g = VIZ_GSAP();
    if (!g) return;
    if (VIZ_REDUCED || !dur) {
        g.set(el, props);
        return;
    }
    props = Object.assign({}, props);
    props.duration = dur;
    props.ease = ease || 'power2.out';
    g.to(el, props);
}

function vizFromTo(el, from, to, dur, ease) {
    var g = VIZ_GSAP();
    if (!g) return;
    if (VIZ_REDUCED || !dur) { g.set(el, to); return; }
    to = Object.assign({}, to);
    to.duration = dur;
    to.ease = ease || 'back.out(1.6)';
    g.fromTo(el, from, to);
}

/* ============================================================
   Visualizer
   ============================================================ */

function Visualizer(mount, cfg) {
    this.mount = mount;
    this.cfg = cfg || {};
    this._id = 'viz' + (++VIZ_INSTANCE_SEQ);
    this.frames = [];
    this.player = null;
    this.index = -1;
    this.cells = {};
    this.pointers = {};
    this.bars = {};
    this.windowEl = null;
    this.varEls = {};
    this.logCount = 0;
    this.stageW = 0;
    this.cellW = 40;
    this.reduced = VIZ_REDUCED;
    this._wired = false;
    this._disposed = false;
    this._obs = null;
    this._unbind = null;

    this.build();
    this.wireControls();
    this.state = Object.assign({}, cfg.defaultState || {});
    this.rerun();
    ACTIVE_VIS.push(this);
}

Visualizer.prototype.build = function () {
    var cfg = this.cfg;
    var legend = (cfg.legend || []).map(function (l) {
        return '<span class="viz-legend-item"><i class="viz-legend-dot ' + l.color + '"></i>' + l.label + '</span>';
    }).join('');

    var inputHtml = '';
    if (cfg.inputs && cfg.inputs.length) {
        inputHtml = '<div class="viz-input">';
        cfg.inputs.forEach(function (inp) {
            inputHtml += '<label class="viz-input-field"><span>' + inp.label + '</span>' +
                '<input type="text" data-vz-input="' + inp.key + '" value="' + (inp.value || '') + '" placeholder="' + (inp.placeholder || '') + '" autocomplete="off"></label>';
        });
        inputHtml += '<button class="viz-apply" data-vz-apply type="button">Apply</button></div>';
    }

    this.mount.innerHTML =
        '<div class="viz-head">' +
            '<span class="viz-title">' + (cfg.title || 'Visualization') + '</span>' +
            (legend ? '<span class="viz-legend">' + legend + '</span>' : '') +
        '</div>' +
        '<div class="viz-stage" data-vz-stage></div>' +
        '<div class="viz-vars" data-vz-vars></div>' +
        '<div class="viz-narr" data-vz-narr>Press Play to animate.</div>' +
        '<div class="viz-log" data-vz-log></div>' +
        '<div class="viz-controls">' +
            '<button class="viz-btn" data-vz-cmd="restart" title="Restart">&#8635;</button>' +
            '<button class="viz-btn" data-vz-cmd="prev" title="Previous step">&#8249;</button>' +
            '<button class="viz-btn viz-btn-play" data-vz-cmd="play" title="Play / Pause">&#9654;</button>' +
            '<button class="viz-btn" data-vz-cmd="next" title="Next step">&#8250;</button>' +
            '<span class="viz-counter" data-vz-counter>0 / 0</span>' +
            '<input class="viz-scrub" type="range" data-vz-scrub min="0" max="0" value="0" step="1" aria-label="Scrub through steps">' +
            '<select class="viz-speed" data-vz-speed aria-label="Speed">' +
                '<option value="0.5">0.5x</option>' +
                '<option value="0.75">0.75x</option>' +
                '<option value="1" selected>1x</option>' +
                '<option value="1.5">1.5x</option>' +
                '<option value="2">2x</option>' +
                '<option value="3">3x</option>' +
            '</select>' +
            '<label class="viz-auton" data-vz-auton title="Auto-narrate: let beats advance on their own">' +
                '<input type="checkbox" data-vz-auton-input>Auto-narrate' +
            '</label>' +
        '</div>' +
        inputHtml;

    this.stage = this.mount.querySelector('[data-vz-stage]');
    this.varsEl = this.mount.querySelector('[data-vz-vars]');
    this.narrEl = this.mount.querySelector('[data-vz-narr]');
    this.logEl = this.mount.querySelector('[data-vz-log]');
};

Visualizer.prototype.wireControls = function () {
    var self = this;

    function cmd(name) {
        var el = self.mount.querySelector('[data-vz-cmd="' + name + '"]');
        if (!el) return;
        el.addEventListener('click', function () {
            if (name === 'play') self.toggle();
            else if (name === 'next') self.next();
            else if (name === 'prev') self.prev();
            else if (name === 'restart') self.restart();
        });
    }
    cmd('play'); cmd('next'); cmd('prev'); cmd('restart');

    var scrub = this.mount.querySelector('[data-vz-scrub]');
    if (scrub) {
        scrub.addEventListener('input', function () {
            var idx = parseInt(scrub.value, 10);
            if (self.player) self.player.pause();
            self.goto(idx);
        });
    }

    var speed = this.mount.querySelector('[data-vz-speed]');
    if (speed) {
        speed.addEventListener('change', function () {
            if (self.player) self.player.setSpeed(parseFloat(speed.value));
        });
    }

    /* Auto-narrate toggle: ON -> the player advances frames on its own
       with weighted beat pacing; OFF -> guided mode where the learner
       steps with Next/Prev. Preference persists so a returning visitor
       keeps their choice. */
    var auton = this.mount.querySelector('[data-vz-auton]');
    var autonInput = this.mount.querySelector('[data-vz-auton-input]');
    if (auton && autonInput) {
        var autonSaved = storage.get(AUTON_KEY);
        var autonOn = autonSaved === '1';
        autonInput.checked = autonOn;
        auton.classList.toggle('on', autonOn);
        autonInput.addEventListener('change', function () {
            var on = autonInput.checked;
            storage.set(AUTON_KEY, on ? '1' : '0');
            auton.classList.toggle('on', on);
            if (on) self.play();
            else self.pause();
        });
        if (autonOn && !this.reduced) {
            setTimeout(function () { if (!self._disposed && !self.player.playing) self.play(); }, 350);
        } else {
            this.pause();
        }
    }

    var apply = this.mount.querySelector('[data-vz-apply]');
    if (apply) {
        apply.addEventListener('click', function () { self.applyInput(); });
    }

    if (this.reduced) {
        var playBtn = this.mount.querySelector('[data-vz-cmd="play"]');
        if (playBtn) playBtn.textContent = '\u25B6';
    }

    this.wireScrubDrag();

    if (typeof ResizeObserver !== 'undefined') {
        this._obs = new ResizeObserver(function () { self.relayout(); });
        this._obs.observe(this.stage);
    }
};

Visualizer.prototype.wireScrubDrag = function () {
    var self = this;
    var dragging = false;

    function idxFromX(clientX) {
        var rect = self.stage.getBoundingClientRect();
        var t = vizClamp((clientX - rect.left) / (rect.width || 1), 0, 1);
        return Math.round(t * (self.frames.length - 1));
    }

    function onDown(e) {
        if (self.frames.length < 2) return;
        var idx = idxFromX(e.clientX);
        dragging = true;
        if (self.player) self.player.pause();
        self.goto(idx);
        e.preventDefault();
    }
    function onMove(e) {
        if (!dragging) return;
        self.goto(idxFromX(e.clientX));
    }
    function onUp() { dragging = false; }

    this.stage.addEventListener('pointerdown', onDown);
    this.stage.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    this._unbind = function () {
        self.stage.removeEventListener('pointerdown', onDown);
        self.stage.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
    };
};

Visualizer.prototype.relayout = function () {
    var w = this.stage.clientWidth;
    if (w === this.stageW || w === 0) return;
    this.stageW = w;
    var n = Math.max(this.frames.length ? this.longestLen() : this.state.array ? this.state.array.length : 0, 1);
    this.cellW = vizClamp(Math.floor(w / n), 22, 72);
    var self = this;
    Object.keys(this.cells).forEach(function (i) {
        self.positionCell(self.cells[i], parseInt(i, 10), true);
    });
    if (this.windowEl) this.placeWindow(this.windowRange || null, true);
    if (this.index >= 0 && this.frames[this.index]) {
        this.renderFrame(this.frames[this.index]);
    }
};

Visualizer.prototype.longestLen = function () {
    var m = 0;
    this.frames.forEach(function (f) {
        if (f.arr && f.arr.length > m) m = f.arr.length;
    });
    return m || 1;
};

/* ---------- array cells ---------- */

Visualizer.prototype.cellY = function () {
    var h = this.stage.clientHeight || 150;
    return Math.floor(h / 2) - 23;
};

Visualizer.prototype.positionCell = function (el, idx, instant) {
    var x = idx * this.cellW;
    var y = this.cellY();
    var props = { x: x, y: y };
    if (instant) { var g = VIZ_GSAP(); if (g) g.set(el, props); else el.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
    else vizTween(el, props, 0.35);
};

Visualizer.prototype.ensureCells = function (arr) {
    var self = this;
    var max = arr.length;
    var cellH = 46;

    arr.forEach(function (val, i) {
        var el = self.cells[i];
        if (!el) {
            el = document.createElement('div');
            el.className = 'viz-cell';
            el.setAttribute('data-idx', i);
            el.innerHTML = '<span class="viz-cell-val"></span><span class="viz-cell-idx"></span>';
            self.stage.appendChild(el);
            el.style.width = (self.cellW - 2) + 'px';
            el.style.height = cellH + 'px';
            el.style.left = '0';
            el.style.top = '0';
            vizFromTo(el, { x: i * self.cellW, y: self.cellY(), scale: 0, opacity: 0 },
                { x: i * self.cellW, y: self.cellY(), scale: 1, opacity: 1 }, 0.35, 'back.out(1.7)');
            self.cells[i] = el;
        } else {
            el.style.width = (self.cellW - 2) + 'px';
            if (parseInt(el.getAttribute('data-idx'), 10) !== i) {
                el.setAttribute('data-idx', i);
                self.cells[i] = el;
            }
            self.positionCell(el, i, false);
        }
        var valEl = el.querySelector('.viz-cell-val');
        if (valEl.textContent !== String(val)) {
            valEl.textContent = val;
            vizFromTo(valEl, { scale: 1.35 }, { scale: 1 }, 0.3);
        }
        el.querySelector('.viz-cell-idx').textContent = i;
    });

    var doomed = [];
    Object.keys(this.cells).forEach(function (i) {
        if (parseInt(i, 10) >= max) doomed.push(i);
    });
    doomed.forEach(function (i) {
        var el = self.cells[i];
        var g = VIZ_GSAP();
        var remove = function () { if (el.parentNode) el.parentNode.removeChild(el); };
        if (g && !self.reduced) g.to(el, { opacity: 0, scale: 0.6, duration: 0.3, onComplete: remove });
        else remove();
        delete self.cells[i];
    });
};

Visualizer.prototype.setHighlights = function (map) {
    var self = this;
    var keep = {};
    if (map) Object.keys(map).forEach(function (i) { keep[i] = true; });
    Object.keys(this.cells).forEach(function (i) {
        var el = self.cells[i];
        ['vz-left', 'vz-right', 'vz-compare', 'vz-swap', 'vz-found', 'vz-active', 'vz-pivot', 'vz-dim'].forEach(function (c) {
            el.classList.remove(c);
        });
    });
    if (!map) return;
    Object.keys(map).forEach(function (i) {
        var el = self.cells[i];
        if (!el) return;
        el.classList.add('vz-' + map[i]);
    });
};

Visualizer.prototype.flashCells = function (idxs, cls) {
    var self = this;
    idxs.forEach(function (i) {
        var el = self.cells[i];
        if (!el) return;
        el.classList.add('vz-' + cls);
        vizTween(el, { scale: 1.12 }, 0.16, 'power1.out');
        vizTween(el, { scale: 1 }, 0.18, 'power1.inOut');
        setTimeout(function () { el.classList.remove('vz-' + cls); }, 500);
    });
};

/* ---------- pointers ---------- */

Visualizer.prototype.ensurePointer = function (label, colorClass) {
    var el = this.pointers[label];
    if (el) return el;
    el = document.createElement('div');
    el.className = 'viz-ptr vz-ptr-' + (colorClass || 'active');
    el.innerHTML = '<span class="viz-ptr-label">' + label + '</span>';
    this.stage.appendChild(el);
    this.pointers[label] = el;
    return el;
};

Visualizer.prototype.movePointer = function (label, idx, colorClass) {
    var el = this.ensurePointer(label, colorClass);
    var x = idx * this.cellW + this.cellW / 2;
    var y = this.cellY() - 34;
    vizTween(el, { x: x, y: y }, 0.4, 'back.out(1.4)');
};

/* ---------- sliding window ---------- */

Visualizer.prototype.setWindow = function (range) {
    var self = this;
    this.windowRange = range;
    if (!range) { if (this.windowEl) { this.windowEl.style.display = 'none'; } return; }
    if (!this.windowEl) {
        this.windowEl = document.createElement('div');
        this.windowEl.className = 'viz-window';
        this.stage.appendChild(this.windowEl);
        var g = VIZ_GSAP();
        if (g) g.set(this.windowEl, { transformOrigin: 'left center' });
    }
    this.windowEl.style.display = 'block';
    this.placeWindow(range, false);
};

Visualizer.prototype.placeWindow = function (range, instant) {
    if (!this.windowEl || !range) return;
    var y = this.cellY();
    var h = 46;
    var props = { x: range.start * this.cellW, scaleX: range.end - range.start + 1, y: y };
    if (instant) { var g = VIZ_GSAP(); if (g) g.set(this.windowEl, props); }
    else vizTween(this.windowEl, props, 0.4, 'power2.inOut');
    this.windowEl.style.height = h + 'px';
    this.windowEl.style.top = '0';
    this.windowEl.style.left = '0';
    var label = this.windowEl.querySelector('.viz-window-label');
    if (range.label) {
        if (!label) { label = document.createElement('span'); label.className = 'viz-window-label'; this.windowEl.appendChild(label); }
        label.textContent = range.label;
    }
};

/* ---------- bars (sorting / kadane / complexity) ---------- */

Visualizer.prototype.ensureBars = function (heights, maxH, labels) {
    var self = this;
    var stageH = this.stage.clientHeight || 150;
    var usable = stageH - 26;
    var baseY = stageH - 8;

    heights.forEach(function (val, i) {
        var el = self.bars[i];
        if (!el) {
            el = document.createElement('div');
            el.className = 'viz-bar';
            el.setAttribute('data-idx', i);
            self.stage.appendChild(el);
            el.style.width = (self.cellW - 2) + 'px';
            el.style.left = '0';
            el.style.bottom = '6px';
            var g = VIZ_GSAP();
            if (g) g.set(el, { transformOrigin: 'center bottom' });
            vizFromTo(el, { x: i * self.cellW, scaleY: 0, opacity: 0 }, { x: i * self.cellW, scaleY: 1, opacity: 1 }, 0.35, 'back.out(1.4)');
            self.bars[i] = el;
        } else {
            el.style.width = (self.cellW - 2) + 'px';
            if (parseInt(el.getAttribute('data-idx'), 10) !== i) { el.setAttribute('data-idx', i); self.bars[i] = el; }
        }
        var sc = maxH ? val / maxH : 0;
        vizTween(el, { x: i * self.cellW, scaleY: sc }, 0.35, 'power2.out');
        el.style.height = usable + 'px';
        el.style.top = '0';
        el.style.bottom = 'auto';
        if (!el.querySelector('.viz-bar-val')) {
            var v = document.createElement('span');
            v.className = 'viz-bar-val';
            v.textContent = val;
            el.appendChild(v);
        } else if (el.querySelector('.viz-bar-val').textContent !== String(val)) {
            el.querySelector('.viz-bar-val').textContent = val;
        }
        if (labels && labels[i] !== undefined) {
            var name = el.querySelector('.viz-bar-name');
            if (!name) { name = document.createElement('span'); name.className = 'viz-bar-name'; el.appendChild(name); }
            name.textContent = labels[i];
        }
    });

    var doomed = [];
    Object.keys(this.bars).forEach(function (i) { if (parseInt(i, 10) >= heights.length) doomed.push(i); });
    doomed.forEach(function (i) {
        var el = self.bars[i];
        var g = VIZ_GSAP();
        var remove = function () { if (el.parentNode) el.parentNode.removeChild(el); };
        if (g && !self.reduced) g.to(el, { opacity: 0, scaleY: 0, duration: 0.3, onComplete: remove });
        else remove();
        delete self.bars[i];
    });
};

Visualizer.prototype.setBarHighlights = function (compare, pivot, cls) {
    var self = this;
    Object.keys(this.bars).forEach(function (i) {
        var el = self.bars[i];
        ['vz-compare', 'vz-swap', 'vz-pivot', 'vz-found', 'vz-active'].forEach(function (c) { el.classList.remove(c); });
    });
    (compare || []).forEach(function (i) { if (self.bars[i]) self.bars[i].classList.add('vz-' + (cls || 'compare')); });
    if (pivot !== undefined && this.bars[pivot]) this.bars[pivot].classList.add('vz-pivot');
};

/* ---------- swap ---------- */

Visualizer.prototype.swapAnimate = function (i, j, arr) {
    var self = this;
    var elI = this.cells[i];
    var elJ = this.cells[j];
    if (!elI || !elJ) return;
    var dx = (j - i) * this.cellW;
    var g = VIZ_GSAP();
    this.flashCells([i, j], 'swap');
    var commit = function () {
        elI.setAttribute('data-idx', j);
        elJ.setAttribute('data-idx', i);
        self.cells[j] = elI;
        self.cells[i] = elJ;
        elI.querySelector('.viz-cell-val').textContent = arr[j];
        elJ.querySelector('.viz-cell-val').textContent = arr[i];
        if (g) {
            g.set(elI, { x: j * self.cellW, y: self.cellY() });
            g.set(elJ, { x: i * self.cellW, y: self.cellY() });
        }
    };
    if (g && !this.reduced) {
        g.to(elI, { x: j * self.cellW, duration: 0.32, ease: 'power2.inOut', onComplete: commit });
        g.to(elJ, { x: i * self.cellW, duration: 0.32, ease: 'power2.inOut' });
    } else {
        commit();
    }
};

/* ---------- vars + narration ---------- */

/* ---------- secondary "sub" row (prefix table, hash buckets, merge result) ---------- */

Visualizer.prototype.renderSubRow = function (frame) {
    var self = this;
    var sub = frame.sub;
    if (!sub) { if (this.subEl) this.subEl.style.display = 'none'; return; }
    if (!this.subEl) {
        this.subEl = document.createElement('div');
        this.subEl.className = 'viz-sub';
        this.mount.insertBefore(this.subEl, this.varsEl);
    }
    var cells = sub.cells || [];
    var key = (sub.label || '') + '|' + (sub.keys ? sub.keys.join(',') : '') + '|' + cells.join(',') + '|' + JSON.stringify(sub.highlight || {});
    if (this.subKey === key) { this.subEl.style.display = 'flex'; return; }
    this.subKey = key;

    var label = this.subEl.querySelector('.viz-sub-label');
    if (!label) { label = document.createElement('span'); label.className = 'viz-sub-label'; this.subEl.appendChild(label); }
    label.textContent = sub.label || '';

    var wrap = document.createElement('span');
    wrap.className = 'viz-sub-cells';
    var frag = document.createDocumentFragment();
    cells.forEach(function (v, i) {
        var cell = document.createElement('span');
        cell.className = 'viz-sub-cell';
        cell.setAttribute('data-idx', i);
        cell.innerHTML = '<b></b><i></i>';
        cell.querySelector('b').textContent = v;
        cell.querySelector('i').textContent = sub.keys && sub.keys[i] !== undefined ? sub.keys[i] : i;
        if (sub.highlight && sub.highlight[i]) cell.classList.add('vz-' + sub.highlight[i]);
        frag.appendChild(cell);
    });
    wrap.appendChild(frag);
    this.subEl.querySelectorAll('.viz-sub-cells').forEach(function (n) { n.parentNode.removeChild(n); });
    this.subEl.appendChild(wrap);
    this.subEl.style.display = 'flex';
    vizFromTo(this.subEl.querySelectorAll('.viz-sub-cell b'), { scale: 1.35 }, { scale: 1 }, 0.28);
};

/* ---------- 2D matrix grid (matrix rotation / path grids) ---------- */

Visualizer.prototype.renderMatrix = function (frame) {
    var m = frame.matrix;
    if (!m) { if (this.matrixEl) this.matrixEl.style.display = 'none'; return; }
    if (!this.matrixEl) {
        this.matrixEl = document.createElement('div');
        this.matrixEl.className = 'viz-matrix';
        this.mount.insertBefore(this.matrixEl, this.varsEl);
    }
    var grid = m.grid || [];
    var cols = grid.length ? grid[0].length : 0;
    var key = m.key || (grid.length + 'x' + cols + '|' + grid.join('|') + '|' + JSON.stringify(m.highlight || {}));
    if (this.matrixKey === key) { this.matrixEl.style.display = 'grid'; return; }
    this.matrixKey = key;

    this.matrixEl.style.gridTemplateColumns = 'repeat(' + cols + ', auto)';
    this.matrixEl.innerHTML = '';
    var frag = document.createDocumentFragment();
    for (var r = 0; r < grid.length; r++) {
        for (var c = 0; c < cols; c++) {
            var cell = document.createElement('span');
            cell.className = 'viz-matrix-cell';
            cell.textContent = grid[r][c];
            if (m.highlight && m.highlight[r + ',' + c]) cell.classList.add('vz-' + m.highlight[r + ',' + c]);
            frag.appendChild(cell);
        }
    }
    this.matrixEl.appendChild(frag);
    this.matrixEl.style.display = 'grid';
    vizFromTo(this.matrixEl.querySelectorAll('.viz-matrix-cell'), { scale: 0.85, opacity: 0.5 }, { scale: 1, opacity: 1 }, 0.3);
};

Visualizer.prototype.setVars = function (obj) {
    var self = this;
    var seen = {};
    if (obj) Object.keys(obj).forEach(function (k) {
        seen[k] = true;
        var el = self.varEls[k];
        if (!el) {
            el = document.createElement('span');
            el.className = 'viz-var';
            el.innerHTML = '<span class="viz-var-name"></span><b class="viz-var-val"></b>';
            self.varsEl.appendChild(el);
            self.varEls[k] = el;
        }
        el.querySelector('.viz-var-name').textContent = k + ' =';
        var b = el.querySelector('.viz-var-val');
        if (b.textContent !== String(obj[k])) {
            b.textContent = obj[k];
            vizFromTo(b, { scale: 1.3 }, { scale: 1 }, 0.25);
        }
    });
    Object.keys(this.varEls).forEach(function (k) {
        if (!seen[k]) {
            var el = self.varEls[k];
            if (el.parentNode) el.parentNode.removeChild(el);
            delete self.varEls[k];
        }
    });
};

Visualizer.prototype.narrate = function (text, logLabel) {
    if (this.narrEl) this.narrEl.textContent = text || '';
    if (!this.logEl) return;
    var line = document.createElement('div');
    line.className = 'viz-log-line' + (logLabel ? ' viz-log-main' : '');
    line.textContent = (logLabel ? logLabel + ' — ' : '\u00b7 ') + (text || '');
    this.logEl.appendChild(line);
    this.logEl.scrollTop = this.logEl.scrollHeight;
    if (++this.logCount > 80) {
        while (this.logEl.children.length > 80) this.logEl.removeChild(this.logEl.firstChild);
    }
};

/* ---------- generic frame renderer ---------- */

Visualizer.prototype.renderFrame = function (frame, prev) {
    if (!frame) return;
    if (frame.arr) this.ensureCells(frame.arr);
    if (frame.highlight) this.setHighlights(frame.highlight);
    if (frame.pointers) {
        var self = this;
        Object.keys(frame.pointers).forEach(function (label) {
            var p = frame.pointers[label];
            self.movePointer(label, p.idx, p.color || 'active');
        });
    }
    if (frame.window !== undefined) this.setWindow(frame.window);
    if (frame.swap) {
        this.swapAnimate(frame.swap[0], frame.swap[1], frame.arr || this.state.array || []);
    }
    if (frame.bars) this.ensureBars(frame.bars.heights, frame.bars.max, frame.bars.labels);
    if (frame.barCompare || frame.pivot !== undefined) this.setBarHighlights(frame.barCompare, frame.pivot);
    if (frame.sub) this.renderSubRow(frame);
    if (frame.matrix) this.renderMatrix(frame);
    if (frame.vars) this.setVars(frame.vars);
    if (frame.found) this.flashCells(frame.found, 'found');
    if (frame.narr) this.narrate(frame.narr, frame.log);
    if (frame.cleanup) { this.setHighlights(null); this.setVars(null); }
};

/* ---------- player controls ---------- */

Visualizer.prototype.rerun = function () {
    var cfg = this.cfg;
    this.frames = [];
    try {
        this.frames = cfg.simulate ? cfg.simulate(this.state, cfg.params || {}) : [];
    } catch (e) {
        this.frames = [{ narr: 'Simulation failed: ' + e.message }];
    }
    this.player = new VizPlayer(this, this.frames, { stepMs: cfg.stepMs || 1050 });
    this.index = -1;
    this.subKey = null;
    this.matrixKey = null;
    this.pause();
    if (this.cells) Object.keys(this.cells).forEach(function (i) { /* kept for diffing */ });
    this.goto(0);
};

Visualizer.prototype.goto = function (i) {
    i = vizClamp(i, 0, this.frames.length - 1);
    if (i === this.index) { this.updateControls(); return; }
    this.index = i;
    var frame = this.frames[i];
    if (frame) this.renderFrame(frame, this.frames[i - 1]);
    this.updateControls();
};

Visualizer.prototype.next = function () {
    this.player.pause();
    this.goto(this.index + 1);
};

Visualizer.prototype.prev = function () {
    this.player.pause();
    this.goto(this.index - 1);
};

Visualizer.prototype.toggle = function () {
    if (!this.player) return;
    if (this.player.playing) this.player.pause();
    else this.player.play();
};

Visualizer.prototype.play = function () { if (this.player) this.player.play(); };

Visualizer.prototype.pause = function () { if (this.player) this.player.pause(); };

Visualizer.prototype.restart = function () {
    if (this.player) this.player.pause();
    this.goto(0);
};

Visualizer.prototype.updateControls = function () {
    var scrub = this.mount.querySelector('[data-vz-scrub]');
    var counter = this.mount.querySelector('[data-vz-counter]');
    var playBtn = this.mount.querySelector('[data-vz-cmd="play"]');
    if (scrub) { scrub.max = Math.max(this.frames.length - 1, 0); scrub.value = this.index; }
    if (counter) counter.textContent = (this.index + 1) + ' / ' + this.frames.length;
    if (playBtn) playBtn.textContent = this.player && this.player.playing ? '\u23F8' : '\u25B6';
    var auton = this.mount.querySelector('[data-vz-auton]');
    var autonInput = this.mount.querySelector('[data-vz-auton-input]');
    var playing = this.player && this.player.playing;
    if (autonInput && autonInput.checked !== !!playing) {
        autonInput.checked = !!playing;
        if (auton) auton.classList.toggle('on', !!playing);
    }
};

Visualizer.prototype.applyInput = function () {
    var self = this;
    var cfg = this.cfg;
    if (!cfg.inputs) return;
    var next = Object.assign({}, this.state);
    cfg.inputs.forEach(function (inp) {
        var el = self.mount.querySelector('[data-vz-input="' + inp.key + '"]');
        if (!el) return;
        var raw = el.value;
        var parsed = inp.parse ? inp.parse(raw) : raw;
        next[inp.key] = parsed;
    });
    this.state = next;
    this.rerun();
};

Visualizer.prototype.dispose = function () {
    if (this._disposed) return;
    this._disposed = true;
    this.pause();
    if (this._obs) { try { this._obs.disconnect(); } catch (e) {} }
    if (this._unbind) { try { this._unbind(); } catch (e) {} }
    var g = VIZ_GSAP();
    if (g) { try { g.killTweensOf(this.mount); } catch (e) {} }
};

/* ============================================================
   VizPlayer — step sequencer (video-player style)
   ============================================================ */

function VizPlayer(viz, frames, opts) {
    this.viz = viz;
    this.frames = frames;
    this.index = -1;
    this.playing = false;
    this.speed = 1;
    this.stepMs = (opts && opts.stepMs) || 1050;
    this.breatheMs = (opts && opts.breatheMs) || 600;
    this.timer = null;
}

VizPlayer.prototype.setSpeed = function (s) {
    this.speed = s;
    this.viz.updateControls();
};

/* Beat-based pacing: every frame can carry its own holdMs (how long the
   narration / diagram holds before the next step). When a config does not
   set holdMs explicitly, major frames are auto-weighted longer so a
   beginner can actually read the important step:
   - "found" (answer/re-match), "swap", and major log beats (match / new
     best / done / switch / found) get ~1.9x the base stepMs.
   - Simple continuation frames stay at the base stepMs.
   A short "breathe" pause follows every major frame so the eye can rest
   before the next beat moves on. Manual Next/Prev/scrub bypass this
   entirely (they call goto directly) — pacing only affects play(). */
VizPlayer.prototype.majorFrame = function (f) {
    if (!f) return false;
    if (f.found || f.swap) return true;
    var lg = f.log;
    return lg === 'match' || lg === 'new best' || lg === 'done' ||
        lg === 'switch' || lg === 'found';
};

VizPlayer.prototype.frameMs = function (f) {
    var base = this.stepMs;
    if (f && typeof f.holdMs === 'number') base = f.holdMs;
    else if (this.majorFrame(f)) base = Math.round(this.stepMs * 1.9);
    return base / this.speed;
};

VizPlayer.prototype.play = function () {
    var self = this;
    if (this.playing || !this.frames.length) return;
    if (this.viz.reduced) { this.goto(this.frames.length - 1); return; }
    if (this.index >= this.frames.length - 1) this.goto(0);
    this.playing = true;
    this.viz.updateControls();
    var tick = function () {
        if (!self.playing) return;
        var prevFrame = self.frames[self.index];
        self.goto(self.index + 1);
        if (self.index >= self.frames.length - 1) { self.pause(); return; }
        var nextFrame = self.frames[self.index + 1];
        var delay = self.frameMs(nextFrame);
        if (self.majorFrame(prevFrame)) delay += self.breatheMs / self.speed;
        self.timer = setTimeout(tick, delay);
    };
    this.timer = setTimeout(tick, 60);
};

VizPlayer.prototype.goto = function (i) { this.index = i; this.viz.goto(i); };

VizPlayer.prototype.pause = function () {
    this.playing = false;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.viz.updateControls();
};

/* ============================================================
   Mounting + teardown
   ============================================================ */

function vizTeardownAll() {
    ACTIVE_VIS.forEach(function (v) {
        try { v.dispose(); } catch (e) {}
    });
    ACTIVE_VIS = [];
}

function vizInitForPage() {
    var path = currentPath;
    /* Inline Visualizer mounts only inside View Code (code/*) pages. */
    if (path.indexOf('code/') !== 0) return;
    var cfg = VIZ_CONFIG[path.slice(5)];
    if (!cfg) return;
    var article = $('#article');
    if (!article) return;

    var mount = document.createElement('div');
    mount.className = 'viz';
    var anchor = article.querySelector('blockquote') || article.querySelector('h1');
    if (anchor && anchor.nextSibling) anchor.nextSibling.after(mount);
    else if (anchor) anchor.after(mount);
    else article.prepend(mount);

    var viz = new Visualizer(mount, cfg);

    if (typeof IntersectionObserver !== 'undefined' && !viz.reduced) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting && viz.player) viz.player.pause();
            });
        }, { threshold: 0.05 });
        obs.observe(mount);
        viz._scrollObs = obs;
    }

    /* Guided by default: the Auto-narrate toggle (wireControls) owns
       playback. It starts paused unless the visitor has opted into
       auto-narrate, so first-time learners step through with Next. */
    if (cfg.autoPlay) {
        setTimeout(function () { if (!viz._disposed) viz.play(); }, 350);
    }
}

/* tree / graph SVG helpers (future-ready for Phase 2 tree & graph pages) */

function vizSvgNode(svg, x, y, label, opts) {
    opts = opts || {};
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x); circle.setAttribute('cy', y); circle.setAttribute('r', opts.r || 16);
    circle.setAttribute('class', 'vz-svg-node');
    g.appendChild(circle);
    if (label !== undefined && label !== null) {
        var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', x); t.setAttribute('y', y + 4);
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'vz-svg-label');
        t.textContent = label;
        g.appendChild(t);
    }
    svg.appendChild(g);
    return g;
}

function vizSvgEdge(svg, x1, y1, x2, y2, opts) {
    opts = opts || {};
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('class', 'vz-svg-edge');
    svg.appendChild(line);
    return line;
}
