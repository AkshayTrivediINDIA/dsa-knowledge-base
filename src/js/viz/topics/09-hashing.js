/* ============================================================
   DSA Knowledge Base - module: viz/topics/09-hashing
   Frequency count with a hash map; the map row is rendered as
   key-value buckets that grow as elements are read.
   Mounts on topics/hashing; inherited by code/hashing.
   ============================================================ */

function vizHashingFrames(state) {
    var arr = state.array || [];
    var n = arr.length;
    var frames = [];
    var freq = {};

    function push(narr, extra) {
        var f = { narr: narr, arr: arr, highlight: {}, sub: null, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array.', arr: [], vars: {} }); return frames; }

    function bucketView(activeKey) {
        var keys = Object.keys(freq).sort(function (a, b) { return a - b; });
        var cells = [], high = {};
        keys.forEach(function (k, idx) {
            cells.push(freq[k]);
            if (String(activeKey) === k) high[idx] = 'found';
        });
        return { label: 'hash map  (key \u00d7 count)', keys: keys, cells: cells, highlight: high };
    }

    var best = null, bestCount = 0;
    push('Count frequencies with a hash map. Each element costs O(1) to insert/update.',
        { sub: bucketView(null), vars: { best: '\u2014', bestCount: 0 }, log: 'init' });

    for (var i = 0; i < n; i++) {
        var v = arr[i];
        freq[v] = (freq[v] || 0) + 1;
        var h = {}; h[i] = 'active';
        if (freq[v] > bestCount) { best = v; bestCount = freq[v]; }
        push('Read a[' + i + '] = ' + v + ': freq[' + v + '] = ' + freq[v] + (freq[v] > 1 ? '  \u2192 increment existing bucket' : '  \u2192 new bucket') + (v === best && freq[v] === bestCount && freq[v] > 1 ? '  \u2192 NEW LEADER' : ''),
            { highlight: h, sub: bucketView(v), vars: { i: i, elem: v, best: best, bestCount: bestCount }, log: 'count' });
    }

    var finalH = {};
    for (var j = 0; j < n; j++) finalH[j] = 'dim';
    for (var k2 = 0; k2 < n; k2++) if (arr[k2] === best) finalH[k2] = 'found';
    push('Most frequent element = ' + best + ' (appears ' + bestCount + ' times). One pass, O(n).',
        { highlight: finalH, sub: bucketView(null), vars: { best: best, bestCount: bestCount }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/hashing'] = {
    title: 'Hashing — frequency count with a hash map',
    family: 'hashing',
    defaultState: { array: [4, 2, 4, 5, 2, 2, 4, 4] },
    inputs: [
        { key: 'array', label: 'Array', value: '4, 2, 4, 5, 2, 2, 4, 4', placeholder: '4, 2, 4, 5, 2, 2, 4, 4', parse: vizParseList }
    ],
    legend: [
        { label: 'reading element', color: 'vz-active' },
        { label: 'bucket updated', color: 'vz-found' },
        { label: 'most frequent', color: 'vz-found' }
    ],
    stepMs: 950,
    simulate: vizHashingFrames
};

VIZ_CONFIG['hashing'] = VIZ_CONFIG['topics/hashing'];
