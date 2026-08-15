/* ============================================================
   DSA Visualizer Studio — Multi-language code panel.
   Tabs for C / C++ / Java / Python / Dart. Highlights the current
   code line from the active frame. Copy button + collapse toggle
   to focus one language at a time.
   ============================================================ */

import { useMemo, useState } from 'react'
import { CODE_LANGS } from '../core/code'
import type { CodeLang } from '../core/code'
import { useVizStore } from '../store'

export function CodePanel() {
  const lang = useVizStore((s) => s.selectedLang)
  const setLang = useVizStore((s) => s.setSelectedLang)
  const frame = useVizStore((s) => s.frames[s.index])
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  const code: CodeLang = useMemo(
    () => CODE_LANGS.find((l) => l.id === lang) ?? CODE_LANGS[0],
    [lang],
  )
  const line = frame ? frame.codeLine : 0

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.lines.join('\n').replace(/\n+$/, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }

  const highlight = (i: number) => line > 0 && i === line - 1

  return (
    <section className="panel code-panel" data-open={open}>
      <div className="panel-head">
        <div className="panel-title">
          <span className="dot dot-cyan" /> The Code — synchronized line by line
        </div>
        <div className="panel-head-actions">
          <button type="button" className={`icon-btn ${copied ? 'ok' : ''}`} onClick={copy} title="Copy code">
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setOpen(!open)}
            title={open ? 'Fold code panel' : 'Expand code panel'}
            aria-expanded={open}
          >
            {open ? '−' : '+'}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="lang-tabs" role="tablist">
            {CODE_LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={l.id === lang}
                className={`lang-tab ${l.id === lang ? 'active' : ''}`}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="code-scroll">
            <pre className="code-view">
              {code.lines.map((ln, i) => (
                <div key={i} className={`code-row ${highlight(i) ? 'hl' : ''}`}>
                  <span className="code-num">{i + 1}</span>
                  <span
                    className="code-text"
                    dangerouslySetInnerHTML={{ __html: syntaxHighlight(ln) }}
                  />
                </div>
              ))}
            </pre>
          </div>
          <div className="code-foot">
            <span className="file-name">{code.filename}</span>
            <span className="code-line-info">line {line || '—'}</span>
          </div>
        </>
      )}
    </section>
  )
}

/** Minimal tokenizer — keywords, strings, numbers, comments, types. */
function syntaxHighlight(line: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const comment = line.trimStart().startsWith('//') || line.trimStart().startsWith('#')
  if (comment) return esc(line)

  const out: string[] = []
  const tokens = line.split(/(\s+)/)
  tokens.forEach((tok) => {
    if (!tok) return
    out.push(styleToken(tok))
  })
  return out.join('')
}

function styleToken(tok: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  if (/^\s*$/.test(tok)) return tok
  if (/^(#include|import|public|private|class|void|int|return|for|if|else|var|print|def|function|const|let|vector|std|print|using|namespace|null|static|System)$/.test(tok))
    return `<span class="tk-kw">${esc(tok)}</span>`
  if (tok.startsWith('"') || tok.startsWith("'")) return `<span class="tk-str">${esc(tok)}</span>`
  if (/^-?\d+(\.\d+)?$/.test(tok)) return `<span class="tk-num">${esc(tok)}</span>`
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(tok) && !/\s/.test(tok) && tok.length > 1)
    return `<span class="tk-id">${esc(tok)}</span>`
  return esc(tok)
}