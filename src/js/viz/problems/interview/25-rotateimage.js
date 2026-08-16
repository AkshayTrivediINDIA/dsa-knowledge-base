/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/25-rotateimage
   Rotate Image 90\u00b0 clockwise (LeetCode 48). Transpose the
   matrix (swap m[i][j] with m[j][i] for j > i), then reverse
   every row. O(n\u00b2) time, O(1) extra space.
   Mounts on code/rotateimage.
   ============================================================ */

function vizIvRotateImageFrames(state) {
    var m = (state.array || []).map(function (r) { return r.slice(); });
    var n = m.length;
    var frames = [];

    function grid() { return m.map(function (r) { return r.slice(); }); }

    function push(narr, extra) {
        var f = { narr: narr, matrix: { grid: grid(), highlight: {} }, vars: {}, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty matrix.', matrix: { grid: [], highlight: {} }, vars: {} }); return frames; }

    push('Rotate 90\u00b0 clockwise in two steps: transpose the matrix (swap (i,j) with (j,i)), then reverse each row.',
        { vars: { i: 0, j: 0, phase: 'transpose' }, log: 'init' });

    for (var i = 0; i < n; i++) {
        for (var j = i + 1; j < n; j++) {
            var h = {};
            h[i + ',' + j] = 'compare';
            h[j + ',' + i] = 'compare';
            push('Transpose: swap (' + i + ',' + j + ') \u2194 (' + j + ',' + i + ')  (' + m[i][j] + ' \u2194 ' + m[j][i] + ')',
                { matrix: { grid: grid(), highlight: h }, vars: { i: i, j: j, phase: 'transpose' } });
            var t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t;
        }
    }
    push('Transpose complete \u2014 rows became columns. Now reverse each row.',
        { vars: { i: 0, j: 0, phase: 'reverse' }, log: 'step' });

    for (var r = 0; r < n; r++) {
        var h2 = {};
        for (var c = 0; c < n; c++) h2[r + ',' + c] = 'active';
        m[r] = m[r].slice().reverse();
        push('Reverse row ' + r + ': [' + m[r].join(', ') + ']',
            { matrix: { grid: grid(), highlight: h2 }, vars: { i: r, j: 0, phase: 'reverse' } });
    }

    var hf = {};
    for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) hf[a + ',' + b] = 'found';
    push('Rotated 90\u00b0 clockwise: [' + m.map(function (row) { return '[' + row.join(', ') + ']'; }).join(', ') + '].',
        { matrix: { grid: grid(), highlight: hf }, vars: { i: 0, j: 0, phase: 'done' }, log: 'done' });

    return frames;
}

VIZ_CONFIG['rotateimage'] = {
    title: 'Rotate Image 90\u00b0 \u2014 transpose, then reverse rows',
    family: 'rotateimage',
    defaultState: { array: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
    inputs: [
        { key: 'array', label: 'Matrix (rows with ;)', value: '1,2,3;4,5,6;7,8,9', placeholder: '1,2,3;4,5,6;7,8,9', parse: function (s) { return s.trim().split(';').map(function (r) { return r.split(',').map(function (x) { return parseInt(x, 10); }); }); } }
    ],
    legend: [
        { label: 'swapping pair', color: 'vz-compare' },
        { label: 'row being reversed', color: 'vz-active' },
        { label: 'rotated result', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvRotateImageFrames
};
