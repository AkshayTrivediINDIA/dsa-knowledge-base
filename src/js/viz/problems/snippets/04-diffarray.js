/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/04-diffarray
   Difference Array (snippet variant): range additions in O(1)
   using the shared diff-array frames with the snippet example
   (+3 on [1,3], +2 on [2,4] over five slots).
   Mounts on code/diffarray.
   ============================================================ */

VIZ_CONFIG['diffarray'] = {
    title: 'Difference Array — O(1) range updates',
    family: 'difference-array',
    defaultState: {
        array: [0, 0, 0, 0, 0],
        updates: [
            { val: 3, l: 1, r: 3 },
            { val: 2, l: 2, r: 4 }
        ]
    },
    inputs: [
        { key: 'array', label: 'Base array', value: '0, 0, 0, 0, 0', placeholder: '0, 0, 0, 0, 0', parse: vizParseList }
    ],
    legend: [
        { label: 'update start', color: 'vz-left' },
        { label: 'update end', color: 'vz-right' },
        { label: 'materialized', color: 'vz-found' },
        { label: 'reading', color: 'vz-active' }
    ],
    stepMs: 1000,
    simulate: vizDiffArrayFrames
};
