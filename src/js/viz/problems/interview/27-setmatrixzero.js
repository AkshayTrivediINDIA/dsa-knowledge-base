/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/27-setmatrixzero
   Set Matrix Zeroes (LeetCode 73). Use the first row and first
   column as markers: scan interior cells and record which rows
   and columns contain a zero, then zero out interior cells and
   finally the first row/column. O(1) extra space.
   Mounts on code/setmatrixzero.
   ============================================================ */

function vizIvSetMatrixZeroFrames(state) {
    var m = (state.array || []).map(function (r) { return r.slice(); });
    var rows = m.length;
    var cols = rows ? m[0].length : 0;
    var frames = [];

    function grid() { return m.map(function (r) { return r.slice(); }); }

    function push(narr, extra) {
        var f = { narr: narr, matrix: { grid: grid(), highlight: {} }, vars: {}, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!rows || !cols) { frames.push({ narr: 'Empty matrix.', matrix: { grid: [], highlight: {} }, vars: {} }); return frames; }

    var firstRowZero = false, firstColZero = false;
    var i, j;
    var zeroed = {};

    push('Strategy: remember which rows and columns hold a 0 using only the first row and first column as markers, then write the zeroes. O(1) extra space.',
        { vars: { phase: 'init', i: 0, j: 0 }, log: 'init' });

    for (j = 0; j < cols; j++) if (m[0][j] === 0) firstRowZero = true;
    for (i = 0; i < rows; i++) if (m[i][0] === 0) firstColZero = true;

    var hz = {};
    for (i = 0; i < rows; i++) for (j = 0; j < cols; j++) if (m[i][j] === 0) hz[i + ',' + j] = 'found';
    push('Scan the edges: ' + (firstRowZero ? 'row 0 has a 0' : 'row 0 is all non-zero') + ', ' + (firstColZero ? 'column 0 has a 0' : 'column 0 is all non-zero') + '. Original zeroes marked.',
        { matrix: { grid: grid(), highlight: hz }, vars: { phase: 'check', i: 0, j: 0 } });

    for (i = 1; i < rows; i++) {
        for (j = 1; j < cols; j++) {
            if (m[i][j] === 0) {
                m[i][0] = 0;
                m[0][j] = 0;
                var hm = {};
                hm[i + ',' + j] = 'found';
                hm[i + ',' + 0] = 'compare';
                hm[0 + ',' + j] = 'compare';
                push('m[' + i + ',' + j + '] = 0 \u2192 mark m[' + i + ',0] and m[0,' + j + '] as row/column markers.',
                    { matrix: { grid: grid(), highlight: hm }, vars: { phase: 'mark', i: i, j: j } });
            }
        }
    }

    for (i = 1; i < rows; i++) {
        for (j = 1; j < cols; j++) {
            if (m[i][0] === 0 || m[0][j] === 0) {
                m[i][j] = 0;
                zeroed[i + ',' + j] = true;
                var hz2 = {};
                for (var k in zeroed) hz2[k] = 'active';
                push('Marker m[' + i + ',0] = ' + m[i][0] + ' or m[0,' + j + '] = ' + m[0][j] + ' \u2192 zero m[' + i + ',' + j + '].',
                    { matrix: { grid: grid(), highlight: hz2 }, vars: { phase: 'zero', i: i, j: j } });
            }
        }
    }

    if (firstRowZero) { for (j = 0; j < cols; j++) { m[0][j] = 0; zeroed['0,' + j] = true; } }
    if (firstColZero) { for (i = 0; i < rows; i++) { m[i][0] = 0; zeroed[i + ',' + 0] = true; } }
    var he = {};
    for (var k2 in zeroed) he[k2] = 'active';
    push('Edges: ' + (firstRowZero ? 'zero row 0' : 'skip row 0') + ', ' + (firstColZero ? 'zero column 0' : 'skip column 0') + ' \u2014 markers already sit in rows/columns that must be zeroed.',
        { matrix: { grid: grid(), highlight: he }, vars: { phase: 'edges', i: 0, j: 0 } });

    var hf = {};
    for (i = 0; i < rows; i++) for (j = 0; j < cols; j++) if (m[i][j] === 0) hf[i + ',' + j] = 'found';
    push('Done \u2014 every row and column that contained a 0 is now zeroed.',
        { matrix: { grid: grid(), highlight: hf }, vars: { phase: 'done', i: 0, j: 0 }, log: 'done' });

    return frames;
}

VIZ_CONFIG['setmatrixzero'] = {
    title: 'Set Matrix Zeroes \u2014 first row/column as markers',
    family: 'setmatrixzero',
    defaultState: { array: [[1, 1, 1], [1, 0, 1], [1, 1, 1]] },
    inputs: [
        { key: 'array', label: 'Matrix (rows with ;)', value: '1,1,1;1,0,1;1,1,1', placeholder: '1,1,1;1,0,1;1,1,1', parse: function (s) { return s.trim().split(';').map(function (r) { return r.split(',').map(function (x) { return parseInt(x, 10); }); }); } }
    ],
    legend: [
        { label: 'original / final zero', color: 'vz-found' },
        { label: 'marker cell', color: 'vz-compare' },
        { label: 'zeroed cell', color: 'vz-active' }
    ],
    stepMs: 1150,
    simulate: vizIvSetMatrixZeroFrames
};
