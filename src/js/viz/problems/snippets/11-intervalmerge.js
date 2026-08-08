/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/11-intervalmerge
   Merge Intervals (snippet variant). Reuses the shared
   merge-intervals frames with the snippet example
   [[1,3],[2,6],[8,10],[15,18]].
   Mounts on code/intervalmerge.
   ============================================================ */

VIZ_CONFIG['intervalmerge'] = {
    title: 'Merge Intervals — sort by start, merge overlaps',
    family: 'merge-intervals',
    defaultState: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] },
    inputs: [
        { key: 'intervals', label: 'Intervals (pairs with ;)', value: '1 3; 2 6; 8 10; 15 18', placeholder: '1 3; 2 6; 8 10; 15 18', parse: vizParseIntervals }
    ],
    legend: [
        { label: 'current interval', color: 'vz-compare' },
        { label: 'merging into', color: 'vz-active' }
    ],
    stepMs: 1000,
    simulate: vizMergeIntervalsFrames
};
