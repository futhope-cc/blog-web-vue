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

export function renderMarkdown(content: string): string {
  return md.render(content || '')
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
    if (inline && !inline.attrs?.some((a) => a[0] === 'id')) {
      inline.attrs = inline.attrs || []
      inline.attrs.push(['id', id])
    }
    const level = Number(token.tag.slice(1))
    if (level <= 4) {
      toc.push({ id, text: text.replace(/[#*`]/g, '').trim(), level })
    }
    return token.tag
  }
  const html = md.render(content || '')
  return { html, toc }
}
