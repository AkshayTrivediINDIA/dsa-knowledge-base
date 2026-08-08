/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/05-rangesum
   Range Sum Query (Immutable): build a prefix-sum array once,
   then answer sum(lo..hi) = prefix[hi+1] - prefix[lo] in O(1).
   The sub-row shows the prefix array. Mounts on code/rangesum.
   ============================================================ */

function vizLcRangeSumFrames(state) {
    var a = state.array || [];
    var lo = state.lo;
    var hi = state.hi;
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    var prefix = [0];

    push('Precompute prefix[i] = sum of a[0..i-1]. Then any range sum is two lookups: sum(lo..hi) = prefix[hi+1] - prefix[lo].',
        { vars: { build: true }, sub: { label: 'prefix', keys: [0], cells: [0] }, log: 'init' });

    for (var i = 0; i < n; i++) {
        prefix.push(prefix[prefix.length - 1] + a[i]);
        push('prefix[' + (i + 1) + '] = prefix[' + i + '] + a[' + i + '] = ' + prefix[i] + ' + ' + a[i] + ' = ' + prefix[i + 1] + '.',
            { highlight: (function () { var h = {}; h[i] = 'active'; return h; })(), vars: { i: i, p: prefix[i + 1] }, sub: { label: 'prefix', keys: prefix.map(function (_, k) { return k; }), cells: prefix.slice(), highlight: (function () { var h = {}; h[i + 1] = 'active'; return h; })() } });
    }

    var s = prefix[hi + 1] - prefix[lo];
    var hl = {};
    hl[lo] = 'left';
    hl[hi] = 'right';
    push('Query sum(' + lo + '..' + hi + ') = prefix[' + (hi + 1) + '] - prefix[' + lo + '] = ' + prefix[hi + 1] + ' - ' + prefix[lo] + ' = ' + s + '.',
        { highlight: hl, vars: { lo: lo, hi: hi, sum: s }, sub: { label: 'prefix', keys: prefix.map(function (_, k) { return k; }), cells: prefix.slice(), highlight: (function () { var h = {}; h[hi + 1] = 'right'; h[lo] = 'left'; return h; })() }, log: 'query' });

    push('Range sum = ' + s + ' (O(1) per query after O(n) build).',
        { vars: { sum: s }, sub: { label: 'prefix', keys: prefix.map(function (_, k) { return k; }), cells: prefix.slice() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['rangesum'] = {
    title: 'Range Sum Query (Immutable) — prefix sums',
    family: 'rangesum',
    defaultState: { array: [-2, 0, 3, -5, 2, -1], lo: 0, hi: 2 },
    inputs: [
        { key: 'array', label: 'Array', value: '-2, 0, 3, -5, 2, -1', placeholder: '-2, 0, 3, -5, 2, -1', parse: vizParseList },
        { key: 'lo', label: 'lo', value: '0', placeholder: '0', parse: function (s) { return parseInt(s, 10) || 0; } },
        { key: 'hi', label: 'hi', value: '2', placeholder: '2', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'lo', color: 'vz-left' },
        { label: 'hi', color: 'vz-right' },
        { label: 'building prefix', color: 'vz-active' }
    ],
    stepMs: 1000,
    simulate: vizLcRangeSumFrames
};
