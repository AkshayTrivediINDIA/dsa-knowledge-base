/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/18-searchrotated
   Search in Rotated Sorted Array. Binary search on a rotated
   array: at each mid one half is guaranteed sorted; use that
   half to decide which side the target must live in. Mounts on
   code/searchrotated.
   ============================================================ */

function vizIvSearchRotatedFrames(state) {
    var a = state.array || [];
    var target = state.target;
    var n = a.length;
    var frames = [];
    var result = -1;

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    function lrHL() {
        var h = {};
        if (l >= 0 && l < n) h[l] = 'left';
        if (r >= 0 && r < n) h[r] = 'right';
        return h;
    }

    var l = 0, r = n - 1, mid = -1;

    push('Rotated sorted array [' + a.join(', ') + '], target ' + target + '. Binary search: at every mid one half is fully sorted \u2014 use it to decide where target can be.',
        { highlight: (function () { var h = {}; h[0] = 'left'; h[n - 1] = 'right'; return h; })(), vars: { l: l, r: r, mid: '-', target: target, result: '-' }, log: 'init' });

    while (l <= r) {
        mid = l + Math.floor((r - l) / 2);
        push('mid = l + (r-l)/2 = ' + l + ' + (' + r + '-' + l + ')/2 = ' + mid + '.  a[' + mid + '] = ' + a[mid] + '.',
            { highlight: (function () { var h = {}; h[l] = 'left'; h[r] = 'right'; h[mid] = 'active'; return h; })(), vars: { l: l, r: r, mid: mid, target: target, result: '-' } });

        if (a[mid] === target) {
            result = mid;
            push('a[' + mid + '] = ' + a[mid] + ' == target ' + target + ' \u2192 FOUND at index ' + mid + '!',
                { highlight: (function () { var h = {}; h[mid] = 'found'; return h; })(), vars: { l: l, r: r, mid: mid, target: target, result: result }, log: 'found' });
            break;
        }

        if (a[l] <= a[mid]) {
            if (target >= a[l] && target < a[mid]) {
                r = mid - 1;
                push('Left half a[' + l + '..' + mid + '] sorted; target ' + target + ' in [' + a[l] + ', ' + a[mid] + ') \u2192 search left \u2192 r = ' + r + '.',
                    { highlight: lrHL(), vars: { l: l, r: r, mid: mid, target: target, result: '-' } });
            } else {
                l = mid + 1;
                push('Left half a[' + (l - 1) + '..' + mid + '] sorted; target ' + target + ' NOT in [' + a[l - 1] + ', ' + a[mid] + ') \u2192 search right \u2192 l = ' + l + '.',
                    { highlight: lrHL(), vars: { l: l, r: r, mid: mid, target: target, result: '-' } });
            }
        } else {
            if (target > a[mid] && target <= a[r]) {
                l = mid + 1;
                push('Right half a[' + mid + '..' + r + '] sorted; target ' + target + ' in (' + a[mid] + ', ' + a[r] + '] \u2192 search right \u2192 l = ' + l + '.',
                    { highlight: lrHL(), vars: { l: l, r: r, mid: mid, target: target, result: '-' } });
            } else {
                r = mid - 1;
                push('Right half a[' + mid + '..' + (r + 1) + '] sorted; target ' + target + ' NOT in (' + a[mid] + ', ' + a[r + 1] + '] \u2192 search left \u2192 r = ' + r + '.',
                    { highlight: lrHL(), vars: { l: l, r: r, mid: mid, target: target, result: '-' } });
            }
        }
    }

    if (result >= 0) {
        push('Done \u2014 target ' + target + ' found at index ' + result + '.',
            { highlight: (function () { var h = {}; h[result] = 'found'; return h; })(), vars: { l: '-', r: '-', mid: '-', target: target, result: result }, log: 'done' });
    } else {
        push('Done \u2014 target ' + target + ' not in the array \u2192 result = -1.',
            { highlight: {}, vars: { l: '-', r: '-', mid: '-', target: target, result: -1 }, log: 'done' });
    }

    return frames;
}

VIZ_CONFIG['searchrotated'] = {
    title: 'Search in Rotated Sorted Array — binary search the sorted half',
    family: 'searchrotated',
    defaultState: { array: [4, 5, 6, 7, 0, 1, 2], target: 0 },
    inputs: [
        { key: 'array', label: 'Array (rotated)', value: '4, 5, 6, 7, 0, 1, 2', placeholder: '4, 5, 6, 7, 0, 1, 2', parse: vizParseList },
        { key: 'target', label: 'Target', value: '0', placeholder: '0', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'l', color: 'vz-left' },
        { label: 'mid', color: 'vz-active' },
        { label: 'r', color: 'vz-right' },
        { label: 'found', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvSearchRotatedFrames
};
