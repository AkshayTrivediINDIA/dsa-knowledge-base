/* ============================================================
   DSA Knowledge Base - module: viz/topics/05-two-pointers
   Two Sum II walk: l/r pointers converge, pair sum probed,
   too-big (r--) / too-small (l++) verdicts, found flash.
   Mounts on topics/two-pointers and inherits on code/two-pointers.
   ============================================================ */

function vizTwoPointersFrames(state) {
    var arr = state.array || [];
    var target = state.target;
    var frames = [];
    var l = 0;
    var r = arr.length - 1;

    function push(narr, extra) {
        var f = {
            narr: narr,
            arr: arr,
            pointers: { l: { idx: l, color: 'left' }, r: { idx: r, color: 'right' } },
            highlight: {},
            vars: { l: l, r: r, sum: (extra && extra.sum !== undefined) ? extra.sum : '-', target: target }
        };
        f.highlight[l] = 'left';
        f.highlight[r] = 'right';
        if (extra) for (var k in extra) if (k !== 'sum') f[k] = extra[k];
        frames.push(f);
    }

    if (!arr.length) {
        frames.push({ narr: 'Empty array — nothing to search.', arr: [], pointers: {}, highlight: {}, vars: {} });
        return frames;
    }

    push('Start at opposite ends: l = 0, r = ' + r + '. Probe a[l] + a[r].', { log: 'init' });

    while (l < r) {
        var s = arr[l] + arr[r];
        if (s === target) {
            push('FOUND! a[' + l + '] + a[' + r + '] = ' + arr[l] + ' + ' + arr[r] + ' = ' + target,
                { sum: s, found: [l, r], log: 'found' });
            return frames;
        }
        if (s < target) {
            push('a[' + l + '] + a[' + r + '] = ' + arr[l] + ' + ' + arr[r] + ' = ' + s + '  (too small) \u2192 move l right, l++',
                { sum: s, log: 'too small' });
            l++;
        } else {
            push('a[' + l + '] + a[' + r + '] = ' + arr[l] + ' + ' + arr[r] + ' = ' + s + '  (too big) \u2192 move r left, r--',
                { sum: s, log: 'too big' });
            r--;
        }
    }

    push('l \u2265 r: no pair sums to ' + target + '.', { log: 'none' });
    return frames;
}

VIZ_CONFIG['topics/two-pointers'] = {
    title: 'Two Pointers — find a pair summing to target',
    family: 'two-pointers',
    defaultState: { array: [1, 3, 4, 5, 7, 10, 11], target: 9 },
    inputs: [
        { key: 'array', label: 'Array (sorted)', value: '1, 3, 4, 5, 7, 10, 11', placeholder: '1, 3, 4, 5, 7, 10, 11', parse: vizParseList },
        { key: 'target', label: 'Target', value: '9', placeholder: '9', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'left pointer', color: 'vz-left' },
        { label: 'right pointer', color: 'vz-right' },
        { label: 'found pair', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizTwoPointersFrames
};

/* code/two-pointers and code/twopointer inherit the same trace */
VIZ_CONFIG['two-pointers'] = VIZ_CONFIG['topics/two-pointers'];
VIZ_CONFIG['twopointer'] = VIZ_CONFIG['topics/two-pointers'];
