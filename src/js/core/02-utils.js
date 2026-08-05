/* ============================================================
   DSA Knowledge Base - script.js (module: utils)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ============================================================
   App State & Helpers
   ============================================================ */

var currentPath = 'home';
var selectedResult = -1;
var toastTimer = null;

function $(sel, root) {
    return (root || document).querySelector(sel);
}

function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
}

/* ============================================================
   Storage (safe localStorage with in-memory fallback)
   On Android Chrome, file:// URLs run in an opaque origin and
   any localStorage access throws SecurityError. We must never
   let storage break the app, so fall back to an in-memory store.
   ============================================================ */

var storage = (function () {
    var mem = {};
    var canStore = false;
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem('__dsa_test__', '1');
            window.localStorage.removeItem('__dsa_test__');
            canStore = true;
        } catch (e) {
            canStore = false;
        }
    }
    return {
        get: function (key) {
            if (canStore) {
                try { return window.localStorage.getItem(key); } catch (e) {}
            }
            return key in mem ? mem[key] : null;
        },
        set: function (key, value) {
            mem[key] = String(value);
            if (canStore) {
                try { window.localStorage.setItem(key, String(value)); } catch (e) {}
            }
        }
    };
})();
