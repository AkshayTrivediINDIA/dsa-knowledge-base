/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/24-findduplicate
   Find the Duplicate Number (LeetCode 287). Treat nums[i] as a
   link to the next index, making the array an implicit linked
   list whose cycle entry point is the duplicate value. Floyd's
   tortoise-and-hare: detect the cycle, then find its entry.
   Mounts on code/findduplicate.
   ============================================================ */

function vizIvFindDuplicateFrames(state) {
    var nums = state.array || [];
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, sub: null, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array \u2014 no duplicate.', arr: [], vars: {}, sub: null }); return frames; }

    var slow = 0, fast = 0;

    push('Floyd\u2019s cycle detection: read nums[i] as a link to the next index. slow advances 1 link per step, fast 2 \u2014 fast laps slow exactly when a duplicate creates a cycle.',
        { highlight: { 0: 'active' }, vars: { slow: slow, fast: fast, dup: '\u2014' }, log: 'init' });

    while (true) {
        var sFrom = slow, fFrom = fast;
        slow = nums[slow];
        fast = nums[nums[fast]];
        var h = {};
        h[slow] = 'left';
        h[fast] = 'right';
        push('slow: nums[' + sFrom + '] = ' + nums[sFrom] + ' \u2192 ' + slow + '.  fast: nums[nums[' + fFrom + ']] = ' + nums[nums[fFrom]] + ' \u2192 ' + fast + '.',
            { highlight: h, vars: { slow: slow, fast: fast, dup: '\u2014' } });
        if (slow === fast) break;
    }

    var meet = slow;
    var hm = {};
    hm[meet] = 'found';
    push('Cycle found: both pointers land on index ' + meet + '. Reset slow to 0 and advance both one link at a time \u2014 they meet again at the cycle entry.',
        { highlight: hm, vars: { slow: 0, fast: meet, dup: '\u2014' }, log: 'step' });

    slow = 0;
    while (slow !== fast) {
        var s2 = slow, f2 = fast;
        slow = nums[slow];
        fast = nums[fast];
        var h2 = {};
        h2[slow] = 'left';
        h2[fast] = 'right';
        push('slow: nums[' + s2 + '] = ' + nums[s2] + ' \u2192 ' + slow + '.  fast: nums[' + f2 + '] = ' + nums[f2] + ' \u2192 ' + fast + '.',
            { highlight: h2, vars: { slow: slow, fast: fast, dup: '\u2014' } });
    }

    var dup = slow;
    var hf = {};
    for (var i = 0; i < n; i++) if (nums[i] === dup) hf[i] = 'found';
    push('Duplicate number = ' + dup + ' (both pointers stop at index ' + dup + ', the cycle entry). O(n) time, O(1) space.',
        { highlight: hf, vars: { slow: dup, fast: dup, dup: dup }, log: 'done' });

    return frames;
}

VIZ_CONFIG['findduplicate'] = {
    title: 'Find the Duplicate Number \u2014 Floyd\u2019s cycle detection',
    family: 'findduplicate',
    defaultState: { array: [1, 3, 4, 2, 2] },
    inputs: [
        { key: 'array', label: 'Array', value: '1, 3, 4, 2, 2', placeholder: '1, 3, 4, 2, 2', parse: vizParseList }
    ],
    legend: [
        { label: 'slow pointer', color: 'vz-left' },
        { label: 'fast pointer', color: 'vz-right' },
        { label: 'duplicate', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvFindDuplicateFrames
};
