/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/03-mergesorted
   Merge Sorted Array: merge a (with n real values + m zero
   padding) and b into a, in place, by filling from the END. The
   largest remaining value of either array is placed at the tail.
   Mounts on code/mergesorted.
   ============================================================ */

function vizLcMergeSortedFrames(state) {
    var a = (state.a || []).slice();
    var b = state.b || [];
    var n = state.n;
    var m = state.m;
    var total = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!total) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    var i = n - 1, j = m - 1, w = total - 1;

    push('Merge backwards: i = last real value of a, j = last of b, w = tail write slot. Take the larger tail value each step.',
        { vars: { i: i, j: j, w: w }, highlight: (function () { var h = {}; if (i >= 0) h[i] = 'left'; if (j >= 0) h[j] = 'right'; return h; })(), sub: { label: 'b', keys: b.slice(), cells: b.slice() }, log: 'init' });

    while (j >= 0) {
        if (i >= 0 && a[i] > b[j]) {
            a[w] = a[i];
            push('a[' + i + '] = ' + a[i] + ' > b[' + j + '] = ' + b[j] + ' \u2192 a[i] goes to slot ' + w + '.',
                { highlight: (function () { var h = {}; h[i] = 'left'; h[w] = 'found'; return h; })(), vars: { i: i, j: j, w: w }, sub: { label: 'b', keys: b.slice(), cells: b.slice() } });
            i--;
        } else {
            a[w] = b[j];
            push('b[' + j + '] = ' + b[j] + ' \u2265 a[' + (i >= 0 ? i : '\u2013') + '] \u2192 b[j] goes to slot ' + w + '.',
                { highlight: (function () { var h = {}; h[j] = 'right'; h[w] = 'found'; return h; })(), vars: { i: i, j: j, w: w }, sub: { label: 'b', keys: b.slice(), cells: b.slice(), highlight: (function () { var h = {}; h[j] = 'right'; return h; })() } });
            j--;
        }
        w--;
    }

    var hf = {};
    for (var k = 0; k < total; k++) hf[k] = 'found';
    push('Merged: [' + a.join(', ') + '].',
        { highlight: hf, vars: {}, sub: { label: 'b', keys: b.slice(), cells: b.slice() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['mergesorted'] = {
    title: 'Merge Sorted Array — merge in place from the end',
    family: 'mergesorted',
    defaultState: { a: [1, 2, 3, 0, 0, 0], b: [2, 5, 6], n: 3, m: 3 },
    inputs: [
        { key: 'a', label: 'Array a (with padding)', value: '1, 2, 3, 0, 0, 0', placeholder: '1, 2, 3, 0, 0, 0', parse: vizParseList },
        { key: 'b', label: 'Array b', value: '2, 5, 6', placeholder: '2, 5, 6', parse: vizParseList },
        { key: 'n', label: 'Real count n', value: '3', placeholder: '3', parse: function (s) { return parseInt(s, 10) || 0; } },
        { key: 'm', label: 'Real count m', value: '3', placeholder: '3', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'a pointer', color: 'vz-left' },
        { label: 'b pointer', color: 'vz-right' },
        { label: 'written value', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizLcMergeSortedFrames
};
