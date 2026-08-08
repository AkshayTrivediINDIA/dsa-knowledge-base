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
