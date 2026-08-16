/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/22-minsizesubarray
   Minimum Size Subarray Sum. Sliding window [l..r]: expand r to
   add nums[r], then shrink l while the window sum \u2265 target,
   recording the shortest window that reaches it. O(n) time.
   Mounts on code/minsizesubarray.
   ============================================================ */

function vizIvMinSizeSubarrayFrames(state) {
    var nums = state.array || [];
    var target = state.target || 0;
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, sub: null, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    var minLen = Infinity;
    function minStr() { return minLen === Infinity ? '\u221e' : minLen; }

    var l = 0, sum = 0;
    var bl = -1, br = -1;

    push('Sliding window [l..r]. Expand r, adding nums[r]; while sum \u2265 target ' + target + ' record the window length and shrink l. Track the shortest window that meets the target. O(n).',
        { vars: { l: l, r: 0, sum: 0, minLen: minStr(), target: target }, window: { start: 0, end: 0, label: 'window' }, log: 'init' });

    for (var r = 0; r < n; r++) {
        sum += nums[r];
        var h = {};
        h[l] = 'left'; h[r] = 'active';
        if (sum < target) {
            push('r = ' + r + ': add nums[' + r + '] = ' + nums[r] + ' \u2192 sum = ' + sum + ' < target ' + target + ' \u2192 keep expanding.',
                { highlight: h, vars: { l: l, r: r, sum: sum, minLen: minStr(), target: target }, window: { start: l, end: r, label: 'window' }, log: 'step' });
        }
        while (sum >= target) {
            var len = r - l + 1;
            if (len < minLen) { minLen = len; bl = l; br = r; }
            var hs = {};
            hs[l] = 'left'; hs[r] = 'active';
            push('sum = ' + sum + ' \u2265 target ' + target + ': window [' + l + '..' + r + '] length ' + len + (bl === l && br === r ? '  \u2192 NEW BEST' : '') + ' \u2192 subtract nums[' + l + '] = ' + nums[l] + ', shrink l.',
                { highlight: hs, vars: { l: l, r: r, sum: sum, minLen: minStr(), target: target }, window: { start: l, end: r, label: 'window' }, log: bl === l && br === r ? 'new best' : 'step' });
            sum -= nums[l];
            l++;
        }
    }

    if (minLen === Infinity) {
        push('No subarray reaches sum \u2265 ' + target + ' \u2192 answer 0.',
            { vars: { l: l, r: n - 1, sum: sum, minLen: 0, target: target }, log: 'done' });
    } else {
        var hf = {};
        for (var k = bl; k <= br; k++) hf[k] = 'found';
        push('Minimum size subarray = [' + nums.slice(bl, br + 1).join(', ') + '] at indices [' + bl + '..' + br + '] \u2014 length ' + minLen + ' with sum \u2265 target ' + target + '.',
            { highlight: hf, vars: { l: l, r: r, sum: sum, minLen: minLen, target: target }, window: { start: bl, end: br, label: 'window' }, log: 'done' });
    }

    return frames;
}

VIZ_CONFIG['minsizesubarray'] = {
    title: 'Minimum Size Subarray Sum — sliding window, shrink while sum \u2265 target',
    family: 'minsizesubarray',
    defaultState: { array: [2, 3, 1, 2, 4, 3], target: 7 },
    inputs: [
        { key: 'array', label: 'Array', value: '2, 3, 1, 2, 4, 3', placeholder: '2, 3, 1, 2, 4, 3', parse: vizParseList },
        { key: 'target', label: 'Target sum', value: '7', placeholder: '7', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'window start', color: 'vz-left' },
        { label: 'current element', color: 'vz-active' },
        { label: 'min-length window', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvMinSizeSubarrayFrames
};
