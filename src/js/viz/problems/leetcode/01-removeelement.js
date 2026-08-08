/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/01-removeelement
   Remove Element: two pointers in place. read scans; write keeps
   the next slot for a value != val. Non-matching values are copied
   forward; everything equal to val is skipped. Mounts on
   code/removeelement.
   ============================================================ */

function vizLcRemoveElementFrames(state) {
    var a = (state.array || []).slice();
    var val = state.val;
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — 0 elements remain.', arr: [], vars: {}, sub: null }); return frames; }

    var w = 0;

    push('Scan with read; write marks the next slot for a value \u2260 ' + val + '. Values equal to ' + val + ' are skipped. O(n).',
        { highlight: { 0: 'active' }, vars: { r: 0, w: w, val: val }, sub: { label: 'kept prefix', keys: [], cells: [] }, log: 'init' });

    for (var r = 0; r < n; r++) {
        if (a[r] !== val) {
            a[w] = a[r];
            var hw = {};
            hw[w] = 'found';
            hw[r] = 'active';
            push('a[' + r + '] = ' + a[r] + ' \u2260 ' + val + ' \u2192 keep: write at slot ' + w + ', advance.',
                { highlight: hw, vars: { r: r, w: w, val: val }, sub: { label: 'kept prefix', keys: a.slice(0, w + 1), cells: a.slice(0, w + 1), highlight: (function () { var x = {}; x[w] = 'active'; return x; })() }, log: 'keep' });
            w++;
        } else {
            push('a[' + r + '] = ' + val + ' \u2192 remove (skip).',
                { highlight: (function () { var h = {}; h[r] = 'compare'; h[w] = 'left'; return h; })(), vars: { r: r, w: w, val: val } });
        }
    }

    push('Done \u2014 ' + w + ' elements remain: [' + a.slice(0, w).join(', ') + '].',
        { vars: { k: w }, sub: { label: 'kept prefix', keys: a.slice(0, w), cells: a.slice(0, w), highlight: (function () { var x = {}; for (var i = 0; i < w; i++) x[i] = 'found'; return x; })() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['removeelement'] = {
    title: 'Remove Element — in-place write pointer',
    family: 'removeelement',
    defaultState: { array: [3, 2, 2, 3], val: 3 },
    inputs: [
        { key: 'array', label: 'Array', value: '3, 2, 2, 3', placeholder: '3, 2, 2, 3', parse: vizParseList },
        { key: 'val', label: 'Value to remove', value: '3', placeholder: '3', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'write slot', color: 'vz-left' },
        { label: 'reading', color: 'vz-active' },
        { label: 'kept value', color: 'vz-found' },
        { label: 'removed', color: 'vz-compare' }
    ],
    stepMs: 1150,
    simulate: vizLcRemoveElementFrames
};
