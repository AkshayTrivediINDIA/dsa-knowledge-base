/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/08-binsearch
   Binary Search (snippet variant). Reuses the shared binary-search
   frames with the snippet example [1,3,5,7,9], target 7.
   Mounts on code/binsearch.
   ============================================================ */

VIZ_CONFIG['binsearch'] = {
    title: 'Binary Search — halve the search space',
    family: 'binary-search',
    defaultState: { array: [1, 3, 5, 7, 9], target: 7 },
    inputs: [
        { key: 'array', label: 'Array (sorted)', value: '1, 3, 5, 7, 9', placeholder: '1, 3, 5, 7, 9', parse: vizParseList },
        { key: 'target', label: 'Target', value: '7', placeholder: '7', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'low', color: 'vz-left' },
        { label: 'high', color: 'vz-right' },
        { label: 'mid', color: 'vz-active' },
        { label: 'found', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizBinarySearchFrames
};
