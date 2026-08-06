/* ============================================================
   DSA Knowledge Base - module: viz/topics/13-binary-search-answer
   Binary search on the ANSWER: lo = max element, hi = sum. A
   greedy feasibility check (how many contiguous parts of sum
   <= mid) decides which half to keep.
   Mounts on topics/binary-search-answer; inherited by
   code/binary-search-answer.
   ============================================================ */

function vizBsAnswerFrames(state) {
    var nums = state.nums || [];
    var k = Math.max(state.k || 2, 1);
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, sub: null, vars: {} };
        for (var kk in extra) f[kk] = extra[kk];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    var sum = 0, maxEl = 0;
    for (var i = 0; i < n; i++) { sum += nums[i]; if (nums[i] > maxEl) maxEl = nums[i]; }
    var lo = maxEl, hi = sum;

    push('Split into ' + k + ' contiguous parts minimizing the largest part sum. Answer lives in [' + lo + ', ' + hi + '].',
        { vars: { lo: lo, hi: hi, k: k }, sub: null, log: 'init' });

    function feasible(x) {
        var parts = 1, run = 0, sums = [];
        for (var i = 0; i < n; i++) {
            if (run + nums[i] > x) { parts++; sums.push(run); run = 0; }
            run += nums[i];
        }
        sums.push(run);
        return { ok: parts <= k, parts: parts, sums: sums };
    }

    var answer = -1;
    while (lo <= hi) {
        var mid = lo + Math.floor((hi - lo) / 2);
        var f = feasible(mid);
        var h2 = {};
        for (var i2 = 0; i2 < n; i2++) h2[i2] = 'compare';
        push('mid = ' + mid + ': greedy split \u2192 ' + f.parts + ' part' + (f.parts === 1 ? '' : 's') + ', each \u2264 ' + mid + (f.ok ? '  \u2192 feasible' : '  \u2192 needs too many parts'),
            { highlight: h2, sub: { label: 'part sums', cells: f.sums, highlight: (function () { var x = {}; if (f.parts > 0) x[f.parts - 1] = 'active'; return x; })() }, vars: { lo: lo, hi: hi, m: mid, parts: f.parts, ok: f.ok ? 'yes' : 'no' }, log: f.ok ? 'feasible' : 'infeasible' });
        if (f.ok) { answer = mid; hi = mid - 1; }
        else { lo = mid + 1; }
    }

    push('Answer = ' + answer + ': split into ' + k + ' parts with largest sum minimized. O(n log(sum)).',
        { highlight: (function () { var x = {}; for (var i = 0; i < n; i++) x[i] = 'found'; return x; })(), sub: null, vars: { answer: answer }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/binary-search-answer'] = {
    title: 'Binary Search on Answer — split array minimising max part sum',
    family: 'binary-search-answer',
    defaultState: { nums: [7, 2, 5, 10, 8], k: 2 },
    inputs: [
        { key: 'nums', label: 'Array', value: '7, 2, 5, 10, 8', placeholder: '7, 2, 5, 10, 8', parse: vizParseList },
        { key: 'k', label: 'Number of parts k', value: '2', placeholder: '2', parse: function (s) { return parseInt(s, 10) || 1; } }
    ],
    legend: [
        { label: 'examining', color: 'vz-compare' },
        { label: 'answer found', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizBsAnswerFrames
};

VIZ_CONFIG['binary-search-answer'] = VIZ_CONFIG['topics/binary-search-answer'];
