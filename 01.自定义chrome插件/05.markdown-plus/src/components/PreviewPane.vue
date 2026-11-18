<template>
  <div v-show="empty" class="preview-empty">
    <p>文档还是空的</p>
    <span>点编辑/分栏模式进行输入</span>
  </div>
  <article v-show="!empty" class="markdown-body" v-html="html"></article>
</template>

<script setup lang="ts">
defineProps<{
  html: string
  empty: boolean
}>()
</script>

<style lang="scss" scoped>
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 80px 20px;
  color: var(--text-muted);
  text-align: center;

  p {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
  }

  span {
    font-size: 12px;
  }
}

// v-html 渲染的内容不带 scoped 属性，需通过 :deep() 穿透作用域
.markdown-body {
  font-size: 15px;
  line-height: 1.78;
  color: #24292f;
  overflow-wrap: break-word;

  > :deep(:first-child) {
    margin-top: 0;
  }

  > :deep(:last-child) {
    margin-bottom: 0;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 1.7em 0 0.65em;
    font-weight: 650;
    line-height: 1.35;
    letter-spacing: -0.01em;
    scroll-margin-top: 16px;
  }

  :deep(h1) {
    font-size: 1.8em;
  }

  :deep(h2) {
    font-size: 1.42em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--border);
  }

  :deep(h3) {
    font-size: 1.18em;
  }

  :deep(h4) {
    font-size: 1.02em;
  }

  :deep(h5) {
    font-size: 0.95em;
  }

  :deep(h6) {
    font-size: 0.9em;
    color: var(--text-muted);
  }

  :deep(p),
  :deep(ul),
  :deep(ol),
  :deep(blockquote),
  :deep(table),
  :deep(pre),
  :deep(dl) {
    margin: 0 0 1.05em;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.7em;
  }

  :deep(li + li) {
    margin-top: 0.32em;
  }

  :deep(li > ul),
  :deep(li > ol) {
    margin: 0.32em 0 0;
  }

  :deep(a) {
    color: var(--accent);
    text-decoration: none;
  }

  :deep(a:hover) {
    text-decoration: underline;
  }

  // markdown-it-anchor 生成的 GitHub 风格悬停锚点
  :deep(.mdplus-anchor) {
    margin-left: 6px;
    color: var(--text-soft);
    font-size: 0.75em;
    text-decoration: none;
    opacity: 0;
  }

  :deep(h1:hover > .mdplus-anchor),
  :deep(h2:hover > .mdplus-anchor),
  :deep(h3:hover > .mdplus-anchor),
  :deep(h4:hover > .mdplus-anchor),
  :deep(h5:hover > .mdplus-anchor),
  :deep(h6:hover > .mdplus-anchor) {
    opacity: 1;
  }

  :deep(.mdplus-anchor:hover) {
    color: var(--accent);
    text-decoration: none;
  }

  :deep(strong) {
    font-weight: 650;
  }

  :deep(del) {
    color: var(--text-soft);
  }

  :deep(mark) {
    padding: 0.1em 0.25em;
    border-radius: 3px;
    background: #fff3bf;
    color: inherit;
  }

  :deep(blockquote) {
    padding: 0.55em 1.05em;
    border-left: 4px solid #cfd8ea;
    border-radius: 0 8px 8px 0;
    background: #f8fafd;
    color: #4b5563;
  }

  :deep(blockquote > :last-child) {
    margin-bottom: 0;
  }

  :deep(code) {
    padding: 0.15em 0.4em;
    border-radius: 5px;
    background: var(--surface-muted);
    font-family: var(--font-mono);
    font-size: 0.88em;
  }

  :deep(pre) {
    padding: 15px 18px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: #f6f8fa;
    overflow-x: auto;
    font-size: 12.5px;
    line-height: 1.68;
  }

  :deep(pre.hljs) {
    background: #f6f8fa;
  }

  :deep(pre code) {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    font-size: inherit;
    white-space: pre;
  }

  :deep(table) {
    display: block;
    width: max-content;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
    font-size: 0.93em;
  }

  :deep(th),
  :deep(td) {
    padding: 7px 13px;
    border: 1px solid var(--border);
    text-align: left;
  }

  :deep(th) {
    background: #f7f8fb;
    font-weight: 600;
  }

  :deep(tbody tr:nth-child(2n)) {
    background: #fbfcfe;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
  }

  :deep(hr) {
    height: 1px;
    margin: 2.1em 0;
    border: 0;
    background: var(--border);
  }

  :deep(input[type='checkbox']) {
    width: 14px;
    height: 14px;
    margin: 0 0.4em 0 0;
    vertical-align: -1px;
    accent-color: var(--accent);
  }

  :deep(.task-list-item) {
    list-style: none;
  }

  :deep(ul.contains-task-list) {
    padding-left: 1.25em;
  }

  :deep(.task-list-item label) {
    cursor: default;
  }

  :deep(sup),
  :deep(sub) {
    line-height: 0;
  }

  :deep(.footnote-ref a) {
    font-weight: 600;
    text-decoration: none;
  }

  :deep(.footnotes) {
    margin-top: 2.6em;
    padding-top: 1.1em;
    border-top: 1px solid var(--border);
    font-size: 0.9em;
    color: var(--text-muted);
  }

  :deep(.footnotes-sep) {
    display: none;
  }

  :deep(.footnotes ol) {
    padding-left: 1.4em;
  }

  :deep(.footnote-backref) {
    text-decoration: none;
  }
}
</style>
