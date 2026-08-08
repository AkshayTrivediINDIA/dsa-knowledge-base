/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/02-reverse
   Reverse an Array: swap the two ends with l/r pointers and move
   inward until they cross. Mounts on code/reverse.
   ============================================================ */

function vizSnReverseFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    var l = 0, r = n - 1;
    push('Two pointers at the ends. Swap a[l] and a[r], then l++, r--. Stop when l \u2265 r.',
        { highlight: { 0: 'left', [n - 1]: 'right' }, vars: { l: l, r: r }, log: 'init' });

    while (l < r) {
        var h = {};
        h[l] = 'left';
        h[r] = 'right';
        push('Swap a[' + l + '] (' + a[l] + ') \u2194 a[' + r + '] (' + a[r] + ').',
            { swap: [l, r], highlight: h, vars: { l: l, r: r } });
        var t = a[l]; a[l] = a[r]; a[r] = t;
        l++; r--;
    }

    var hf = {};
    for (var i = 0; i < n; i++) hf[i] = 'found';
    push('Reversed: [' + a.join(', ') + '].',
        { highlight: hf, vars: {}, log: 'done' });

    return frames;
}

VIZ_CONFIG['reverse'] = {
    title: 'Reverse an Array — two-pointer swaps',
    family: 'reverse',
    defaultState: { array: [1, 2, 3, 4, 5] },
    inputs: [
        { key: 'array', label: 'Array', value: '1, 2, 3, 4, 5', placeholder: '1, 2, 3, 4, 5', parse: vizParseList }
    ],
    legend: [
        { label: 'left', color: 'vz-left' },
        { label: 'right', color: 'vz-right' },
        { label: 'reversed', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizSnReverseFrames
};
