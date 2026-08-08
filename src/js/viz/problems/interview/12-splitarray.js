/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/12-splitarray
   Split Array Largest Sum (interview variant). Binary search on
   the ANSWER using the shared binary-search-answer frames.
   Mounts on code/splitarray.
   ============================================================ */

VIZ_CONFIG['splitarray'] = {
    title: 'Split Array Largest Sum — binary search on the answer',
    family: 'binary-search-answer',
    defaultState: { nums: [7, 2, 5, 10, 8], k: 2 },
    inputs: [
        { key: 'nums', label: 'Array', value: '7, 2, 5, 10, 8', placeholder: '7, 2, 5, 10, 8', parse: vizParseList },
        { key: 'k', label: 'Number of parts k', value: '2', placeholder: '2', parse: function (s) { return parseInt(s, 10) || 1; } }
    ],
    legend: [
        { label: 'examining', color: 'vz-compare' },
        { label: 'answer found', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizBsAnswerFrames
};
