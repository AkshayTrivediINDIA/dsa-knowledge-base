/* ============================================================
   DSA Knowledge Base - module: viz/topics/18-monotonic-stack
   Monotonic stack for Next Greater Element: keep stack indices in
   strictly decreasing value order. For each a[i], pop every index
   whose value < a[i] — a[i] is the NGE of each popped element —
   then push i. Values left on the stack have no NGE to the right.
   Mounts on topics/monotonic-stack; inherited by code/monotonic-stack.
   ============================================================ */

function vizMonotonicStackFrames(state) {
    var arr = state.array || [];
    var n = arr.length;
    var frames = [];
    var stack = [];
    var nge = [];
    var i, k, r;

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, sub: null, vars: {} };
        for (var k2 in extra) f[k2] = extra[k2];
        frames.push(f);
    }
    function stackView(sh) {
        var cells = [], keys = [], so = {};
        for (k = 0; k < stack.length; k++) {
            cells.push(arr[stack[k]]);
            keys.push('a[' + stack[k] + ']');
            if (sh && sh[k] !== undefined) so[k] = sh[k];
        }
        return { label: 'stack (values)', keys: keys, cells: cells, highlight: so };
    }
    function markNGE() {
        var h = {};
        for (k = 0; k < n; k++) if (nge[k] !== '\u2014') h[k] = 'found';
        return h;
    }

    for (i = 0; i < n; i++) nge.push('\u2014');

    if (!n) {
        frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null });
        return frames;
    }

    push('Monotonic stack: the stack always holds indices in strictly decreasing value order. Each a[i] pops every smaller top — a[i] is that top\u2019s Next Greater Element — then i is pushed.',
        { vars: { i: '\u2014', top: '\u2014', nge: '\u2014' }, sub: stackView(null), log: 'init' });

    for (i = 0; i < n; i++) {
        var curH = markNGE(); curH[i] = 'active';
        var curTop = stack.length ? arr[stack[stack.length - 1]] : '\u2014';
        push('Examine a[' + i + '] = ' + arr[i] + '. Pop every stack top with value < ' + arr[i] + ', then push i = ' + i + '.',
            { highlight: curH, vars: { i: i, top: curTop, nge: '\u2014' }, sub: stackView(null), log: 'step' });

        while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {
            var topIdx = stack[stack.length - 1];
            var h = markNGE(); h[topIdx] = 'compare'; h[i] = 'active';
            var sh = {}; sh[stack.length - 1] = 'compare';
            push('a[' + topIdx + '] = ' + arr[topIdx] + ' < a[' + i + '] = ' + arr[i] + ' \u2192 pop it; NGE[' + topIdx + '] = ' + arr[i] + '.',
                { highlight: h, sub: stackView(sh), vars: { i: i, top: arr[topIdx], nge: arr[i] }, log: 'pop' });
            stack.pop();
            nge[topIdx] = arr[i];
        }

        var newTop = stack.length ? arr[stack[stack.length - 1]] : '\u2014';
        stack.push(i);
        var ph = markNGE(); ph[i] = 'active';
        var sh2 = {}; sh2[stack.length - 1] = 'active';
        push('No smaller top remains \u2192 push i = ' + i + ' (value ' + arr[i] + '). Stack stays strictly decreasing.',
            { highlight: ph, sub: stackView(sh2), vars: { i: i, top: newTop, nge: '\u2014' }, log: 'push' });
    }

    var hf = markNGE();
    var remains = [];
    for (r = 0; r < stack.length; r++) {
        hf[stack[r]] = 'dim';
        remains.push(arr[stack[r]]);
    }
    push('Elements left in the stack (' + remains.join(', ') + ') have no greater element to the right \u2192 their NGE is \u2014. NGE = [' + nge.join(', ') + '].',
        { highlight: hf, sub: stackView(null), vars: { i: '\u2014', top: '\u2014', nge: '[' + nge.join(', ') + ']' }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/monotonic-stack'] = {
    title: 'Monotonic Stack — Next Greater Element in O(n)',
    family: 'monotonic-stack',
    defaultState: { array: [4, 5, 2, 25, 7, 8] },
    inputs: [
        { key: 'array', label: 'Array', value: '4, 5, 2, 25, 7, 8', placeholder: '4, 5, 2, 25, 7, 8', parse: vizParseList }
    ],
    legend: [
        { label: 'current element', color: 'vz-active' },
        { label: 'popped / compared', color: 'vz-compare' },
        { label: 'NGE established', color: 'vz-found' },
        { label: 'no NGE (left in stack)', color: 'vz-dim' }
    ],
    stepMs: 1000,
    simulate: vizMonotonicStackFrames
};

VIZ_CONFIG['monotonicstack'] = VIZ_CONFIG['topics/monotonic-stack'];
