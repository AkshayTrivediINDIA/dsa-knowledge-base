/* ============================================================
   DSA Knowledge Base - module: viz/topics/20-inversion-count
   Inversion Count via merge sort. Every element taken from the
   right half before a left element creates (mid - left_i + 1)
   inversions with the untouched left remainder. Counting happens
   during each merge. Mounts on topics/inversion-count.
   ============================================================ */

function vizInversionCountFrames(state) {
    var a = (state.array || []).slice();
    var n = a.length;
    var frames = [];
    var count = 0;
    var cur = a.slice();

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null, window: null };
        for (var key in extra) f[key] = extra[key];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array \u2192 0 inversions.', arr: [], vars: {}, sub: null, log: 'done' }); return frames; }

    function merge(lo, mid, hi) {
        var left = lo;
        var right = mid + 1;
        var temp = [];
        var taken = 0;

        function subRow() {
            var row = { label: 'merged', keys: [], cells: temp.slice() };
            if (taken > 0) { row.highlight = {}; row.highlight[taken - 1] = 'active'; }
            return row;
        }

        while (left <= mid && right <= hi) {
            var hl = {}; hl[left] = 'compare'; hl[right] = 'compare';
            push('Compare a[' + left + '] = ' + cur[left] + ' vs a[' + right + '] = ' + cur[right] + ' inside window [' + lo + '..' + hi + '].',
                { highlight: hl, vars: { lo: lo, mid: mid, hi: hi, count: count, taken: taken, left_i: left }, window: { start: lo, end: hi, label: 'merge' }, sub: subRow() });
            if (cur[left] <= cur[right]) {
                temp.push(cur[left]);
                var hl2 = {}; hl2[left] = 'active'; hl2[right] = 'compare';
                push('a[' + left + '] = ' + cur[left] + ' \u2264 a[' + right + '] = ' + cur[right] + ' \u2192 take LEFT \u2192 merged[' + taken + '] = ' + cur[left] + '. No new inversions.',
                    { highlight: hl2, vars: { lo: lo, mid: mid, hi: hi, count: count, taken: taken + 1, left_i: left + 1 }, window: { start: lo, end: hi, label: 'merge' }, sub: subRow() });
                left++;
            } else {
                var inv = mid - left + 1;
                temp.push(cur[right]);
                count += inv;
                var hl3 = {}; hl3[left] = 'compare'; hl3[right] = 'active';
                push('a[' + right + '] = ' + cur[right] + ' < a[' + left + '] = ' + cur[left] + ' \u2192 take RIGHT \u2192 merged[' + taken + '] = ' + cur[right] + '. All ' + inv + ' of a[' + left + '..' + mid + '] are bigger \u2192 +' + inv + ' inversions, count = ' + count + '.',
                    { highlight: hl3, vars: { lo: lo, mid: mid, hi: hi, count: count, taken: taken + 1, left_i: left }, window: { start: lo, end: hi, label: 'merge' }, sub: subRow(), log: 'inversions' });
                right++;
            }
            taken++;
        }
        while (left <= mid) {
            temp.push(cur[left]);
            var hl4 = {}; hl4[left] = 'active';
            push('Right half drained \u2192 copy leftover a[' + left + '] = ' + cur[left] + ' to merged[' + taken + ']. No more inversions here.',
                { highlight: hl4, vars: { lo: lo, mid: mid, hi: hi, count: count, taken: taken + 1, left_i: left + 1 }, window: { start: lo, end: hi, label: 'merge' }, sub: subRow() });
            left++; taken++;
        }
        while (right <= hi) {
            temp.push(cur[right]);
            var hl5 = {}; hl5[right] = 'active';
            push('Left half drained \u2192 copy leftover a[' + right + '] = ' + cur[right] + ' to merged[' + taken + '].',
                { highlight: hl5, vars: { lo: lo, mid: mid, hi: hi, count: count, taken: taken + 1, left_i: mid + 1 }, window: { start: lo, end: hi, label: 'merge' }, sub: subRow() });
            right++; taken++;
        }
        for (var i = lo; i <= hi; i++) cur[i] = temp[i - lo];
        var hd = {};
        for (var j = lo; j <= hi; j++) hd[j] = 'soft';
        push('Merge complete: a[' + lo + '..' + hi + '] is now [' + temp.join(', ') + ']. Running inversion count = ' + count + '.',
            { highlight: hd, vars: { lo: lo, mid: mid, hi: hi, count: count, taken: taken, left_i: left }, window: { start: lo, end: hi, label: 'sorted' }, sub: null });
    }

    function sortRange(lo, hi) {
        if (lo >= hi) return;
        var mid = lo + Math.floor((hi - lo) / 2);
        push('Split [' + lo + '..' + hi + '] \u2192 left [' + lo + '..' + mid + '], right [' + (mid + 1) + '..' + hi + '].',
            { highlight: (function () { var h = {}; for (var i = lo; i <= hi; i++) h[i] = 'compare'; return h; })(), vars: { lo: lo, mid: mid, hi: hi, count: count, taken: 0, left_i: lo }, window: { start: lo, end: hi, label: 'divide' } });
        sortRange(lo, mid);
        sortRange(mid + 1, hi);
        merge(lo, mid, hi);
    }

    push('Inversion Count: count pairs i < j with a[i] > a[j] via merge sort \u2014 counting during merges. a = [' + a.join(', ') + '].',
        { highlight: {}, vars: { lo: 0, mid: '-', hi: n - 1, count: 0, taken: 0, left_i: 0 }, log: 'init' });

    sortRange(0, n - 1);

    var hf = {};
    for (var fi = 0; fi < n; fi++) hf[fi] = 'found';
    push('Total inversions = ' + count + '. (Array sorted as a side effect: [' + cur.join(', ') + '].)',
        { highlight: hf, vars: { lo: 0, hi: n - 1, count: count, taken: '-', left_i: '-' }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/inversion-count'] = {
    title: 'Inversion Count \u2014 merge sort counting',
    family: 'inversioncount',
    defaultState: { array: [8, 4, 2, 1] },
    inputs: [
        { key: 'array', label: 'Array', value: '8, 4, 2, 1', placeholder: '8, 4, 2, 1', parse: vizParseList }
    ],
    legend: [
        { label: 'compare pair', color: 'vz-compare' },
        { label: 'element being merged', color: 'vz-active' },
        { label: 'sorted segment', color: 'vz-soft' },
        { label: 'counted inversions', color: 'vz-found' }
    ],
    stepMs: 1100,
    simulate: vizInversionCountFrames
};

VIZ_CONFIG['inversioncount'] = VIZ_CONFIG['topics/inversion-count'];
