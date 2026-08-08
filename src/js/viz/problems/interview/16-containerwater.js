/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/16-containerwater
   Container With Most Water. Two pointers from the edges; the
   shorter line limits the area, so advance it inward and track the
   best area seen. Mounts on code/containerwater.
   ============================================================ */

function vizIvContainerWaterFrames(state) {
    var h = state.array || [];
    var n = h.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: h, highlight: {}, vars: {}, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — 0 area.', arr: [], vars: {}, sub: null }); return frames; }

    var l = 0, r = n - 1;
    var best = 0, bl = 0, br = 0;

    push('Two pointers at the extremes. area = (r - l) \u00b7 min(h[l], h[r]). Moving the taller line inward can never beat the current area, so always advance the shorter one.',
        { vars: { l: l, r: r, area: 0, best: 0 }, sub: { label: 'current container', keys: [], cells: [] }, log: 'init' });

    while (l < r) {
        var width = r - l;
        var area = width * Math.min(h[l], h[r]);
        var hl = {}, hr = {};
        hl[l] = 'left'; hr[r] = 'right';
        var limitedByLeft = h[l] <= h[r];
        if (area > best) { best = area; bl = l; br = r; }

        var labelL = limitedByLeft ? 'shorter' : 'taller';
        var labelR = limitedByLeft ? 'taller' : 'shorter';
        var h2 = {};
        h2[l] = limitedByLeft ? 'left' : 'right';
        h2[r] = limitedByLeft ? 'right' : 'left';
        if (area === best && width === n - 1 && l === 0) {
            push('Container [' + l + '..' + r + ']: width ' + width + ' \u00b7 min(' + h[l] + ', ' + h[r] + ') = ' + area + '  \u2192 start. best = ' + best + '.',
                { highlight: h2, vars: { l: l, r: r, area: area, best: best } });
        } else if (area > 0) {
            push('Container [' + l + '..' + r + ']: width ' + width + ' \u00b7 min(' + h[l] + ', ' + h[r] + ') = ' + area + (area === best && bl === l && br === r ? '  \u2192 NEW BEST' : '') + '. h[' + l + '] (' + h[l] + ') is ' + labelL + ' \u2192 advance it.',
                { highlight: h2, vars: { l: l, r: r, area: area, best: best }, log: area === best && bl === l && br === r ? 'new best' : 'step' });
        } else {
            push('Container [' + l + '..' + r + ']: width ' + width + ' \u00b7 min(' + h[l] + ', ' + h[r] + ') = ' + area + '. Advance the shorter line.',
                { highlight: h2, vars: { l: l, r: r, area: area, best: best } });
        }

        if (limitedByLeft) l++; else r--;
    }

    var hf = {};
    hf[bl] = 'found';
    hf[br] = 'found';
    push('Maximum water = ' + best + ' (lines ' + bl + ' and ' + br + ').',
        { highlight: hf, vars: { best: best }, sub: null, log: 'done' });

    return frames;
}

VIZ_CONFIG['containerwater'] = {
    title: 'Container With Most Water — two pointers, advance the shorter',
    family: 'containerwater',
    defaultState: { array: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
    inputs: [
        { key: 'array', label: 'Heights', value: '1, 8, 6, 2, 5, 4, 8, 3, 7', placeholder: '1, 8, 6, 2, 5, 4, 8, 3, 7', parse: vizParseList }
    ],
    legend: [
        { label: 'left line', color: 'vz-left' },
        { label: 'right line', color: 'vz-right' },
        { label: 'best container', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvContainerWaterFrames
};
