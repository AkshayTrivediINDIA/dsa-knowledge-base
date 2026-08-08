/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/06-removeduplicates
   Remove Duplicates from a SORTED array, in place. read scans;
   write tracks the next distinct slot. When a[read] differs from
   the last written value a[write-1], copy it forward and advance.
   The sub-row shows the deduplicated prefix.
   Mounts on code/removeduplicates.
   ============================================================ */

function vizIvRemoveDupFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — 0 unique values.', arr: [], vars: {}, sub: null }); return frames; }

    var w = 1;

    push('Sorted input. read scans forward; write marks where the next distinct value goes. a[0] is always kept. O(n).',
        { highlight: { 0: 'found' }, vars: { r: 0, w: 0 }, sub: { label: 'unique prefix', keys: [a[0]], cells: [a[0]] }, log: 'init' });

    for (var r = 1; r < n; r++) {
        var last = a[w - 1];
        var h = {};
        h[w - 1] = 'left';
        h[r] = 'active';
        if (a[r] !== last) {
            a[w] = a[r];
            var hw = {};
            hw[w] = 'found';
            hw[r] = 'found';
            push('a[' + r + '] = ' + a[r] + ' \u2260 last unique ' + last + ' \u2192 copy into slot ' + w + ', write advances.',
                { highlight: hw, vars: { r: r, w: w }, sub: { label: 'unique prefix', keys: a.slice(0, w + 1), cells: a.slice(0, w + 1), highlight: (function () { var x = {}; x[w] = 'active'; return x; })() }, log: 'new distinct' });
            w++;
        } else {
            push('a[' + r + '] = ' + a[r] + ' equals last unique ' + last + ' \u2192 skip (duplicate).',
                { highlight: h, vars: { r: r, w: w } });
        }
    }

    push('Done \u2014 ' + w + ' unique values, array prefix = [' + a.slice(0, w).join(', ') + '].',
        { vars: { k: w }, sub: { label: 'unique prefix', keys: a.slice(0, w), cells: a.slice(0, w), highlight: (function () { var x = {}; for (var i = 0; i < w; i++) x[i] = 'found'; return x; })() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['removeduplicates'] = {
    title: 'Remove Duplicates from Sorted Array — in-place write pointer',
    family: 'removeduplicates',
    defaultState: { array: [0, 0, 1, 1, 1, 2] },
    inputs: [
        { key: 'array', label: 'Array (sorted)', value: '0, 0, 1, 1, 1, 2', placeholder: '0, 0, 1, 1, 1, 2', parse: vizParseList }
    ],
    legend: [
        { label: 'last unique', color: 'vz-left' },
        { label: 'reading', color: 'vz-active' },
        { label: 'unique prefix', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvRemoveDupFrames
};
