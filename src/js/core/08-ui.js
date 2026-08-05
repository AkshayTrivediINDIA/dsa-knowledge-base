/* ============================================================
   DSA Knowledge Base - script.js (module: ui)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ============================================================
   Bookmarks
   ============================================================ */

function getBookmarks() {
    try {
        return JSON.parse(storage.get('dsa_bookmarks') || '[]');
    } catch (e) {
        return [];
    }
}

function saveBookmarks(list) {
    storage.set('dsa_bookmarks', JSON.stringify(list));
}

function updateBookmarkBtn() {
    $('#bookmarkBtn').classList.toggle('active', getBookmarks().indexOf(currentPath) >= 0);
}

function renderBookmarks() {
    var list = getBookmarks();
    var el = $('#bookmarksList');
    if (!list.length) {
        el.innerHTML = '<p class="bookmarks-empty">No bookmarks yet. Press Ctrl+B on any page to bookmark it.</p>';
        return;
    }
    el.innerHTML = '';
    list.forEach(function (p) {
        var d = DB[p];
        if (!d) return;
        var item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><span>' + escapeHtml(d.title) + '</span>';
        item.addEventListener('click', function () {
            navigate(p);
            closeBookmarks();
        });
        el.appendChild(item);
    });
}

/* ============================================================
   Theme
   ============================================================ */

function initTheme() {
    var saved = storage.get('dsa_theme');
    document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
}

/* ============================================================
   Bookmarks Panel
   ============================================================ */

function openBookmarks() {
    renderBookmarks();
    $('#bookmarksPanel').classList.add('open');
}

function closeBookmarks() {
    $('#bookmarksPanel').classList.remove('open');
}

/* ============================================================
   Code Blocks
   ============================================================ */

function copyText(text, btn) {
    function done() {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
        fallbackCopy(text);
        done();
    }
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
}

function bindCodeBlocks() {
    $('#article').addEventListener('click', function (e) {
        var card = e.target.closest('.card[data-path]');
        if (card) {
            navigate(card.getAttribute('data-path'));
            return;
        }
        var btn = e.target.closest('.code-action-btn');
        if (!btn) return;
        var block = btn.closest('.code-block');
        var codeEl = block.querySelector('code');
        if (btn.getAttribute('data-action') === 'copy') {
            copyText(codeEl.textContent, btn);
        } else if (btn.getAttribute('data-action') === 'expand') {
            var expanded = codeEl.style.maxHeight === 'none';
            codeEl.style.maxHeight = expanded ? '' : 'none';
            btn.textContent = expanded ? 'Expand' : 'Collapse';
        }
    });
}

/* ============================================================
   Toast
   ============================================================ */

function toast(msg) {
    var el = $('#toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(16px);background:#24292f;color:#fff;padding:10px 18px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.25);font-size:13px;z-index:300;opacity:0;transition:all .25s ease;font-family:inherit;';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(16px)';
    }, 1800);
}

/* ============================================================
   Scroll Progress & Back to Top
   ============================================================ */

function bindScroll() {
    var content = $('#content');
    content.addEventListener('scroll', function () {
        var max = content.scrollHeight - content.clientHeight;
        var pct = max > 0 ? (content.scrollTop / max) * 100 : 0;
        setProgress(pct);
    });
    $('#backToTop').addEventListener('click', function () {
        content.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ============================================================
   Sidebar & Navigation
   ============================================================ */

function bindSidebar() {
    $('#sidebarToggle').addEventListener('click', function () {
        $('#sidebar').classList.toggle('open');
    });

    $$('.sidebar .nav-item').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            if (el.classList.contains('nav-parent')) {
                el.classList.toggle('expanded');
                var next = el.nextElementSibling;
                if (next && next.classList.contains('nav-children')) next.classList.toggle('open');
                return;
            }
            var path = el.getAttribute('data-path');
            if (path) {
                navigate(path);
                $('#sidebar').classList.remove('open');
            }
        });
    });

    $('#copyPathBtn').addEventListener('click', function () {
        copyText(currentPath, this);
        toast('Path copied: ' + currentPath);
    });

    $('#bookmarkBtn').addEventListener('click', function () {
        var list = getBookmarks();
        var idx = list.indexOf(currentPath);
        if (idx >= 0) {
            list.splice(idx, 1);
            saveBookmarks(list);
            toast('Bookmark removed');
        } else {
            list.push(currentPath);
            saveBookmarks(list);
            toast('Bookmarked');
        }
        updateBookmarkBtn();
        renderBookmarks();
    });
}

/* ============================================================
   Search & Modal Bindings
   ============================================================ */

function bindSearch() {
    $('#searchInput').addEventListener('focus', function () { openSearch(); });
    $('#searchBackdrop').addEventListener('click', closeSearch);

    $('#modalSearchInput').addEventListener('input', function () {
        var q = this.value;
        renderSearchResults(searchIndex(q), q);
    });

    $('#modalSearchInput').addEventListener('keydown', function (e) {
        var items = $$('#searchResults .search-result-item');
        if (!items.length) return;
        var cur = selectedResult;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectResult(items, (cur + 1) % items.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectResult(items, cur <= 0 ? items.length - 1 : cur - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedResult >= 0 && items[selectedResult]) items[selectedResult].click();
        }
    });
}

function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
        var tag = document.activeElement && document.activeElement.tagName;
        if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
            e.preventDefault();
            openSearch();
        } else if (e.key === 'Escape') {
            closeSearch();
            closeBookmarks();
            $('#sidebar').classList.remove('open');
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            if ($('#bookmarksPanel').classList.contains('open')) closeBookmarks();
            else openBookmarks();
        }
    });
    $('#bookmarkToggle').addEventListener('click', function () {
        if ($('#bookmarksPanel').classList.contains('open')) closeBookmarks();
        else openBookmarks();
    });
    $('#closeBookmarks').addEventListener('click', closeBookmarks);
    $('#themeToggle').addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme');
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        storage.set('dsa_theme', next);
    });
}
