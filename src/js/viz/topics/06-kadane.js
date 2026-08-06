/* ============================================================
   DSA Knowledge Base - module: viz/topics/06-kadane
   Kadane: cur = max(a[i], cur + a[i]) keeps the best sum ending
   at i; best tracks the best anywhere. The cur subarray is shown
   as a growing/shrinking window.
   Mounts on topics/kadane; inherited by code/kadane.
   ============================================================ */

function vizKadaneFrames(state) {
    var arr = state.array || [];
    var n = arr.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        if (!extra.window) delete f.window;
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    var cur = arr[0], best = arr[0];
    var curStart = 0, bestStart = 0, bestEnd = 0;

    push('Kadane walks left to right. cur = best sum of a subarray ENDING at i; best = max over all i.',
        { vars: { i: 0, cur: cur, best: best }, window: { start: 0, end: 0 }, log: 'init' });

    for (var i = 1; i < n; i++) {
        var oldCur = cur;
        var restart = arr[i] > oldCur + arr[i];
        if (restart) { cur = arr[i]; curStart = i; }
        else cur = oldCur + arr[i];
        if (cur > best) { best = cur; bestStart = curStart; bestEnd = i; }
        push('i = ' + i + ': cur = max(a[' + i + '], cur + a[' + i + ']) = max(' + arr[i] + ', ' + oldCur + ' + ' + arr[i] + ') = ' + cur + (restart ? '  \u2192 restart at a[' + i + ']' : '') + (cur === best && i === bestEnd ? '  \u2192 NEW BEST' : ''),
            { vars: { i: i, cur: cur, best: best }, window: { start: curStart, end: i }, log: restart ? 'restart' : (cur === best ? 'new best' : 'step') });
    }

    var finalH = {};
    for (var j = 0; j < n; j++) finalH[j] = 'dim';
    for (var k = bestStart; k <= bestEnd; k++) finalH[k] = 'found';
    push('Maximum subarray sum = ' + best + ' at [' + bestStart + '..' + bestEnd + ']' + (bestEnd - bestStart + 1 > 1 ? '  (' + arr.slice(bestStart, bestEnd + 1).join(', ') + ')' : '') + '. O(n).',
        { highlight: finalH, window: null, vars: { best: best, at: '[' + bestStart + '..' + bestEnd + ']' }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/kadane'] = {
    title: "Kadane's Algorithm — maximum subarray sum",
    family: 'kadane',
    defaultState: { array: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    inputs: [
        { key: 'array', label: 'Array (can be negative)', value: '-2, 1, -3, 4, -1, 2, 1, -5, 4', placeholder: '-2, 1, -3, 4, -1, 2, 1, -5, 4', parse: vizParseList }
    ],
    legend: [
        { label: 'current subarray', color: 'vz-active' },
        { label: 'best subarray', color: 'vz-found' }
    ],
    stepMs: 1000,
    simulate: vizKadaneFrames
};

VIZ_CONFIG['kadane'] = VIZ_CONFIG['topics/kadane'];
