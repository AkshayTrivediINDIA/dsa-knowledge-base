/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/04-majorityelement
   Majority Element (Boyer-Moore): a candidate and a count. When
   the current value equals the candidate, count++; otherwise
   count--. When count hits 0, adopt the current value. The value
   left standing is the majority. Mounts on code/majorityelement.
   ============================================================ */

function vizIvMajorityFrames(state) {
    var a = state.array || [];
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — no majority.', arr: [], vars: {} }); return frames; }

    var cand = a[0];
    var count = 1;

    push('Boyer-Moore: keep a candidate and a vote count. Equal values raise the count, different values lower it; at count 0, switch candidate. The surviving value is the majority.',
        { highlight: { 0: 'active' }, vars: { i: 0, cand: cand, count: count }, log: 'init' });

    for (var i = 1; i < n; i++) {
        var h = {};
        h[i] = 'active';
        if (a[i] === cand) {
            count++;
            h[i] = 'found';
            push('i = ' + i + ': a[' + i + '] = ' + a[i] + ' equals candidate ' + cand + ' \u2192 count = ' + count + '.',
                { highlight: h, vars: { i: i, cand: cand, count: count } });
        } else {
            count--;
            h[i] = 'compare';
            if (count === 0) {
                cand = a[i];
                count = 1;
                h[i] = 'left';
                push('i = ' + i + ': a[' + i + '] = ' + a[i] + ' \u2260 ' + cand + ' \u2014 count drops to 0 \u2192 adopt ' + a[i] + ' as the new candidate.',
                    { highlight: h, vars: { i: i, cand: cand, count: count }, log: 'switch' });
            } else {
                push('i = ' + i + ': a[' + i + '] = ' + a[i] + ' \u2260 candidate ' + cand + ' \u2192 count = ' + count + '.',
                    { highlight: h, vars: { i: i, cand: cand, count: count } });
            }
        }
    }

    var hf = {};
    for (var j = 0; j < n; j++) if (a[j] === cand) hf[j] = 'found';
    push('Majority element = ' + cand + ' (Boyer-Moore, O(n) time, O(1) space).',
        { highlight: hf, vars: { cand: cand, count: count }, log: 'done' });

    return frames;
}

VIZ_CONFIG['majorityelement'] = {
    title: 'Majority Element — Boyer-Moore vote counter',
    family: 'majorityelement',
    defaultState: { array: [3, 3, 4] },
    inputs: [
        { key: 'array', label: 'Array', value: '3, 3, 4', placeholder: '3, 3, 4', parse: vizParseList }
    ],
    legend: [
        { label: 'candidate', color: 'vz-left' },
        { label: 'matching vote', color: 'vz-found' },
        { label: 'opposing vote', color: 'vz-compare' }
    ],
    stepMs: 1150,
    simulate: vizIvMajorityFrames
};

/* ---------- Focus Mode config ---------- */

FOCUS_CONFIG['majorityelement'] = {
    title: 'Majority Element — Focus Mode',
    viz: 'majorityelement',
    codeGroup: 'majorityelement',
    tagline: 'Let the votes cancel out.',
    lead: 'Boyer-Moore finds the majority in one pass and constant memory.',
    optLabel: 'Boyer–Moore votes',
    beats: [
        {
            narr: 'Brute force counts how often every distinct value appears. For n values that is n scans — or O(n\u00b2) work.',
            brute: 1,
            opt: 1
        },
        {
            narr: 'A counter hashmap does it in O(n), but needs a bucket for every distinct value — O(n) memory too.',
            brute: 16,
            opt: 1
        },
        {
            narr: 'Boyer-Moore pairs up equal and opposite votes. Because the majority appears more than half the time, the value left standing is it — O(n) time, O(1) space.',
            brute: 16,
            opt: 4
        }
    ],
    recap:
        'Think of a room where every value votes. Boyer-Moore keeps a running candidate: seeing the same value raises its count, ' +
        'seeing anything else lowers it, and when the count hits zero a new candidate takes over. ' +
        'The majority value can never be fully cancelled because it appears more than every other value combined — so it survives to the end.',
    recapTitle: 'Concept recap — how do the votes cancel?'
};
