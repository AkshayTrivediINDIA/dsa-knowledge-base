/* ============================================================
   DSA Knowledge Base - module: viz/problems/snippets/09-freqcount
   Frequency Count (snippet variant). Reuses the shared hashing
   frames with the snippet example [4,2,4,5,2,2,4,4].
   Mounts on code/freqcount.
   ============================================================ */

VIZ_CONFIG['freqcount'] = {
    title: 'Frequency Count — hashmap tallies',
    family: 'hashing',
    defaultState: { array: [4, 2, 4, 5, 2, 2, 4, 4] },
    inputs: [
        { key: 'array', label: 'Array', value: '4, 2, 4, 5, 2, 2, 4, 4', placeholder: '4, 2, 4, 5, 2, 2, 4, 4', parse: vizParseList }
    ],
    legend: [
        { label: 'counting', color: 'vz-active' },
        { label: 'most frequent', color: 'vz-found' }
    ],
    stepMs: 1000,
    simulate: vizHashingFrames
};
