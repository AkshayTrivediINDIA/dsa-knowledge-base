/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/03-movezeroes
   Move Zeroes: two pointers. read scans forward; write points at
   the next slot for a non-zero. When read finds a non-zero, swap
   it into the write slot so all zeroes slide right in order.
   Mounts on code/movezeroes.
   ============================================================ */

function vizIvMoveZeroesFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    var w = 0;

    push('Scan with read. The write pointer w marks the next slot for a non-zero value. O(n), stable order preserved.',
        { highlight: { 0: 'active' }, vars: { r: 0, w: w }, sub: { label: 'growing non-zero prefix', keys: [], cells: [] }, log: 'init' });

    for (var r = 0; r < n; r++) {
        if (a[r] !== 0) {
            if (r !== w) {
                push('a[' + r + '] = ' + a[r] + ' \u2260 0 \u2192 swap into write slot ' + w + '. (a[' + w + '] = ' + a[w] + ' moves right)',
                    { swap: [w, r], highlight: (function () { var h = {}; h[w] = 'left'; h[r] = 'active'; return h; })(), vars: { r: r, w: w }, sub: { label: 'non-zero prefix', keys: a.slice(0, w + 1), cells: a.slice(0, w + 1) } });
                var t = a[w]; a[w] = a[r]; a[r] = t;
            } else {
                push('a[' + r + '] = ' + a[r] + ' already in place (r = w).',
                    { highlight: (function () { var h = {}; h[r] = 'left'; return h; })(), vars: { r: r, w: w } });
            }
            w++;
        } else {
            push('a[' + r + '] = 0 \u2192 skip; write stays at ' + w + '.',
                { highlight: (function () { var h = {}; h[r] = 'active'; h[w] = 'left'; return h; })(), vars: { r: r, w: w } });
        }
    }

    push('Done \u2014 all zeroes are at the end: [' + a.join(', ') + '].',
        { vars: { w: w }, sub: { label: 'non-zero prefix', keys: a.slice(0, w), cells: a.slice(0, w) }, log: 'done' });

    return frames;
}

VIZ_CONFIG['movezeroes'] = {
    title: 'Move Zeroes — stable in-place partition',
    family: 'movezeroes',
    defaultState: { array: [0, 1, 0, 3, 12] },
    inputs: [
        { key: 'array', label: 'Array', value: '0, 1, 0, 3, 12', placeholder: '0, 1, 0, 3, 12', parse: vizParseList }
    ],
    legend: [
        { label: 'write slot', color: 'vz-left' },
        { label: 'reading', color: 'vz-active' },
        { label: 'non-zero prefix', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvMoveZeroesFrames
};
