/* ============================================================
   DSA Knowledge Base - script.js (module: langtabs)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ---------- Language Tab Groups ----------
   All .code-explain blocks sharing the same data-group render as
   one tabbed widget (C · C++ · Java · Python · Dart). Tabs default
   to the user's preferred language (if present), else C++.

   Every code block also carries a .lang-switch <select>:
   - inside a group  -> switches the group's active tab
   - standalone      -> jumps to the same snippet under the same
                        heading on this page.

   The home page asks the user for their preferred language on first
   visit (persisted via safe storage) and offers a persistent control
   to change it. */

var groupWidgets = [];
var groupWidgetsActive = {};

/* ---------- Preferred language ---------- */

var PREF_KEY = 'dsa_lang';
var PREF_ASKED_KEY = 'dsa_lang_asked';

function getPrefLang() {
    var v = storage.get(PREF_KEY);
    return LANG_ORDER.indexOf(v) !== -1 ? v : null;
}

function setPrefLang(l) {
    if (LANG_ORDER.indexOf(l) !== -1) storage.set(PREF_KEY, l);
}

function applyPrefToGroups() {
    var pref = getPrefLang();
    if (!pref) return;
    $$('.code-explain[data-group]').forEach(function (el) {
        var g = el.getAttribute('data-group');
        if (!g) return;
        var present = $$('.code-explain[data-group="' + g + '"]').some(function (x) {
            return x.getAttribute('data-lang') === pref;
        });
        if (present) {
            groupWidgetsActive[g] = pref;
            activateGroup(g, pref);
        }
    });
}

/* ---------- Language tab groups ---------- */

function initLangTabs(root) {
    var scope = root || document;
    var groups = {};
    $$('.code-explain[data-group]', scope).forEach(function (el) {
        var g = el.getAttribute('data-group');
        if (!g) return;
        if (!groups[g]) groups[g] = [];
        groups[g].push(el);
    });

    Object.keys(groups).forEach(function (g) {
        var widgets = groups[g];
        if (widgets.length < 2) return;
        var langs = widgets.map(function (w) { return w.getAttribute('data-lang'); });
        var defaultLang = langs.indexOf('cpp') !== -1 ? 'cpp' : langs[0];
        var persisted = groupWidgetsActive[g];
        var pref = getPrefLang();
        var initial = persisted !== undefined && langs.indexOf(persisted) !== -1 ? persisted
            : pref && langs.indexOf(pref) !== -1 ? pref
            : defaultLang;

        var bar = document.createElement('div');
        bar.className = 'lang-tabs';
        langs.forEach(function (l) {
            var btn = document.createElement('button');
            btn.className = 'lang-tab';
            btn.setAttribute('data-group', g);
            btn.setAttribute('data-lang', l);
            btn.textContent = langName(l);
            btn.addEventListener('click', function () {
                activateGroup(g, l);
            });
            bar.appendChild(btn);
        });

        var first = widgets[0];
        first.parentNode.insertBefore(bar, first);
        activateGroup(g, initial);
    });
}

function activateGroup(g, lang) {
    groupWidgetsActive[g] = lang;
    $$('.code-explain[data-group="' + g + '"]').forEach(function (el) {
        var isActive = el.getAttribute('data-lang') === lang;
        el.style.display = isActive ? '' : 'none';
    });
    $$('.lang-tab[data-group="' + g + '"]').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    $$('.code-explain[data-group="' + g + '"] .lang-switch').forEach(function (sel) {
        sel.value = lang;
    });
}

/* ---------- Per-block language switcher ---------- */

function flashBlock(el) {
    el.style.boxShadow = '0 0 0 3px var(--accent-primary)';
    setTimeout(function () { el.style.boxShadow = ''; }, 1600);
}

function blockContext(block) {
    var node = block.previousElementSibling;
    while (node) {
        if (node.tagName && /^H[1-4]$/.test(node.tagName)) return node.tagName + '|' + node.textContent.trim();
        node = node.previousElementSibling;
    }
    return '';
}

function findTwinBlock(article, block, targetLang) {
    var ctx = blockContext(block);
    var candidates = $$('.code-block[data-lang="' + targetLang + '"]', article);
    for (var i = 0; i < candidates.length; i++) {
        var c = candidates[i];
        if (c === block) continue;
        if (c.closest && c.closest('.code-explain')) continue;
        if (blockContext(c) === ctx) return c;
    }
    return null;
}

function switchBlockLanguage(block, targetLang) {
    var explain = block.closest && block.closest('.code-explain');
    var g = explain ? explain.getAttribute('data-group') : null;
    if (g) {
        if ($$('.code-explain[data-group="' + g + '"][data-lang="' + targetLang + '"]').length) {
            activateGroup(g, targetLang);
            return;
        }
        toast('No ' + langName(targetLang) + ' version in this group');
        block.querySelector('.lang-switch').value = explain.getAttribute('data-lang');
        return;
    }
    var sel = block.querySelector('.lang-switch');
    var target = findTwinBlock($('#article'), block, targetLang);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        flashBlock(target);
        var tsel = target.querySelector('.lang-switch');
        if (tsel) tsel.value = target.getAttribute('data-lang');
    } else {
        toast('No ' + langName(targetLang) + ' version on this page');
    }
    if (sel) sel.value = block.getAttribute('data-lang');
}

function initBlockSwitchers(root) {
    var scope = root || document;
    $$('.lang-switch', scope).forEach(function (sel) {
        if (sel.__wired) return;
        sel.__wired = true;
        sel.addEventListener('change', function () {
            var block = sel.closest('.code-block');
            if (!block) return;
            switchBlockLanguage(block, sel.value);
        });
    });
}

/* ---------- Problem cards ("View code") ---------- */

function initProblemSolutionButtons(root) {
    var scope = root || document;
    $$('.problem-solution-btn', scope).forEach(function (btn) {
        if (btn.__wired) return;
        btn.__wired = true;
        btn.addEventListener('click', function () {
            var g = btn.getAttribute('data-group');
            var target = $('.code-explain[data-group="' + g + '"]');
            if (!target) return;
            var active = groupWidgetsActive[g];
            if (!active) {
                var tab = $('.lang-tab[data-group="' + g + '"]');
                active = tab ? tab.getAttribute('data-lang') : 'cpp';
            }
            activateGroup(g, active);
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            flashBlock(target);
        });
    });
}

/* ---------- Preferred language ask (home page) ---------- */

function renderLangPrefBar() {
    var article = $('#article');
    if (!article || article.querySelector('.lang-pref-bar')) return;
    var cur = getPrefLang();
    var html = '<div class="lang-pref-bar">' +
        '<span class="lang-pref-label">Preferred language:</span>' +
        '<select id="langPrefSelect" class="lang-pref-select" aria-label="Preferred language">' +
        langSelectOptions(cur) +
        '</select>' +
        '<span class="lang-pref-hint">Code tabs default to this language.</span>' +
        '</div>';
    article.insertAdjacentHTML('afterbegin', html);
    var sel = $('#langPrefSelect');
    if (sel) {
        sel.addEventListener('change', function () {
            setPrefLang(this.value);
            applyPrefToGroups();
            toast('Preferred language: ' + langName(this.value));
        });
    }
}

function closeLangPrefModal() {
    var modal = $('#langPrefModal');
    if (modal) modal.classList.remove('open');
}

function chooseLangPref(l) {
    setPrefLang(l);
    storage.set(PREF_ASKED_KEY, '1');
    closeLangPrefModal();
    var homeSel = $('#langPrefSelect');
    if (homeSel) homeSel.value = l;
    applyPrefToGroups();
    toast('Preferred language: ' + langName(l));
}

function initLangPref() {
    safe(initLangPrefModal);
    renderLangPrefBar();
    if (getPrefLang() || storage.get(PREF_ASKED_KEY)) return;
    var modal = $('#langPrefModal');
    if (!modal) return;
    modal.classList.add('open');
}

var langPrefWired = false;

function initLangPrefModal() {
    if (langPrefWired) return;
    langPrefWired = true;
    var modal = $('#langPrefModal');
    if (!modal) return;
    $$('.lang-pref-option', modal).forEach(function (btn) {
        btn.addEventListener('click', function () {
            chooseLangPref(btn.getAttribute('data-lang'));
        });
    });
    var skip = $('#langPrefSkip');
    if (skip) {
        skip.addEventListener('click', function () {
            storage.set(PREF_ASKED_KEY, '1');
            closeLangPrefModal();
        });
    }
    $('#langPrefBackdrop').addEventListener('click', function () {
        storage.set(PREF_ASKED_KEY, '1');
        closeLangPrefModal();
    });
}

/* ---------- Entry point ---------- */

function initLangTabsAll() {
    initLangPrefModal();
    initLangTabs(document);
    initBlockSwitchers(document);
    initProblemSolutionButtons(document);
}
