/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/09-maxprodsubarray
   Maximum Product Subarray (Kadane variant). Because negatives
   flip signs, track BOTH maxEndingHere and minEndingHere; the max
   may come from the negative product of a min. Mounts on
   code/maxprodsubarray.
   ============================================================ */

function vizIvMaxProdFrames(state) {
    var nums = state.array || [];
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — max product 0.', arr: [], vars: {} }); return frames; }

    var curMax = nums[0], curMin = nums[0], best = nums[0];
    var winL = 0, winR = 0;

    push('Kadane with two states: curMax = max product ending here, curMin = min product ending here (a negative times a negative can be positive).',
        { vars: { i: 0, curMax: curMax, curMin: curMin, best: best }, window: { start: 0, end: 0, label: 'best' }, log: 'init' });

    for (var i = 1; i < n; i++) {
        var v = nums[i];
        var a = curMax * v;
        var b = curMin * v;
        var newMax = Math.max(v, a, b);
        var newMin = Math.min(v, a, b);
        var h = {};
        h[i] = 'active';
        var restart = newMax === v;
        if (restart) { winL = i; winR = i; } else { winR = i; }
        push('i = ' + i + ': v = ' + v + '. curMax = max(' + v + ', ' + curMax + '\u00b7' + v + ', ' + curMin + '\u00b7' + v + ') = ' + newMax + (restart ? '  \u2192 restart subarray' : '') + (newMax > best ? '  \u2192 NEW BEST' : ''),
            { highlight: h, vars: { i: i, curMax: newMax, curMin: newMin, best: Math.max(best, newMax) }, window: { start: winL, end: winR, label: 'cur' }, log: restart ? 'restart' : (newMax > best ? 'new best' : 'step') });
        curMax = newMax;
        curMin = newMin;
        if (best < curMax) best = curMax;
    }

    var hf = {};
    for (var j = winL; j <= winR; j++) hf[j] = 'found';
    push('Maximum product subarray = ' + best + '.',
        { highlight: hf, vars: { best: best }, log: 'done' });

    return frames;
}

VIZ_CONFIG['maxprodsubarray'] = {
    title: 'Maximum Product Subarray — Kadane with max & min',
    family: 'maxprodsubarray',
    defaultState: { array: [2, 3, -2, 4] },
    inputs: [
        { key: 'array', label: 'Array', value: '2, 3, -2, 4', placeholder: '2, 3, -2, 4', parse: vizParseList }
    ],
    legend: [
        { label: 'current index', color: 'vz-active' },
        { label: 'current subarray', color: 'vz-swap' },
        { label: 'best subarray', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvMaxProdFrames
};
