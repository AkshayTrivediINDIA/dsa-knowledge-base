/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/01-twosum
   Two Sum: walk left to right, for each value look up the
   complement (target - value) in a hashmap of value -> index.
   A "seen" sub-row shows the map growing; the winning pair
   flashes found. Mounts on code/twosum.
   ============================================================ */

function vizIvTwoSumFrames(state) {
    var arr = state.array || [];
    var target = state.target;
    var n = arr.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — nothing to search.', arr: [], vars: {}, sub: null }); return frames; }

    var seen = {};      /* value -> index */
    var seenKeys = [];
    var seenIdx = [];

    push('Walk the array. For each value v, look up complement = target - v = ' + target + ' - v in the hashmap. O(n) time.',
        { vars: { i: 0, target: target, complement: '-' }, sub: { label: 'seen { value \u2192 index }', keys: [], cells: [] }, log: 'init' });

    for (var i = 0; i < n; i++) {
        var comp = target - arr[i];
        var hCur = {};
        hCur[i] = 'active';

        if (seen[comp] !== undefined) {
            var j = seen[comp];
            var hFound = {};
            hFound[j] = 'found';
            hFound[i] = 'found';
            push('FOUND! a[' + j + '] = ' + arr[j] + ' and a[' + i + '] = ' + arr[i] + ': ' + arr[j] + ' + ' + arr[i] + ' = ' + target,
                { highlight: hFound, vars: { i: i, j: j, target: target, complement: comp }, sub: { label: 'seen { value \u2192 index }', keys: seenKeys.slice(), cells: seenIdx.slice(), highlight: (function () { var x = {}; for (var s = 0; s < seenKeys.length; s++) if (seenKeys[s] === comp) x[s] = 'found'; return x; })() }, found: [j, i], log: 'found' });
            return frames;
        }

        if (seen[arr[i]] === undefined) {
            seen[arr[i]] = i;
            seenKeys.push(arr[i]);
            seenIdx.push(i);
        }
        push('i = ' + i + ': complement of ' + arr[i] + ' is ' + comp + ' \u2014 not seen yet. Store a[' + i + '] = ' + arr[i] + ' \u2192 index ' + i + '.',
            { highlight: hCur, vars: { i: i, target: target, complement: comp }, sub: { label: 'seen { value \u2192 index }', keys: seenKeys.slice(), cells: seenIdx.slice(), highlight: (function () { var x = {}; x[seenKeys.length - 1] = 'active'; return x; })() } });
    }

    push('No two values sum to ' + target + '.', { vars: { target: target }, sub: { label: 'seen { value \u2192 index }', keys: seenKeys.slice(), cells: seenIdx.slice() }, log: 'none' });
    return frames;
}

VIZ_CONFIG['twosum'] = {
    title: 'Two Sum — find two indices that add up to the target',
    family: 'twosum',
    defaultState: { array: [2, 7, 11, 15], target: 9 },
    inputs: [
        { key: 'array', label: 'Array', value: '2, 7, 11, 15', placeholder: '2, 7, 11, 15', parse: vizParseList },
        { key: 'target', label: 'Target', value: '9', placeholder: '9', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'current value', color: 'vz-active' },
        { label: 'matched pair', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvTwoSumFrames
};
