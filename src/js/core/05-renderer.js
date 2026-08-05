/* ============================================================
   DSA Knowledge Base - script.js (module: renderer)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ============================================================
   Markdown Renderer
   ============================================================ */

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function inline(text) {
    var html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, href) {
        if (DB[href]) return '<a href="' + pageFile(href) + '">' + txt + '</a>';
        if (href.indexOf('coming-soon/') === 0) return '<a href="' + pageFile(href) + '">' + txt + '</a>';
        if (/^https?:/.test(href)) return '<a href="' + href + '" target="_blank" rel="noopener">' + txt + '</a>';
        if (href.charAt(0) === '#') return '<a href="' + href + '">' + txt + '</a>';
        return '<a href="' + pageFile(href) + '">' + txt + '</a>';
    });
    return html;
}

function isBlockStart(line) {
    if (!line.trim()) return true;
    if (/^~~~/.test(line)) return true;
    if (/^#{1,4}\s/.test(line)) return true;
    if (/^>/.test(line)) return true;
    if (/^\|.*\|$/.test(line.trim())) return true;
    if (/^(\s*)[-*+]\s+/.test(line)) return true;
    if (/^(\s*)(\d+)[.)]\s+/.test(line)) return true;
    if (/^(---+|\*\*\*+)$/.test(line.trim())) return true;
    return false;
}

function renderTable(headerLine, rows) {
    function cells(l) {
        return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); });
    }
    var html = '<table><thead><tr>';
    cells(headerLine).forEach(function (c) { html += '<th>' + inline(c) + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function (r) {
        html += '<tr>';
        cells(r).forEach(function (c) { html += '<td>' + inline(c) + '</td>'; });
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

function renderListLines(lines, ordered) {
    var tag = ordered ? 'ol' : 'ul';
    var items = [];
    lines.forEach(function (line) {
        var m = line.match(/^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/);
        items.push({ depth: m ? Math.floor(m[1].length / 2) : 0, text: m ? m[2] : '' });
    });
    var root = [];
    var stack = [{ children: root, depth: -1 }];
    items.forEach(function (it) {
        while (stack[stack.length - 1].depth >= it.depth) stack.pop();
        it.children = [];
        stack[stack.length - 1].children.push(it);
        stack.push(it);
    });
    function emit(list) {
        var h = '<' + tag + '>';
        list.forEach(function (it) {
            h += '<li>' + inline(it.text);
            if (it.children.length) h += emit(it.children);
            h += '</li>';
        });
        return h + '</' + tag + '>';
    }
    return emit(root);
}

function renderBlockquote(buf) {
    var first = buf[0].trim();
    var m = first.match(/^\[!(info|warning|success|danger)\](?:\s+(.*))?$/i);
    if (m) {
        var type = m[1].toLowerCase();
        var body = buf.slice(1);
        if (m[2]) body.unshift(m[2]);
        return '<div class="callout callout-' + type + '">' + body.map(inline).join(' ') + '</div>';
    }
    return '<blockquote>' + buf.map(inline).join(' ') + '</blockquote>';
}

function renderProblem(src) {
    var f = {};
    var cur = null;
    var keys = ['title', 'difficulty', 'source', 'tags', 'statement', 'approach', 'time', 'space', 'solution'];
    src.split('\n').forEach(function (line) {
        var m = line.match(/^([a-z_]+)\s*:\s?(.*)$/i);
        if (m && keys.indexOf(m[1].toLowerCase()) !== -1) {
            cur = m[1].toLowerCase();
            f[cur] = m[2].trim();
        } else if (cur) {
            f[cur] += '\n' + line;
        }
    });
    var diff = (f.difficulty || 'medium').toLowerCase();
    var badge = diff === 'easy' ? 'badge-easy' : diff === 'hard' ? 'badge-hard' : 'badge-medium';
    var html = '<div class="problem-card">';
    html += '<div class="problem-header">';
    html += '<h3 class="problem-title">' + escapeHtml(f.title || 'Problem') + '</h3>';
    html += '<span class="badge ' + badge + '">' + diff + '</span>';
    html += '</div>';
    html += '<div class="problem-meta">';
    if (f.source) html += '<span class="tag">' + escapeHtml(f.source) + '</span>';
    (f.tags || '').split(',').forEach(function (t) {
        t = t.trim();
        if (t) html += '<span class="tag">' + escapeHtml(t) + '</span>';
    });
    html += '</div>';
    if (f.statement) html += '<p class="problem-statement">' + inline(f.statement) + '</p>';
    if (f.approach) html += '<h4>Approach</h4><p>' + inline(f.approach) + '</p>';
    if (f.time || f.space) {
        html += '<div class="problem-meta">';
        if (f.time) html += '<span class="tag">Time: ' + escapeHtml(f.time) + '</span>';
        if (f.space) html += '<span class="tag">Space: ' + escapeHtml(f.space) + '</span>';
        html += '</div>';
    }
    if (f.solution) {
        html += '<button class="problem-solution-btn" data-group="' + escapeHtml(f.solution.trim()) + '">View code</button>';
    }
    html += '</div>';
    return html;
}

function renderCodeBlock(lang, code) {
    var label = (LANG_LABELS[lang] || lang || 'code').toUpperCase();
    var highlighted = highlight(code, lang);
    return '<div class="code-block" data-lang="' + lang + '">' +
        '<div class="code-header">' +
        '<span class="lang-label">' + label + '</span>' +
        '<select class="lang-switch" aria-label="Switch language">' + langSelectOptions(lang) + '</select>' +
        '<span class="code-actions">' +
        '<button class="code-action-btn" data-action="expand">Expand</button>' +
        '<button class="code-action-btn" data-action="copy">Copy</button>' +
        '</span>' +
        '</div>' +
        '<pre><code class="language-' + lang + '">' + highlighted + '</code></pre>' +
        '</div>';
}

function expandRefShorthand(text) {
    return String(text).replace(/\[([^\]]+)\]\(\{([a-z]+):([a-zA-Z0-9_]+)\}\)/gi, function (m, label, lang, token) {
        var u = refUrl(lang, token);
        return u ? '[' + label + '](' + u + ')' : '[' + label + '](#)';
    });
}

function renderIo(src) {
    var input = [];
    var output = [];
    var section = null;
    src.split('\n').forEach(function (line) {
        var m = line.match(/^(input|output)\s*:\s?(.*)$/i);
        if (m) {
            section = m[1].toLowerCase();
            if (m[2]) (section === 'input' ? input : output).push(m[2]);
            return;
        }
        if (section === 'input') input.push(line);
        else if (section === 'output') output.push(line);
    });
    var html = '<div class="io-box">';
    if (input.length) {
        html += '<div class="io-section io-input">' +
            '<div class="io-label">Sample Input</div>' +
            '<pre>' + escapeHtml(input.join('\n')) + '</pre></div>';
    }
    if (output.length) {
        html += '<div class="io-section io-output">' +
            '<div class="io-label">Sample Output (expected)</div>' +
            '<pre>' + escapeHtml(output.join('\n')) + '</pre></div>';
    }
    html += '</div>';
    return html;
}

function renderExplain(src) {    var meta = {};
    var code = [];
    var expl = [];
    var seenSeparator = false;
    src.split('\n').forEach(function (line) {
        var m = line.match(/^([a-z_]+)\s*:\s?(.*)$/i);
        if (!seenSeparator && m && ['lang', 'group', 'level', 'topic'].indexOf(m[1].toLowerCase()) !== -1) {
            meta[m[1].toLowerCase()] = m[2].trim();
            return;
        }
        if (!seenSeparator && /^---+\s*$/.test(line.trim())) { seenSeparator = true; return; }
        if (seenSeparator) {
            var em = line.match(/^##(\d+)##\s*(.*)$/);
            if (em) expl.push({ n: parseInt(em[1], 10), text: em[2] });
        } else {
            code.push(line);
        }
    });
    var lang = meta.lang || 'cpp';
    var group = meta.group || '';
    var html = '<div class="code-explain" data-lang="' + lang + '" data-group="' + group + '">';
    html += renderCodeBlock(lang, code.join('\n'));
    if (expl.length) {
        html += '<ol class="explain-lines">';
        expl.forEach(function (e) {
            html += '<li><span class="line-num">' + e.n + '</span><span class="explain-text">' +
                inline(expandRefShorthand(e.text)) + '</span></li>';
        });
        html += '</ol>';
    }
    html += '</div>';
    return html;
}

function renderMarkdown(md) {
    var lines = String(md || '').split('\n');
    var i = 0;
    var out = [];
    while (i < lines.length) {
        var line = lines[i];
        if (!line.trim()) { i++; continue; }

        var fence = line.match(/^~~~(\w*)\s*$/);
        if (fence) {
            var lang = fence[1];
            var buf = [];
            i++;
            while (i < lines.length && !/^~~~\s*$/.test(lines[i])) {
                buf.push(lines[i]); i++;
            }
            i++;
            out.push(lang === 'explain' ? renderExplain(buf.join('\n'))
                : lang === 'problem' ? renderProblem(buf.join('\n'))
                : lang === 'io' ? renderIo(buf.join('\n'))
                : renderCodeBlock(lang, buf.join('\n')));
            continue;
        }

        var h = line.match(/^(#{1,4})\s+(.*)$/);
        if (h) {
            out.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>');
            i++; continue;
        }

        if (/^(---+|\*\*\*+)$/.test(line.trim())) {
            out.push('<hr>'); i++; continue;
        }

        if (/^>\s*/.test(line)) {
            var q = [];
            while (i < lines.length && /^>\s*/.test(lines[i])) {
                q.push(lines[i].replace(/^>\s?/, ''));
                i++;
            }
            out.push(renderBlockquote(q));
            continue;
        }

        if (/^\|.*\|$/.test(line.trim()) && i + 1 < lines.length && /^\|[\s:\-|]+\|$/.test(lines[i + 1].trim())) {
            var header = line;
            var rows = [];
            i += 2;
            while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
                rows.push(lines[i]); i++;
            }
            out.push(renderTable(header, rows));
            continue;
        }

        var ul = line.match(/^(\s*)[-*+]\s+/);
        if (ul) {
            var lbuf = [line];
            i++;
            while (i < lines.length && /^(\s*)[-*+]\s+/.test(lines[i])) {
                lbuf.push(lines[i]); i++;
            }
            out.push(renderListLines(lbuf, false));
            continue;
        }

        var ol = line.match(/^(\s*)(\d+)[.)]\s+/);
        if (ol) {
            var obuf = [line];
            i++;
            while (i < lines.length && /^(\s*)(\d+)[.)]\s+/.test(lines[i])) {
                obuf.push(lines[i]); i++;
            }
            out.push(renderListLines(obuf, true));
            continue;
        }

        var pbuf = [line];
        i++;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
            pbuf.push(lines[i]); i++;
        }
        out.push('<p>' + inline(pbuf.join(' ')) + '</p>');
    }
    return out.join('\n');
}
