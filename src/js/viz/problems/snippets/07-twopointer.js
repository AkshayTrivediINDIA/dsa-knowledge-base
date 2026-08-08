/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/07-twopointer
   Two Pointers (snippet variant). Reuses the shared two-pointers
   frames with the snippet example [1,2,3,4,6], target 6.
   Mounts on code/twopointer.
   ============================================================ */

VIZ_CONFIG['twopointer'] = {
    title: 'Two Pointers — find a pair summing to target',
    family: 'two-pointers',
    defaultState: { array: [1, 2, 3, 4, 6], target: 6 },
    inputs: [
        { key: 'array', label: 'Array (sorted)', value: '1, 2, 3, 4, 6', placeholder: '1, 2, 3, 4, 6', parse: vizParseList },
        { key: 'target', label: 'Target', value: '6', placeholder: '6', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'left pointer', color: 'vz-left' },
        { label: 'right pointer', color: 'vz-right' },
        { label: 'found pair', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizTwoPointersFrames
};
