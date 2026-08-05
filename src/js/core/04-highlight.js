/* ============================================================
   DSA Knowledge Base - script.js (module: highlight)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ============================================================
   Syntax Highlighter
   ============================================================ */

function highlight(code, lang) {
    var kw = LANG_KEYWORDS[lang] || [];
    var ty = LANG_TYPES[lang] || [];
    var bi = LANG_BUILTINS[lang] || [];
    var kwS = {}, tyS = {}, biS = {};
    kw.forEach(function (w) { kwS[w] = 1; });
    ty.forEach(function (w) { tyS[w] = 1; });
    bi.forEach(function (w) { biS[w] = 1; });

    var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#[^\n]*|\b\d[\w.]*\b|[A-Za-z_]\w*)/g;
    var out = '';
    var last = 0;
    var m;
    while ((m = re.exec(code))) {
        if (m.index > last) out += escapeHtml(code.slice(last, m.index));
        var tok = m[0];
        var cls = null;
        if (tok.indexOf('//') === 0 || tok.indexOf('/*') === 0) cls = 'hl-comment';
        else if (tok.charAt(0) === '"' || tok.charAt(0) === "'") cls = 'hl-string';
        else if (tok.charAt(0) === '#') cls = 'hl-comment';
        else if (/^\d/.test(tok)) cls = 'hl-number';
        else if (/^[A-Za-z_]\w*$/.test(tok)) {
            if (kwS[tok]) cls = 'hl-keyword';
            else if (tyS[tok]) cls = 'hl-type';
            else if (biS[tok]) cls = 'hl-builtin';
            else if (/^\s*\(/.test(code.slice(re.lastIndex))) cls = 'hl-function';
        }
        out += cls ? '<span class="' + cls + '">' + escapeHtml(tok) + '</span>' : escapeHtml(tok);
        last = re.lastIndex;
    }
    out += escapeHtml(code.slice(last));
    return out;
}
