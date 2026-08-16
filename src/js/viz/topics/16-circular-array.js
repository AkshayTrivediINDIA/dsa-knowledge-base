/* ============================================================
   DSA Knowledge Base - module: viz/topics/16-circular-array
   Ring buffer of fixed capacity: write slot = i % cap. When the
   ring is full the next push wraps around and overwrites the
   oldest value (the classic circular-array / ring-buffer trick).
   Mounts on topics/circular-array; inherited by code/circular-array.
   ============================================================ */

function vizCircularArrayFrames(state) {
    var vals = state.array || [];
    var cap = Math.max(1, state.capacity || 4);
    var buf = [];
    var frames = [];
    var i, s;

    function push(narr, extra) {
        var f = { narr: narr, arr: vals.slice(), highlight: {}, sub: null, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }
    function fullMap() {
        var h = {};
        for (s = 0; s < cap; s++) if (buf[s] !== '\u2014') h[s] = 'found';
        return h;
    }
    function bufferSub(activeSlot) {
        var h = fullMap();
        if (activeSlot !== null && activeSlot !== undefined) h[activeSlot] = 'active';
        return { label: 'buffer (slots 0..' + (cap - 1) + ')', keys: (function () { var ks = []; for (var s2 = 0; s2 < cap; s2++) ks.push(s2); return ks; })(), cells: buf.slice(), highlight: h };
    }

    for (s = 0; s < cap; s++) buf.push('\u2014');

    if (!vals.length) {
        frames.push({ narr: 'Empty push list.', arr: [], vars: {}, sub: null });
        return frames;
    }

    push('Ring buffer of capacity ' + cap + ': each push lands at slot = i % ' + cap + '. A full ring wraps around to slot 0 and overwrites the oldest value.',
        { vars: { i: '\u2014', slot: '\u2014', capacity: cap }, sub: bufferSub(null), log: 'init' });

    for (i = 0; i < vals.length; i++) {
        var slot = i % cap;
        var old = buf[slot];
        var wrap = i > 0 && slot === 0;
        var filled = buf[slot] !== '\u2014';
        buf[slot] = vals[i];
        var h = {}; h[i] = 'active';
        push('push ' + vals[i] + ' at i = ' + i + ' \u2192 slot = ' + i + ' % ' + cap + ' = ' + slot
            + (wrap ? '. Ring full \u2192 wrap around, overwrite oldest value ' + old + '.' : filled ? '. Overwrite old value ' + old + '.' : '.'),
            { highlight: h, sub: bufferSub(slot), vars: { i: i, slot: slot, capacity: cap }, log: wrap ? 'wrap' : 'step' });
    }

    push('Done \u2192 final ring: [' + buf.join(', ') + ']. Last write was slot ' + ((vals.length - 1) % cap) + '. Circular indexing keeps all writes O(1).',
        { highlight: (function () { var h = {}; for (var s3 = 0; s3 < cap; s3++) if (buf[s3] !== '\u2014') h[s3] = 'found'; return h; })(), sub: bufferSub(null), vars: { i: vals.length - 1, slot: (vals.length - 1) % cap, capacity: cap }, log: 'done' });

    return frames;
}

VIZ_CONFIG['topics/circular-array'] = {
    title: 'Circular Array / Ring Buffer — arr[i % n] wraparound',
    family: 'circular-array',
    defaultState: { array: [1, 2, 3, 4, 5, 6, 7], capacity: 4 },
    inputs: [
        { key: 'array', label: 'Values to push', value: '1, 2, 3, 4, 5, 6, 7', placeholder: '1, 2, 3, 4, 5, 6, 7', parse: vizParseList },
        { key: 'capacity', label: 'Ring capacity', value: '4', placeholder: '4', parse: function (s) { return parseInt(s, 10) || 4; } }
    ],
    legend: [
        { label: 'current write slot', color: 'vz-active' },
        { label: 'filled slot', color: 'vz-found' }
    ],
    stepMs: 1000,
    simulate: vizCircularArrayFrames
};

VIZ_CONFIG['circulararray'] = VIZ_CONFIG['topics/circular-array'];
