/* ============================================================
   DSA Knowledge Base - module: viz/topics/03-difference-array
   Range updates O(1) on a diff array, then one prefix pass
   materializes the final array.
   Mounts on topics/difference-array; inherited by code/difference-array.
   ============================================================ */

function vizDiffArrayFrames(state) {
    var base = state.array || [0, 0, 0, 0, 0, 0];
    var n = base.length;
    var diff = [];
    for (var i = 0; i <= n; i++) diff.push(0);
    var updates = state.updates || [
        { val: 3, l: 1, r: 4 },
        { val: 2, l: 2, r: 3 },
        { val: 5, l: 0, r: 1 }
    ];
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: diff, highlight: {}, sub: null, vars: {} };
        for (var k in extra) f[k] = extra[k];
        if (!extra.sub) f.sub = { label: 'diff', cells: diff.slice() };
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    push('diff[] starts all zero. An update to [l..r] touches only two cells: diff[l] += v and diff[r+1] -= v.',
        { highlight: {}, sub: { label: 'diff', cells: diff.slice() }, vars: {}, log: 'init' });

    updates.forEach(function (u, k) {
        var h = {}; h[u.l] = 'left'; h[u.r + 1] = 'right';
        diff[u.l] += u.val;
        diff[u.r + 1] -= u.val;
        push('Update ' + (k + 1) + ': +' + u.val + ' to [' + u.l + '..' + u.r + ']  \u2192  diff[' + u.l + '] += ' + u.val + ', diff[' + (u.r + 1) + '] -= ' + u.val,
            { highlight: h, sub: { label: 'diff', cells: diff.slice(), highlight: {} }, vars: { update: k + 1, l: u.l, r: u.r, v: u.val } });
    });

    push('All updates applied in O(1) each. Now materialize: running += diff[i] walks the real array forward.',
        { highlight: {}, sub: { label: 'diff', cells: diff.slice() }, vars: {}, log: 'materialize' });

    var out = [];
    var running = 0;
    for (var i = 0; i < n; i++) {
        running += diff[i];
        out.push(running);
        var h = {}; h[i] = 'active';
        var sh = {}; sh[i] = 'found';
        push('i = ' + i + ': running += diff[' + i + '] (' + diff[i] + ')  \u2192  a[' + i + '] = ' + running,
            { highlight: h, sub: { label: 'diff', cells: diff.slice(), highlight: sh }, vars: { i: i, running: running } });
    }

    push('Final array: [' + out.join(', ') + ']. Prefix sum of diff recovers every range update.',
        { highlight: {}, sub: { label: 'diff', cells: diff.slice() }, vars: { result: '[' + out.join(', ') + ']' }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/difference-array'] = {
    title: 'Difference Array — O(1) range updates',
    family: 'difference-array',
    defaultState: { array: [0, 0, 0, 0, 0, 0] },
    inputs: [
        { key: 'array', label: 'Array (zeros)', value: '0, 0, 0, 0, 0, 0', placeholder: '0, 0, 0, 0, 0, 0', parse: vizParseList }
    ],
    legend: [
        { label: 'update left edge', color: 'vz-left' },
        { label: 'update right edge', color: 'vz-right' },
        { label: 'materializing', color: 'vz-active' }
    ],
    stepMs: 1000,
    simulate: vizDiffArrayFrames
};

VIZ_CONFIG['difference-array'] = VIZ_CONFIG['topics/difference-array'];
