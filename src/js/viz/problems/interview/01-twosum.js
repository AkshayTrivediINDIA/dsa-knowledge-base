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

/* ---------- Focus Mode config ----------
   Drives the full-screen teaching environment (see core/14-focus-env).
   beats[] = the "why this approach" intro, one narration beat per row of
   the operation-count comparison; brute/hash are cumulative operation
   counts for the animated bars. recap = plain-English concept panel. */

FOCUS_CONFIG['twosum'] = {
    title: 'Two Sum — Focus Mode',
    viz: 'twosum',
    codeGroup: 'twosum',
    tagline: 'Why two passes? No — one pass.',
    lead: 'Compare the naive pair check with the hash-map walk before looking at the code.',
    bruteLabel: 'Brute force',
    optLabel: 'Hash map',
    beats: [
        {
            narr: 'The naive way checks every pair. For 4 numbers that is 6 pairs to try — and the count explodes as the array grows.',
            brute: 1,
            opt: 1
        },
        {
            narr: 'With brute force each new number multiplies the work: look at every pair again. That is O(n\u00b2) — too slow for big inputs.',
            brute: 6,
            opt: 2
        },
        {
            narr: 'A hashmap remembers what we have already seen. Each number needs just one look-up, so one pass does it: O(n) time.',
            brute: 6,
            opt: 4
        }
    ],
    recap:
        'A hashmap is like a labelled box room. When you see a number, you write its value on a box and drop the position inside. ' +
        'Later, to check "have I seen the partner of this number?", you open one box directly instead of searching every box. ' +
        'A hashmap turns "did I already see this?" into a single, instant answer — that is what turns O(n\u00b2) pair-checking into one O(n) walk.',
    recapTitle: 'Concept recap — what is a hash map?'
};
