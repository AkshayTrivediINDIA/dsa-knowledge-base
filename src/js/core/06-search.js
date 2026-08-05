/* ============================================================
   DSA Knowledge Base - script.js (module: search)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ============================================================
   Search Index
   ============================================================ */

var SEARCH_INDEX = [];

function buildIndex() {
    SEARCH_INDEX = [];
    Object.keys(DB).forEach(function (id) {
        var d = DB[id];
        var text = (d.content || '').replace(/~~~\w*\s*/g, ' ').replace(/[`#*_>|[\]]/g, ' ').toLowerCase();
        SEARCH_INDEX.push({ id: id, title: d.title, crumbs: d.crumbs, text: text });
    });
}

function searchIndex(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    var res = [];
    SEARCH_INDEX.forEach(function (page) {
        var hay = page.title.toLowerCase() + ' ' + page.text;
        for (var t = 0; t < terms.length; t++) {
            if (hay.indexOf(terms[t]) === -1) return;
        }
        var score = 0;
        terms.forEach(function (term) {
            if (page.title.toLowerCase().indexOf(term) !== -1) score += 10;
            if (page.text.indexOf(term) !== -1) score += 1;
        });
        res.push({ page: page, score: score });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    return res.slice(0, 20);
}

/* ============================================================
   Search Modal
   ============================================================ */

function openSearch() {
    $('#searchModal').classList.add('open');
    $('#modalSearchInput').value = '';
    selectedResult = -1;
    $('#searchResults').innerHTML = '<div class="search-empty"><p>Type to search across all topics, problems, and patterns.</p></div>';
    setTimeout(function () { $('#modalSearchInput').focus(); }, 50);
}

function closeSearch() {
    $('#searchModal').classList.remove('open');
}

function snippetFor(page, query) {
    var term = query.trim().toLowerCase().split(/\s+/)[0];
    var idx = page.text.indexOf(term);
    var start = Math.max(0, idx - 40);
    var raw = page.text.slice(start, start + 120);
    return (start > 0 ? '…' : '') + raw + '…';
}

function renderSearchResults(results, query) {
    var el = $('#searchResults');
    if (!results.length) {
        el.innerHTML = '<div class="search-empty"><p>No matches for "' + escapeHtml(query) + '".</p></div>';
        return;
    }
    el.innerHTML = '';
    results.forEach(function (r, i) {
        var item = document.createElement('div');
        item.className = 'search-result-item' + (i === 0 ? ' selected' : '');
        item.innerHTML =
            '<span class="search-result-title">' + escapeHtml(r.page.title) + '</span>' +
            '<span class="search-result-path">' + r.page.crumbs.map(escapeHtml).join(' / ') + '</span>' +
            '<span class="search-result-preview">' + escapeHtml(snippetFor(r.page, query)) + '</span>';
        item.addEventListener('click', function () {
            navigate(r.page.id);
            closeSearch();
        });
        el.appendChild(item);
        if (i === 0) selectedResult = 0;
    });
}

function selectResult(items, idx) {
    if (idx < 0 || idx >= items.length) return;
    items.forEach(function (it) { it.classList.remove('selected'); });
    items[idx].classList.add('selected');
    selectedResult = idx;
    items[idx].scrollIntoView({ block: 'nearest' });
}
