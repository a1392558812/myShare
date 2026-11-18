import { renderMarkdown } from '@/core/markdown'
import { MARKDOWN_EXTENSIONS } from '@/utils/file'
import tocbot from 'tocbot'
import './content.scss'

/** tocbot 大纲容器选择器 */
const TOC_SELECTOR = '#mdplus-toc'

/** 接管页运行时状态 */
const state = {
  rawText: '',
  fileName: 'document.md',
  editMode: false,
  outlineVisible: true,
}

// 接管页 DOM 引用，在 buildApp 时创建
let outlineAside: HTMLElement | null = null
let viewArticle: HTMLElement | null = null
let outlineToggle: HTMLButtonElement | null = null

/**
 * 判断当前 URL 路径是否以受支持的 Markdown 后缀结尾
 * @param pathname 页面路径（可能包含百分号编码）
 * @returns 是否为受支持的文档路径
 */
const isMarkdownPathname = (pathname: string): boolean => {
  let decoded = pathname
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    decoded = pathname
  }
  const lowered = decoded.toLowerCase()
  return MARKDOWN_EXTENSIONS.some((ext) => lowered.endsWith(ext))
}

/**
 * 查找 Chrome 原始文本查看器包裹内容的 <pre> 元素
 * Chrome 对本地/远程 .md、.txt 的默认展示是 body 下唯一一个 <pre>
 * @returns 原始文本容器；页面不是原始文本视图时返回 null
 */
const findRawTextPre = (): HTMLPreElement | null => {
  const children = document.body ? Array.from(document.body.children) : []
  if (children.length !== 1) {
    return null
  }
  const firstChild = children[0]
  if (firstChild instanceof HTMLPreElement) {
    return firstChild
  }
  return null
}

/**
 * 从 URL 提取文件名（用于顶栏标题与保存下载命名）
 * @returns 解码后的文件名；无法解析时回退 document.md
 */
const detectFileName = (): string => {
  let decoded = window.location.pathname
  try {
    decoded = decodeURIComponent(decoded)
  } catch {
    decoded = window.location.pathname
  }
  const segments = decoded.split('/').filter((segment) => segment.length > 0)
  if (segments.length === 0) {
    return 'document.md'
  }
  return segments[segments.length - 1]
}

/** 用当前 rawText 渲染主视图 */
const renderDoc = (): void => {
  if (!viewArticle) {
    return
  }
  viewArticle.innerHTML = renderMarkdown(state.rawText)
}

/** 初始化 tocbot */
const initTocbot = (): void => {
  tocbot.init({
    tocSelector: TOC_SELECTOR,
    contentSelector: '.mdplus-view',
    headingSelector: 'h1, h2, h3, h4, h5, h6',
    orderedList: false,
    scrollSmooth: false,
    collapseDepth: 6,
    headingsOffset: 68, // 55 + 12 + 1
    disableTocScrollSync: true,
    headingLabelCallback: (text) => {
      return text.replace(/#\s*$/, '').trim()
    },
  })
}

/** 顶栏「大纲」按钮：折叠/展开侧栏 */
const toggleOutline = (): void => {
  state.outlineVisible = !state.outlineVisible
  if (!outlineAside || !outlineToggle) {
    return
  }
  outlineAside.classList.toggle('mdplus-outline--hidden', !state.outlineVisible)
  outlineToggle.setAttribute('aria-pressed', state.outlineVisible ? 'true' : 'false')
}

/**
 * 构建接管页 DOM：顶栏（文件名 + 大纲）、大纲侧栏
 * @returns 接管页根元素
 */
const buildApp = (): HTMLElement => {
  const app = document.createElement('div')
  app.className = 'mdplus-app'

  const topbar = document.createElement('header')
  topbar.className = 'mdplus-topbar'

  const title = document.createElement('span')
  title.className = 'mdplus-title'
  title.textContent = state.fileName
  title.title = state.fileName

  const actions = document.createElement('div')
  actions.className = 'mdplus-topbar__actions'

  outlineToggle = document.createElement('button')
  outlineToggle.type = 'button'
  outlineToggle.className = 'mdplus-btn'
  outlineToggle.textContent = '大纲'
  outlineToggle.setAttribute('aria-pressed', 'true')
  outlineToggle.addEventListener('click', toggleOutline)

  actions.appendChild(outlineToggle)
  topbar.appendChild(title)
  topbar.appendChild(actions)

  const frame = document.createElement('div')
  frame.className = 'mdplus-frame'

  const aside = document.createElement('aside')
  aside.className = 'mdplus-outline'
  const asideTitle = document.createElement('div')
  asideTitle.className = 'mdplus-outline__title'
  asideTitle.textContent = '文档大纲'
  const nav = document.createElement('nav')
  nav.id = 'mdplus-toc'
  nav.className = 'mdplus-toc'
  aside.appendChild(asideTitle)
  aside.appendChild(nav)

  const main = document.createElement('main')
  main.className = 'mdplus-main'
  const article = document.createElement('article')
  article.className = 'markdown-body mdplus-view'
  const preview = document.createElement('article')
  preview.className = 'markdown-body mdplus-editor__preview'
  main.appendChild(article)
  frame.appendChild(aside)
  frame.appendChild(main)

  app.appendChild(topbar)
  app.appendChild(frame)

  frameElement = frame
  outlineAside = aside
  viewArticle = article
  return app
}

/** 在 DOM 就绪后执行路径检测与接管渲染 */
const handleReady = (): void => {
  if (!isMarkdownPathname(window.location.pathname)) {
    return
  }
  const pre = findRawTextPre()
  if (!pre) {
    return
  }
  state.fileName = detectFileName()
  state.rawText = pre.textContent || ''
  const app = buildApp()
  document.body.replaceChildren(app)
  document.body.classList.add('mdplus-active')
  renderDoc()
  initTocbot()
}

/** 脚本以 document_start 注入，等待 DOM 就绪后再接管页面 */
const setup = (): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleReady, { once: true })
    return
  }
  handleReady()
}

setup()
