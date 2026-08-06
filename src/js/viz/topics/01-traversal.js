/* ============================================================
   DSA Knowledge Base - module: viz/topics/01-traversal
   Forward pass computes the running sum; reverse pass computes
   the suffix max. Two directional scans of the same array.
   Mounts on topics/traversal; inherited by code/traversal.
   ============================================================ */

function vizTraversalFrames(state) {
    var arr = state.array || [];
    var frames = [];
    var n = arr.length;

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, vars: {} };
        if (extra) {
            for (var k in extra) f[k] = extra[k];
            if (extra.highlight) f.highlight = extra.highlight;
        }
        frames.push(f);
    }

    if (!n) {
        push('Empty array — nothing to traverse.', { vars: {} });
        return frames;
    }

    /* forward: running sum */
    push('Forward scan: visit every element 0..' + (n - 1) + ' exactly once, adding to sum.',
        { highlight: {}, vars: { i: '\u2014', sum: 0 }, log: 'init' });
    var sum = 0;
    for (var i = 0; i < n; i++) {
        var before = sum;
        sum += arr[i];
        var h = {}; h[i] = 'active';
        if (i > 0) h[i - 1] = 'found';
        push('i = ' + i + ': sum = ' + before + ' + ' + arr[i] + ' = ' + sum,
            { highlight: h, vars: { i: i, sum: sum } });
    }
    push('Forward pass done — total sum = ' + sum + '.',
        { highlight: {}, vars: { i: '\u2014', sum: sum }, log: 'forward done' });

    /* reverse: suffix max */
    push('Reverse scan: visit n-1..0, tracking the largest value seen from the right.',
        { highlight: {}, vars: { i: '\u2014', sufMax: '\u2014' }, log: 'reverse' });
    var m = -Infinity;
    var suf = new Array(n).fill(null);
    for (var j = n - 1; j >= 0; j--) {
        if (arr[j] > m) m = arr[j];
        suf[j] = m;
        var rh = {}; rh[j] = 'active';
        push('i = ' + j + ': suffix max = ' + m + '  (a[i] = ' + arr[j] + ')',
            { highlight: rh, vars: { i: j, sufMax: m } });
    }
    push('Reverse pass done — suffix max array = [' + suf.join(', ') + ']  (max of a[i..n-1] at each i).',
        { highlight: {}, vars: { i: '\u2014', sufMax: m }, log: 'reverse done' });

    return frames;
}

VIZ_CONFIG['topics/traversal'] = {
    title: 'Array Traversal — forward sum + reverse suffix max',
    family: 'traversal',
    defaultState: { array: [2, 5, 1, 8, 3] },
    inputs: [
        { key: 'array', label: 'Array', value: '2, 5, 1, 8, 3', placeholder: '2, 5, 1, 8, 3', parse: vizParseList }
    ],
    legend: [
        { label: 'scan position', color: 'vz-active' },
        { label: 'accumulated', color: 'vz-found' }
    ],
    stepMs: 950,
    simulate: vizTraversalFrames
};

VIZ_CONFIG['traversal'] = VIZ_CONFIG['topics/traversal'];
