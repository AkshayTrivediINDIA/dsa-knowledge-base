/* ============================================================
   DSA Knowledge Base - script.js (module: content:20-split-codes)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ---------- Code-page splitter ----------
   Runs after every content module has populated DB. Each program
   group (its 5 ~~~explain blocks + matching ~~~io box) is moved
   onto its own routable page code/<group>. The source page keeps a
   code card that routes to that page; problem-card "View code"
   buttons route to it too. Both MPA pages and the standalone share
   this script, so the behaviour is identical everywhere. */

(function () {
    var CODE_RE = /^~~~(\w*)\s*$/;

    function metaOf(line) {
        var m = line.match(/^([a-z_]+)\s*:\s?(.*)$/i);
        return m ? { key: m[1].toLowerCase(), value: m[2].trim() } : null;
    }

    function prettyLabel(g) {
        return g.replace(/[-_]+/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, function (m) { return m.toUpperCase(); })
            .replace(/\s+/g, ' ')
            .trim();
    }

    Object.keys(DB).forEach(function (pageId) {
        if (pageId.indexOf('code/') === 0) return;

        var lines = DB[pageId].content.split('\n');
        var segs = [];
        var i = 0;
        while (i < lines.length) {
            var m = lines[i].match(CODE_RE);
            if (m && m[1] === 'explain') {
                var buf = [];
                i++;
                while (i < lines.length && !/^~~~\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
                i++;
                var meta = { group: '', lang: '' };
                buf.forEach(function (l) {
                    var kv = metaOf(l);
                    if (kv && (kv.key === 'group' || kv.key === 'lang')) meta[kv.key] = kv.value;
                });
                segs.push({ type: 'explain', lines: buf, group: meta.group, lang: meta.lang });
            } else if (m && m[1] === 'io') {
                var iobuf = [];
                i++;
                while (i < lines.length && !/^~~~\s*$/.test(lines[i])) { iobuf.push(lines[i]); i++; }
                i++;
                segs.push({ type: 'io', lines: iobuf });
            } else if (m && m[1] === 'code') {
                var cbuf = [];
                i++;
                while (i < lines.length && !/^~~~\s*$/.test(lines[i])) { cbuf.push(lines[i]); i++; }
                i++;
                segs.push({ type: 'codecard', lines: cbuf });
            } else {
                segs.push({ type: 'text', lines: [lines[i]] });
                i++;
            }
        }

        /* group consecutive explains that share a group name */
        var groups = [];
        var cur = null;
        segs.forEach(function (s) {
            if (s.type === 'explain') {
                if (cur && cur.name === s.group) {
                    cur.segs.push(s);
                } else {
                    cur = { name: s.group, segs: [s] };
                    groups.push(cur);
                }
            } else if (s.type === 'io') {
                cur = null;
            }
        });
        if (!groups.length) return;

        /* assign each io box to the next group that has none, in order */
        var ioIdx = 0;
        var ios = segs.filter(function (s) { return s.type === 'io'; });
        groups.forEach(function (g) {
            if (ioIdx < ios.length) g.io = ios[ioIdx++];
        });

        /* one routable page per group */
        var parentTitle = DB[pageId].title;
        var parentCrumbs = DB[pageId].crumbs || [];
        groups.forEach(function (g) {
            if (!g.name) return;
            var label = prettyLabel(g.name);
            var content = ['# ' + label, ''];
            content.push('> [!info] Full solution');
            content.push('> Five-language implementation with line-by-line explanation. Use the tabs above the code to switch languages. Back to [' + parentTitle + '](' + pageId + ').');
            content.push('');
            g.segs.forEach(function (s) {
                content.push('~~~explain');
                content = content.concat(s.lines);
                content.push('~~~');
                content.push('');
            });
            if (g.io) {
                content.push('~~~io');
                content = content.concat(g.io.lines);
                content.push('~~~');
                content.push('');
            }
            var crumbs = [];
            parentCrumbs.forEach(function (c) { crumbs.push(c); });
            crumbs.push(label);
            DB['code/' + g.name] = {
                title: label + ' — Code',
                crumbs: crumbs,
                tags: ['code', 'solution', g.name],
                content: content.join('\n')
            };
        });

        /* rewrite the source page: one code card per group, blocks moved out */
        var cardInserted = {};
        var out = [];
        segs.forEach(function (s) {
            if (s.type === 'explain') {
                var owner = null;
                groups.forEach(function (g) {
                    if (g.segs.indexOf(s) !== -1) owner = g;
                });
                if (owner) {
                    if (!cardInserted[owner.name]) {
                        cardInserted[owner.name] = true;
                        out.push('~~~code');
                        out.push('group: ' + owner.name);
                        out.push('label: ' + prettyLabel(owner.name));
                        out.push('~~~');
                        out.push('');
                    }
                    return;
                }
                out.push('~~~explain');
                out = out.concat(s.lines);
                out.push('~~~');
            } else if (s.type === 'io') {
                var owned = false;
                groups.forEach(function (g) { if (g.io === s) owned = true; });
                if (owned) return;
                out.push('~~~io');
                out = out.concat(s.lines);
                out.push('~~~');
            } else if (s.type === 'codecard') {
                out.push('~~~code');
                out = out.concat(s.lines);
                out.push('~~~');
            } else {
                out.push(s.lines[0]);
            }
        });
        DB[pageId].content = out.join('\n');
    });
})();
