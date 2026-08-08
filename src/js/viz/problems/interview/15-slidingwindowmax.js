/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/15-slidingwindowmax
   Sliding Window Maximum. A monotonic deque keeps candidate
   indices in decreasing value order: pop smaller tail values, pop
   the head once it leaves the window, and the head is always the
   current window's max. Mounts on code/slidingwindowmax.
   ============================================================ */

function vizIvSlidingWindowMaxFrames(state) {
    var nums = state.array || [];
    var k = Math.max(state.k || 1, 1);
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, sub: null, window: null };
        for (var kk in extra) f[kk] = extra[kk];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    var dq = [];           /* indices, values decreasing */
    var out = [];

    push('Monotonic deque of indices holding values in DEcreasing order. Before adding index i: pop tail while its value \u2264 nums[i], pop head if it fell out of the window. Head = current max.',
        { vars: { i: 0, window: 0, max: '-' }, window: { start: 0, end: Math.min(k - 1, n - 1), label: 'window' }, sub: { label: 'deque (values)', keys: [], cells: [] }, log: 'init' });

    function dqLabel() {
        var keys = [], cells = [];
        for (var i = 0; i < dq.length; i++) { keys.push(dq[i]); cells.push(nums[dq[i]]); }
        return { keys: keys, cells: cells };
    }

    for (var i = 0; i < n; i++) {
        var lo = i - k + 1;
        if (dq.length && dq[0] < lo) {
            var dropped = dq.shift();
            push('Index ' + dropped + ' fell out of window [max(' + lo + ',0)..' + i + '] \u2192 pop from head.',
                { vars: { i: i, window: lo + '..' + i, max: dq.length ? nums[dq[0]] : '-' }, window: { start: Math.max(lo, 0), end: i, label: 'window' }, sub: { label: 'deque (values)', keys: dqLabel().keys, cells: dqLabel().cells } });
        }
        while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) {
            var popped = dq.pop();
            push('nums[' + popped + '] = ' + nums[popped] + ' \u2264 nums[' + i + '] = ' + nums[i] + ' \u2192 pop smaller tail.',
                { vars: { i: i, window: lo + '..' + i, max: dq.length ? nums[dq[0]] : '-' }, window: { start: Math.max(lo, 0), end: i, label: 'window' }, sub: { label: 'deque (values)', keys: dqLabel().keys, cells: dqLabel().cells } });
        }
        dq.push(i);
        if (lo >= 0) {
            var mx = nums[dq[0]];
            out.push(mx);
            var h = {};
            h[dq[0]] = 'found';
            push('Window [' + lo + '..' + i + '] max = nums[' + dq[0] + '] = ' + mx + '  \u2192 maxima so far: [' + out.join(', ') + '].',
                { highlight: h, vars: { i: i, window: lo + '..' + i, max: mx }, window: { start: lo, end: i, label: 'window' }, sub: { label: 'deque (values)', keys: dqLabel().keys, cells: dqLabel().cells, highlight: (function () { var x = {}; x[0] = 'found'; return x; })() }, log: 'max' });
        } else {
            push('Build window: added ' + nums[i] + ' (deque: [' + dq.map(function (j) { return nums[j]; }).join(', ') + ']).',
                { vars: { i: i, window: lo + '..' + i }, window: { start: 0, end: i, label: 'window' }, sub: { label: 'deque (values)', keys: dqLabel().keys, cells: dqLabel().cells } });
        }
    }

    push('Sliding window maxima = [' + out.join(', ') + '].',
        { vars: { max: out.join(', ') }, sub: { label: 'deque (values)', keys: dqLabel().keys, cells: dqLabel().cells }, log: 'done' });

    return frames;
}

VIZ_CONFIG['slidingwindowmax'] = {
    title: 'Sliding Window Maximum — monotonic deque',
    family: 'slidingwindowmax',
    defaultState: { array: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
    inputs: [
        { key: 'array', label: 'Array', value: '1, 3, -1, -3, 5, 3, 6, 7', placeholder: '1, 3, -1, -3, 5, 3, 6, 7', parse: vizParseList },
        { key: 'k', label: 'Window size k', value: '3', placeholder: '3', parse: function (s) { return parseInt(s, 10) || 1; } }
    ],
    legend: [
        { label: 'window maximum', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvSlidingWindowMaxFrames
};
