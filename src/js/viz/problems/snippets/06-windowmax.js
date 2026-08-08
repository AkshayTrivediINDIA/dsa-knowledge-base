/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/06-windowmax
   Maximum Sum of a Fixed-Window (snippet variant). Reuses the
   shared sliding-window frames with the snippet example
   [1,4,2,10,23,3,1,0,20], k=4 -> best 39.
   Mounts on code/windowmax.
   ============================================================ */

VIZ_CONFIG['windowmax'] = {
    title: 'Maximum Sum of a Window of Size k — sliding window',
    family: 'sliding-window',
    defaultState: { array: [1, 4, 2, 10, 23, 3, 1, 0, 20], k: 4 },
    inputs: [
        { key: 'array', label: 'Array', value: '1, 4, 2, 10, 23, 3, 1, 0, 20', placeholder: '1, 4, 2, 10, 23, 3, 1, 0, 20', parse: vizParseList },
        { key: 'k', label: 'Window size k', value: '4', placeholder: '4', parse: function (s) { return parseInt(s, 10) || 1; } }
    ],
    legend: [
        { label: 'window', color: 'vz-swap' },
        { label: 'current index', color: 'vz-active' },
        { label: 'best window', color: 'vz-found' }
    ],
    stepMs: 1000,
    simulate: vizSlidingWindowFrames
};
