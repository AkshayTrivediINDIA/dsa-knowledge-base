/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/28-search2d
   Search a 2D Matrix. Flatten the sorted matrix conceptually into
   one sorted array of length rows*cols, then binary search it with
   row = mid / cols, col = mid % cols. Mounts on code/search2d.
   ============================================================ */

function vizIvSearch2dFrames(state) {
    var m = state.array || [];
    var target = Number(state.target);
    var rows = m.length;
    var cols = rows ? m[0].length : 0;
    var total = rows * cols;
    var frames = [];

    function grid() { return m.map(function (r) { return r.slice(); }); }

    function push(narr, extra) {
        var f = { narr: narr, matrix: { grid: grid(), highlight: {} }, vars: {}, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!total) { frames.push({ narr: 'Empty matrix.', matrix: { grid: [], highlight: {} }, vars: {} }); return frames; }

    var l = 0, r = total - 1;
    var found = false, fRow = -1, fCol = -1;

    push('Flatten the sorted matrix into one array of length ' + total + ': row = mid / ' + cols + ', col = mid % ' + cols + '. Search for target ' + target + '.',
        { vars: { l: l, r: r, mid: 0, row: 0, col: 0, target: target }, log: 'init' });

    while (l <= r) {
        var mid = Math.floor((l + r) / 2);
        var row = Math.floor(mid / cols);
        var col = mid % cols;
        var val = m[row][col];
        if (val === target) {
            fRow = row; fCol = col; found = true;
            var h = {};
            for (var i = 0; i < rows; i++) for (var j = 0; j < cols; j++) {
                var idx = i * cols + j;
                if (idx < l || idx > r) h[i + ',' + j] = 'dim';
            }
            h[row + ',' + col] = 'found';
            push('mid = ' + mid + ' \u2192 (' + row + ',' + col + ') = ' + val + ' == target ' + target + ' \u2192 FOUND!',
                { matrix: { grid: grid(), highlight: h }, vars: { l: l, r: r, mid: mid, row: row, col: col, target: target }, log: 'found' });
            break;
        }
        var hl = {};
        for (var i2 = 0; i2 < rows; i2++) for (var j2 = 0; j2 < cols; j2++) {
            var ix = i2 * cols + j2;
            if (ix < l || ix > r) hl[i2 + ',' + j2] = 'dim';
        }
        hl[row + ',' + col] = 'active';
        if (val < target) {
            push('mid = ' + mid + ' \u2192 (' + row + ',' + col + ') = ' + val + ' < target ' + target + ' \u2192 discard left half, move l to ' + (mid + 1) + '.',
                { matrix: { grid: grid(), highlight: hl }, vars: { l: l, r: r, mid: mid, row: row, col: col, target: target }, log: 'step' });
            l = mid + 1;
        } else {
            push('mid = ' + mid + ' \u2192 (' + row + ',' + col + ') = ' + val + ' > target ' + target + ' \u2192 discard right half, move r to ' + (mid - 1) + '.',
                { matrix: { grid: grid(), highlight: hl }, vars: { l: l, r: r, mid: mid, row: row, col: col, target: target }, log: 'step' });
            r = mid - 1;
        }
    }

    var hd = {};
    if (found) hd[fRow + ',' + fCol] = 'found';
    push(found ? 'target ' + target + ' found at (' + fRow + ',' + fCol + ').'
               : 'l = ' + l + ' > r = ' + r + ' \u2192 target ' + target + ' is NOT in the matrix.',
        { matrix: { grid: grid(), highlight: hd }, vars: { l: l, r: r, target: target }, log: 'done' });

    return frames;
}

VIZ_CONFIG['search2d'] = {
    title: 'Search a 2D Matrix — binary search on flattened matrix',
    family: 'search2d',
    defaultState: { array: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 3 },
    inputs: [
        { key: 'array', label: 'Matrix (rows with ;)', value: '1,3,5,7;10,11,16,20;23,30,34,60', placeholder: '1,3,5,7;10,11,16,20;23,30,34,60', parse: function (s) {
            return String(s || '').split(';').map(function (row) {
                return String(row).split(',').map(function (t) { return parseInt(t, 10); });
            }).filter(function (r) { return r.length; });
        } },
        { key: 'target', label: 'Target', value: '3', placeholder: '3', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'current cell', color: 'vz-active' },
        { label: 'target found', color: 'vz-found' },
        { label: 'eliminated half', color: 'vz-dim' }
    ],
    stepMs: 1150,
    simulate: vizIvSearch2dFrames
};
