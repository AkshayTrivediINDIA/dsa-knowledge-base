/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/13-firstmissing
   First Missing Positive. Cycle-place every value v in 1..n at
   index v-1 by swapping, ignoring negatives and values > n. Then
   scan for the first i where nums[i] != i+1. Mounts on
   code/firstmissing.
   ============================================================ */

function vizIvFirstMissingFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — first missing positive = 1.', arr: [], vars: {}, sub: null }); return frames; }

    push('Cycle placement: for every v with 1 \u2264 v \u2264 n, v belongs at index v-1. Swap it there; ignore negatives and values > n.',
        { vars: {}, sub: { label: 'expected', keys: (function () { var r = []; for (var i = 0; i < n; i++) r.push(i + 1); return r; })(), cells: (function () { var r = []; for (var i = 0; i < n; i++) r.push(i + 1); return r; })() }, log: 'init' });

    for (var i = 0; i < n; i++) {
        while (a[i] >= 1 && a[i] <= n && a[a[i] - 1] !== a[i]) {
            var dest = a[i] - 1;
            var h = {};
            h[i] = 'left';
            h[dest] = 'active';
            push('Place ' + a[i] + ' at its home index ' + dest + ': swap a[' + i + '] \u2194 a[' + dest + '].',
                { swap: [i, dest], highlight: h, vars: { i: i, home: dest }, sub: null });
            var t = a[i]; a[i] = a[dest]; a[dest] = t;
        }
    }

    var answer = n + 1;
    var hfound = {};
    for (var j = 0; j < n; j++) {
        if (a[j] !== j + 1) {
            answer = j + 1;
            hfound[j] = 'found';
            break;
        }
    }

    var hf = {};
    for (var k = 0; k < n; k++) if (a[k] === k + 1) hf[k] = 'found';
    push('Placement done. First index where a[i] \u2260 i+1 is ' + (answer - 1) + ' \u2192 first missing positive = ' + answer + '.',
        { highlight: hf, vars: { answer: answer }, sub: { label: 'expected', keys: (function () { var r = []; for (var i = 0; i < n; i++) r.push(i + 1); return r; })(), cells: (function () { var r = []; for (var i = 0; i < n; i++) r.push(i + 1); return r; })() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['firstmissing'] = {
    title: 'First Missing Positive — cycle placement in place',
    family: 'firstmissing',
    defaultState: { array: [3, 4, -1, 1] },
    inputs: [
        { key: 'array', label: 'Array', value: '3, 4, -1, 1', placeholder: '3, 4, -1, 1', parse: vizParseList }
    ],
    legend: [
        { label: 'moving value', color: 'vz-left' },
        { label: 'home slot', color: 'vz-active' },
        { label: 'correctly placed', color: 'vz-found' }
    ],
    stepMs: 1250,
    simulate: vizIvFirstMissingFrames
};
