/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/02-plusone
   Plus One: scan from the least significant digit. Add 1; if the
   digit stays < 10 we're done, otherwise carry the 1 left. If the
   carry escapes the most significant digit, prepend a 1.
   Mounts on code/plusone.
   ============================================================ */

function vizLcPlusOneFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a.slice(), highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    var carry = 1;
    push('Add 1 as a carry starting at the last digit. If a digit reaches 10, carry 1 to the left.',
        { highlight: (function () { var h = {}; h[n - 1] = 'active'; return h; })(), vars: { i: n - 1, carry: 1 }, log: 'init' });

    for (var i = n - 1; i >= 0; i--) {
        var s = a[i] + carry;
        if (s >= 10) {
            a[i] = s - 10;
            carry = 1;
            push('a[' + i + '] + carry = ' + s + ' \u2265 10 \u2192 digit becomes ' + a[i] + ', carry 1 to the left.',
                { highlight: (function () { var h = {}; h[i] = 'found'; return h; })(), vars: { i: i, carry: 1, digit: a[i] }, log: 'carry' });
        } else {
            a[i] = s;
            carry = 0;
            push('a[' + i + '] + carry = ' + s + ' < 10 \u2192 digit = ' + a[i] + ', no more carry. Done.',
                { highlight: (function () { var h = {}; h[i] = 'found'; return h; })(), vars: { i: i, carry: 0, digit: a[i] }, log: 'done' });
            push('Result: [' + a.join(', ') + '].',
                { highlight: (function () { var h = {}; for (var k = i; k < n; k++) h[k] = 'found'; return h; })(), vars: {}, sub: { label: 'result', keys: a.slice(i), cells: a.slice(i) }, log: 'done' });
            return frames;
        }
    }

    if (carry) {
        a.unshift(1);
        push('Carry escaped the most significant digit \u2192 prepend 1. Result: [' + a.join(', ') + '].',
            { highlight: { 0: 'found' }, vars: {}, sub: { label: 'result', keys: a.slice(), cells: a.slice() }, log: 'carry out' });
    }

    return frames;
}

VIZ_CONFIG['plusone'] = {
    title: 'Plus One — add 1 with carry propagation',
    family: 'plusone',
    defaultState: { array: [1, 2, 3] },
    inputs: [
        { key: 'array', label: 'Digits', value: '1, 2, 3', placeholder: '1, 2, 3', parse: vizParseList }
    ],
    legend: [
        { label: 'updated digit', color: 'vz-found' },
        { label: 'examining', color: 'vz-active' }
    ],
    stepMs: 1150,
    simulate: vizLcPlusOneFrames
};
