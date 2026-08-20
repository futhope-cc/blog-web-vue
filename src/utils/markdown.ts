import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {
        /* fallthrough */
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

export interface TocItem {
  id: string
  text: string
  level: number
}

function resolveImgSrc(html: string): string {
  return html.replace(/(<img\s[^>]*?)src="(\/files\/[^"]+)"/gi, '$1src="/api$2"')
}

function renderRaw(content: string): string {
  const normalized = (content || '')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
  return resolveImgSrc(md.render(normalized))
}

export function renderMarkdown(content: string): string {
  return renderRaw(content)
}

export function extractToc(html: string): TocItem[] {
  const toc: TocItem[] = []
  const regex = /<h([1-4])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/g
  let match: RegExpExecArray | null
  let counter = 0
  while ((match = regex.exec(html))) {
    const level = Number(match[1])
    const id = match[2]
    const text = match[3]
      .replace(/<[^>]+>/g, '')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim()
    toc.push({ id, text, level })
    counter++
    if (counter > 200) break
  }
  return toc
}

export function renderMarkdownWithAnchors(content: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  let counter = 0
  md.renderer.rules.heading_open = (tokens, idx) => {
    const token = tokens[idx]
    const inline = tokens[idx + 1]
    const text = inline ? inline.content : ''
    counter++
    const id = `heading-${counter}`
    token.attrs = token.attrs || []
    token.attrs.push(['id', id])
    const level = Number(token.tag.slice(1))
    if (level <= 4) {
      toc.push({ id, text: text.replace(/[#*`]/g, '').trim(), level })
    }
    const attrs = md.renderer.renderAttrs(token)
    return `<${token.tag}${attrs}>`
  }
  const html = renderRaw(content)
  return { html, toc }
}
