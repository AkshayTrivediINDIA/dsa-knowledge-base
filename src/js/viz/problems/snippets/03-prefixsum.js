/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/03-prefixsum
   Prefix Sum (snippet variant). Reuses the shared prefix-sum
   frames with the snippet's canonical example.
   Mounts on code/prefixsum.
   ============================================================ */

VIZ_CONFIG['prefixsum'] = {
    title: 'Prefix Sum — O(1) range-sum queries',
    family: 'prefix-sum',
    defaultState: { array: [2, 3, 5, 1], l: 0, r: 2 },
    inputs: [
        { key: 'array', label: 'Array', value: '2, 3, 5, 1', placeholder: '2, 3, 5, 1', parse: vizParseList },
        { key: 'l', label: 'Query l', value: '0', placeholder: '0', parse: function (s) { return parseInt(s, 10) || 0; } },
        { key: 'r', label: 'Query r', value: '2', placeholder: '2', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'reading a[i]', color: 'vz-active' },
        { label: 'updated prefix', color: 'vz-found' },
        { label: 'query range', color: 'vz-compare' }
    ],
    stepMs: 1000,
    simulate: vizPrefixSumFrames
};
