/* ============================================================
   DSA Knowledge Base - module: viz/topics/15-suffix-sum
   Build sfx[i] = a[i] + sfx[i+1] right-to-left, then answer any
   range-sum query as sum(i..j) = sfx[i] - sfx[j+1] in O(1).
   Mounts on topics/suffix-sum; inherited by code/suffix-sum.
   ============================================================ */

function vizSuffixSumFrames(state) {
    var arr = state.array || [];
    var n = arr.length;
    var frames = [];
    var sfx = [];
    var i, k;

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, sub: null, vars: {} };
        for (var k2 in extra) f[k2] = extra[k2];
        frames.push(f);
    }
    function sfxKeys() {
        var ks = [];
        for (k = 0; k <= n; k++) ks.push(k);
        return ks;
    }
    function sfxCells() {
        return sfx.slice();
    }
    function markSfx() {
        var h = {};
        for (k = 0; k <= n; k++) if (sfx[k] !== '\u2014') h[k] = 'found';
        return h;
    }

    if (!n) {
        frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null });
        return frames;
    }

    for (i = 0; i < n; i++) sfx[i] = '\u2014';
    sfx[n] = 0;

    push('Build the suffix array: sfx[n] = 0, then sfx[i] = a[i] + sfx[i+1] scanning right to left.',
        { vars: { i: '\u2014', sfx_i: '\u2014', query: '\u2014' }, sub: { label: 'suffix', keys: sfxKeys(), cells: sfxCells(), highlight: (function () { var h = {}; h[n] = 'found'; return h; })() }, log: 'init' });

    for (i = n - 1; i >= 0; i--) {
        var next = arr[i] + sfx[i + 1];
        var h = {}; h[i] = 'active';
        var sh = markSfx(); sh[i] = 'found';
        sfx[i] = next;
        push('i = ' + i + ': sfx[' + i + '] = a[' + i + '] + sfx[' + (i + 1) + '] = ' + arr[i] + ' + ' + (i + 1 === n ? 0 : sfx[i + 1]) + ' = ' + next,
            { highlight: h, sub: { label: 'suffix', keys: sfxKeys(), cells: sfxCells(), highlight: sh }, vars: { i: i, sfx_i: next, query: '\u2014' } });
    }

    var ql = 1;
    var qr = n - 1 > 3 ? 3 : n - 1;
    if (ql > qr) ql = 0;
    var s = sfx[ql] - sfx[qr + 1];
    var qh = {};
    for (k = ql; k <= qr; k++) qh[k] = 'compare';
    push('Query sum(' + ql + '..' + qr + ') = sfx[' + ql + '] - sfx[' + (qr + 1) + '] = ' + sfx[ql] + ' - ' + sfx[qr + 1] + ' = ' + s,
        { highlight: qh, sub: { label: 'suffix', keys: sfxKeys(), cells: sfxCells() }, vars: { i: '\u2014', sfx_i: '\u2014', query: s }, log: 'range query' });

    push('Suffix array [' + sfx.join(', ') + '] built in O(n); every range sum sum(i..j) = sfx[i] - sfx[j+1] in O(1). Answer for (' + ql + '..' + qr + ') = ' + s + '.',
        { highlight: markSfx(), sub: { label: 'suffix', keys: sfxKeys(), cells: sfxCells() }, vars: { i: '\u2014', sfx_i: '\u2014', query: s }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/suffix-sum'] = {
    title: 'Suffix Sum — O(1) range-sum queries from the right',
    family: 'suffix-sum',
    defaultState: { array: [2, 4, 6, 8, 10] },
    inputs: [
        { key: 'array', label: 'Array', value: '2, 4, 6, 8, 10', placeholder: '2, 4, 6, 8, 10', parse: vizParseList }
    ],
    legend: [
        { label: 'current a[i]', color: 'vz-active' },
        { label: 'built sfx cell', color: 'vz-found' },
        { label: 'query range', color: 'vz-compare' }
    ],
    stepMs: 1000,
    simulate: vizSuffixSumFrames
};

VIZ_CONFIG['suffixsum'] = VIZ_CONFIG['topics/suffix-sum'];
