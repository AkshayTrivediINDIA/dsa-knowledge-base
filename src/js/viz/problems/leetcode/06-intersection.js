/* ============================================================
   DSA Knowledge Base - module: viz/problems/leetcode/06-intersection
   Intersection of Two Arrays: put the smaller array into a
   hashset, then scan the other keeping only values already in the
   set (deduped). The sub-row shows the result. Mounts on
   code/intersection.
   ============================================================ */

function vizLcIntersectionFrames(state) {
    var a = state.a || [];
    var b = state.b || [];
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: a, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!a.length) { frames.push({ narr: 'Empty array — no intersection.', arr: [], vars: {}, sub: null }); return frames; }

    var set = {};
    var setList = [];
    var result = [];

    push('Put array a into a hashset, then scan b: keep only values already in the set (add each at most once).',
        { vars: { building: true }, sub: { label: 'set(a)', keys: [], cells: [] }, log: 'init' });

    for (var i = 0; i < a.length; i++) {
        if (set[a[i]] === undefined) {
            set[a[i]] = true;
            setList.push(a[i]);
        }
    }
    push('Set built from a: {' + setList.join(', ') + '}.',
        { sub: { label: 'set(a)', keys: setList.slice(), cells: setList.slice() }, vars: {} });

    for (var j = 0; j < b.length; j++) {
        var hb = {};
        hb[j] = 'active';
        if (set[b[j]] && result.indexOf(b[j]) === -1) {
            result.push(b[j]);
            var hr = {};
            hr[j] = 'found';
            push('b[' + j + '] = ' + b[j] + ' is in set(a) and not yet in result \u2192 add. Result: [' + result.join(', ') + '].',
                { highlight: hr, vars: { j: j, result: result.join(',') }, sub: { label: 'set(a)', keys: setList.slice(), cells: setList.slice(), highlight: (function () { var x = {}; for (var s = 0; s < setList.length; s++) if (setList[s] === b[j]) x[s] = 'found'; return x; })() }, log: 'match' });
        } else if (set[b[j]]) {
            push('b[' + j + '] = ' + b[j] + ' already in result \u2014 skip (dedupe).',
                { highlight: hb, vars: { j: j, result: result.join(',') }, sub: { label: 'set(a)', keys: setList.slice(), cells: setList.slice() } });
        } else {
            push('b[' + j + '] = ' + b[j] + ' not in set(a) \u2014 skip.',
                { highlight: hb, vars: { j: j, result: result.join(',') }, sub: { label: 'set(a)', keys: setList.slice(), cells: setList.slice() } });
        }
    }

    push('Intersection = [' + result.join(', ') + '].',
        { vars: { result: result.join(',') || 'none' }, sub: { label: 'set(a)', keys: setList.slice(), cells: setList.slice() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['intersection'] = {
    title: 'Intersection of Two Arrays — hashset lookup',
    family: 'intersection',
    defaultState: { a: [1, 2, 2, 1], b: [2, 2] },
    inputs: [
        { key: 'a', label: 'Array a', value: '1, 2, 2, 1', placeholder: '1, 2, 2, 1', parse: vizParseList },
        { key: 'b', label: 'Array b', value: '2, 2', placeholder: '2, 2', parse: vizParseList }
    ],
    legend: [
        { label: 'examining b', color: 'vz-active' },
        { label: 'common value', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizLcIntersectionFrames
};
