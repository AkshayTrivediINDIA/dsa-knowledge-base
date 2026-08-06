/* ============================================================
   DSA Knowledge Base - module: viz/topics/10-matrix
   Rotate an NxN matrix 90° clockwise: transpose (swap i,j with
   j,i for j > i) then reverse each row.
   Mounts on topics/matrix; inherited by code/matrix.
   ============================================================ */

function vizParseMatrix(s) {
    return String(s || '').split(';').map(function (row) {
        return String(row).trim().split(/[\s,]+/).map(function (t) { return parseInt(t, 10); }).filter(function (x) { return !isNaN(x); });
    }).filter(function (r) { return r.length; });
}

function vizMatrixFrames(state) {
    var grid = state.matrix;
    var rows = grid.length;
    var cols = rows ? grid[0].length : 0;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, matrix: { grid: grid.map(function (r) { return r.slice(); }) }, vars: {} };
        for (var k in extra) f[k] = extra[k];
        if (!extra.matrix) f.matrix = { grid: grid.map(function (r) { return r.slice(); }) };
        frames.push(f);
    }

    if (!rows) { frames.push({ narr: 'Empty matrix.', matrix: { grid: [] }, vars: {} }); return frames; }

    push('Rotate the matrix 90\u00b0 clockwise. Two steps: transpose, then reverse each row.',
        { vars: {}, log: 'init' });

    /* transpose: swap (i,j) with (j,i) for j > i */
    for (var i = 0; i < rows; i++) {
        for (var j = i + 1; j < cols; j++) {
            var h = {}; h[i + ',' + j] = 'swap'; h[j + ',' + i] = 'swap';
            push('Transpose: swap (' + i + ',' + j + ') \u2194 (' + j + ',' + i + ')  (' + grid[i][j] + ' \u2194 ' + grid[j][i] + ')',
                { matrix: { grid: grid.map(function (r) { return r.slice(); }), highlight: h }, vars: {} });
            var t = grid[i][j]; grid[i][j] = grid[j][i]; grid[j][i] = t;
        }
    }
    push('Transpose complete: rows became columns.', { vars: {}, log: 'transposed' });

    /* reverse each row */
    for (var r = 0; r < rows; r++) {
        var rev = grid[r].slice().reverse();
        var h2 = {}; h2[r + ',0'] = 'left'; h2[r + ',' + (cols - 1)] = 'right';
        grid[r] = rev;
        push('Reverse row ' + r + ': ' + rev.join(', '),
            { matrix: { grid: grid.map(function (x) { return x.slice(); }), highlight: h2 }, vars: {} });
    }

    push('Done \u2014 the matrix is rotated 90\u00b0 clockwise.', { vars: {}, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/matrix'] = {
    title: 'Matrix — rotate 90\u00b0 (transpose + reverse rows)',
    family: 'matrix',
    defaultState: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
    inputs: [
        { key: 'matrix', label: 'Matrix (rows with ;)', value: '1 2 3; 4 5 6; 7 8 9', placeholder: '1 2 3; 4 5 6; 7 8 9', parse: vizParseMatrix }
    ],
    legend: [
        { label: 'swapping pair', color: 'vz-swap' },
        { label: 'row edges', color: 'vz-left' }
    ],
    stepMs: 1000,
    simulate: vizMatrixFrames
};

VIZ_CONFIG['matrix'] = VIZ_CONFIG['topics/matrix'];
