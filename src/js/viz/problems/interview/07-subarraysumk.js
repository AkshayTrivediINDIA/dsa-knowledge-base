/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/07-subarraysumk
   Subarray Sum Equals K: running prefix sum + a hashmap counting
   how many times each prefix sum has occurred. For each position,
   count += map[prefix - k]. The sub-row shows the prefix-sum
   counter map. Mounts on code/subarraysumk.
   ============================================================ */

function vizIvSubarraySumKFrames(state) {
    var nums = state.array || [];
    var k = state.k;
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, sub: null };
        for (var kk in extra) f[kk] = extra[kk];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — 0 subarrays.', arr: [], vars: {}, sub: null }); return frames; }

    var map = { 0: 1 };   /* prefix sum -> how many times seen */
    var prefix = 0;
    var count = 0;
    var mapKeys = [0], mapVals = [1];

    push('Count subarrays that sum to ' + k + '. Keep prefix sums in a counter map: when prefix - k was seen before, each such earlier prefix closes a valid subarray. O(n).',
        { vars: { i: 0, prefix: 0, k: k, count: 0 }, sub: { label: 'prefix-sum counter', keys: mapKeys.slice(), cells: mapVals.slice() }, log: 'init' });

    for (var i = 0; i < n; i++) {
        prefix += nums[i];
        var need = prefix - k;
        var add = map[need] || 0;
        var h = {};
        h[i] = 'active';
        if (add > 0) {
            var h2 = {};
            h2[i] = 'found';
            push('i = ' + i + ': prefix = ' + prefix + '. prefix - k = ' + need + ' seen ' + add + ' time(s) \u2192 ' + add + ' subarray(s) end here. total = ' + (count + add) + '.',
                { highlight: h2, vars: { i: i, prefix: prefix, need: need, count: count + add }, sub: { label: 'prefix-sum counter', keys: mapKeys.slice(), cells: mapVals.slice(), highlight: (function () { var x = {}; for (var s = 0; s < mapKeys.length; s++) if (mapKeys[s] === need) x[s] = 'found'; return x; })() }, log: 'match' });
        } else {
            push('i = ' + i + ': prefix = ' + prefix + '. prefix - k = ' + need + ' not seen \u2014 0 new subarrays.',
                { highlight: h, vars: { i: i, prefix: prefix, need: need, count: count }, sub: { label: 'prefix-sum counter', keys: mapKeys.slice(), cells: mapVals.slice() } });
        }
        count += add;
        map[prefix] = (map[prefix] || 0) + 1;
        mapKeys.push(prefix);
        mapVals.push(map[prefix]);
    }

    push('Total subarrays summing to ' + k + ' = ' + count + '.',
        { vars: { count: count }, sub: { label: 'prefix-sum counter', keys: mapKeys.slice(), cells: mapVals.slice() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['subarraysumk'] = {
    title: 'Subarray Sum Equals K — prefix-sum counter map',
    family: 'subarraysumk',
    defaultState: { array: [1, 1, 1], k: 2 },
    inputs: [
        { key: 'array', label: 'Array', value: '1, 1, 1', placeholder: '1, 1, 1', parse: vizParseList },
        { key: 'k', label: 'Target sum k', value: '2', placeholder: '2', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'current index', color: 'vz-active' },
        { label: 'closes a valid subarray', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvSubarraySumKFrames
};

/* ---------- Focus Mode config ---------- */

FOCUS_CONFIG['subarraysumk'] = {
    title: 'Subarray Sum Equals K — Focus Mode',
    viz: 'subarraysumk',
    codeGroup: 'subarraysumk',
    tagline: 'One sum, many ears to compare.',
    lead: 'Check every window, or use prefix sums to close matching windows in one pass.',
    optLabel: 'Prefix-sum counter',
    beats: [
        {
            narr: 'Brute force tries every starting point and grows each window — for the sample [1,1,1] with k=2 there are 6 windows to check.',
            brute: 1,
            opt: 1
        },
        {
            narr: 'Each window adds up on its own, so the work is O(n\u00b2) in the worst case — too slow for long arrays.',
            brute: 6,
            opt: 2
        },
        {
            narr: 'Track the running prefix sum and count how many times each prefix value was seen. If prefix - k was seen before, every such earlier prefix closes a valid subarray. O(n) with one map.',
            brute: 6,
            opt: 3
        }
    ],
    recap:
        'A subarray from i+1 to j has sum k exactly when prefix[j] - prefix[i] = k, i.e. prefix[i] = prefix[j] - k. ' +
        'So walk left to right, remember how often each prefix sum has occurred in a counter map, and at each position j ' +
        'add the count of the value prefix[j] - k — every one of those earlier prefixes is the start of a valid subarray. ' +
        'One O(n) pass with a lookup per step replaces the O(n\u00b2) window search.',
    recapTitle: 'Concept recap — how do prefix sums count subarrays?'
};
