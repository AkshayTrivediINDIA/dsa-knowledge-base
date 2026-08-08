/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/07-disappeared
   Find All Disappeared Numbers. Mark presence in place: for each
   value v, negate nums[abs(v)-1] (if not already negative). Then
   indices with a still-positive value are the missing numbers.
   Mounts on code/disappeared.
   ============================================================ */

function vizLcDisappearedFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — all numbers missing from 1..n?', arr: [], vars: {}, sub: null }); return frames; }

    push('Mark presence in place: for each value v, negate the value at index |v|-1. O(1) extra space. Afterward, positive values = missing numbers.',
        { vars: {}, sub: { label: 'expected 1..n', keys: (function () { var r = []; for (var i = 1; i <= n; i++) r.push(i); return r; })(), cells: (function () { var r = []; for (var i = 1; i <= n; i++) r.push(i); return r; })() }, log: 'init' });

    for (var i = 0; i < n; i++) {
        var v = Math.abs(a[i]);
        var idx = v - 1;
        var h = {};
        h[i] = 'active';
        if (a[idx] > 0) {
            a[idx] = -a[idx];
            var h2 = {};
            h2[i] = 'active';
            h2[idx] = 'found';
            push('value ' + v + ' present \u2192 negate a[' + idx + '] (' + (-a[idx]) + ').',
                { highlight: h2, vars: { i: i, v: v, mark: idx }, sub: null });
        } else {
            push('value ' + v + ' already marked (a[' + idx + '] = ' + a[idx] + ').',
                { highlight: h, vars: { i: i, v: v, mark: idx } });
        }
    }

    var missing = [];
    for (var j = 0; j < n; j++) {
        if (a[j] > 0) missing.push(j + 1);
    }

    var hf = {};
    for (var k = 0; k < n; k++) if (a[k] < 0) hf[k] = 'found';
    push('Indices still positive = missing numbers \u2192 [' + missing.join(', ') + '].',
        { highlight: hf, vars: { missing: missing.join(',') || 'none' }, sub: { label: 'expected 1..n', keys: (function () { var r = []; for (var i = 1; i <= n; i++) r.push(i); return r; })(), cells: (function () { var r = []; for (var i = 1; i <= n; i++) r.push(i); return r; })(), highlight: (function () { var x = {}; for (var s = 0; s < missing.length; s++) x[missing[s] - 1] = 'found'; return x; })() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['disappeared'] = {
    title: 'Find All Disappeared Numbers — in-place marking',
    family: 'disappeared',
    defaultState: { array: [4, 3, 2, 7, 8, 2, 3, 1] },
    inputs: [
        { key: 'array', label: 'Array (1..n)', value: '4, 3, 2, 7, 8, 2, 3, 1', placeholder: '4, 3, 2, 7, 8, 2, 3, 1', parse: vizParseList }
    ],
    legend: [
        { label: 'reading value', color: 'vz-active' },
        { label: 'marked negative', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizLcDisappearedFrames
};
