/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/14-trappingwater
   Trapping Rain Water. Two pointers from the edges, tracking the
   max height seen on each side; the shorter wall decides how much
   water sits on the current bar. The sub-row accumulates the water
   per bar. Mounts on code/trappingwater.
   ============================================================ */

function vizIvTrappingWaterFrames(state) {
    var h = state.array || [];
    var n = h.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: h, highlight: {}, vars: {}, sub: null, bars: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — 0 water.', arr: [], vars: {}, sub: null }); return frames; }

    var l = 0, r = n - 1;
    var lMax = 0, rMax = 0;
    var total = 0;
    var per = new Array(n).fill(0);

    push('Two pointers l, r from the edges. The lower of the two side-maxima determines water on the current bar.',
        { vars: { l: l, r: r, lMax: 0, rMax: 0, water: 0 }, sub: { label: 'water per bar', keys: [], cells: [] }, log: 'init' });

    while (l <= r) {
        var hl = {}, hr = {};
        hl[l] = 'left'; hr[r] = 'right';
        if (lMax <= rMax) {
            lMax = Math.max(lMax, h[l]);
            var w = lMax - h[l];
            total += w;
            per[l] = w;
            var hw = {};
            hw[l] = 'found';
            if (w > 0) {
                push('Left wall controls (lMax ' + lMax + ' \u2264 rMax ' + rMax + '): bar ' + l + ' holds ' + w + ' unit' + (w === 1 ? '' : 's') + '. total = ' + total + '.',
                    { highlight: hw, vars: { l: l, r: r, lMax: lMax, rMax: rMax, water: total }, sub: { label: 'water per bar', keys: (function () { var a = []; for (var i = 0; i <= l; i++) if (per[i] > 0) a.push(i); return a; })(), cells: per.slice(0, l + 1).map(function (x) { return x > 0 ? x : ''; }) }, log: 'add' });
            } else {
                push('Left wall controls: bar ' + l + ' (' + h[l] + ') is a peak / exposed \u2014 0 water.', { highlight: hw, vars: { l: l, r: r, lMax: lMax, rMax: rMax, water: total } });
            }
            l++;
        } else {
            rMax = Math.max(rMax, h[r]);
            var w2 = rMax - h[r];
            total += w2;
            per[r] = w2;
            var hw2 = {};
            hw2[r] = 'found';
            if (w2 > 0) {
                push('Right wall controls (rMax ' + rMax + ' < lMax ' + lMax + '): bar ' + r + ' holds ' + w2 + ' unit' + (w2 === 1 ? '' : 's') + '. total = ' + total + '.',
                    { highlight: hw2, vars: { l: l, r: r, lMax: lMax, rMax: rMax, water: total }, sub: { label: 'water per bar', keys: (function () { var a = []; for (var i = 0; i < n; i++) if (per[i] > 0) a.push(i); return a; })(), cells: per.slice().map(function (x) { return x > 0 ? x : ''; }) }, log: 'add' });
            } else {
                push('Right wall controls: bar ' + r + ' (' + h[r] + ') is a peak / exposed \u2014 0 water.', { highlight: hw2, vars: { l: l, r: r, lMax: lMax, rMax: rMax, water: total } });
            }
            r--;
        }
    }

    var hf = {};
    for (var i = 0; i < n; i++) if (per[i] > 0) hf[i] = 'found';
    push('Total trapped rainwater = ' + total + '.',
        { highlight: hf, vars: { water: total }, sub: { label: 'water per bar', keys: (function () { var a = []; for (var i = 0; i < n; i++) if (per[i] > 0) a.push(i); return a; })(), cells: per.slice().map(function (x) { return x > 0 ? x : ''; }) }, log: 'done' });

    return frames;
}

VIZ_CONFIG['trappingwater'] = {
    title: 'Trapping Rain Water — two pointers with side maxima',
    family: 'trappingwater',
    defaultState: { array: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] },
    inputs: [
        { key: 'array', label: 'Heights', value: '0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1', placeholder: '0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1', parse: vizParseList }
    ],
    legend: [
        { label: 'left pointer', color: 'vz-left' },
        { label: 'right pointer', color: 'vz-right' },
        { label: 'water held', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvTrappingWaterFrames
};
