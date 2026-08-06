/* ============================================================
   DSA Knowledge Base - module: viz/topics/04-sliding-window
   Fixed-size window of k slides right; sum updated in O(1)
   by adding a[right] and subtracting a[left-1].
   Mounts on topics/sliding-window; inherited by code/sliding-window.
   ============================================================ */

function vizSlidingWindowFrames(state) {
    var arr = state.array || [];
    var k = Math.max(state.k || 3, 1);
    var n = arr.length;
    var frames = [];

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }
    if (k > n) k = n;

    var sum = 0;
    var l = 0, r = k - 1;
    for (var i = 0; i < k; i++) sum += arr[i];

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, window: { start: l, end: r }, vars: {} };
        for (var kk in extra) f[kk] = extra[kk];
        frames.push(f);
    }

    push('Window [' + l + '..' + r + '] of size ' + k + ': sum = ' + sum + '. Best so far = ' + sum + '.',
        { vars: { l: l, r: r, sum: sum, best: sum }, log: 'init' });

    var best = sum;
    for (var right = k; right < n; right++) {
        var left = right - k + 1;
        var prevSum = sum;
        sum = sum - arr[left - 1] + arr[right];
        var isBest = sum > best;
        if (isBest) best = sum;
        l = left; r = right;
        push('Slide right: sum = ' + prevSum + ' - a[' + (left - 1) + '] (' + arr[left - 1] + ') + a[' + right + '] (' + arr[right] + ') = ' + sum + (isBest ? '  \u2192 NEW BEST' : ''),
            { vars: { l: l, r: r, sum: sum, best: best }, log: isBest ? 'new best' : 'slide' });
    }

    var finalH = {};
    for (var i2 = 0; i2 < n; i2++) finalH[i2] = 'dim';
    var bl = -1, br = -1;
    for (var s = 0; s + k <= n; s++) {
        var ssum = 0;
        for (var t = s; t < s + k; t++) ssum += arr[t];
        if (ssum === best) { bl = s; br = s + k - 1; break; }
    }
    for (var i3 = bl; i3 <= br; i3++) finalH[i3] = 'found';
    push('Maximum sum = ' + best + ', achieved by window [' + bl + '..' + br + ']. O(n) total.',
        { highlight: finalH, window: null, vars: { best: best, at: '[' + bl + '..' + br + ']' }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/sliding-window'] = {
    title: 'Sliding Window — max sum of a fixed-size subarray',
    family: 'sliding-window',
    defaultState: { array: [2, 1, 5, 1, 3, 2], k: 3 },
    inputs: [
        { key: 'array', label: 'Array', value: '2, 1, 5, 1, 3, 2', placeholder: '2, 1, 5, 1, 3, 2', parse: vizParseList },
        { key: 'k', label: 'Window size k', value: '3', placeholder: '3', parse: function (s) { return parseInt(s, 10) || 1; } }
    ],
    legend: [
        { label: 'window', color: 'vz-soft' },
        { label: 'best window', color: 'vz-found' }
    ],
    stepMs: 1100,
    simulate: vizSlidingWindowFrames
};

VIZ_CONFIG['sliding-window'] = VIZ_CONFIG['topics/sliding-window'];
