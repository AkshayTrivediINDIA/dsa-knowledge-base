/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/23-meetingrooms
   Meeting Rooms II. Sort start times and end times separately,
   then sweep both with two pointers: a start (starts[s] <
   ends[e]) needs +1 room, an end frees -1. The peak count is
   the number of rooms needed. Mounts on code/meetingrooms.
   ============================================================ */

function vizIvMeetingRoomsFrames(state) {
    var starts = (state.starts || []).slice();
    var ends = (state.ends || []).slice();
    starts.sort(function (a, b) { return a - b; });
    ends.sort(function (a, b) { return a - b; });
    var n = starts.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: starts, highlight: {}, vars: {}, sub: { label: 'ends (sorted)', keys: ends.slice(), cells: ends.slice() } };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty schedule \u2192 0 rooms needed.', arr: [], vars: {}, sub: { label: 'ends (sorted)', keys: [], cells: [] } }); return frames; }

    var s = 0, e = 0, rooms = 0, maxRooms = 0;

    push('Sort starts [' + starts.join(', ') + '] and ends [' + ends.join(', ') + '] separately. Sweep both with pointers: starts[s] < ends[e] \u2192 a meeting begins (+1 room); else one ends (\u22121). Peak = rooms needed. O(n log n).',
        { highlight: (function () { var h = {}; h[0] = 'left'; return h; })(), vars: { s: s, e: e, rooms: rooms, maxRooms: maxRooms }, sub: { label: 'ends (sorted)', keys: ends.slice(), cells: ends.slice(), highlight: (function () { var h = {}; h[0] = 'right'; return h; })() }, log: 'init' });

    while (s < n) {
        var endVal = e < ends.length ? ends[e] : Infinity;
        var h = {};
        h[s] = 'left';
        var subH = {};
        subH[e] = 'right';
        if (starts[s] < endVal) {
            rooms++;
            var wasPeak = rooms > maxRooms;
            if (wasPeak) maxRooms = rooms;
            push('start ' + starts[s] + ' < end ' + endVal + ' \u2192 meeting begins, rooms = ' + rooms + (wasPeak ? '  \u2192 NEW PEAK' : '') + '.',
                { highlight: h, vars: { s: s, e: e, rooms: rooms, maxRooms: maxRooms }, sub: { label: 'ends (sorted)', keys: ends.slice(), cells: ends.slice(), highlight: subH }, log: wasPeak ? 'max' : 'step' });
            s++;
        } else {
            rooms--;
            push('start ' + starts[s] + ' \u2265 end ' + endVal + ' \u2192 meeting ends, rooms = ' + rooms + '.',
                { highlight: h, vars: { s: s, e: e, rooms: rooms, maxRooms: maxRooms }, sub: { label: 'ends (sorted)', keys: ends.slice(), cells: ends.slice(), highlight: subH }, log: 'step' });
            e++;
        }
    }

    push('Peak concurrent meetings = ' + maxRooms + ' \u2192 need ' + maxRooms + ' rooms.',
        { vars: { s: s, e: e, rooms: rooms, maxRooms: maxRooms }, sub: { label: 'ends (sorted)', keys: ends.slice(), cells: ends.slice() }, log: 'done' });

    return frames;
}

VIZ_CONFIG['meetingrooms'] = {
    title: 'Meeting Rooms II — sort starts & ends, two-pointer sweep',
    family: 'meetingrooms',
    defaultState: { starts: [0, 5, 15], ends: [10, 20, 30] },
    inputs: [
        { key: 'starts', label: 'Start times', value: '0, 5, 15', placeholder: '0, 5, 15', parse: vizParseList },
        { key: 'ends', label: 'End times', value: '10, 20, 30', placeholder: '10, 20, 30', parse: vizParseList }
    ],
    legend: [
        { label: 'start pointer', color: 'vz-left' },
        { label: 'end pointer', color: 'vz-right' }
    ],
    stepMs: 1150,
    simulate: vizIvMeetingRoomsFrames
};
