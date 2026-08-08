/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/05-maxsubarray
   Maximum Subarray (Kadane). Reuses the shared kadane frames with
   the canonical snippet example [-2,1,-3,4,-1,2,1,-5,4] -> 6.
   Mounts on code/maxsubarray.
   ============================================================ */

VIZ_CONFIG['maxsubarray'] = {
    title: 'Maximum Subarray — Kadane\u2019s algorithm',
    family: 'kadane',
    defaultState: { array: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    inputs: [
        { key: 'array', label: 'Array', value: '-2, 1, -3, 4, -1, 2, 1, -5, 4', placeholder: '-2, 1, -3, 4, -1, 2, 1, -5, 4', parse: vizParseList }
    ],
    legend: [
        { label: 'current subarray', color: 'vz-swap' },
        { label: 'best subarray', color: 'vz-found' },
        { label: 'examining', color: 'vz-active' }
    ],
    stepMs: 1100,
    simulate: vizKadaneFrames
};
