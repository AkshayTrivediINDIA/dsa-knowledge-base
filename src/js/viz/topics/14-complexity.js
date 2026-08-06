/* ============================================================
   DSA Knowledge Base - module: viz/topics/14-complexity
   Growth chart: four representative loops (constant, linear,
   nested, halving) plotted as bars for a chosen n. Doubling n
   makes the O(n^2) bar dwarf the others.
   Mounts on topics/complexity; inherited by code/complexity.
   ============================================================ */

function vizComplexityFrames(state) {
    var n = Math.max(state.n || 16, 1);
    var maxH = 256;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, bars: null, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }
    function barsFor(nn) {
        var counts = [1, nn, nn * nn, Math.floor(Math.log2(nn))];
        var labels = ['O(1)', 'O(n)', 'O(n\u00b2)', 'O(log n)'];
        return { heights: counts, max: maxH, labels: labels };
    }
    function varsFor(nn) {
        return { n: nn, constant: 1, linear: nn, nested: nn * nn, log: Math.floor(Math.log2(nn)) };
    }

    push('How do operation counts grow with n? Four loops, n = 1 first.',
        { bars: barsFor(1), vars: varsFor(1), log: 'init' });

    [2, 4, 8].forEach(function (nn) {
        push('n = ' + nn + ': nested loop runs ' + (nn * nn) + ' times \u2014 quadratic growth outpaces linear.',
            { bars: barsFor(nn), vars: varsFor(nn) });
    });

    push('n = ' + n + ' (chosen): constant 1, linear ' + n + ', nested ' + (n * n) + ', halving ' + Math.floor(Math.log2(n)) + '.',
        { bars: barsFor(n), vars: varsFor(n), log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/complexity'] = {
    title: 'Complexity Analysis — how operation counts scale with n',
    family: 'complexity',
    defaultState: { n: 16 },
    inputs: [
        { key: 'n', label: 'n', value: '16', placeholder: '16', parse: function (s) { return Math.max(parseInt(s, 10) || 1, 1); } }
    ],
    legend: [
        { label: 'operation counts at n', color: 'vz-soft' }
    ],
    stepMs: 1200,
    simulate: vizComplexityFrames
};

VIZ_CONFIG['complexity'] = VIZ_CONFIG['topics/complexity'];
