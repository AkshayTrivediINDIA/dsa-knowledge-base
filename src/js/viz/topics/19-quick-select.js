/* ============================================================
   DSA Knowledge Base - module: viz/topics/19-quick-select
   Quick Select: k-th smallest via Lomuto partition. Partition
   a[lo..hi] in place, then recurse into only the side containing
   index k. Mounts on topics/quick-select; group quickselect.
   ============================================================ */

function vizQuickSelectFrames(state) {
    var a = (state.array || []).slice();
    var k = state.k !== undefined ? state.k : 0;
    var n = a.length;
    var frames = [];
    var lo = 0;
    var hi = n - 1;
    var depth = 0;

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null, window: null };
        for (var key in extra) f[key] = extra[key];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null, log: 'done' }); return frames; }
    if (k < 0 || k >= n) { frames.push({ narr: 'k = ' + k + ' is out of range for ' + n + ' elements.', arr: a, vars: { k: k }, sub: null, log: 'done' }); return frames; }

    function swap(i, j) {
        var t = a[i]; a[i] = a[j]; a[j] = t;
    }

    function rangeH(extra) {
        var h = {};
        for (var i = 0; i < n; i++) {
            if (i < lo || i > hi) h[i] = 'dim';
        }
        if (extra) for (var e in extra) h[e] = extra[e];
        return h;
    }

    push('Quick Select \u2014 find the k-th smallest (0-indexed k = ' + k + ') with Lomuto partition. Active range [' + lo + '..' + hi + '].',
        { highlight: rangeH({}), vars: { lo: lo, hi: hi, k: k, pivot: '-', pIndex: '-', depth: depth }, log: 'init' });

    while (true) {
        if (lo === hi) {
            var h1 = {}; h1[lo] = 'found';
            push('Range collapsed to one element \u2192 a[' + lo + '] = ' + a[lo] + ' is the k-th smallest. Answer = ' + a[lo] + '.',
                { highlight: h1, vars: { lo: lo, hi: hi, k: k, pivot: '-', pIndex: lo, depth: depth }, log: 'done' });
            return frames;
        }

        var pivot = a[hi];
        var pIndex = lo;
        push('Partition a[' + lo + '..' + hi + ']: pivot = a[' + hi + '] = ' + pivot + '. Sweep; elements < ' + pivot + ' move left of pIndex = ' + lo + '.',
            { highlight: rangeH((function () { var x = {}; x[hi] = 'pivot'; x[lo] = 'ptr-active'; return x; })()), vars: { lo: lo, hi: hi, k: k, pivot: pivot, pIndex: pIndex, depth: depth } });

        for (var i = lo; i < hi; i++) {
            var cur = a[i];
            if (cur < pivot) {
                if (i === pIndex) {
                    push('a[' + i + '] = ' + cur + ' < pivot ' + pivot + ' \u2192 already at pIndex ' + pIndex + ' \u2192 pIndex++ \u2192 ' + (pIndex + 1) + '.',
                        { highlight: rangeH((function () { var x = {}; x[hi] = 'pivot'; x[i] = 'active'; x[pIndex] = 'ptr-active'; return x; })()), vars: { lo: lo, hi: hi, k: k, pivot: pivot, pIndex: pIndex + 1, depth: depth } });
                } else {
                    var old = a[pIndex];
                    swap(i, pIndex);
                    push('a[' + i + '] = ' + cur + ' < pivot ' + pivot + ' \u2192 swap a[' + i + '] with a[' + pIndex + '] (' + old + ') \u2192 pIndex++ \u2192 ' + (pIndex + 1) + '.',
                        { highlight: rangeH((function () { var x = {}; x[hi] = 'pivot'; x[i] = 'swap'; x[pIndex] = 'swap'; return x; })()), vars: { lo: lo, hi: hi, k: k, pivot: pivot, pIndex: pIndex + 1, depth: depth }, log: 'swap' });
                }
                pIndex++;
            } else {
                push('a[' + i + '] = ' + cur + ' \u2265 pivot ' + pivot + ' \u2192 stays put, sweep continues.',
                    { highlight: rangeH((function () { var x = {}; x[hi] = 'pivot'; x[i] = 'active'; x[pIndex] = 'ptr-active'; return x; })()), vars: { lo: lo, hi: hi, k: k, pivot: pivot, pIndex: pIndex, depth: depth } });
            }
        }

        if (pIndex !== hi) swap(pIndex, hi);
        push('Place pivot: swap a[' + pIndex + '] \u2194 a[' + hi + '] \u2192 pivot ' + pivot + ' now sits at index ' + pIndex + ', all smaller values on its left.',
            { highlight: rangeH((function () { var x = {}; x[pIndex] = 'found'; return x; })()), vars: { lo: lo, hi: hi, k: k, pivot: pivot, pIndex: pIndex, depth: depth }, log: 'found' });

        if (k === pIndex) {
            var h2 = {}; h2[pIndex] = 'found';
            push('k = ' + k + ' == pIndex ' + pIndex + ' \u2192 answer = a[' + pIndex + '] = ' + a[pIndex] + '.',
                { highlight: h2, vars: { lo: lo, hi: hi, k: k, pivot: pivot, pIndex: pIndex, depth: depth }, log: 'done' });
            return frames;
        }

        if (k < pIndex) {
            depth++;
            hi = pIndex - 1;
            push('k = ' + k + ' < pIndex ' + pIndex + ' \u2192 k lies LEFT \u2192 recurse into [' + lo + '..' + hi + '] only.',
                { highlight: rangeH((function () { var x = {}; x[pIndex] = 'found'; return x; })()), vars: { lo: lo, hi: hi, k: k, pivot: pivot, pIndex: pIndex, depth: depth } });
        } else {
            depth++;
            lo = pIndex + 1;
            push('k = ' + k + ' > pIndex ' + pIndex + ' \u2192 k lies RIGHT \u2192 recurse into [' + lo + '..' + hi + '] only.',
                { highlight: rangeH((function () { var x = {}; x[pIndex] = 'found'; return x; })()), vars: { lo: lo, hi: hi, k: k, pivot: pivot, pIndex: pIndex, depth: depth } });
        }
    }
}

VIZ_CONFIG['topics/quick-select'] = {
    title: 'Quick Select \u2014 k-th smallest via Lomuto partition',
    family: 'quickselect',
    defaultState: { array: [3, 2, 1, 5, 6, 4], k: 2 },
    inputs: [
        { key: 'array', label: 'Array', value: '3, 2, 1, 5, 6, 4', placeholder: '3, 2, 1, 5, 6, 4', parse: vizParseList },
        { key: 'k', label: 'k (0-indexed)', value: '2', placeholder: '2', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'pivot', color: 'vz-pivot' },
        { label: 'sweep element', color: 'vz-active' },
        { label: 'swap', color: 'vz-swap' },
        { label: 'pivot placed / answer', color: 'vz-found' },
        { label: 'discarded region', color: 'vz-dim' }
    ],
    stepMs: 1000,
    simulate: vizQuickSelectFrames
};

VIZ_CONFIG['quickselect'] = VIZ_CONFIG['topics/quick-select'];
