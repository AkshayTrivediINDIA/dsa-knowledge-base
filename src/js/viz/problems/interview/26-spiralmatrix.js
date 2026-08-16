/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/26-spiralmatrix
   Spiral Matrix (LeetCode 54). Walk the boundaries with
   top/bottom/left/right pointers: traverse the top row, right
   column, bottom row, left column, shrink the window, and
   repeat until every cell is collected. Mounts on
   code/spiralmatrix.
   ============================================================ */

function vizIvSpiralMatrixFrames(state) {
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

    var top = 0, bottom = rows - 1, left = 0, right = cols - 1, dir = 0;
    var out = [];
    var seen = {};

    function pathH() {
        var h = {};
        for (var k in seen) h[k] = 'found';
        return h;
    }
    function mark(r, c) {
        seen[r + ',' + c] = true;
        var h = pathH();
        h[r + ',' + c] = 'active';
        return h;
    }

    push('Spiral order: keep a window [top..bottom] \u00d7 [left..right]. Walk the top row, right column, bottom row, left column, shrink the window, and repeat.',
        { vars: { top: top, bottom: bottom, left: left, right: right, dir: 0 }, sub: { label: 'spiral output', keys: [], cells: [] }, log: 'init' });

    while (top <= bottom && left <= right) {
        if (dir === 0) {
            for (var c = left; c <= right; c++) {
                var v = m[top][c];
                out.push(v);
                push('Top row left\u2192right: m[' + top + ',' + c + '] = ' + v + ' \u2192 append ' + v + '.',
                    { matrix: { grid: grid(), highlight: mark(top, c) }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() } });
            }
            top++;
            push('Top edge done \u2192 shrink top to ' + top + '.',
                { matrix: { grid: grid(), highlight: pathH() }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() } });
        } else if (dir === 1) {
            for (var r = top; r <= bottom; r++) {
                var v2 = m[r][right];
                out.push(v2);
                push('Right column top\u2192bottom: m[' + r + ',' + right + '] = ' + v2 + ' \u2192 append ' + v2 + '.',
                    { matrix: { grid: grid(), highlight: mark(r, right) }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() } });
            }
            right--;
            push('Right edge done \u2192 shrink right to ' + right + '.',
                { matrix: { grid: grid(), highlight: pathH() }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() } });
        } else if (dir === 2) {
            for (var c2 = right; c2 >= left; c2--) {
                var v3 = m[bottom][c2];
                out.push(v3);
                push('Bottom row right\u2192left: m[' + bottom + ',' + c2 + '] = ' + v3 + ' \u2192 append ' + v3 + '.',
                    { matrix: { grid: grid(), highlight: mark(bottom, c2) }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() } });
            }
            bottom--;
            push('Bottom edge done \u2192 shrink bottom to ' + bottom + '.',
                { matrix: { grid: grid(), highlight: pathH() }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() } });
        } else {
            for (var r2 = bottom; r2 >= top; r2--) {
                var v4 = m[r2][left];
                out.push(v4);
                push('Left column bottom\u2192top: m[' + r2 + ',' + left + '] = ' + v4 + ' \u2192 append ' + v4 + '.',
                    { matrix: { grid: grid(), highlight: mark(r2, left) }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() } });
            }
            left++;
            push('Left edge done \u2192 shrink left to ' + left + '.',
                { matrix: { grid: grid(), highlight: pathH() }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() } });
        }
        dir = (dir + 1) % 4;
    }

    push('Spiral order = [' + out.join(', ') + '].',
        { matrix: { grid: grid(), highlight: pathH() }, vars: { top: top, bottom: bottom, left: left, right: right, dir: dir }, sub: { label: 'spiral output', keys: [], cells: out.slice() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['spiralmatrix'] = {
    title: 'Spiral Matrix \u2014 shrink the boundary window',
    family: 'spiralmatrix',
    defaultState: { array: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
    inputs: [
        { key: 'array', label: 'Matrix (rows with ;)', value: '1,2,3;4,5,6;7,8,9', placeholder: '1,2,3;4,5,6;7,8,9', parse: function (s) { return s.trim().split(';').map(function (r) { return r.split(',').map(function (x) { return parseInt(x, 10); }); }); } }
    ],
    legend: [
        { label: 'current cell', color: 'vz-active' },
        { label: 'spiral path', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvSpiralMatrixFrames
};
