/* ============================================================
   DSA Knowledge Base - script.js (module: init)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ============================================================
   Init
   ============================================================ */

/* visualizer config container — populated by the src/js/viz/** modules
   (topics + problems). Declared here in core so it exists before the
   module.exports below and is shared by the viz modules. */
var VIZ_CONFIG = {};

function safe(fn) {
    try { fn(); } catch (e) { /* never let one subsystem break the app */ }
}

function init() {
    safe(initTheme);
    safe(buildIndex);
    safe(bindSidebar);
    safe(bindSearch);
    safe(bindKeyboard);
    safe(bindCodeBlocks);
    safe(bindScroll);
    safe(renderBookmarks);
    safe(bindHashRouter);
    renderPath(parseHashPath() || parsePath());
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DB: DB,
        DS_CARDS: DS_CARDS,
        HOME_CARDS: HOME_CARDS,
        renderMarkdown: renderMarkdown,
        highlight: highlight,
        searchIndex: searchIndex,
        buildIndex: buildIndex,
        renderHome: renderHome,
        renderPath: renderPath,
        navigate: navigate,
        pageFile: pageFile,
        refUrl: refUrl,
        VIZ_CONFIG: VIZ_CONFIG,
        Visualizer: Visualizer
    };
}
