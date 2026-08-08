/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/11-findanagrams
   Find All Anagrams in a String. Sliding window of length
   len(p) over s; maintain a running char-count of the window and
   compare to p's counts. When all counts match, the start index
   is an anagram. Mounts on code/findanagrams.
   ============================================================ */

function vizIvFindAnagramsFrames(state) {
    var s = String(state.s || '');
    var p = String(state.p || '');
    var chars = s.split('');
    var n = chars.length;
    var m = p.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: chars, highlight: {}, vars: {}, window: null, sub: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty string — no anagrams.', arr: [], vars: {}, sub: null }); return frames; }
    if (!m) { frames.push({ narr: 'Empty pattern — no anagrams.', arr: chars, vars: {}, sub: null }); return frames; }

    var need = {};       /* p char counts */
    for (var i = 0; i < m; i++) need[p[i]] = (need[p[i]] || 0) + 1;
    var have = {};       /* window char counts */
    var matches = 0;
    var found = [];
    var subKeys = [], subVals = [];
    Object.keys(need).forEach(function (c) { subKeys.push(c); subVals.push(need[c]); });

    push('Sliding window of length ' + m + ' over s. Keep counts of window chars and compare to p\u2019s counts (' + p + '). O(n).',
        { vars: { i: 0, window: 0, matches: 0 }, window: { start: 0, end: Math.min(m - 1, n - 1), label: 'window' }, sub: { label: 'p: char\u2192count', keys: subKeys.slice(), cells: subVals.slice() }, log: 'init' });

    function addChar(c) {
        if (need[c] === undefined) return;
        have[c] = (have[c] || 0) + 1;
        if (have[c] === need[c]) matches++;
    }
    function delChar(c) {
        if (need[c] === undefined) return;
        if (have[c] === need[c]) matches--;
        have[c]--;
    }

    for (var r = 0; r < n; r++) {
        addChar(chars[r]);
        if (r >= m) delChar(chars[r - m]);
        var l = r - m + 1;
        var h = {};
        h[l] = 'left';
        h[r] = 'active';
        if (matches === Object.keys(need).length) {
            found.push(l);
            var hf = {};
            for (var k = l; k <= r; k++) hf[k] = 'found';
            push('Window s[' + l + '..' + r + '] = \u201c' + chars.slice(l, r + 1).join('') + '\u201d matches p\u2019s counts \u2192 anagram at index ' + l + '!',
                { highlight: hf, vars: { l: l, r: r, matches: matches, found: found.join(',') }, window: { start: l, end: r, label: 'window' }, sub: { label: 'p: char\u2192count', keys: subKeys.slice(), cells: subVals.slice() }, log: 'anagram' });
        } else if (l >= 0) {
            push('Window s[' + l + '..' + r + '] = \u201c' + chars.slice(l, r + 1).join('') + '\u201d \u2014 not an anagram (matches ' + matches + '/' + Object.keys(need).length + ').',
                { highlight: h, vars: { l: l, r: r, matches: matches }, window: { start: l, end: r, label: 'window' }, sub: { label: 'p: char\u2192count', keys: subKeys.slice(), cells: subVals.slice() } });
        }
    }

    push('Anagram start indices: [' + (found.join(', ') || 'none') + '].',
        { vars: { found: found.join(',') || 'none' }, sub: { label: 'p: char\u2192count', keys: subKeys.slice(), cells: subVals.slice() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['findanagrams'] = {
    title: 'Find All Anagrams in a String — sliding window counts',
    family: 'findanagrams',
    defaultState: { s: 'cbaebabacd', p: 'abc' },
    inputs: [
        { key: 's', label: 'String s', value: 'cbaebabacd', placeholder: 'cbaebabacd', parse: function (str) { return String(str || ''); } },
        { key: 'p', label: 'Pattern p', value: 'abc', placeholder: 'abc', parse: function (str) { return String(str || ''); } }
    ],
    legend: [
        { label: 'window start', color: 'vz-left' },
        { label: 'current char', color: 'vz-active' },
        { label: 'anagram window', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvFindAnagramsFrames
};
