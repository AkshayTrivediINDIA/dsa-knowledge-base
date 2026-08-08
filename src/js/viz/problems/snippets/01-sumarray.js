/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/01-sumarray
   Sum of an Array: one left-to-right pass adding each element to
   an accumulator. Mounts on code/sumarray.
   ============================================================ */

function vizSnSumArrayFrames(state) {
    var a = state.array || [];
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — sum 0.', arr: [], vars: {} }); return frames; }

    var sum = 0;
    push('Sum all elements with a running total. O(n).',
        { vars: { sum: 0 }, log: 'init' });

    for (var i = 0; i < n; i++) {
        sum += a[i];
        push('i = ' + i + ': add a[' + i + '] = ' + a[i] + ' \u2192 sum = ' + sum + '.',
            { highlight: (function () { var h = {}; h[i] = 'active'; return h; })(), vars: { i: i, a: a[i], sum: sum } });
    }

    push('Sum of array = ' + sum + '.',
        { vars: { sum: sum }, log: 'done' });

    return frames;
}

VIZ_CONFIG['sumarray'] = {
    title: 'Sum of Array — running total',
    family: 'sumarray',
    defaultState: { array: [1, 2, 3, 4, 5] },
    inputs: [
        { key: 'array', label: 'Array', value: '1, 2, 3, 4, 5', placeholder: '1, 2, 3, 4, 5', parse: vizParseList }
    ],
    legend: [
        { label: 'adding', color: 'vz-active' }
    ],
    stepMs: 1000,
    simulate: vizSnSumArrayFrames
};
