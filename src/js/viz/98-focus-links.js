/* ============================================================
   DSA Knowledge Base - script.js (module: viz:98-focus-links)
   Focus Mode navigation links.
   Adds a "Focus mode" callout to every code page (code/<group>)
   whose problem registers a FOCUS_CONFIG entry. Must run lazily
   at init() — not as an IIFE — because the viz modules populate
   FOCUS_CONFIG after the core content modules evaluate; calling it
   from init() (DOMContentLoaded) guarantees every entry exists.
   ============================================================ */

function focusInjectLinks() {
    if (typeof FOCUS_CONFIG === 'undefined' || !FOCUS_CONFIG) return;
    if (typeof DB === 'undefined' || !DB) return;

    Object.keys(FOCUS_CONFIG).forEach(function (id) {
        var cfg = FOCUS_CONFIG[id];
        var group = cfg.codeGroup || id;
        var page = DB['code/' + group];
        if (!page) return;
        if (!(cfg.beats && cfg.beats.length)) return;
        if (page.content.indexOf('focus/' + id) !== -1) return;

        var linkLine = '> **Focus mode:** an interactive guide with an animated brute-force vs hash-map comparison. [Open Focus Mode](focus/' + id + ')';

        var lines = page.content.split('\n');
        var out = [];
        var inserted = false;
        var inQuote = false;
        lines.forEach(function (line, i) {
            out.push(line);
            var next = lines[i + 1];
            if (/^>\s?/.test(line)) inQuote = true;
            if (inQuote && (i === lines.length - 1 || !/^>\s?/.test(next))) {
                inQuote = false;
                if (!inserted) {
                    out.push('');
                    out.push(linkLine);
                    inserted = true;
                }
            }
        });
        if (!inserted) out.push('', linkLine);
        page.content = out.join('\n');
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports.focusInjectLinks = focusInjectLinks;
}