/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/09-squaresorted
   Squares of a Sorted Array. Two pointers l and r walk inward;
   the largest square is always at one of the ends, so compare
   nums[l]^2 vs nums[r]^2 and drop the bigger one into the result
   from the back. The sub-row shows the result being filled.
   Mounts on code/squaresorted.
   ============================================================ */

function vizLcSquareSortedFrames(state) {
    var nums = state.array || [];
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    var res = [];
    for (var z = 0; z < n; z++) res[z] = null;

    function subRes() {
        var cells = [], keys = [];
        for (var i = 0; i < n; i++) {
            cells[i] = res[i] === null ? '\u00b7' : res[i];
            keys[i] = i;
        }
        return { label: 'result \u2014 squares', keys: keys, cells: cells, highlight: {} };
    }

    var l = 0, r = n - 1, pos = n - 1;

    push('Squares of a sorted array [' + nums.join(', ') + ']. Two pointers l = ' + l + ', r = ' + r + ' meet inward: the largest square is at an end, so write the result from the back.',
        { highlight: (function () { var h = {}; h[0] = 'left'; h[n - 1] = 'right'; return h; })(), vars: { l: l, r: r, pos: pos }, sub: subRes(), log: 'init' });

    while (l <= r) {
        var lsq = nums[l] * nums[l];
        var rsq = nums[r] * nums[r];
        var hl = {};
        hl[l] = 'left';
        hl[r] = 'right';
        if (lsq >= rsq) {
            res[pos] = lsq;
            push('nums[' + l + ']\u00b2 = ' + lsq + ' vs nums[' + r + ']\u00b2 = ' + rsq + ' \u2192 ' + lsq + ' is larger \u2192 result[' + pos + '] = ' + lsq + '.',
                { highlight: hl, vars: { l: l, r: r, pos: pos }, sub: (function () { var s = subRes(); s.highlight[pos] = 'found'; return s; })() });
            l++;
        } else {
            res[pos] = rsq;
            push('nums[' + r + ']\u00b2 = ' + rsq + ' vs nums[' + l + ']\u00b2 = ' + lsq + ' \u2192 ' + rsq + ' is larger \u2192 result[' + pos + '] = ' + rsq + '.',
                { highlight: hl, vars: { l: l, r: r, pos: pos }, sub: (function () { var s = subRes(); s.highlight[pos] = 'found'; return s; })() });
            r--;
        }
        pos--;
    }

    var doneSub = subRes();
    doneSub.highlight = {};
    for (var k = 0; k < n; k++) doneSub.highlight[k] = 'found';
    push('Done \u2014 sorted squares = [' + res.join(', ') + '].',
        { vars: { l: l, r: r, pos: pos }, sub: doneSub, log: 'done' });

    return frames;
}

VIZ_CONFIG['squaresorted'] = {
    title: 'Squares of a Sorted Array — two pointers meet in the middle',
    family: 'squaresorted',
    defaultState: { array: [-4, -1, 0, 3, 10] },
    inputs: [
        { key: 'array', label: 'Array (sorted)', value: '-4, -1, 0, 3, 10', placeholder: '-4, -1, 0, 3, 10', parse: vizParseList }
    ],
    legend: [
        { label: 'left pointer', color: 'vz-left' },
        { label: 'right pointer', color: 'vz-right' },
        { label: 'written square', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizLcSquareSortedFrames
};
