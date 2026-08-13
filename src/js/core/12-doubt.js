/* ============================================================
   DSA Knowledge Base - script.js (module: ask-doubt)
   "Ask Doubt" AI tutor panel — floating chat wired to the
   server-side proxy (server.js) so the API key never ships in
   the static site. Works over http(s) with a same-origin proxy;
   over file:// and content:// it needs a manually-set proxy URL
   (panel settings). Degrades to a friendly offline message when
   the proxy is unreachable — the site itself stays fully offline.
   ============================================================ */

var doubtOpen = false;
var doubtBusy = false;
var doubtHistory = [];
var DOUBT_HISTORY_KEY = 'dsa_doubt_history';
var DOUBT_URL_KEY = 'dsa_doubt_url';

/* streaming cursor element appended to the live AI bubble while tokens arrive */
function doubtCursor() {
    var c = document.createElement('span');
    c.className = 'doubt-cursor';
    c.setAttribute('aria-hidden', 'true');
    return c;
}

function doubtIsHttpOrigin() {
    try {
        var p = window.location.protocol;
        return p === 'http:' || p === 'https:';
    } catch (e) {
        return false;
    }
}

function doubtAskUrl() {
    if (doubtIsHttpOrigin()) return '/api/ask';
    var base = String(storage.get(DOUBT_URL_KEY) || '').replace(/\/+$/, '');
    return base ? base + '/api/ask' : '';
}

function doubtEscape(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function doubtRender(src) {
    var blocks = String(src || '').split(/\n{2,}/);
    var out = [];
    for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i].trim();
        if (b.indexOf('```') === 0) {
            var code = b.replace(/^```[^\n]*\n?/, '').replace(/```\s*$/, '');
            out.push('<pre class="doubt-code">' + doubtEscape(code) + '</pre>');
        } else {
            var line = doubtEscape(b)
                .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`\n]+)`/g, '<code>$1</code>');
            out.push('<p>' + line.replace(/\n/g, '<br>') + '</p>');
        }
    }
    return out.join('');
}

function doubtContext() {
    var title = '';
    var p = currentPath || '';
    try { title = document.title; } catch (e) {}
    return 'You are a friendly, concise DSA tutor for the DSA Knowledge Base app. ' +
        'The student is on the page "' + title + '" (path: ' + p + '). ' +
        'Answer clearly and directly. Use short code snippets when they help. ' +
        'If asked about a problem, explain the approach, complexity, then code.';
}

function doubtWelcome() {
    return '<p>Hi! I\u2019m the DSA tutor. Ask about any topic, problem, or code on this page \u2014 e.g. \u201cWhy is Kadane O(n)?\u201d</p>';
}

function addDoubtMessage(role, html) {
    var list = $('#doubtMessages');
    if (!list) return;
    var wrap = document.createElement('div');
    wrap.className = 'doubt-msg doubt-msg-' + (role === 'user' ? 'user' : 'ai');
    wrap.innerHTML = html;
    list.appendChild(wrap);
    list.scrollTop = list.scrollHeight;
}

function showDoubtTyping() {
    var list = $('#doubtMessages');
    if (!list) return;
    var t = document.createElement('div');
    t.className = 'doubt-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    list.appendChild(t);
    list.scrollTop = list.scrollHeight;
}

function hideDoubtTyping() {
    var t = $('.doubt-typing');
    if (t) t.remove();
}

function setDoubtBusy(busy) {
    doubtBusy = busy;
    var send = $('#doubtSend');
    var ta = $('#doubtInput');
    if (send) send.disabled = busy;
    if (ta) ta.disabled = busy;
}

function saveDoubtHistory() {
    try { storage.set(DOUBT_HISTORY_KEY, JSON.stringify(doubtHistory.slice(-40))); } catch (e) {}
}

function loadDoubtHistory() {
    try {
        var s = storage.get(DOUBT_HISTORY_KEY);
        if (!s) return;
        var arr = JSON.parse(s);
        if (Array.isArray(arr)) doubtHistory = arr;
    } catch (e) {}
}

function renderDoubtHistory() {
    var list = $('#doubtMessages');
    if (!list) return;
    list.innerHTML = '';
    if (!doubtHistory.length) {
        list.innerHTML = '<div class="doubt-msg doubt-msg-ai">' + doubtWelcome() + '</div>';
    } else {
        doubtHistory.forEach(function (m) {
            addDoubtMessage(m.role, doubtRender(m.content));
        });
    }
    if (!doubtAskUrl()) {
        var hint = document.createElement('div');
        hint.className = 'doubt-offline';
        hint.innerHTML = '<p>AI needs a network server. Run <code>node server.js</code> anywhere, then set its URL with the settings gear above.</p>';
        list.appendChild(hint);
    }
}

function openDoubt() {
    doubtOpen = true;
    var panel = $('#doubtPanel');
    if (panel) {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
    }
    var fab = $('#doubtFab');
    if (fab) fab.classList.add('active');
    renderDoubtHistory();
    setTimeout(function () {
        var ta = $('#doubtInput');
        if (ta) ta.focus();
    }, 120);
}

function closeDoubt() {
    doubtOpen = false;
    var panel = $('#doubtPanel');
    if (panel) {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
    }
    var fab = $('#doubtFab');
    if (fab) fab.classList.remove('active');
}

function toggleDoubt() {
    if (doubtOpen) closeDoubt();
    else openDoubt();
}

function finishDoubt() {
    hideDoubtTyping();
    setDoubtBusy(false);
}

/* thrown when the proxy answered with plain JSON (no SSE) despite stream:true —
   the caller falls back to the non-stream rendering path. */
function DoubtStreamFallback(json) {
    this.json = json;
    this.message = 'non-streaming proxy response';
}
DoubtStreamFallback.prototype = Object.create(Error.prototype);
DoubtStreamFallback.prototype.constructor = DoubtStreamFallback;

/* ---------- SSE streaming read ----------
   Reads the proxy's `data: {ok,delta}` events through the fetch body reader,
   re-renders the AI bubble on every token and keeps a blinking cursor until the
   final `data: {ok,done}` frame. Resolves with {ok:true,text} (or JSON on an
   early error event). */
function doubtStreamResponse(res) {
    return new Promise(function (resolve, reject) {
        if (!res.body || !res.body.getReader || typeof TextDecoder === 'undefined') {
            res.text().then(function (raw) {
                try { resolve(JSON.parse(raw)); }
                catch (e) { reject(new Error('Server returned a non-JSON response.')); }
            }).catch(reject);
            return;
        }

        var reader = res.body.getReader();
        var decoder = new TextDecoder('utf-8');
        var buffer = '';
        var full = '';
        var bubble = null;
        var list = $('#doubtMessages');
        var raf = null;

        function rerender() {
            raf = null;
            if (!bubble) return;
            bubble.innerHTML = doubtRender(full) + doubtCursor().outerHTML;
            if (list) list.scrollTop = list.scrollHeight;
        }

        function schedule() {
            if (raf === null && typeof requestAnimationFrame === 'function') {
                raf = requestAnimationFrame(rerender);
            }
        }

        function handleFrame(data) {
            if (!data || data === '[DONE]') return;
            var j = null;
            try { j = JSON.parse(data); } catch (e) { return; }
            if (j && typeof j.delta === 'string') full += j.delta;
            if (j && j.done) return;            /* streaming finished */
            if (j && j.ok === false && j.error && full === '') {
                var err = new Error(j.error);
                err.doubtFail = true;
                throw err;
            }
        }

        function pump() {
            return reader.read().then(function (r) {
                if (r.done) {
                    /* flush any trailing line with no newline */
                    if (buffer.trim()) {
                        try { handleFrame(buffer.trim()); } catch (e) { throw e; }
                        buffer = '';
                    }
                    schedule();
                    if (!full) {
                        var e2 = new Error('Server returned an empty response.');
                        e2.doubtFail = true;
                        throw e2;
                    }
                    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
                    var doneBubble = $('#doubtMessages');
                    var live = bubble;
                    if (live) {
                        live.innerHTML = doubtRender(full);
                        if (doneBubble) doneBubble.scrollTop = doneBubble.scrollHeight;
                    }
                    resolve({ ok: true, text: full, streamed: true });
                    return;
                }
                buffer += decoder.decode(r.value, { stream: true });
                var idx;
                while ((idx = buffer.indexOf('\n')) !== -1) {
                    var line = buffer.slice(0, idx);
                    buffer = buffer.slice(idx + 1);
                    var t = String(line).replace(/\r$/, '').trim();
                    if (t.indexOf('data:') === 0) {
                        try { handleFrame(t.slice(5).trim()); }
                        catch (e) { reader.cancel(); throw e; }
                    }
                }
                if (!bubble && full) {
                    hideDoubtTyping();
                    bubble = document.createElement('div');
                    bubble.className = 'doubt-msg doubt-msg-ai doubt-msg-stream';
                    if (list) list.appendChild(bubble);
                    schedule();
                }
                return pump();
            });
        }

        pump().catch(function (err) {
            if (err && err.doubtFail) {
                addDoubtMessage('ai', '<p class="doubt-error">' + doubtEscape(err.message) + '</p>');
                finishDoubt();
                err.silentDoubt = true;
                reject(err);
                return;
            }
            /* die silently mid-stream if we already showed tokens */
            if (full) {
                if (bubble) bubble.innerHTML = doubtRender(full);
                resolve({ ok: true, text: full, streamed: true });
                return;
            }
            reject(err);
        });
    });
}

function sendDoubt() {
    var ta = $('#doubtInput');
    if (!ta) return;
    var q = ta.value.trim();
    if (!q || doubtBusy) return;

    ta.value = '';
    if (ta.style) ta.style.height = 'auto';

    addDoubtMessage('user', doubtRender(q));
    doubtHistory.push({ role: 'user', content: q });

    var url = doubtAskUrl();
    if (!url) {
        addDoubtMessage('ai', '<p class="doubt-error">This page can\u2019t reach an AI server on its own.</p>' +
            '<p class="doubt-hint-text">Run <code>node server.js</code>, then open the settings gear and paste the server URL (e.g. http://192.168.1.5:8000).</p>');
        return;
    }

    setDoubtBusy(true);
    showDoubtTyping();

    var payload = {
        stream: true,
        messages: [
            { role: 'system', content: doubtContext() },
            { role: 'user', content: q }
        ]
    };

    function onFail(msg) {
        addDoubtMessage('ai', '<p class="doubt-error">Sorry, I couldn\u2019t reach the AI server.</p>' +
            '<p class="doubt-hint-text">' + doubtEscape(msg) + '</p>');
        finishDoubt();
    }

    function readJson(res, ok) {
        return res.text().then(function (raw) {
            if (!raw) {
                if (!ok) throw new Error('Server returned an empty response (HTTP ' + res.status + ').');
                throw new Error('Server returned an empty response.');
            }
            try {
                return JSON.parse(raw);
            } catch (e) {
                if (!ok) throw new Error('Server error ' + res.status + ' (not JSON).');
                throw new Error('Server returned a non-JSON response.');
            }
        });
    }

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 100000);

    try {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ctrl.signal,
            body: JSON.stringify(payload)
        }).then(function (res) {
            if (!res.ok) return readJson(res, false).then(function (j) {
                throw new Error(j && j.error ? String(j.error) : 'Server error ' + res.status);
            });
            var ctype = String((res.headers && res.headers.get) ? (res.headers.get('content-type') || '') : '');
            if (ctype.indexOf('text/event-stream') === -1) return readJson(res, true).then(function (j) {
                throw new DoubtStreamFallback(j);
            });
            return doubtStreamResponse(res);
        }).then(function (j) {
            clearTimeout(timer);
            if (j && j.ok && typeof j.text === 'string' && j.text) {
                if (j.streamed) {
                    finishDoubt();
                    doubtHistory.push({ role: 'assistant', content: j.text });
                    saveDoubtHistory();
                    return;
                }
                addDoubtMessage('ai', doubtRender(j.text));
                doubtHistory.push({ role: 'assistant', content: j.text });
                saveDoubtHistory();
            } else {
                throw new Error((j && j.error) ? String(j.error) : 'Unexpected response from server');
            }
            finishDoubt();
        }, function (err) {
            clearTimeout(timer);
            if (err && err.silentDoubt) return;   /* specific error bubble already shown */
            if (err instanceof DoubtStreamFallback) {
                var j = err.json;
                if (j && j.ok && typeof j.text === 'string' && j.text) {
                    addDoubtMessage('ai', doubtRender(j.text));
                    doubtHistory.push({ role: 'assistant', content: j.text });
                    saveDoubtHistory();
                    finishDoubt();
                    return;
                }
            }
            onFail((err && err.name === 'AbortError') ? 'The AI server took too long (100s). Try again.' :
                (err && err.message ? err.message : 'Network error.'));
        }).catch(function (err) {
            clearTimeout(timer);
            if (err && err.silentDoubt) return;
            onFail((err && err.name === 'AbortError') ? 'The AI server took too long (100s). Try again.' :
                (err && err.message ? err.message : 'Network error.'));
        });
    } catch (e) {
        clearTimeout(timer);
        onFail('fetch() unavailable in this environment.');
    }
}

function clearDoubtHistory() {
    doubtHistory = [];
    try { storage.set(DOUBT_HISTORY_KEY, ''); } catch (e) {}
    var list = $('#doubtMessages');
    if (list) list.innerHTML = '<div class="doubt-msg doubt-msg-ai">' + doubtWelcome() + '</div>';
}

function toggleDoubtSettings() {
    var row = $('#doubtSettingsRow');
    if (!row) return;
    row.hidden = !row.hidden;
    if (!row.hidden) {
        var input = $('#doubtUrlInput');
        if (input) input.value = storage.get(DOUBT_URL_KEY) || '';
    }
}

function doubtSaveUrl() {
    var input = $('#doubtUrlInput');
    if (!input) return;
    doubtSetServerUrl(input.value.trim());
    toggleDoubtSettings();
    var v = String(storage.get(DOUBT_URL_KEY) || '');
    toast(v ? 'AI server URL saved' : 'AI server URL cleared');
    renderDoubtHistory();
}

function doubtSetServerUrl(v) {
    try { storage.set(DOUBT_URL_KEY, String(v || '')); } catch (e) {}
}

function autoResizeDoubt() {
    var ta = $('#doubtInput');
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
}

function bindDoubt() {
    var fab = $('#doubtFab');
    if (fab) fab.addEventListener('click', toggleDoubt);

    var closeBtn = $('#doubtClose');
    if (closeBtn) closeBtn.addEventListener('click', closeDoubt);

    var clearBtn = $('#doubtClear');
    if (clearBtn) clearBtn.addEventListener('click', clearDoubtHistory);

    var gear = $('#doubtSettings');
    if (gear) gear.addEventListener('click', toggleDoubtSettings);

    var saveBtn = $('#doubtUrlSave');
    if (saveBtn) saveBtn.addEventListener('click', doubtSaveUrl);

    var form = $('#doubtForm');
    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        sendDoubt();
    });

    var ta = $('#doubtInput');
    if (ta) {
        ta.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendDoubt();
            }
        });
        ta.addEventListener('input', autoResizeDoubt);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && doubtOpen) closeDoubt();
    });
}
