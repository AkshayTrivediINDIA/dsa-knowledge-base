/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/19-firstlast
   Find First and Last Position of Element in Sorted Array.
   Two binary searches: first occurrence (a[mid] >= target keeps
   pushing r = mid - 1 left) then last occurrence (a[mid] <=
   target keeps pushing l = mid + 1 right). Mounts on code/firstlast.
   ============================================================ */

function vizIvFirstLastFrames(state) {
    var a = state.array || [];
    var target = state.target;
    var n = a.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array \u2192 [-1, -1].', arr: [], vars: {}, sub: null }); return frames; }

    var l = 0, r = n - 1, mid = -1;
    var first = -1, last = -1;

    function lrHL() {
        var h = {};
        if (l >= 0 && l < n) h[l] = 'left';
        if (r >= 0 && r < n) h[r] = 'right';
        return h;
    }
    function midHL() {
        var h = {};
        if (l >= 0 && l < n) h[l] = 'left';
        if (r >= 0 && r < n) h[r] = 'right';
        h[mid] = 'active';
        return h;
    }
    function varsNow() {
        return { l: l, r: r, mid: mid === -1 ? '-' : mid, target: target, first: first, last: last };
    }

    push('Sorted array [' + a.join(', ') + '], target ' + target + '. Pass 1 finds the FIRST occurrence: probe mid; if a[mid] \u2265 target, push r = mid - 1 left to keep chasing the leftmost match.',
        { vars: { l: l, r: r, mid: '-', target: target, first: first, last: last }, log: 'init' });

    while (l <= r) {
        mid = l + Math.floor((r - l) / 2);
        push('Pass 1 \u2014 l = ' + l + ', r = ' + r + ': mid = ' + mid + ', a[' + mid + '] = ' + a[mid] + '.',
            { highlight: midHL(), vars: varsNow() });
        if (a[mid] >= target) {
            r = mid - 1;
            push('a[' + mid + '] = ' + a[mid] + ' \u2265 target ' + target + ' \u2192 could be the first \u2192 r = ' + r + '.',
                { highlight: lrHL(), vars: varsNow() });
        } else {
            l = mid + 1;
            push('a[' + mid + '] = ' + a[mid] + ' < target ' + target + ' \u2192 first must be to the right \u2192 l = ' + l + '.',
                { highlight: lrHL(), vars: varsNow() });
        }
    }
    if (l < n && a[l] === target) first = l;
    push('Pass 1 done \u2014 first = ' + (first >= 0 ? first : '-1') + '.',
        { highlight: (function () { var h = {}; if (first >= 0) h[first] = 'found'; return h; })(), vars: varsNow(), log: 'step' });

    l = 0; r = n - 1; mid = -1;
    push('Pass 2 finds the LAST occurrence of target ' + target + ': probe mid; if a[mid] \u2264 target, push l = mid + 1 right to chase the rightmost match.',
        { vars: { l: l, r: r, mid: '-', target: target, first: first, last: last }, log: 'step' });

    while (l <= r) {
        mid = l + Math.floor((r - l) / 2);
        push('Pass 2 \u2014 l = ' + l + ', r = ' + r + ': mid = ' + mid + ', a[' + mid + '] = ' + a[mid] + '.',
            { highlight: midHL(), vars: varsNow() });
        if (a[mid] <= target) {
            l = mid + 1;
            push('a[' + mid + '] = ' + a[mid] + ' \u2264 target ' + target + ' \u2192 could be the last \u2192 l = ' + l + '.',
                { highlight: lrHL(), vars: varsNow() });
        } else {
            r = mid - 1;
            push('a[' + mid + '] = ' + a[mid] + ' > target ' + target + ' \u2192 last must be to the left \u2192 r = ' + r + '.',
                { highlight: lrHL(), vars: varsNow() });
        }
    }
    if (r >= 0 && a[r] === target) last = r;
    push('Pass 2 done \u2014 last = ' + (last >= 0 ? last : '-1') + '.',
        { highlight: (function () { var h = {}; if (last >= 0) h[last] = 'found'; return h; })(), vars: varsNow(), log: 'step' });

    push('Answer: [' + first + ', ' + last + '] \u2014 first = ' + first + ', last = ' + last + '.',
        { highlight: (function () { var h = {}; if (first >= 0) h[first] = 'found'; if (last >= 0) h[last] = 'found'; return h; })(), vars: { l: '-', r: '-', mid: '-', target: target, first: first, last: last }, log: 'done' });

    return frames;
}

VIZ_CONFIG['firstlast'] = {
    title: 'Find First and Last Position — two binary searches',
    family: 'firstlast',
    defaultState: { array: [5, 7, 7, 8, 8, 10], target: 8 },
    inputs: [
        { key: 'array', label: 'Array (sorted)', value: '5, 7, 7, 8, 8, 10', placeholder: '5, 7, 7, 8, 8, 10', parse: vizParseList },
        { key: 'target', label: 'Target', value: '8', placeholder: '8', parse: function (s) { return parseInt(s, 10) || 0; } }
    ],
    legend: [
        { label: 'l', color: 'vz-left' },
        { label: 'mid', color: 'vz-active' },
        { label: 'r', color: 'vz-right' },
        { label: 'bound', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvFirstLastFrames
};
