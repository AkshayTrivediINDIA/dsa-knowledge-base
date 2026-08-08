/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/10-selsort
   Selection Sort (snippet variant). Reuses the shared sorting
   frames pinned to selection sort with [5,2,8,1,3].
   Mounts on code/selsort.
   ============================================================ */

VIZ_CONFIG['selsort'] = {
    title: 'Selection Sort — place the minimum each pass',
    family: 'sorting',
    defaultState: { array: [5, 2, 8, 1, 3], algo: 'selection' },
    inputs: [
        { key: 'array', label: 'Array', value: '5, 2, 8, 1, 3', placeholder: '5, 2, 8, 1, 3', parse: vizParseList }
    ],
    legend: [
        { label: 'current min', color: 'vz-left' },
        { label: 'comparing', color: 'vz-compare' },
        { label: 'sorted prefix', color: 'vz-found' },
        { label: 'swap', color: 'vz-swap' }
    ],
    stepMs: 1050,
    simulate: vizSortingFrames
};
