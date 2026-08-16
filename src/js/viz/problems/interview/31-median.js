/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/31-median
   Median of Two Sorted Arrays. Binary search the partition cut on
   the smaller array A; cutB is forced by cutA + cutB = half. The
   cut is correct when max(left) <= min(right); the median follows
   from the parity of the combined length. Mounts on code/median.
   ============================================================ */

function vizIvMedianFrames(state) {
    var a = (state.array || []).slice();
    var b = (state.array2 || []).slice();
    var frames = [];

    if (!a.length && !b.length) { frames.push({ narr: 'Both arrays empty.', arr: [], vars: {}, sub: null }); return frames; }

    var A, B;
    if (a.length <= b.length) { A = a; B = b; }
    else { A = b; B = a; }

    function subKeys() {
        var ks = [];
        for (var i = 0; i < B.length; i++) ks.push(i);
        return ks;
    }

    function push(narr, extra) {
        var f = { narr: narr, arr: A, highlight: {}, vars: {}, sub: null, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    function cutState(cutA, cutB) {
        var h = {};
        for (var i = 0; i < A.length; i++) {
            if (i < cutA) h[i] = 'left';
            else if (i > cutA) h[i] = 'right';
            else h[i] = 'pivot';
        }
        var sh = {};
        for (var j = 0; j < B.length; j++) {
            if (j < cutB) sh[j] = 'left';
            else if (j > cutB) sh[j] = 'right';
            else sh[j] = 'pivot';
        }
        return { highlight: h, sub: { label: 'B', keys: subKeys(), cells: B.slice(), highlight: sh } };
    }

    var total = A.length + B.length;
    var half = Math.floor((total + 1) / 2);
    var l = 0, r = A.length;
    var cutA = 0, cutB = half;

    push('Median of two sorted arrays (' + total + ' elements). Binary search the cut on the smaller array A; cutB = half \u2212 cutA = ' + half + '. Left halves must be \u2264 right halves.',
        { vars: { l: l, r: r, cutA: cutA, cutB: cutB, maxLeft: '-', minRight: '-', median: '-' }, log: 'init' });

    var median = null;
    var mIdxA = -1, mIdxB = -1, m2IdxA = -1, m2IdxB = -1;

    while (l <= r) {
        cutA = Math.floor((l + r) / 2);
        cutB = half - cutA;
        var maxLeftA = cutA === 0 ? -Infinity : A[cutA - 1];
        var minRightA = cutA === A.length ? Infinity : A[cutA];
        var maxLeftB = cutB === 0 ? -Infinity : B[cutB - 1];
        var minRightB = cutB === B.length ? Infinity : B[cutB];
        var maxLeft = Math.max(maxLeftA, maxLeftB);
        var minRight = Math.min(minRightA, minRightB);
        var cs = cutState(cutA, cutB);
        var vL = l, vR = r;

        if (maxLeftA <= minRightB && maxLeftB <= minRightA) {
            if (total % 2 === 1) { median = maxLeft; }
            else { median = (maxLeft + minRight) / 2; }
            if (maxLeftA >= maxLeftB) mIdxA = cutA - 1; else mIdxB = cutB - 1;
            if (total % 2 === 0) {
                if (minRightA <= minRightB) m2IdxA = cutA; else m2IdxB = cutB;
            }
            var hf = {};
            if (mIdxA >= 0) hf[mIdxA] = 'found';
            if (m2IdxA >= 0) hf[m2IdxA] = 'found';
            var shf = {};
            if (mIdxB >= 0) shf[mIdxB] = 'found';
            if (m2IdxB >= 0) shf[m2IdxB] = 'found';
            push('cutA = ' + cutA + ', cutB = ' + cutB + ': maxLeft ' + maxLeft + ' \u2264 minRight ' + minRight + ' \u2192 correct partition! median = ' + median + '.',
                { highlight: hf, sub: { label: 'B', keys: subKeys(), cells: B.slice(), highlight: shf }, vars: { l: vL, r: vR, cutA: cutA, cutB: cutB, maxLeft: maxLeft, minRight: minRight, median: median }, log: 'found' });
            break;
        }
        if (maxLeftA > minRightB) {
            push('cutA = ' + cutA + ': maxLeftA ' + maxLeftA + ' > minRightB ' + minRightB + ' \u2192 too many A elements on the left, move r to ' + (cutA - 1) + '.',
                { highlight: cs.highlight, sub: cs.sub, vars: { l: vL, r: vR, cutA: cutA, cutB: cutB, maxLeft: maxLeft, minRight: minRight, median: '-' }, log: 'step' });
            r = cutA - 1;
        } else {
            push('cutA = ' + cutA + ': maxLeftB ' + maxLeftB + ' > minRightA ' + minRightA + ' \u2192 not enough A elements on the left, move l to ' + (cutA + 1) + '.',
                { highlight: cs.highlight, sub: cs.sub, vars: { l: vL, r: vR, cutA: cutA, cutB: cutB, maxLeft: maxLeft, minRight: minRight, median: '-' }, log: 'step' });
            l = cutA + 1;
        }
    }

    var hd = {};
    if (mIdxA >= 0) hd[mIdxA] = 'found';
    if (m2IdxA >= 0) hd[m2IdxA] = 'found';
    var shd = {};
    if (mIdxB >= 0) shd[mIdxB] = 'found';
    if (m2IdxB >= 0) shd[m2IdxB] = 'found';
    push('Median of [' + a.join(', ') + '] and [' + b.join(', ') + '] = ' + median + '.',
        { highlight: hd, sub: { label: 'B', keys: subKeys(), cells: B.slice(), highlight: shd }, vars: { cutA: cutA, cutB: cutB, maxLeft: maxLeft, minRight: minRight, median: median }, log: 'done' });

    return frames;
}

VIZ_CONFIG['median'] = {
    title: 'Median of Two Sorted Arrays — binary search on partition cuts',
    family: 'median',
    defaultState: { array: [1, 3], array2: [2] },
    inputs: [
        { key: 'array', label: 'Array A (sorted)', value: '1, 3', placeholder: '1, 3', parse: vizParseList },
        { key: 'array2', label: 'Array B (sorted)', value: '2', placeholder: '2', parse: vizParseList }
    ],
    legend: [
        { label: 'left half', color: 'vz-left' },
        { label: 'right half', color: 'vz-right' },
        { label: 'cut position', color: 'vz-pivot' },
        { label: 'median element(s)', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvMedianFrames
};
