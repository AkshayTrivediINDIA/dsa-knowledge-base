/* ============================================================
   DSA Knowledge Base - module: viz/topics/12-dutch-national-flag
   Three-way partition of 0/1/2 (red/white/blue) with lo/mid/hi
   pointers in a single pass.
   Mounts on topics/dutch-national-flag; inherited by
   code/dutch-national-flag.
   ============================================================ */

function vizDNFrames(state) {
    var arr = (state.array || []).slice();
    var n = arr.length;
    var frames = [];
    var lo = 0, mid = 0, hi = n - 1;

    function push(narr, extra) {
        var f = { narr: narr, arr: arr.slice(), highlight: {}, pointers: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }
    function ptrs() {
        return { lo: { idx: lo, color: 'left' }, mid: { idx: mid, color: 'pivot' }, hi: { idx: hi, color: 'right' } };
    }
    function mark(color) {
        var h = {};
        for (var i = 0; i < n; i++) h[i] = color;
        return h;
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    push('Three-way partition of [2,0,2,1,1,0] (0 = red, 1 = white, 2 = blue). lo/mid/hi sweep once.',
        { pointers: ptrs(), vars: { lo: lo, mid: mid, hi: hi }, log: 'init' });

    while (mid <= hi) {
        var val = arr[mid];
        if (val === 0) {
            var h0 = {}; h0[lo] = 'swap'; h0[mid] = 'swap';
            if (lo !== mid) {
                push('a[mid] = ' + val + ' (red)  \u2192 swap a[' + lo + '] \u2194 a[' + mid + '], lo++, mid++',
                    { swap: [lo, mid], highlight: h0, pointers: ptrs(), vars: { lo: lo, mid: mid, hi: hi, a: val } });
                var t0 = arr[lo]; arr[lo] = arr[mid]; arr[mid] = t0;
            } else {
                push('a[mid] = ' + val + ' (red)  \u2192 lo and mid both move right.',
                    { highlight: h0, pointers: ptrs(), vars: { lo: lo, mid: mid, hi: hi, a: val } });
            }
            lo++; mid++;
        } else if (val === 1) {
            var h1 = {}; h1[mid] = 'compare';
            push('a[mid] = ' + val + ' (white)  \u2192 correct zone, mid++',
                { highlight: h1, pointers: ptrs(), vars: { lo: lo, mid: mid, hi: hi, a: val } });
            mid++;
        } else {
            var h2 = {}; h2[mid] = 'swap'; h2[hi] = 'swap';
            push('a[mid] = ' + val + ' (blue)  \u2192 swap a[' + mid + '] \u2194 a[' + hi + '], hi--',
                { swap: [mid, hi], highlight: h2, pointers: ptrs(), vars: { lo: lo, mid: mid, hi: hi, a: val } });
            var t2 = arr[mid]; arr[mid] = arr[hi]; arr[hi] = t2;
            hi--;
        }
    }

    push('Done \u2014 reds | whites | blues: [' + arr.join(', ') + ']. Single pass, O(n).',
        { highlight: mark('found'), pointers: {}, vars: { lo: lo, mid: mid, hi: hi }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/dutch-national-flag'] = {
    title: 'Dutch National Flag — sort 0, 1, 2 in one pass',
    family: 'dutch-national-flag',
    defaultState: { array: [2, 0, 2, 1, 1, 0] },
    inputs: [
        { key: 'array', label: 'Array (0,1,2)', value: '2, 0, 2, 1, 1, 0', placeholder: '2, 0, 2, 1, 1, 0', parse: vizParseList }
    ],
    legend: [
        { label: 'lo (reds)', color: 'vz-left' },
        { label: 'mid (scan)', color: 'vz-pivot' },
        { label: 'hi (blues)', color: 'vz-right' },
        { label: 'swapping', color: 'vz-swap' }
    ],
    stepMs: 1000,
    simulate: vizDNFrames
};

VIZ_CONFIG['dutch-national-flag'] = VIZ_CONFIG['topics/dutch-national-flag'];
