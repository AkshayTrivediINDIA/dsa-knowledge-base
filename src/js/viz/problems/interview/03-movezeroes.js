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

/* ---------- Focus Mode config ---------- */

FOCUS_CONFIG['movezeroes'] = {
    title: 'Move Zeroes — Focus Mode',
    viz: 'movezeroes',
    codeGroup: 'movezeroes',
    tagline: 'Write first, ask questions later.',
    lead: 'A read pointer scans and a write pointer packs — one pass, no extra array.',
    optLabel: 'Two pointers',
    beats: [
        {
            narr: 'The simple answer copies every non-zero into a new array, then fills the tail with zeroes — an extra array of the same size.',
            brute: 1,
            opt: 1
        },
        {
            narr: 'Copying to a scratch array needs O(n) extra memory and two trips over the data.',
            brute: 6,
            opt: 2
        },
        {
            narr: 'Two pointers do it in place: the read pointer scans, the write pointer marks where the next non-zero goes. O(n) time, O(1) space, order preserved.',
            brute: 6,
            opt: 4
        }
    ],
    recap:
        'The trick is a write pointer that only advances when a non-zero is placed. The read pointer sweeps the whole array once; ' +
        'every time it finds a non-zero, that value is swapped into the write slot. ' +
        'Zeroes are never actively moved — they are simply overtaken, so they end up untouched at the tail and the relative order of non-zeroes is preserved.',
    recapTitle: 'Concept recap — why does the write pointer work?'
};
