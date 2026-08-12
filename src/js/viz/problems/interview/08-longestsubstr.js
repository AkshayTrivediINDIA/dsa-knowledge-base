/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/08-longestsubstr
   Longest Substring Without Repeating Characters. Sliding window
   [l..r] with a char-set (or last-seen index map). Growing the
   window rightward; when a char repeats, jump l past its previous
   occurrence. Mounts on code/longestsubstr.
   ============================================================ */

function vizIvLongestSubstrFrames(state) {
    var s = state.s || '';
    var chars = String(s).split('');
    var n = chars.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: chars, highlight: {}, vars: {}, window: null };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty string — length 0.', arr: [], vars: {} }); return frames; }

    var lastSeen = {};   /* char -> latest index */
    var l = 0;
    var best = 0, bestL = 0, bestR = 0;

    push('Sliding window [l..r]. For each new char, if it appeared at index \u2265 l, shrink l past it; otherwise the window grows. Track the best length.',
        { vars: { l: l, r: 0, len: 1, best: 1 }, window: { start: 0, end: 0, label: 'window' }, log: 'init' });

    for (var r = 0; r < n; r++) {
        var c = chars[r];
        var h = {};
        h[r] = 'active';
        if (lastSeen[c] !== undefined && lastSeen[c] >= l) {
            var oldL = l;
            l = lastSeen[c] + 1;
            push('char \u201c' + c + '\u201d at ' + r + ' repeats at index ' + lastSeen[c] + ' \u2192 move l from ' + oldL + ' to ' + l + '.',
                { vars: { l: l, r: r, len: r - l + 1, best: best }, window: { start: l, end: r, label: 'window' }, log: 'shrink' });
        }
        lastSeen[c] = r;
        var len = r - l + 1;
        if (len > best) { best = len; bestL = l; bestR = r; }
        var hl = {};
        hl[l] = 'left';
        hl[r] = 'active';
        push('r = ' + r + ': window [' + l + '..' + r + '] = \u201c' + chars.slice(l, r + 1).join('') + '\u201d, length ' + len + (len === best ? '  \u2192 NEW BEST' : '') + '.',
            { highlight: hl, vars: { l: l, r: r, len: len, best: best }, window: { start: l, end: r, label: 'window' }, log: len === best ? 'new best' : 'step' });
    }

    var hf = {};
    for (var i = bestL; i <= bestR; i++) hf[i] = 'found';
    push('Longest substring without repeating characters = ' + best + ' (\u201c' + chars.slice(bestL, bestR + 1).join('') + '\u201d).',
        { highlight: hf, vars: { best: best }, log: 'done' });

    return frames;
}

VIZ_CONFIG['longestsubstr'] = {
    title: 'Longest Substring Without Repeating Characters — sliding window',
    family: 'longestsubstr',
    defaultState: { s: 'abcabcbb' },
    inputs: [
        { key: 's', label: 'String', value: 'abcabcbb', placeholder: 'abcabcbb', parse: function (str) { return String(str || ''); } }
    ],
    legend: [
        { label: 'window start', color: 'vz-left' },
        { label: 'current char', color: 'vz-active' },
        { label: 'best substring', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvLongestSubstrFrames
};

/* ---------- Focus Mode config ---------- */

FOCUS_CONFIG['longestsubstr'] = {
    title: 'Longest Substring Without Repeating Characters — Focus Mode',
    viz: 'longestsubstr',
    codeGroup: 'longestsubstr',
    tagline: 'One window, always unique.',
    lead: 'Every substring is far too many — keep a shrinking window and never re-scan it.',
    optLabel: 'Sliding window',
    beats: [
        {
            narr: 'Brute force builds every substring and checks each for repeats. For a string of length n that is roughly n\u00b2/2 substrings.',
            brute: 1,
            opt: 1
        },
        {
            narr: 'Checking each candidate substring for duplicates on its own adds yet another factor: O(n\u00b2) to O(n\u00b3) work in total.',
            brute: 21,
            opt: 4
        },
        {
            narr: 'A sliding window keeps exactly one valid substring. When a char repeats, jump the start past its last appearance — O(n) time, window never re-scanned.',
            brute: 21,
            opt: 7
        }
    ],
    recap:
        'The window is a contiguous run of characters that currently has no repeats. Grow it one character at a time on the right; ' +
        'if the new character already appears inside the window, slide the left edge past that earlier copy. ' +
        'Window size never needs a full re-scan, so the whole string is processed in a single O(n) pass while the longest window seen is remembered.',
    recapTitle: 'Concept recap — what is the window doing?'
};
