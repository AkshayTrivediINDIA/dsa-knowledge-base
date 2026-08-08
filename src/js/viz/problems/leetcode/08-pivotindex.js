/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/08-pivotindex
   Pivot Index: find i where sum(left of i) == sum(right of i).
   Use the total sum: left sum accumulates; right = total - left -
   nums[i]. Mounts on code/pivotindex.
   ============================================================ */

function vizLcPivotIndexFrames(state) {
    var a = state.array || [];
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — no pivot.', arr: [], vars: {}, sub: null }); return frames; }

    var total = 0;
    for (var t = 0; t < n; t++) total += a[t];
    var left = 0;

    push('Pivot i: sum(a[0..i-1]) == sum(a[i+1..n-1]). Compute right = total - left - a[i] and compare with left.',
        { vars: { total: total, left: 0 }, sub: null, log: 'init' });

    for (var i = 0; i < n; i++) {
        var right = total - left - a[i];
        var hl = {}, hr = {};
        for (var l = 0; l < i; l++) hl[l] = 'left';
        for (var r = i + 1; r < n; r++) hr[r] = 'right';
        if (left === right) {
            var h = {};
            h[i] = 'found';
            push('PIVOT at index ' + i + ': left = ' + left + ', right = ' + right + ' \u2014 equal!',
                { highlight: h, vars: { i: i, left: left, right: right }, sub: { label: 'left | right', keys: [], cells: [] }, log: 'pivot' });
            return frames;
        }
        var h2 = {};
        h2[i] = 'active';
        push('i = ' + i + ': left = ' + left + ', right = ' + right + ' \u2014 not equal (a[' + i + '] = ' + a[i] + ').',
            { highlight: h2, vars: { i: i, left: left, right: right }, sub: null });
        left += a[i];
    }

    push('No pivot index found (return -1).',
        { vars: { pivot: -1 }, sub: null, log: 'none' });

    return frames;
}

VIZ_CONFIG['pivotindex'] = {
    title: 'Pivot Index — balanced left/right sums',
    family: 'pivotindex',
    defaultState: { array: [1, 7, 3, 6, 5, 6] },
    inputs: [
        { key: 'array', label: 'Array', value: '1, 7, 3, 6, 5, 6', placeholder: '1, 7, 3, 6, 5, 6', parse: vizParseList }
    ],
    legend: [
        { label: 'left of i', color: 'vz-left' },
        { label: 'right of i', color: 'vz-right' },
        { label: 'pivot', color: 'vz-found' },
        { label: 'examining', color: 'vz-active' }
    ],
    stepMs: 1150,
    simulate: vizLcPivotIndexFrames
};
