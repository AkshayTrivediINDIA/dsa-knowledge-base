/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/21-longestconsecutive
   Longest Consecutive Sequence. Drop every value into a hash
   set; count a chain only from an element with no left
   neighbour x - 1, so each chain is measured exactly once from
   its smallest value. O(n) time. Mounts on code/longestconsecutive.
   ============================================================ */

function vizIvLongestConsecutiveFrames(state) {
    var nums = state.array || [];
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array \u2192 longest run = 0.', arr: [], vars: {}, sub: null }); return frames; }

    var setMap = {};
    var setList = [];
    for (var i = 0; i < n; i++) {
        if (!setMap[nums[i]]) { setMap[nums[i]] = true; setList.push(nums[i]); }
    }

    function subRow() { return { label: 'set', keys: setList.slice(), cells: setList.slice() }; }

    function chainHighlight(chain) {
        var h = {};
        for (var j = 0; j < setList.length; j++) {
            if (chain.indexOf(setList[j]) >= 0) h[j] = 'found';
        }
        return h;
    }

    var longest = 0, current = 0;

    push('Hashset of all values: [' + setList.join(', ') + ']. Walk each element x and only start counting when x - 1 is NOT in the set \u2014 every chain is then counted once, from its smallest value. O(n).',
        { highlight: { 0: 'active' }, vars: { x: nums[0], current: 0, longest: 0 }, sub: subRow(), log: 'init' });

    for (var x = 0; x < n; x++) {
        var val = nums[x];
        var h = {};
        h[x] = 'active';
        if (setMap[val - 1]) {
            push('x = ' + val + ' at index ' + x + ': ' + (val - 1) + ' is in the set \u2192 not a chain start, skip.',
                { highlight: h, vars: { x: val, current: current, longest: longest }, sub: subRow() });
            continue;
        }
        current = val;
        var chain = [val];
        while (setMap[current + 1]) { current++; chain.push(current); }
        var len = current - val + 1;
        var wasBest = len > longest;
        if (wasBest) longest = len;
        push('x = ' + val + ' at index ' + x + ': no ' + (val - 1) + ' in the set \u2192 count up: ' + chain.join(', ') + ' \u2192 run length ' + len + (wasBest ? '  \u2192 NEW BEST' : '') + '.',
            { highlight: h, vars: { x: val, current: current, longest: longest }, sub: { label: 'set', keys: setList.slice(), cells: setList.slice(), highlight: chainHighlight(chain) }, log: wasBest ? 'new best' : 'step' });
    }

    push('Longest consecutive sequence length = ' + longest + '.',
        { vars: { x: '-', current: '-', longest: longest }, sub: subRow(), log: 'done' });

    return frames;
}

VIZ_CONFIG['longestconsecutive'] = {
    title: 'Longest Consecutive Sequence — hashset, count from no-left-neighbour starts',
    family: 'longestconsecutive',
    defaultState: { array: [100, 4, 200, 1, 3, 2] },
    inputs: [
        { key: 'array', label: 'Array', value: '100, 4, 200, 1, 3, 2', placeholder: '100, 4, 200, 1, 3, 2', parse: vizParseList }
    ],
    legend: [
        { label: 'examining value', color: 'vz-active' },
        { label: 'current chain', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvLongestConsecutiveFrames
};
