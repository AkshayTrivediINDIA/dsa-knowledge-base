/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/04-missingnumber
   Missing Number: n distinct values in 0..n, one is missing.
   XOR trick: x = 0 XOR every index (0..n) and every value; the
   values that cancel are the ones present, leaving the missing
   number. Mounts on code/missingnumber.
   ============================================================ */

function vizLcMissingNumberFrames(state) {
    var a = state.array || [];
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — missing number 0.', arr: [], vars: {}, sub: null }); return frames; }

    var x = 0;

    push('XOR trick: x starts 0. XOR it with every index i in 0..n and every value a[i]; paired index/value cancel, leaving the missing number.',
        { vars: { x: 0, op: 'start' }, sub: { label: 'expected 0..n', keys: (function () { var r = []; for (var i = 0; i <= n; i++) r.push(i); return r; })(), cells: (function () { var r = []; for (var i = 0; i <= n; i++) r.push(i); return r; })() }, log: 'init' });

    for (var i = 0; i < n; i++) {
        var x1 = x ^ i;
        push('x = ' + x + ' XOR index ' + i + ' = ' + x1 + '.',
            { highlight: (function () { var h = {}; h[i] = 'left'; return h; })(), vars: { x: x1, op: 'xor index ' + i }, sub: null });
        x = x1;
        var x2 = x ^ a[i];
        push('x = ' + x + ' XOR value a[' + i + '] = ' + a[i] + ' = ' + x2 + '.',
            { highlight: (function () { var h = {}; h[i] = 'active'; return h; })(), vars: { x: x2, op: 'xor value a[' + i + ']' }, sub: null });
        x = x2;
    }

    var xf = x ^ n;
    push('Finally XOR with index ' + n + ': ' + x + ' ^ ' + n + ' = ' + xf + '.',
        { vars: { x: xf, op: 'xor index ' + n }, sub: { label: 'expected 0..n', keys: (function () { var r = []; for (var i = 0; i <= n; i++) r.push(i); return r; })(), cells: (function () { var r = []; for (var i = 0; i <= n; i++) r.push(i); return r; })() }, log: 'step' });
    x = xf;

    var hf = {};
    for (var j = 0; j < n; j++) hf[j] = 'found';
    push('Missing number = ' + x + '.',
        { highlight: hf, vars: { missing: x }, sub: { label: 'expected 0..n', keys: (function () { var r = []; for (var i = 0; i <= n; i++) r.push(i); return r; })(), cells: (function () { var r = []; for (var i = 0; i <= n; i++) r.push(i); return r; })() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['missingnumber'] = {
    title: 'Missing Number — XOR trick',
    family: 'missingnumber',
    defaultState: { array: [3, 0, 1] },
    inputs: [
        { key: 'array', label: 'Array (0..n, one missing)', value: '3, 0, 1', placeholder: '3, 0, 1', parse: vizParseList }
    ],
    legend: [
        { label: 'index xor', color: 'vz-left' },
        { label: 'value xor', color: 'vz-active' },
        { label: 'present values', color: 'vz-found' }
    ],
    stepMs: 1000,
    simulate: vizLcMissingNumberFrames
};
