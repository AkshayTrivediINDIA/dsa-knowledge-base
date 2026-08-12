/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/05-containsduplicate
   Contains Duplicate: insert every value into a hashset; the
   moment an insert finds the value already present, the answer
   is true. Mounts on code/containsduplicate.
   ============================================================ */

function vizIvContainsDupFrames(state) {
    var nums = state.array || [];
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — no duplicates.', arr: [], vars: {}, sub: null }); return frames; }

    var seen = {};      /* set of values seen */
    var setList = [];

    push('Insert each value into a hashset. If a value is already present when we try to add it, there is a duplicate. O(n).',
        { highlight: { 0: 'active' }, vars: { i: 0 }, sub: { label: 'hashset', keys: [], cells: [] }, log: 'init' });

    for (var i = 0; i < n; i++) {
        var h = {};
        h[i] = 'active';
        if (seen[nums[i]]) {
            var h2 = {};
            h2[i] = 'found';
            push('a[' + i + '] = ' + nums[i] + ' is ALREADY in the set \u2192 contains duplicate = true.',
                { highlight: h2, vars: { i: i, result: 'true' }, sub: { label: 'hashset', keys: setList.slice(), cells: setList.slice() }, found: [i], log: 'found' });
            return frames;
        }
        seen[nums[i]] = true;
        setList.push(nums[i]);
        push('a[' + i + '] = ' + nums[i] + ' \u2014 not seen before, add to set.',
            { highlight: h, vars: { i: i, result: 'false so far' }, sub: { label: 'hashset', keys: setList.slice(), cells: setList.slice(), highlight: (function () { var x = {}; x[setList.length - 1] = 'active'; return x; })() } });
    }

    push('Scanned everything \u2014 no duplicates. result = false.',
        { vars: { result: 'false' }, sub: { label: 'hashset', keys: setList.slice(), cells: setList.slice() }, log: 'none' });

    return frames;
}

VIZ_CONFIG['containsduplicate'] = {
    title: 'Contains Duplicate — hashset membership',
    family: 'containsduplicate',
    defaultState: { array: [1, 2, 3, 1] },
    inputs: [
        { key: 'array', label: 'Array', value: '1, 2, 3, 1', placeholder: '1, 2, 3, 1', parse: vizParseList }
    ],
    legend: [
        { label: 'examining value', color: 'vz-active' },
        { label: 'duplicate found', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvContainsDupFrames
};

/* ---------- Focus Mode config ---------- */

FOCUS_CONFIG['containsduplicate'] = {
    title: 'Contains Duplicate — Focus Mode',
    viz: 'containsduplicate',
    codeGroup: 'containsduplicate',
    tagline: 'Remember what you have already seen.',
    lead: 'One scan with a hashset beats re-checking every pair.',
    optLabel: 'Hashset',
    beats: [
        {
            narr: 'Brute force compares every pair of values. For 4 numbers that is 6 pair comparisons — and it explodes as the array grows.',
            brute: 1,
            opt: 1
        },
        {
            narr: 'Each new number re-checked against all earlier ones means O(n\u00b2) comparisons — 10 numbers \u2192 45 pairs. Too slow.',
            brute: 6,
            opt: 2
        },
        {
            narr: 'A hashset remembers every value seen so far. One look-up per number settles the whole array: O(n) time.',
            brute: 6,
            opt: 4
        }
    ],
    recap:
        'A hashset is a collection that answers "have I seen this value before?" in one step, no matter how many values are stored. ' +
        'Insert the current value, and immediately check whether it was already there — if it was, the array contains a duplicate. ' +
        'That turns the O(n\u00b2) "compare everything with everything" scan into a single O(n) walk.',
    recapTitle: 'Concept recap — what is a hashset used for?'
};
