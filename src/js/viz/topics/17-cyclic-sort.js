/* ============================================================
   DSA Knowledge Base - module: viz/topics/17-cyclic-sort
   Cyclic sort for values 1..n: swap each value into its home
   index (value - 1); advance i only when a[i] is already correct.
   Every misplaced element lands at its home in one swap, so O(n).
   Mounts on topics/cyclic-sort; inherited by code/cyclic-sort.
   ============================================================ */

function vizCyclicSortFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];
    var i = 0, swaps = 0;

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }
    function markCorrect() {
        var h = {};
        for (var k = 0; k < n; k++) if (a[k] === k + 1) h[k] = 'found';
        return h;
    }

    if (!n) {
        frames.push({ narr: 'Empty array.', arr: [], vars: {} });
        return frames;
    }

    push('Cyclic sort: values are 1..n. Home of value v is index v - 1. Swap each element to its home; only advance i when a[i] is already correct.',
        { vars: { i: i, a_i: a[i], expected: i + 1, swaps: 0 }, log: 'init' });

    while (i < n) {
        if (a[i] === i + 1) {
            var hc = markCorrect(); hc[i] = 'active';
            push('i = ' + i + ': a[' + i + '] = ' + a[i] + ' already at home (expected ' + (i + 1) + ') \u2192 advance i.',
                { highlight: hc, vars: { i: i, a_i: a[i], expected: i + 1, swaps: swaps }, log: 'step' });
            i++;
        } else {
            var dest = a[i] - 1;
            var hw = markCorrect(); hw[i] = 'swap'; hw[dest] = 'swap';
            push('i = ' + i + ': a[' + i + '] = ' + a[i] + ' (home should be ' + (a[i] - 1) + ') \u2192 swap a[' + i + '] \u2194 a[' + dest + '].',
                { highlight: hw, swap: [i, dest], vars: { i: i, a_i: a[i], expected: i + 1, swaps: swaps + 1 }, log: 'swap' });
            var t = a[i]; a[i] = a[dest]; a[dest] = t;
            swaps++;
        }
    }

    push('Done \u2192 [' + a.join(', ') + '] fully sorted in ' + swaps + ' swaps. Each misplaced value reaches its home in one swap, total O(n).',
        { highlight: markCorrect(), vars: { i: i, a_i: '\u2014', expected: '\u2014', swaps: swaps }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/cyclic-sort'] = {
    title: 'Cyclic Sort — place each 1..n value at index value-1',
    family: 'cyclic-sort',
    defaultState: { array: [3, 1, 5, 2, 4] },
    inputs: [
        { key: 'array', label: 'Array (1..n)', value: '3, 1, 5, 2, 4', placeholder: '3, 1, 5, 2, 4', parse: vizParseList }
    ],
    legend: [
        { label: 'i pointer', color: 'vz-active' },
        { label: 'swapping pair', color: 'vz-swap' },
        { label: 'correctly placed', color: 'vz-found' }
    ],
    stepMs: 1000,
    simulate: vizCyclicSortFrames
};

VIZ_CONFIG['cyclicsort'] = VIZ_CONFIG['topics/cyclic-sort'];
