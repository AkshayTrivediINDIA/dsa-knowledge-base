#!/usr/bin/env node
/* ============================================================
   DSA Knowledge Base — AI proxy + static server (zero deps)

   What this is for:
   The static site cannot hold an AI API key (anyone who opens the
   page could read it). So this tiny server keeps keys server-side,
   serves dist/ for browsing, and proxies the "Ask Doubt" panel's
   questions to one or more OpenAI-compatible AI endpoints.

   Reliability: if one AI backend fails (down, rate-limited, dead
   DNS), the proxy automatically fails over to the next backend in
   the chain and remembers which one last worked — so an end user
   who just runs `node server.js` gets a working tutor even when
   a free keyless proxy is offline.

   Run it:
       node server.js                # serves dist/ on :8000 + AI (auto-discovered free models)
       PORT=9000 node server.js      # different port
       AI_ENDPOINT=... AI_TOKEN=... AI_MODEL=... node server.js   # use one specific backend

   Optional server-config.json (root, next to server.js, never copied into dist/):
       { "token": "<OpenAI-compatible API key>", "model": "<free model id>" }
       Lets end users run `node server.js` with zero environment variables.

   Environment variables (all optional):
       PORT          listen port                 (default 8000)
       AI_ENDPOINT   a single custom OpenAI-compatible /chat/completions URL.
                     When set, ONLY that backend is used (old single-backend behaviour).
       AI_TOKEN      Bearer token used with AI_ENDPOINT, or the Zen API key
                     (falls back to server-config.json "token")
       AI_MODEL      model override (primary / custom backend)
       AI_POLL_URL   override the pollinations URL (debug/mirror)
       ALLOW_ORIGIN  CORS origin                 (default: "*")
       STATIC_DIR    directory to serve          (default: dist/)

   AI backend chain (auto-failover, tried in order):
       zen free models — https://opencode.ai/zen/v1/chat/completions — ALL "-free"
                         models are discovered at startup from the /models endpoint
                         (nemotron-3-ultra-free, deepseek-v4-flash-free, ...), so new
                         free models are picked up automatically and broken ones fail
                         over to the next.
       then free keyless fallbacks (no key needed, unreliable):
         pollinations — https://text.pollinations.ai/openai/chat/completions (anonymous)
         keylessai    — https://keylessai.thryx.workers.dev/v1/chat/completions
         api.airforce — https://api.airforce/v1/chat/completions

   Routes:
       GET  /api/config        { configured, model, endpoints, active }  (never leaks keys)
       GET  /api/ask           health check
       POST /api/ask           { messages, temperature? } -> { ok, text, model, backend }
       anything else           serves files from STATIC_DIR
   ============================================================ */

'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8000', 10);
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';
const STATIC_DIR = path.resolve(__dirname, process.env.STATIC_DIR || 'dist');

/* ---------- AI backend chain ---------- */

/* Free keyless fallbacks (no key needed but unreliable):
   - pollinations  : anonymous tier rejects a `temperature` field outright (402)
                     and treats a `system` role as a paid (pollen) call — so it
                     sets noTemp + mergeSystem: body stays minimal.
   - keylessai     : was NXDOMAIN for a long time; kept in case it returns.
   - api.airforce  : public key "abc", usually rate-limited. */
const DEFAULT_BACKENDS = [
    { name: 'pollinations', url: 'https://text.pollinations.ai/openai/chat/completions', token: '', model: 'openai', noTemp: true, mergeSystem: true },
    { name: 'keylessai', url: 'https://keylessai.thryx.workers.dev/v1/chat/completions', token: '123', model: 'gpt-4o-mini' },
    { name: 'api.airforce', url: 'https://api.airforce/v1/chat/completions', token: 'abc', model: 'gpt-4o-mini' }
];

/* Optional server-config.json (project root, never copied into dist/):
   { "token": "<OpenAI-compatible API key>", "model": "<free model id>" }
   Lets end users run `node server.js` with zero environment variables. */
function loadServerConfig() {
    try {
        const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'server-config.json'), 'utf8'));
        return (j && typeof j === 'object') ? j : {};
    } catch (e) { return {}; }
}

const ZEN_URL = 'https://opencode.ai/zen/v1/chat/completions';
const ZEN_FREE_PRIORITY = [
    'nemotron-3-ultra-free', 'deepseek-v4-flash-free',
    'mimo-v2.5-free', 'longcat-2.0-free'
];
const ZEN_FREE_FALLBACK = [
    'nemotron-3-ultra-free', 'deepseek-v4-flash-free',
    'mimo-v2.5-free', 'ling-3.0-flash-free', 'ling-3.0-tiny-free',
    'laguna-s-2.1-free', 'longcat-2.0-free', 'north-mini-code-free'
];

const serverConfig = loadServerConfig();

function zenToken() {
    return process.env.AI_TOKEN || serverConfig.token || '';
}

/* fetch all live "-free" model ids from the Zen /models endpoint (or [] on failure) */
function discoverZenFree(token) {
    return new Promise((resolve) => {
        const req = https.get(ZEN_URL.replace(/\/chat\/completions$/, '/models'), {
            headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
            timeout: 8000
        }, (res) => {
            let data = '';
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
                try {
                    const j = JSON.parse(data);
                    const arr = (j.data || j.models || []);
                    const free = arr.map((m) => m.id)
                        .filter((id) => typeof id === 'string' && /-free$/.test(id));
                    resolve(Array.from(new Set(free)));
                } catch (e) { resolve([]); }
            });
        });
        req.on('error', () => resolve([]));
        req.on('timeout', () => { req.destroy(); resolve([]); });
    });
}

/* order free models: serverConfig.model first, then the known-good priority list,
   then the rest alphabetically (new free models are picked up automatically). */
function orderZenFree(ids) {
    const out = [];
    const add = (m) => { if (ids.indexOf(m) !== -1 && out.indexOf(m) === -1) out.push(m); };
    add(process.env.AI_MODEL || serverConfig.model);
    ZEN_FREE_PRIORITY.forEach(add);
    ids.slice().sort().forEach(add);
    return out;
}

function buildZenBackends(token, ids) {
    return orderZenFree(ids).map((id) => ({
        name: id, url: ZEN_URL, token: token, model: id, timeout: 60000
    }));
}

async function buildBackends() {
    /* old single-backend mode: AI_ENDPOINT set -> ONLY that backend */
    if (process.env.AI_ENDPOINT) {
        return [{
            name: 'custom',
            url: process.env.AI_ENDPOINT,
            token: process.env.AI_TOKEN || '123',
            model: process.env.AI_MODEL || 'gpt-4o-mini'
        }];
    }
    const fallbacks = DEFAULT_BACKENDS.map((b) => Object.assign({}, b));

    const token = zenToken();
    let zen = [];
    if (token) {
        const discovered = await discoverZenFree(token);
        const ids = discovered.length ? discovered : ZEN_FREE_FALLBACK;
        zen = buildZenBackends(token, ids);
    }

    if (process.env.AI_POLL_URL) {
        for (const b of fallbacks) if (b.name === 'pollinations') b.url = process.env.AI_POLL_URL;
    }
    return zen.concat(fallbacks);
}

let backends = [];
let lastGood = 0;               // index of the backend that last answered (tried first)
const downUntil = {};           // backend name -> timestamp until which it is skipped

function cleanAnswer(text) {
    if (typeof text !== 'string') return '';
    /* free keyless providers sometimes append promo/deprecation lines after
       the real answer — cut everything from the first known marker line. */
    const markers = ['⏳', 'Time taken', 'Want more', 'Live at', 'This response was generated by',
        'Get your own', 'prompt queue', 'Deprecation', 'NOTE: The', 'Subscribe to', 'Sponsored'];
    const lines = text.split('\n');
    const keep = [];
    for (let i = 0; i < lines.length; i++) {
        const t = lines[i].trim();
        if (t && markers.some((m) => t.startsWith(m) || t.indexOf(m) === 0)) break;
        keep.push(lines[i]);
    }
    return keep.join('\n').trim();
}

function extractDetail(data) {
    try {
        const j = JSON.parse(data);
        if (j && j.detail) return String(j.detail).slice(0, 300);
        if (j && j.error) return typeof j.error === 'string' ? j.error.slice(0, 300) : JSON.stringify(j.error).slice(0, 300);
    } catch (e) {}
    return data.slice(0, 200);
}

function isTransient(status) {
    return !status || status === 408 || status === 425 || status === 429 ||
        status === 402 || status === 500 || status === 502 || status === 503 || status === 504;
}

function cooldownFor(err) {
    if (!err.status) return 20000;                    // network / DNS / timeout
    if (err.status === 429 || err.status === 402) return 30000;  // rate-limited -> wait a bit
    if (err.status === 401 || err.status === 403) return 300000; // auth won't change soon
    if (err.status >= 500) return 30000;
    return 120000;
}

/* ---------- per-backend serial queue ----------
   Free keyless providers (notably Pollinations) allow at most ONE
   concurrent request per IP and answer 429 when we burst. Every
   outbound call to a backend goes through its own FIFO queue so we
   never hit that limit from our own concurrency. */
const queues = {};

function enqueue(b, run) {
    return new Promise((resolve, reject) => {
        if (!queues[b.name]) queues[b.name] = [];
        if (queues[b.name].length >= 4) {
            reject(new Error('backend busy (' + b.name + ')'));
            return;
        }
        queues[b.name].push({
            run: run,
            done: (err, val) => (err ? reject(err) : resolve(val))
        });
        pump(b);
    });
}

function pump(b) {
    const q = queues[b.name];
    if (!q || !q.length) return;
    const job = q[0];
    Promise.resolve().then(job.run).then(
        (val) => { q.shift(); job.done(null, val); pump(b); },
        (err) => { q.shift(); job.done(err); pump(b); }
    );
}

function callBackend(b, messages, opts) {
    return enqueue(b, () => new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        if (b.token) headers.Authorization = 'Bearer ' + b.token;
        /* Some anonymous backends (Pollinations) reject `temperature` outright and
           treat a `system` role as a paid call — fold the system prompt into the
           first user message and drop the temperature field for them. */
        let bodyMessages = messages;
        if (b.mergeSystem && messages[0] && messages[0].role === 'system') {
            bodyMessages = messages.slice(1);
            const first = bodyMessages[0];
            if (first) {
                bodyMessages = bodyMessages.slice();
                bodyMessages[0] = Object.assign({}, first, {
                    content: 'Instructions: ' + messages[0].content + '\n\nStudent question: ' + first.content
                });
            } else {
                bodyMessages = messages;   // system-only ask — keep as sent
            }
        }
        const payload = { model: b.model, messages: bodyMessages, max_tokens: 1200 };
        if (!b.noTemp) payload.temperature = typeof opts.temperature === 'number' ? opts.temperature : 0.4;
        const body = JSON.stringify(payload);

        const lib = b.url.indexOf('http://') === 0 ? http : https;
        const req = lib.request(b.url, { method: 'POST', headers, timeout: b.timeout || 30000 }, (res) => {
            let data = '';
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    const err = new Error(extractDetail(data));
                    err.status = res.statusCode;
                    reject(err);
                    return;
                }
                try {
                    const json = JSON.parse(data);
                    const content = json && json.choices && json.choices[0] && json.choices[0].message &&
                        json.choices[0].message.content;
                    if (typeof content !== 'string' || !content.trim()) {
                        const err = new Error('empty content');
                        err.status = 200;
                        reject(err);
                        return;
                    }
                    resolve({
                        text: cleanAnswer(content),
                        model: (json.model || b.model),
                        usage: json.usage || null,
                        backend: b.name
                    });
                } catch (e) {
                    const err = new Error('non-JSON response');
                    err.status = 200;
                    reject(err);
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(new Error('timeout')); });
        req.end(body);
    }));
}

function forward(messages, opts, cb) {
    const now = Date.now();
    const deadlineAt = now + (opts.deadlineMs || 75000);
    const order = [];
    for (let i = 0; i < backends.length; i++) {
        const idx = (lastGood + i) % backends.length;
        const b = backends[idx];
        if (downUntil[b.name] && now < downUntil[b.name]) continue;
        order.push(idx);
    }
    if (!order.length) {
        for (let i = 0; i < backends.length; i++) order.push((lastGood + i) % backends.length);
    }

    let attempt = 0;
    let retried = false;
    let done = false;
    const errors = [];

    function finish(e, okRes) {
        if (done) return;
        done = true;
        cb(e, okRes);
    }

    function next() {
        if (Date.now() > deadlineAt) {
            const e = new Error('AI backends took too long (over the deadline). Try again in a moment.');
            e.attempted = errors.map((x) => x.name + (x.status ? '(' + x.status + ')' : ''));
            e.deadline = true;
            finish(e);
            return;
        }
        if (attempt >= order.length) {
            const lastErr = errors[errors.length - 1];
            let detail = 'no backends available';
            if (lastErr) {
                detail = lastErr.status !== 'net'
                    ? lastErr.name + ' [' + lastErr.status + ']'
                    : lastErr.name + ' [' + lastErr.detail + ']';
            }
            const e = new Error('All AI backends failed — last: ' + detail);
            e.attempted = errors.map((x) => x.name + (x.status ? '(' + x.status + ')' : ''));
            finish(e);
            return;
        }
        const bi = order[attempt];
        const b = backends[bi];

        callBackend(b, messages, opts).then((okRes) => {
            lastGood = bi;
            downUntil[b.name] = 0;
            finish(null, okRes);
        }).catch((err) => {
            if (!retried && isTransient(err.status) && Date.now() <= deadlineAt) {
                retried = true;
                setTimeout(next, 1200);   // transient -> retry the same backend once
                return;
            }
            attempt++;
            retried = false;
            errors.push({ name: b.name, status: err.status || 'net', detail: err.message });
            downUntil[b.name] = Date.now() + cooldownFor(err);
            next();
        });
    }

    next();
}

/* ---------- static file serving ---------- */

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.map': 'application/json'
};

function staticFile(res, filePath) {
    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Content-Length': stat.size,
            'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
    });
}

/* ---------- HTTP helpers ---------- */

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
}

function send(res, status, obj, extra) {
    const body = JSON.stringify(obj);
    res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extra || {}));
    res.end(body);
}

function readBody(req, limit, cb) {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
        size += c.length;
        if (size > limit) {
            cb(new Error('Payload too large'));
            req.destroy();
            return;
        }
        chunks.push(c);
    });
    req.on('end', () => {
        try {
            cb(null, chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
        } catch (e) {
            cb(new Error('Invalid JSON body'));
        }
    });
    req.on('error', (e) => cb(e));
}

/* ---------- routes ---------- */

const server = http.createServer((req, res) => {
    cors(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = req.url.split('?')[0];

    if (req.method === 'GET' && url === '/api/config') {
        send(res, 200, {
            ok: true,
            configured: backends.length > 0,
            model: backends[0].model,
            endpoints: backends.map((b) => b.name),
            active: backends[lastGood] ? backends[lastGood].name : null
        });
        return;
    }

    if (url === '/api/ask') {
        if (req.method === 'GET') {
            send(res, 200, { ok: true, message: 'Ask Doubt proxy is running.' });
            return;
        }
        if (req.method !== 'POST') {
            send(res, 405, { ok: false, error: 'Method not allowed' });
            return;
        }
        readBody(req, 64 * 1024, (err, body) => {
            if (err) { send(res, 400, { ok: false, error: err.message }); return; }
            const messages = Array.isArray(body.messages) ? body.messages : [];
            if (!messages.length) { send(res, 400, { ok: false, error: 'messages[] is required' }); return; }
            for (const m of messages) {
                if (!m || typeof m.role !== 'string' || typeof m.content !== 'string') {
                    send(res, 400, { ok: false, error: 'each message needs {role, content}' });
                    return;
                }
            }
            let aborted = false;
            const timer = setTimeout(() => {
                if (aborted || res.writableEnded) return;
                send(res, 504, { ok: false, error: 'AI request timed out on the server. Try again in a moment.' });
            }, 80000);
            const onClose = () => { aborted = true; clearTimeout(timer); };
            res.on('close', onClose);
            res.on('error', () => {});
            forward(messages, { temperature: body.temperature, deadlineMs: 75000 }, (ferr, okRes) => {
                clearTimeout(timer);
                if (aborted || res.writableEnded) return;
                if (ferr) {
                    send(res, ferr.deadline ? 504 : 502, {
                        ok: false,
                        error: ferr.message,
                        backends: ferr.attempted || []
                    });
                    return;
                }
                send(res, 200, {
                    ok: true,
                    text: okRes.text,
                    model: okRes.model,
                    usage: okRes.usage,
                    backend: okRes.backend
                });
            });
        });
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        send(res, 404, { ok: false, error: 'Not found' });
        return;
    }

    let filePath = path.normalize(path.join(STATIC_DIR, url === '/' ? 'index.html' : url));
    if (filePath.indexOf(STATIC_DIR) !== 0) {
        res.writeHead(403); res.end('Forbidden');
        return;
    }
    staticFile(res, filePath);
});

(async function start() {
    backends = await buildBackends();
    const zenCount = backends.filter((b) => b.url === ZEN_URL).length;
    server.listen(PORT, () => {
        console.log('DSA Knowledge Base server:');
        console.log('  Site:   http://localhost:' + PORT + '/index.html');
        if (zenCount) console.log('  AI:     ' + zenCount + ' free zen models discovered + free-proxy fallbacks');
        console.log('  AI:     enabled — ' + backends.map((b) => b.name + ' [' + b.model + ']').join(' → '));
        console.log('  Static: ' + STATIC_DIR);
    });
})();
