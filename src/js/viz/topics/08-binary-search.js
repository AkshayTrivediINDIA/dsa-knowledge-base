/* ============================================================
   DSA Knowledge Base - module: viz/topics/08-binary-search
   Classic binary search on a sorted array: halve the range each
   probe; eliminated halves are dimmed.
   Mounts on topics/binary-search; inherited by code/binary-search.
   ============================================================ */

function vizBinarySearchFrames(state) {
    var arr = state.array || [];
    var target = state.target;
    var n = arr.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, pointers: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    function dimOutside(lo, hi, mid) {
        var h = {};
        for (var i = 0; i < n; i++) {
            if (i === mid) h[i] = 'pivot';
            else if (i < lo || i > hi) h[i] = 'dim';
            else h[i] = 'compare';
        }
        return h;
    }

    var lo = 0, hi = n - 1;
    push('Search [' + arr.join(', ') + '] for ' + target + '. Range [0..' + hi + '].',
        { highlight: (function () { var h = {}; h[0] = 'left'; h[n - 1] = 'right'; return h; })(), vars: { lo: 0, hi: hi, target: target }, log: 'init' });

    while (lo <= hi) {
        var mid = lo + Math.floor((hi - lo) / 2);
        push('mid = lo + (hi-lo)/2 = ' + lo + ' + (' + hi + '-' + lo + ')/2 = ' + mid + '.  a[' + mid + '] = ' + arr[mid],
            { highlight: dimOutside(lo, hi, mid), pointers: { l: { idx: lo, color: 'left' }, r: { idx: hi, color: 'right' } }, vars: { lo: lo, hi: hi, m: mid, a: arr[mid], target: target } });
        if (arr[mid] === target) {
            var hf = {}; hf[mid] = 'found';
            push('a[' + mid + '] = ' + arr[mid] + ' == ' + target + '  \u2192 FOUND at index ' + mid + '!',
                { highlight: hf, vars: { lo: lo, hi: hi, m: mid, found: mid, target: target }, log: 'found' });
            return frames;
        }
        if (arr[mid] < target) {
            lo = mid + 1;
            push('a[' + mid + '] (' + arr[mid] + ') < ' + target + '  \u2192 go right, lo = ' + lo,
                { highlight: dimOutside(lo, hi, -1), pointers: { l: { idx: lo, color: 'left' }, r: { idx: hi, color: 'right' } }, vars: { lo: lo, hi: hi, target: target } });
        } else {
            hi = mid - 1;
            push('a[' + mid + '] (' + arr[mid] + ') > ' + target + '  \u2192 go left, hi = ' + hi,
                { highlight: dimOutside(lo, hi, -1), pointers: { l: { idx: lo, color: 'left' }, r: { idx: hi, color: 'right' } }, vars: { lo: lo, hi: hi, target: target } });
        }
    }

    push('Range collapsed (lo ' + lo + ' > hi ' + hi + '): ' + target + ' is NOT in the array.',
        { highlight: {}, vars: { lo: lo, hi: hi, target: target }, log: 'not found' });

    return frames;
}

VIZ_CONFIG['topics/binary-search'] = {
    title: 'Binary Search — halve the search space each probe',
    family: 'binary-search',
    defaultState: { array: [1, 3, 5, 7, 9, 11, 13], target: 9 },
    inputs: [
        { key: 'array', label: 'Array (sorted)', value: '1, 3, 5, 7, 9, 11, 13', placeholder: '1, 3, 5, 7, 9, 11, 13', parse: vizParseList },
        { key: 'target', label: 'Target', value: '9', placeholder: '9', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'probe (mid)', color: 'vz-pivot' },
        { label: 'active range', color: 'vz-compare' },
        { label: 'eliminated', color: 'vz-dim' },
        { label: 'found', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizBinarySearchFrames
};

VIZ_CONFIG['binary-search'] = VIZ_CONFIG['topics/binary-search'];
