/* ============================================================
   DSA Knowledge Base - module: viz/topics/21-fast-slow-pointers
   Fast & Slow Pointers (Floyd cycle detection). An array of next
   pointers simulates a linked list: node i (1-indexed, head = 1)
   points to next[i]. Phase 1: slow +1, fast +2 until they meet.
   Phase 2: reset slow to head, both +1 \u2192 meeting node is the
   cycle start. Mounts on topics/fast-slow-pointers.
   ============================================================ */

function vizFastSlowPointersFrames(state) {
    var next = (state.array || []).slice();
    var n = next.length;
    var nodes = [];
    for (var ni = 1; ni <= n; ni++) nodes.push(ni);
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: nodes, highlight: {}, vars: {}, sub: null, window: null };
        for (var key in extra) f[key] = extra[key];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty next-pointer array.', arr: [], vars: {}, sub: null, log: 'done' }); return frames; }

    function subRow() {
        return { label: 'next[i]', keys: nodes.slice(), cells: next.slice() };
    }
    function mark(node, cls) {
        var h = {};
        h[node - 1] = cls;
        return h;
    }

    var head = 1;
    var slow = head;
    var fast = head;
    var phase = 1;

    push('Floyd cycle detection. Node ' + head + ' is the head; node i points to next[i] = [' + next.join(', ') + ']. Phase 1: slow +1, fast +2 per step.',
        { highlight: mark(head, 'soft'), vars: { phase: phase, slow: slow, fast: fast, head: head }, sub: subRow(), log: 'init' });

    var meet = -1;
    var guard1 = 0;
    while (true) {
        var fastNext = next[fast - 1];
        if (fastNext === undefined) {
            push('next[' + fast + '] is undefined \u2192 fast hits the end \u2192 no cycle.',
                { highlight: mark(fast, 'found'), vars: { phase: phase, slow: slow, fast: fast, head: head }, sub: subRow(), log: 'done' });
            return frames;
        }
        slow = next[slow - 1];
        fast = next[fastNext - 1];
        guard1++;
        var hs = mark(slow, 'left');
        hs[fast - 1] = 'right';
        push('Move: slow +1 \u2192 node ' + slow + ', fast +2 \u2192 node ' + fast + '.',
            { highlight: hs, vars: { phase: phase, slow: slow, fast: fast, head: head }, sub: subRow() });
        if (slow === fast) { meet = slow; break; }
        if (guard1 > 3 * n + 2) {
            push('No meeting after ' + guard1 + ' steps \u2192 no cycle detected.',
                { highlight: {}, vars: { phase: phase, slow: slow, fast: fast, head: head }, sub: subRow(), log: 'done' });
            return frames;
        }
    }

    phase = 2;
    slow = head;
    push('MEET! slow == fast == node ' + meet + ' \u2192 a cycle exists. Phase 2: reset slow to head = ' + head + ', keep fast at ' + meet + '; both now move +1.',
        { highlight: mark(meet, 'found'), vars: { phase: phase, slow: slow, fast: fast, head: head }, sub: subRow(), log: 'found' });

    var guard2 = 0;
    while (slow !== fast) {
        slow = next[slow - 1];
        fast = next[fast - 1];
        guard2++;
        var h2 = mark(slow, 'left');
        h2[fast - 1] = 'right';
        push('Both +1 \u2192 slow = node ' + slow + ', fast = node ' + fast + '.',
            { highlight: h2, vars: { phase: phase, slow: slow, fast: fast, head: head }, sub: subRow() });
        if (guard2 > 3 * n + 2) {
            push('No convergence \u2192 no cycle start found.',
                { highlight: {}, vars: { phase: phase, slow: slow, fast: fast, head: head }, sub: subRow(), log: 'done' });
            return frames;
        }
    }

    var hf = mark(slow, 'found');
    push('slow == fast == node ' + slow + ' \u2192 this meeting node is the CYCLE START. Answer = ' + slow + '.',
        { highlight: hf, vars: { phase: phase, slow: slow, fast: fast, head: head }, sub: subRow(), log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/fast-slow-pointers'] = {
    title: 'Fast & Slow Pointers \u2014 Floyd cycle detection',
    family: 'fastslowptr',
    defaultState: { array: [2, 3, 4, 5, 3] },
    inputs: [
        { key: 'array', label: 'next[i] (1-indexed)', value: '2, 3, 4, 5, 3', placeholder: '2, 3, 4, 5, 3', parse: vizParseList }
    ],
    legend: [
        { label: 'slow pointer', color: 'vz-left' },
        { label: 'fast pointer', color: 'vz-right' },
        { label: 'meeting / cycle start', color: 'vz-found' },
        { label: 'head', color: 'vz-soft' }
    ],
    stepMs: 1000,
    simulate: vizFastSlowPointersFrames
};

VIZ_CONFIG['fastslowptr'] = VIZ_CONFIG['topics/fast-slow-pointers'];
