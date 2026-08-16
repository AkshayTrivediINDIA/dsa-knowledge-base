/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/17-threesum
   3Sum: sort the array, fix a pivot i, then sweep two pointers
   l = i+1 and r = n-1 inward adjusting on sum = a[i]+a[l]+a[r]
   vs 0; skip duplicate values. Found triplets collect in a sub-row.
   Mounts on code/threesum.
   ============================================================ */

function vizIvThreeSumFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    a.sort(function (x, y) { return x - y; });

    var triVals = [], triIdx = [];
    function subTri() {
        return { label: 'triplets found', keys: triIdx.slice(), cells: triVals.slice(), highlight: {} };
    }
    var count = 0;

    push('3Sum on [' + a.join(', ') + ']: sort first. Fix i as pivot; l = i+1 and r = n-1 chase sum = a[i] + a[l] + a[r] = 0. Skip duplicate values.',
        { vars: { i: 0, l: 1, r: n - 1, sum: 0, count: 0 }, sub: subTri(), log: 'init' });

    for (var i = 0; i < n - 2; i++) {
        if (i > 0 && a[i] === a[i - 1]) {
            var hd = {};
            hd[i] = 'dim';
            push('a[' + i + '] = ' + a[i] + ' equals previous pivot a[' + (i - 1) + '] = ' + a[i - 1] + ' \u2192 skip (same triplets would repeat).',
                { highlight: hd, vars: { i: i, l: '-', r: '-', sum: 0, count: count }, sub: subTri() });
            continue;
        }
        var l = i + 1, r = n - 1;
        push('Fix pivot i = ' + i + ' (a[' + i + '] = ' + a[i] + '). l = ' + l + ', r = ' + r + '.',
            { highlight: (function () { var h = {}; h[i] = 'pivot'; h[l] = 'left'; h[r] = 'right'; return h; })(), vars: { i: i, l: l, r: r, sum: 0, count: count }, sub: subTri() });

        while (l < r) {
            var sum = a[i] + a[l] + a[r];
            if (sum === 0) {
                triVals.push('[' + a[i] + ', ' + a[l] + ', ' + a[r] + ']');
                triIdx.push('(' + i + ',' + l + ',' + r + ')');
                count++;
                push('sum = ' + a[i] + ' + ' + a[l] + ' + ' + a[r] + ' = 0 \u2192 TRIPLET! Add [' + a[i] + ', ' + a[l] + ', ' + a[r] + '].',
                    { highlight: (function () { var h = {}; h[i] = 'found'; h[l] = 'found'; h[r] = 'found'; return h; })(), vars: { i: i, l: l, r: r, sum: sum, count: count }, sub: (function () { var s = subTri(); s.highlight[triVals.length - 1] = 'found'; return s; })(), log: 'found' });
                while (l < r && a[l] === a[l + 1]) l++;
                while (l < r && a[r] === a[r - 1]) r--;
                l++; r--;
            } else if (sum < 0) {
                l++;
                push('sum = ' + a[i] + ' + ' + a[l - 1] + ' + ' + a[r] + ' = ' + sum + ' < 0 \u2192 too small, move l right \u2192 l = ' + l + '.',
                    { highlight: (function () { var h = {}; h[i] = 'pivot'; h[l] = 'left'; h[r] = 'right'; return h; })(), vars: { i: i, l: l, r: r, sum: sum, count: count }, sub: subTri() });
            } else {
                r--;
                push('sum = ' + a[i] + ' + ' + a[l] + ' + ' + a[r + 1] + ' = ' + sum + ' > 0 \u2192 too big, move r left \u2192 r = ' + r + '.',
                    { highlight: (function () { var h = {}; h[i] = 'pivot'; h[l] = 'left'; h[r] = 'right'; return h; })(), vars: { i: i, l: l, r: r, sum: sum, count: count }, sub: subTri() });
            }
        }
    }

    var doneSub = subTri();
    doneSub.highlight = {};
    for (var k = 0; k < triVals.length; k++) doneSub.highlight[k] = 'found';
    push('All pivots tried \u2014 found ' + count + ' unique triplet' + (count === 1 ? '' : 's') + (count ? ': ' + triVals.join('  ') : ' (none)') + '.',
        { vars: { i: '-', l: '-', r: '-', sum: 0, count: count }, sub: doneSub, log: 'done' });

    return frames;
}

VIZ_CONFIG['threesum'] = {
    title: '3Sum — sort, fix a pivot, sweep two pointers',
    family: 'threesum',
    defaultState: { array: [-1, 0, 1, 2, -1, -4] },
    inputs: [
        { key: 'array', label: 'Array', value: '-1, 0, 1, 2, -1, -4', placeholder: '-1, 0, 1, 2, -1, -4', parse: vizParseList }
    ],
    legend: [
        { label: 'pivot i', color: 'vz-pivot' },
        { label: 'left pointer', color: 'vz-left' },
        { label: 'right pointer', color: 'vz-right' },
        { label: 'triplet', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvThreeSumFrames
};
