/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/29-numislands
   Number of Islands. Scan the grid; every unvisited '1' starts a
   new island, then DFS flood-fill marks its whole connected group
   so it is never counted again. Mounts on code/numislands.
   ============================================================ */

function vizIvNumIslandsFrames(state) {
    var g = state.array || [];
    var rows = g.length;
    var cols = rows ? g[0].length : 0;
    var frames = [];
    var visited = [];
    var island = 0;

    for (var vi = 0; vi < rows; vi++) {
        visited.push([]);
        for (var vj = 0; vj < cols; vj++) visited[vi].push(false);
    }

    function grid() { return g.map(function (r) { return r.slice(); }); }

    function baseHl() {
        var h = {};
        for (var ri = 0; ri < rows; ri++) for (var cj = 0; cj < cols; cj++) {
            if (visited[ri][cj]) h[ri + ',' + cj] = 'found';
            else if (g[ri][cj] === '0') h[ri + ',' + cj] = 'soft';
        }
        return h;
    }

    function subRow() {
        return { label: 'islands counted', keys: ['islands'], cells: [island] };
    }

    function push(narr, extra) {
        var f = { narr: narr, matrix: { grid: grid(), highlight: baseHl() }, vars: {}, sub: null, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!rows || !cols) { frames.push({ narr: 'Empty grid.', matrix: { grid: [], highlight: {} }, vars: {}, sub: null }); return frames; }

    function flood(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        if (visited[r][c] || g[r][c] !== '1') return;
        visited[r][c] = true;
        var h = baseHl();
        h[r + ',' + c] = 'active';
        push('DFS: claim land (' + r + ',' + c + ') as part of island #' + island + ' \u2192 visit its neighbours.',
            { matrix: { grid: grid(), highlight: h }, vars: { island: island, r: r, c: c }, sub: subRow(), log: 'step' });
        flood(r - 1, c); flood(r + 1, c); flood(r, c - 1); flood(r, c + 1);
    }

    push('Each \u201c1\u201d is land, \u201c0\u201d is water. Count every connected group of land; flood-fill marks visited \u201c1\u201ds so an island is never counted twice.',
        { vars: { island: island, r: 0, c: 0 }, sub: subRow(), log: 'init' });

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (g[i][j] === '1' && !visited[i][j]) {
                island++;
                var hs = baseHl();
                hs[i + ',' + j] = 'active';
                push('Unvisited land at (' + i + ',' + j + ') \u2192 start island #' + island + '.',
                    { matrix: { grid: grid(), highlight: hs }, vars: { island: island, r: i, c: j }, sub: subRow(), log: 'found' });
                flood(i, j);
            } else if (g[i][j] === '0') {
                push('Cell (' + i + ',' + j + ') is water \u2192 skip.',
                    { vars: { island: island, r: i, c: j }, sub: subRow() });
            }
        }
    }

    push('Number of islands = ' + island + '.',
        { vars: { island: island }, sub: subRow(), log: 'done' });

    return frames;
}

VIZ_CONFIG['numislands'] = {
    title: 'Number of Islands — DFS flood fill',
    family: 'numislands',
    defaultState: { array: [['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']] },
    inputs: [
        { key: 'array', label: 'Grid (rows with ;)', value: '1,1,0,0,0;1,1,0,0,0;0,0,1,0,0;0,0,0,1,1', placeholder: '1,1,0,0,0;1,1,0,0,0;0,0,1,0,0;0,0,0,1,1', parse: function (s) {
            return String(s || '').split(';').map(function (row) {
                return String(row).split(',').map(function (t) { return String(t).trim(); });
            }).filter(function (r) { return r.length; });
        } }
    ],
    legend: [
        { label: 'current land', color: 'vz-active' },
        { label: 'visited / claimed', color: 'vz-found' },
        { label: 'water', color: 'vz-soft' }
    ],
    stepMs: 1150,
    simulate: vizIvNumIslandsFrames
};
