/* ============================================================
   DSA Knowledge Base - module: viz/topics/02-prefix-sum
   Build pref[i+1] = pref[i] + a[i], then answer range-sum
   queries via pref[r+1] - pref[l].
   Mounts on topics/prefix-sum; inherited by code/prefix-sum.
   ============================================================ */

function vizPrefixSumFrames(state) {
    var arr = state.array || [];
    var n = arr.length;
    var frames = [];
    var pref = [0];

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, sub: null, vars: {} };
        for (var k in extra) f[k] = extra[k];
        if (!extra.sub) f.sub = { label: 'prefix', keys: prefKeys(), cells: pref.slice() };
        if (!extra.highlight) f.highlight = {};
        frames.push(f);
    }
    function prefKeys() {
        var ks = [];
        for (var i = 0; i <= n; i++) ks.push(i);
        return ks;
    }

    if (!n) {
        frames.push({ narr: 'Empty array.', arr: [], vars: {} });
        return frames;
    }

    push('Build the prefix array: pref[0] = 0, then pref[i+1] = pref[i] + a[i] for each i.',
        { highlight: {}, vars: { i: '\u2014' }, log: 'init' });

    for (var i = 0; i < n; i++) {
        var next = pref[i] + arr[i];
        var h = {}; h[i] = 'active';
        var sh = {}; sh[i + 1] = 'found';
        push('i = ' + i + ': pref[' + (i + 1) + '] = pref[' + i + '] + a[' + i + '] = ' + pref[i] + ' + ' + arr[i] + ' = ' + next,
            { highlight: h, sub: { label: 'prefix', keys: prefKeys(), cells: pref.concat([next]), highlight: sh }, vars: { i: i, a: arr[i], pref: next } });
        pref.push(next);
    }

    push('Prefix array complete. Any range sum is two lookups: sum(l..r) = pref[r+1] - pref[l].',
        { highlight: {}, sub: { label: 'prefix', keys: prefKeys(), cells: pref.slice() }, vars: {}, log: 'build done' });

    /* query 1: sum(1..3) */
    var l = state.l !== undefined ? state.l : 1;
    var r = state.r !== undefined ? state.r : 3;
    var s1 = pref[r + 1] - pref[l];
    var qh = {};
    for (var q = l; q <= r; q++) qh[q] = 'compare';
    push('Query sum(' + l + '..' + r + '): pref[' + (r + 1) + '] - pref[' + l + '] = ' + pref[r + 1] + ' - ' + pref[l] + ' = ' + s1,
        { highlight: qh, vars: { l: l, r: r, sum: s1 }, log: 'range query' });

    /* query 2: sum(0..4) */
    var l2 = 0, r2 = n - 1;
    var s2 = pref[r2 + 1] - pref[l2];
    var qh2 = {};
    for (var q2 = l2; q2 <= r2; q2++) qh2[q2] = 'compare';
    push('Query sum(' + l2 + '..' + r2 + '): pref[' + (r2 + 1) + '] - pref[' + l2 + '] = ' + pref[r2 + 1] + ' - ' + pref[l2] + ' = ' + s2,
        { highlight: qh2, vars: { l: l2, r: r2, sum: s2 }, log: 'full range' });

    return frames;
}

VIZ_CONFIG['topics/prefix-sum'] = {
    title: 'Prefix Sum — O(1) range-sum queries',
    family: 'prefix-sum',
    defaultState: { array: [3, 1, 4, 1, 5], l: 1, r: 3 },
    inputs: [
        { key: 'array', label: 'Array', value: '3, 1, 4, 1, 5', placeholder: '3, 1, 4, 1, 5', parse: vizParseList },
        { key: 'l', label: 'Query l', value: '1', placeholder: '1', parse: function (s) { return parseInt(s, 10) || 0; } },
        { key: 'r', label: 'Query r', value: '3', placeholder: '3', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'reading a[i]', color: 'vz-active' },
        { label: 'updated prefix', color: 'vz-found' },
        { label: 'query range', color: 'vz-compare' }
    ],
    stepMs: 1000,
    simulate: vizPrefixSumFrames
};

VIZ_CONFIG['prefix-sum'] = VIZ_CONFIG['topics/prefix-sum'];
