import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'
import mark from 'markdown-it-mark'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdownLanguage from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import DOMPurify from 'dompurify'
import MarkdownItAnchor from 'markdown-it-anchor'

/** 代码高亮按需注册的常见语言 */
const HIGHLIGHT_LANGUAGES = {
  bash,
  css,
  go,
  java,
  javascript,
  json,
  markdown: markdownLanguage,
  python,
  sql,
  typescript,
  xml,
  yaml,
}

Object.entries(HIGHLIGHT_LANGUAGES).forEach(([name, definition]) => {
  hljs.registerLanguage(name, definition)
})

/** 文档统计信息 */
export interface DocumentStats {
  /** 字符总数 */
  characters: number
  /** 行数 */
  lines: number
}

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const highlightCode = (code: string, language: string): string => {
  const normalizedLanguage = language.trim().split(/\s+/)[0] ?? ''
  if (normalizedLanguage.length > 0 && hljs.getLanguage(normalizedLanguage)) {
    const highlighted = hljs.highlight(code, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    })
    return `<pre class="hljs"><code class="language-${escapeHtml(normalizedLanguage)}">${highlighted.value}</code></pre>`
  }
  return `<pre class="hljs"><code>${escapeHtml(code)}</code></pre>`
}

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight: highlightCode,
})

markdown.use(taskLists, {
  enabled: false,
  label: true,
  labelAfter: true,
})
markdown.use(footnote)
markdown.use(mark)
markdown.use(sub)
markdown.use(sup)
// 标题 id + GitHub 风格悬停锚点，统一由社区插件 markdown-it-anchor 生成
markdown.use(MarkdownItAnchor, {
  permalink: MarkdownItAnchor.permalink.linkInsideHeader({
    class: 'mdplus-anchor',
    symbol: '#',
  }),
})

const defaultLinkOpen =
  markdown.renderer.rules.link_open ??
  ((tokens, index, options, _env, self) => {
    return self.renderToken(tokens, index, options)
  })

markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  tokens[index].attrSet('target', '_blank')
  tokens[index].attrSet('rel', 'noopener noreferrer')
  return defaultLinkOpen(tokens, index, options, env, self)
}

const defaultImageRender =
  markdown.renderer.rules.image ??
  ((tokens, index, options, _env, self) => {
    return self.renderToken(tokens, index, options)
  })

markdown.renderer.rules.image = (tokens, index, options, env, self) => {
  tokens[index].attrSet('loading', 'lazy')
  return defaultImageRender(tokens, index, options, env, self)
}

/**
 * 将 Markdown 源码渲染为可安全插入 DOM 的 HTML。
 * @param source Markdown 源码
 * @returns 经过 DOMPurify 净化后的 HTML 字符串
 */
export const renderMarkdown = (source: string): string => {
  const rawHtml = markdown.render(source)
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel', 'loading', 'checked', 'disabled'],
    ADD_TAGS: ['input'],
  })
}

/**
 * 统计 Markdown 源码的字符数与行数。
 * @param source Markdown 源码
 * @returns 字符数与行数
 */
export const measureDocument = (source: string): DocumentStats => {
  const characters = source.length
  const lines = characters === 0 ? 0 : source.split(/\r\n|\r|\n/).length
  return { characters, lines }
}
