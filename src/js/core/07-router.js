/* ============================================================
   DSA Knowledge Base - script.js (module: router)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ---------- Multi-page file mapping ----------
   Each DB path maps to its own static HTML file.
   home -> index.html | research/array -> array.html
   coming-soon/<id> -> <id>.html | topics/prefix-sum -> topics-prefix-sum.html
   ============================================================ */

var PAGE_FILE = {
    'home': 'index.html',
    'research/array': 'array.html'
};

function pageFile(path) {
    if (PAGE_FILE[path]) return PAGE_FILE[path];
    if (path.indexOf('coming-soon/') === 0) return path.replace('coming-soon/', '') + '.html';
    return path.replace(/\//g, '-') + '.html';
}

function parsePath() {
    return (document.body && document.body.getAttribute('data-path')) || 'home';
}

/* ---------- Hash-based SPA routing ----------
   Kept alongside the MPA build so a single file (index.html or the
   standalone bundle) can navigate entirely in-place via #/path.
   Works over http://, file:// and Android content://. */

function parseHashPath() {
    var m = window.location.hash.match(/^#\/([^?]*)/);
    return m ? decodeURIComponent(m[1]) : null;
}

function navigate(path) {
    var target = '#/' + path;
    if (target === window.location.hash) return;
    window.location.hash = target;
}

function bindHashRouter() {
    window.addEventListener('hashchange', function () {
        var p = parseHashPath();
        if (p) renderPath(p);
    });
}

function renderPath(path) {
    if (path === 'home') renderHome();
    else if (path.indexOf('coming-soon/') === 0) renderComingSoon(path.replace('coming-soon/', ''));
    else if (path.indexOf('focus/') === 0 && hasFocusConfig(path)) renderFocus(path);
    else if (DB[path]) renderPage(path);
    else renderHome();
}

function hasFocusConfig(path) {
    return typeof FOCUS_CONFIG !== 'undefined' &&
        !!FOCUS_CONFIG[String(path).replace(/^focus\//, '')];
}

function setProgress(pct) {
    var el = $('#scrollProgress');
    if (el) el.style.width = pct + '%';
}

/* ---------- Dashboard Renderer ---------- */

function renderHome() {
    currentPath = 'home';
    document.title = 'DSA Knowledge Base — Dashboard';
    safe(immersiveExit);
    safe(focusExit);
    safe(vizTeardownAll);

    var activeCount = 0;
    var totalTopics = 0;
    var totalProblems = 0;
    DS_CARDS.forEach(function (c) {
        if (c.status === 'active') activeCount++;
        totalTopics += c.topics;
        totalProblems += c.problems;
    });

    var statsHtml =
        '<div class="stats-row">' +
            '<div class="stat-card reveal-on-scroll">' +
                '<div class="stat-number" data-target="' + DS_CARDS.length + '">0</div>' +
                '<div class="stat-label">Data Structures</div>' +
            '</div>' +
            '<div class="stat-card reveal-on-scroll">' +
                '<div class="stat-number" data-target="' + totalTopics + '">0</div>' +
                '<div class="stat-label">Topics</div>' +
            '</div>' +
            '<div class="stat-card reveal-on-scroll">' +
                '<div class="stat-number" data-target="' + totalProblems + '">0</div>' +
                '<div class="stat-label">Problems</div>' +
            '</div>' +
            '<div class="stat-card reveal-on-scroll">' +
                '<div class="stat-number" data-target="5">0</div>' +
                '<div class="stat-label">Languages</div>' +
            '</div>' +
        '</div>';

    var cardsHtml = '';
    DS_CARDS.forEach(function (c, i) {
        var isActive = c.status === 'active';
        var statusBadge = isActive
            ? '<span class="ds-badge ds-badge-active">Active</span>'
            : '<span class="ds-badge ds-badge-soon">Coming Soon</span>';
        var topicCount = isActive
            ? '<span class="ds-topic-count">' + c.topics + ' topics</span>'
            : '<span class="ds-topic-count">' + c.expectedTopics.length + ' planned</span>';
        var clickAttr = ' onclick="navigate(\'' + c.path + '\')"';

        cardsHtml +=
            '<div class="ds-card' + (isActive ? ' ds-card-active' : ' ds-card-soon') + '"' +
            ' style="--card-color:' + c.color + '; animation-delay:' + (0.05 + i * 0.05) + 's"' +
            clickAttr + '>' +
                '<div class="ds-card-icon" style="color:' + c.color + '">' + c.icon + '</div>' +
                '<div class="ds-card-body">' +
                    '<h3 class="ds-card-title">' + escapeHtml(c.title) + '</h3>' +
                    '<p class="ds-card-desc">' + escapeHtml(c.desc) + '</p>' +
                '</div>' +
                '<div class="ds-card-footer">' +
                    statusBadge +
                    topicCount +
                '</div>' +
            '</div>';
    });

    var html =
        '<div class="dashboard-hero">' +
            '<h1>DSA Knowledge Base</h1>' +
            '<p class="dashboard-subtitle">Master Data Structures &amp; Algorithms — research notes, topics, interview prep, LeetCode, Codeforces, and code snippets. Everything works offline.</p>' +
        '</div>' +
        statsHtml +
        '<div class="dashboard-section">' +
            '<div class="dashboard-section-header">' +
                '<h2>Data Structures</h2>' +
            '</div>' +
            '<div class="ds-card-grid">' + cardsHtml + '</div>' +
        '</div>';

    $('#article').innerHTML = html;
    safe(initLangPref);
    safe(initScrollReveal);
    safe(animateCounters);
    renderBreadcrumb(['Home']);
    updateNavActive('home');
    expandToCurrent();
    $('#content').scrollTop = 0;
    setProgress(0);
}

/* ---------- Coming Soon Renderer ---------- */

function renderComingSoon(dsId) {
    var card = null;
    DS_CARDS.forEach(function (c) { if (c.id === dsId) card = c; });
    if (!card) { renderHome(); return; }

    currentPath = 'coming-soon/' + dsId;
    document.title = card.title + ' — Coming Soon — DSA Knowledge Base';
    safe(immersiveExit);
    safe(focusExit);
    safe(vizTeardownAll);

    var topicsList = '';
    card.expectedTopics.forEach(function (t) {
        topicsList += '<li class="coming-soon-topic">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>' +
            escapeHtml(t) +
            '</li>';
    });

    var html =
        '<div class="coming-soon-page">' +
            '<div class="coming-soon-icon" style="color:' + card.color + '">' +
                '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="coming-soon-lock">' +
                    '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
                    '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
                '</svg>' +
            '</div>' +
            '<h1 class="coming-soon-title">' + escapeHtml(card.title) + '</h1>' +
            '<p class="coming-soon-desc">' + escapeHtml(card.desc) + '</p>' +
            '<div class="shimmer-bar"><div class="shimmer-fill" style="background:' + card.color + '"></div></div>' +
            '<div class="coming-soon-topics">' +
                '<h3>Expected Topics</h3>' +
                '<ul class="coming-soon-list">' + topicsList + '</ul>' +
            '</div>' +
            '<div class="coming-soon-cta">' +
                '<p>This section is under active development. Want to contribute?</p>' +
                '<a href="#/home" class="btn btn-primary" style="background:' + card.color + '; border-color:' + card.color + '">Back to Dashboard</a>' +
            '</div>' +
        '</div>';

    $('#article').innerHTML = html;
    safe(initScrollReveal);
    renderBreadcrumb(['Home', card.title]);
    updateNavActive('coming-soon/' + dsId);
    expandToCurrent();
    updateBookmarkBtn();
    $('#content').scrollTop = 0;
    setProgress(0);
}

/* ---------- Page Renderer (with transition) ---------- */

/* Pages that get a "Visualizer Studio" launch button — maps a DB path
   to the studio's algorithm label. The button deep-links to /viz/ so
   the full-screen React visualizer can run the same algorithm. */
var VIZ_STUDIO_LINKS = {
    'topics/traversal': 'Array Traversal',
    'topics/prefix-sum': 'Prefix Sum',
    'topics/sliding-window': 'Sliding Window',
    'topics/kadane': 'Kadane Algorithm',
    'topics/sorting': 'Sorting'
};

function renderPage(path) {
    var page = DB[path];
    if (!page) { renderHome(); return; }
    currentPath = path;
    document.title = page.title + ' — DSA Knowledge Base';
    safe(immersiveExit);
    safe(focusExit);
    safe(vizTeardownAll);
    $('#article').innerHTML = renderMarkdown(page.content);
    safe(initLangTabsAll);
    safe(initScrollReveal);
    safe(vizInitForPage);
    safe(immersiveEnter);
    if (VIZ_STUDIO_LINKS[path]) injectVizStudioCta(VIZ_STUDIO_LINKS[path]);
    renderBreadcrumb(page.crumbs || ['Home', page.title]);
    updateNavActive(path);
    expandToCurrent();
    updateBookmarkBtn();
    $('#content').scrollTop = 0;
    setProgress(0);
}

/* ---------- Breadcrumb & Nav ---------- */

/* Injects a "Visualizer Studio" launch button into the article. Uses a
   relative href so it also works from the file:// standalone, and only
   links to /viz/ when served over http(s) (location.protocol). */
function injectVizStudioCta(label) {
    var article = $('#article');
    if (!article || article.querySelector('.viz-studio-cta')) return;
    var rel = (location.protocol === 'http:' || location.protocol === 'https:') ? '/viz/' : 'visualizer/dist/index.html';
    var a = document.createElement('a');
    a.className = 'viz-studio-cta';
    a.href = rel;
    a.innerHTML =
        '<span class="viz-studio-cta-icon">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<polygon points="5 3 19 12 5 21 5 3"></polygon>' +
            '</svg>' +
        '</span>' +
        '<span class="viz-studio-cta-body">' +
            '<strong>Open Visualizer Studio</strong>' +
            '<small>' + escapeHtml(label) + ' — full-screen, interactive</small>' +
        '</span>' +
        '<span class="viz-studio-cta-arrow">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
        '</span>';
    article.insertBefore(a, article.firstChild);
}

function renderBreadcrumb(crumbs) {
    $('#breadcrumb').innerHTML = crumbs.map(function (c, i) {
        var last = i === crumbs.length - 1;
        return '<span class="breadcrumb-item' + (last ? ' breadcrumb-current' : '') + '">' +
            escapeHtml(c) + '</span>' + (last ? '' : '<span class="breadcrumb-separator">/</span>');
    }).join('');
}

function updateNavActive(path) {
    $$('.sidebar .nav-item[data-path]').forEach(function (el) {
        el.classList.toggle('active', el.getAttribute('data-path') === path);
    });
}

function expandToCurrent() {
    var active = $('.sidebar .nav-item.active[data-path]');
    if (!active) return;
    var el = active.parentElement;
    while (el && !el.classList.contains('sidebar')) {
        if (el.classList.contains('nav-children')) {
            el.classList.add('open');
            var prev = el.previousElementSibling;
            if (prev && prev.classList.contains('nav-parent')) prev.classList.add('expanded');
        }
        el = el.parentElement;
    }
}

/* ---------- Scroll Reveal ---------- */

function initScrollReveal() {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    $$('.reveal-on-scroll').forEach(function (el) {
        if (!el.classList.contains('revealed')) observer.observe(el);
    });
}

/* ---------- Animated Counters ---------- */

function animateCounters() {
    $$('.stat-number[data-target]').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 800;
        var start = performance.now();

        function step(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}
