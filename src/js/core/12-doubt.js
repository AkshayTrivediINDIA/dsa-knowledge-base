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

    try {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function (res) {
            if (!res.ok) return res.json().then(function (j) {
                throw new Error(j && j.error ? String(j.error) : 'Server error ' + res.status);
            });
            return res.json();
        }).then(function (j) {
            if (j && j.ok && typeof j.text === 'string' && j.text) {
                addDoubtMessage('ai', doubtRender(j.text));
                doubtHistory.push({ role: 'assistant', content: j.text });
                saveDoubtHistory();
            } else {
                throw new Error((j && j.error) ? String(j.error) : 'Unexpected response from server');
            }
            finishDoubt();
        }, function (err) {
            onFail(err && err.message ? err.message : 'Network error.');
        }).catch(function (err) {
            onFail(err && err.message ? err.message : 'Network error.');
        });
    } catch (e) {
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
