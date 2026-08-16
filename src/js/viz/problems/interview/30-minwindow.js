/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/30-minwindow
   Minimum Window Substring. Sliding window over s: grow r until
   every char of t is present (frequency counts), then shrink l to
   make the valid window as small as possible. Mounts on
   code/minwindow.
   ============================================================ */

function vizIvMinWindowFrames(state) {
    var chars = state.array || [];
    var t = String(state.target || '');
    var n = chars.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: chars, highlight: {}, vars: {}, sub: null, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty string s \u2192 no window.', arr: [], vars: {}, sub: null }); return frames; }
    if (!t) { frames.push({ narr: 'Empty target t \u2192 answer is \u201c\u201d.', arr: chars, vars: {}, sub: null }); return frames; }

    var need = {};
    for (var i = 0; i < t.length; i++) need[t[i]] = (need[t[i]] || 0) + 1;
    var needKeys = [];
    for (var k0 in need) needKeys.push(k0);
    var needTotal = 0;
    for (var k1 = 0; k1 < needKeys.length; k1++) needTotal += need[needKeys[k1]];

    var have = {};
    var formed = 0;
    var l = 0;
    var minLen = Infinity, bestL = 0, bestR = 0, foundMin = false;

    function subRow() {
        var keys = needKeys.slice();
        var cells = [];
        for (var k = 0; k < keys.length; k++) cells.push(have[keys[k]] || 0);
        return { label: 'window counts', keys: keys, cells: cells };
    }

    function minStr() { return minLen === Infinity ? '-' : minLen; }

    push('Sliding window over s. Grow r adding chars; once all of t\u2019s chars are present, shrink l to minimize. t = \u201c' + t + '\u201d, need ' + needTotal + ' chars.',
        { vars: { l: l, r: 0, have: formed, need: needTotal, minLen: minStr(), bestL: bestL }, window: { start: 0, end: 0, label: 'window' }, sub: subRow(), log: 'init' });

    for (var r = 0; r < n; r++) {
        var c = chars[r];
        if (need[c] !== undefined) {
            have[c] = (have[c] || 0) + 1;
            if (have[c] === need[c]) formed++;
        }
        var hl = {};
        hl[l] = 'left'; hl[r] = 'active';
        push('r = ' + r + ': added \u201c' + c + '\u201d \u2192 ' + formed + '/' + needKeys.length + ' distinct chars satisfied.',
            { highlight: hl, vars: { l: l, r: r, have: formed, need: needTotal, minLen: minStr(), bestL: bestL }, window: { start: l, end: r, label: 'window' }, sub: subRow(), log: 'step' });

        if (formed === needKeys.length) {
            while (need[chars[l]] === undefined || (have[chars[l]] || 0) > need[chars[l]]) {
                var removed = chars[l];
                if (need[removed] !== undefined) {
                    have[removed]--;
                    if (have[removed] < need[removed]) formed--;
                }
                l++;
                var hls = {};
                hls[l] = 'left'; hls[r] = 'active';
                push('Window valid \u2192 shrink: drop \u201c' + removed + '\u201d \u2192 l moves to ' + l + '.',
                    { highlight: hls, vars: { l: l, r: r, have: formed, need: needTotal, minLen: minStr(), bestL: bestL }, window: { start: l, end: r, label: 'window' }, sub: subRow(), log: 'shrink' });
            }
            var len = r - l + 1;
            if (len < minLen) {
                minLen = len; bestL = l; bestR = r; foundMin = true;
                var hf = {};
                hf[l] = 'left'; hf[r] = 'right';
                push('Shrunk window s[' + l + '..' + r + '] = \u201c' + chars.slice(l, r + 1).join('') + '\u201d (length ' + len + ') \u2192 NEW BEST.',
                    { highlight: hf, vars: { l: l, r: r, have: formed, need: needTotal, minLen: minStr(), bestL: bestL }, window: { start: l, end: r, label: 'window' }, sub: subRow(), log: 'new best' });
            }
        }
    }

    if (foundMin) {
        var hd = {};
        for (var k = bestL; k <= bestR; k++) hd[k] = 'found';
        push('Minimum window = \u201c' + chars.slice(bestL, bestR + 1).join('') + '\u201d (s[' + bestL + '..' + bestR + '], length ' + minLen + ').',
            { highlight: hd, vars: { l: l, r: r, have: formed, need: needTotal, minLen: minLen, bestL: bestL }, window: { start: bestL, end: bestR, label: 'window' }, sub: subRow(), log: 'done' });
    } else {
        push('No window of s contains all of \u201c' + t + '\u201d \u2192 answer \u201c\u201d (empty string).',
            { vars: { l: l, r: r, minLen: 0, bestL: bestL }, sub: subRow(), log: 'done' });
    }

    return frames;
}

VIZ_CONFIG['minwindow'] = {
    title: 'Minimum Window Substring — sliding window with counts',
    family: 'minwindow',
    defaultState: { array: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'], target: 'ABC' },
    inputs: [
        { key: 'array', label: 'String s (chars, comma-separated)', value: 'A,D,O,B,E,C,O,D,E,B,A,N,C', placeholder: 'A,D,O,B,E,C,O,D,E,B,A,N,C', parse: function (s) {
            return String(s || '').split(',').map(function (t) { return String(t).trim(); }).filter(function (c) { return c !== ''; });
        } },
        { key: 'target', label: 'Target t', value: 'ABC', placeholder: 'ABC', parse: function (s) { return String(s || ''); } }
    ],
    legend: [
        { label: 'window start', color: 'vz-left' },
        { label: 'current char', color: 'vz-active' },
        { label: 'best window', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvMinWindowFrames
};
