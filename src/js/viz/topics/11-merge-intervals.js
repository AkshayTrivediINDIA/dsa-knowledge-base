/* ============================================================
   DSA Knowledge Base - module: viz/topics/11-merge-intervals
   Sort intervals by start, then merge overlapping ones. The main
   row is the sorted intervals; the sub row is the running result.
   Mounts on topics/merge-intervals; inherited by code/merge-intervals.
   ============================================================ */

function vizParseIntervals(s) {
    return String(s || '').split(';').map(function (seg) {
        var nums = String(seg).trim().split(/[\s,]+/).map(function (t) { return parseInt(t, 10); }).filter(function (x) { return !isNaN(x); });
        return nums.length >= 2 ? [nums[0], nums[1]] : null;
    }).filter(function (x) { return x; });
}

function vizMergeIntervalsFrames(state) {
    var intervals = (state.intervals || []).map(function (iv) { return [iv[0], iv[1]]; });
    var n = intervals.length;
    var frames = [];
    var result = [];

    function fmt(iv) { return '[' + iv[0] + ',' + iv[1] + ']'; }

    function push(narr, extra) {
        var f = { narr: narr, arr: intervals.map(function (iv) { return fmt(iv); }), highlight: {}, sub: null, vars: {} };
        for (var k in extra) f[k] = extra[k];
        if (!extra.sub) f.sub = { label: 'merged result', cells: result.map(fmt) };
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty list.', arr: [], vars: {} }); return frames; }

    push('Merge overlapping intervals. First sort by start.',
        { highlight: {}, sub: { label: 'merged result', cells: [] }, vars: {}, log: 'init' });

    intervals.sort(function (a, b) { return a[0] - b[0]; });
    push('Sorted by start: ' + intervals.map(fmt).join(' ') + '.',
        { highlight: {}, sub: { label: 'merged result', cells: [] }, vars: {} });

    result.push(intervals[0]);
    var h = {}; h[0] = 'active';
    push('Take ' + fmt(intervals[0]) + ' (result is empty \u2192 accept).',
        { highlight: h, sub: { label: 'merged result', cells: result.map(fmt) }, vars: {}, log: 'take' });

    for (var i = 1; i < n; i++) {
        var cur = intervals[i];
        var last = result[result.length - 1];
        var h2 = {}; h2[i] = 'compare'; h2[i - 1] = 'active';
        if (cur[0] <= last[1]) {
            var newEnd = Math.max(last[1], cur[1]);
            push(fmt(cur) + ' overlaps ' + fmt(last) + ' (start ' + cur[0] + ' \u2264 end ' + last[1] + ')  \u2192 merge, end grows to ' + newEnd,
                { highlight: h2, sub: { label: 'merged result', cells: result.map(fmt) }, vars: { merges: true }, log: 'merge' });
            last[1] = newEnd;
            push('Merged: ' + fmt(last) + '.', { highlight: h2, sub: { label: 'merged result', cells: result.map(fmt) }, vars: {} });
        } else {
            result.push(cur);
            push(fmt(cur) + ' is disjoint from ' + fmt(last) + ' (start ' + cur[0] + ' > end ' + last[1] + ')  \u2192 append as new interval.',
                { highlight: h2, sub: { label: 'merged result', cells: result.map(fmt) }, vars: {}, log: 'disjoint' });
        }
    }

    push('Merged intervals: ' + result.map(fmt).join(' ') + '.  (' + result.length + ' intervals)',
        { highlight: {}, sub: { label: 'merged result', cells: result.map(fmt) }, vars: { count: result.length }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/merge-intervals'] = {
    title: 'Merge Intervals — sort by start, merge overlaps',
    family: 'merge-intervals',
    defaultState: { intervals: [[8, 10], [1, 3], [15, 18], [2, 6]] },
    inputs: [
        { key: 'intervals', label: 'Intervals (pairs with ;)', value: '8 10; 1 3; 15 18; 2 6', placeholder: '8 10; 1 3; 15 18; 2 6', parse: vizParseIntervals }
    ],
    legend: [
        { label: 'current interval', color: 'vz-compare' },
        { label: 'merging into', color: 'vz-active' }
    ],
    stepMs: 1000,
    simulate: vizMergeIntervalsFrames
};

VIZ_CONFIG['merge-intervals'] = VIZ_CONFIG['topics/merge-intervals'];
