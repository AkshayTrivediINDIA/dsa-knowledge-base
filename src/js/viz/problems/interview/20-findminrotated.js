/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/20-findminrotated
   Find Minimum in Rotated Sorted Array. Binary search: the
   minimum sits at the pivot. Comparing nums[mid] with nums[r]
   tells which side of mid the pivot lies on, so the search
   space halves each step. Mounts on code/findminrotated.
   ============================================================ */

function vizIvFindMinRotatedFrames(state) {
    var nums = state.array || [];
    var n = nums.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nums, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {}, sub: null }); return frames; }

    var l = 0, r = n - 1, mid = 0, min = 0;

    push('Rotated sorted array [' + nums.join(', ') + ']. Binary search for the pivot: if nums[mid] > nums[r] the minimum is to the right of mid; else it is at mid or to its left. O(log n).',
        { highlight: (function () { var h = {}; h[0] = 'left'; h[n - 1] = 'right'; return h; })(), vars: { l: l, r: r, mid: '-', min: '-' }, log: 'init' });

    while (l < r) {
        mid = (l + r) >> 1;
        var h = {};
        h[l] = 'left'; h[r] = 'right'; h[mid] = 'active';
        if (nums[mid] > nums[r]) {
            push('mid = ' + mid + ': nums[' + mid + '] = ' + nums[mid] + ' > nums[' + r + '] = ' + nums[r] + ' \u2192 pivot is to the right \u2192 l = ' + (mid + 1) + '.',
                { highlight: h, vars: { l: l, r: r, mid: mid, min: '-' } });
            l = mid + 1;
        } else {
            push('mid = ' + mid + ': nums[' + mid + '] = ' + nums[mid] + ' \u2264 nums[' + r + '] = ' + nums[r] + ' \u2192 pivot is at mid or to the left \u2192 r = ' + mid + '.',
                { highlight: h, vars: { l: l, r: r, mid: mid, min: '-' } });
            r = mid;
        }
    }

    min = nums[l];
    push('l = r = ' + l + ' \u2192 pivot found. Minimum = nums[' + l + '] = ' + min + '.',
        { highlight: (function () { var h = {}; h[l] = 'found'; return h; })(), vars: { l: l, r: r, mid: l, min: min }, log: 'done' });

    return frames;
}

VIZ_CONFIG['findminrotated'] = {
    title: 'Find Minimum in Rotated Sorted Array — binary search the pivot',
    family: 'findminrotated',
    defaultState: { array: [4, 5, 6, 7, 0, 1, 2] },
    inputs: [
        { key: 'array', label: 'Array (rotated)', value: '4, 5, 6, 7, 0, 1, 2', placeholder: '4, 5, 6, 7, 0, 1, 2', parse: vizParseList }
    ],
    legend: [
        { label: 'l', color: 'vz-left' },
        { label: 'mid', color: 'vz-active' },
        { label: 'r', color: 'vz-right' },
        { label: 'minimum', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvFindMinRotatedFrames
};
