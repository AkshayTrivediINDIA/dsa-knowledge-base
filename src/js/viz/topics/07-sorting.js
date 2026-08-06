/* ============================================================
   DSA Knowledge Base - module: viz/topics/07-sorting
   Three quadratic sorts on the same array: bubble, selection,
   insertion. Passes, compares, swaps and the growing sorted
   prefix are narrated frame by frame.
   Mounts on topics/sorting; inherited by code/sorting.
   ============================================================ */

function vizSortingFrames(state) {
    var arr = (state.array || []).slice();
    var algo = state.algo || 'insertion';
    var n = arr.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: arr.slice(), highlight: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    push('Sorting with ' + algo + ' sort on [' + arr.join(', ') + '].', { vars: {}, log: 'init' });

    function doSwap(i, j) {
        push('Swap a[' + i + '] (' + arr[i] + ') \u2194 a[' + j + '] (' + arr[j] + ')',
            { swap: [i, j], highlight: (function () { var h = {}; h[i] = 'swap'; h[j] = 'swap'; return h; })(), vars: {} });
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }

    if (algo === 'bubble') {
        for (var i = 0; i < n - 1; i++) {
            var swapped = false;
            push('Pass ' + (i + 1) + ': bubble the largest remaining value to the right.', { vars: {}, log: 'pass' });
            for (var j = 0; j < n - i - 1; j++) {
                var h = {}; h[j] = 'compare'; h[j + 1] = 'compare';
                push('Compare a[' + j + '] (' + arr[j] + ') vs a[' + (j + 1) + '] (' + arr[j + 1] + ')' + (arr[j] > arr[j + 1] ? '  \u2192 out of order' : '  \u2192 in order'),
                    { highlight: h, vars: { j: j } });
                if (arr[j] > arr[j + 1]) { doSwap(j, j + 1); swapped = true; }
            }
            var sortedH = {};
            for (var s = n - i - 1; s < n; s++) sortedH[s] = 'found';
            push('Pass done: position ' + (n - i - 1) + ' is now final.', { highlight: sortedH, vars: {} });
            if (!swapped) { push('No swaps this pass \u2014 array is sorted. Early exit.', { vars: {} }); break; }
        }
    } else if (algo === 'selection') {
        for (var i2 = 0; i2 < n - 1; i2++) {
            var minI = i2;
            push('Pass ' + (i2 + 1) + ': find the minimum in [' + i2 + '..' + (n - 1) + '].', { vars: { minI: minI }, log: 'pass' });
            for (var j2 = i2 + 1; j2 < n; j2++) {
                var h2 = {}; h2[j2] = 'compare'; h2[minI] = 'left';
                if (arr[j2] < arr[minI]) {
                    push('a[' + j2 + '] (' + arr[j2] + ') < a[' + minI + '] (' + arr[minI] + ')  \u2192 new minimum',
                        { highlight: h2, vars: { minI: j2 } });
                    minI = j2;
                } else {
                    push('a[' + j2 + '] (' + arr[j2] + ') \u2265 current min ' + arr[minI],
                        { highlight: h2, vars: { minI: minI } });
                }
            }
            if (minI !== i2) doSwap(i2, minI);
            var sortedH2 = {};
            for (var s2 = 0; s2 <= i2; s2++) sortedH2[s2] = 'found';
            push('Minimum ' + arr[i2] + ' placed at index ' + i2 + '.', { highlight: sortedH2, vars: {} });
        }
    } else { /* insertion (default, matches the page trace) */
        for (var i3 = 1; i3 < n; i3++) {
            var key = arr[i3];
            var j3 = i3 - 1;
            var h3 = {}; h3[i3] = 'pivot';
            push('Key = a[' + i3 + '] = ' + key + '. Find where it belongs in the sorted prefix.',
                { highlight: h3, vars: { key: key }, log: 'pass' });
            while (j3 >= 0 && arr[j3] > key) {
                var h4 = {}; h4[j3] = 'swap'; h4[j3 + 1] = 'compare';
                arr[j3 + 1] = arr[j3];
                push('a[' + j3 + '] (' + key + ' < ' + arr[j3] + ')  \u2192 shift a[' + j3 + '] right',
                    { highlight: h4, vars: { key: key, j: j3 } });
                j3--;
            }
            arr[j3 + 1] = key;
            var h5 = {}; h5[j3 + 1] = 'found';
            push('Place key ' + key + ' at index ' + (j3 + 1) + '.', { highlight: h5, vars: { key: key } });
        }
    }

    var finalH = {};
    for (var f = 0; f < n; f++) finalH[f] = 'found';
    push('Sorted: [' + arr.join(', ') + '].', { highlight: finalH, vars: {}, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/sorting'] = {
    title: 'Sorting — bubble / selection / insertion, step by step',
    family: 'sorting',
    defaultState: { array: [5, 2, 4, 6, 1, 3], algo: 'insertion' },
    inputs: [
        { key: 'array', label: 'Array', value: '5, 2, 4, 6, 1, 3', placeholder: '5, 2, 4, 6, 1, 3', parse: vizParseList },
        { key: 'algo', label: 'Algorithm', value: 'insertion', placeholder: 'bubble | selection | insertion',
          parse: function (s) { var v = String(s).trim().toLowerCase(); return ['bubble', 'selection', 'insertion'].indexOf(v) !== -1 ? v : 'insertion'; } }
    ],
    legend: [
        { label: 'comparing', color: 'vz-compare' },
        { label: 'swapping', color: 'vz-swap' },
        { label: 'key', color: 'vz-pivot' },
        { label: 'sorted', color: 'vz-found' }
    ],
    stepMs: 700,
    simulate: vizSortingFrames
};

VIZ_CONFIG['sorting'] = VIZ_CONFIG['topics/sorting'];
