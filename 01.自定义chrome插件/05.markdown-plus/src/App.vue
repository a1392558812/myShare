<template>
  <div class="app">
    <header class="toolbar">
      <div class="brand">
        <span class="brand__mark">M</span>
        <div class="brand__text">
          <span class="brand__name">Markdown Plus</span>
          <span class="brand__file" :title="fileName">
            <span class="brand__filename">{{ fileName }}</span>
            <span v-if="dirty" class="brand__dirty" title="有未保存的修改"></span>
          </span>
        </div>
      </div>

      <div class="toolbar__actions">
        <div class="segmented" role="group" aria-label="视图模式">
          <button v-for="option in viewModes" :key="option.value" type="button"
            :class="{ 'is-active': mode === option.value }" @click="mode = option.value">
            {{ option.label }}
          </button>
        </div>
        <button class="btn btn--ghost" type="button" :disabled="!hasDocument"
          :aria-pressed="outlineVisible ? 'true' : 'false'" @click="outlineVisible = !outlineVisible">大纲</button>
        <button class="btn btn--ghost" type="button" @click="handleOpenClick">打开</button>
        <button class="btn btn--ghost" type="button" @click="createBlank()">新建</button>
        <button class="btn btn--ghost" type="button" :disabled="!hasDocument" @click="exportCopy()">导出</button>
        <button class="btn" type="button" :disabled="!hasDocument" @click="saveAs()">另存为</button>
        <button class="btn btn--primary" type="button" :disabled="!hasDocument" title="保存（Ctrl / Cmd + S）"
          @click="save()">
          保存
          <kbd>Ctrl S</kbd>
        </button>
      </div>
    </header>

    <main class="workspace" :class="workspaceClass">
      <section v-if="!hasDocument" class="empty-wrap">
        <EmptyState @open="handleOpenClick" @create="createBlank()" />
      </section>
      <template v-else>
        <section v-show="mode !== 'preview'" class="pane pane--editor">
          <div class="pane__header">
            <span>源码</span>
            <span class="pane__tag">Tab 缩进</span>
          </div>
          <EditorPane :model-value="content" @update:model-value="updateContent" />
        </section>
        <section v-show="mode !== 'edit'" class="pane pane--preview">
          <div class="pane__header">
            <span>预览</span>
            <span class="pane__tag">实时渲染</span>
          </div>
          <div class="preview-scroll">
            <PreviewPane :html="renderedHtml" :empty="content.length === 0" />
          </div>
        </section>
        <aside v-show="outlineVisible && mode !== 'edit'" class="pane pane--outline">
          <div class="pane__header">
            <span>大纲</span>
          </div>
          <div ref="tocElement" class="outline-toc"></div>
        </aside>
      </template>
    </main>

    <footer class="statusbar">
      <template v-if="hasDocument">
        <span>{{ stats.characters }} 字符</span>
        <span>{{ stats.lines }} 行</span>
        <span class="statusbar__spacer"></span>
        <span class="statusbar__hint">拖入新的 .md 可替换当前文档</span>
        <span>{{ storageHint }}</span>
        <span :class="{ 'statusbar__warn': dirty }">{{ saveStateText }}</span>
      </template>
      <template v-else>
        <span>准备就绪</span>
        <span class="statusbar__spacer"></span>
        <span>拖入文件，或点击「打开」</span>
      </template>
    </footer>

    <Transition name="fade">
      <div v-if="isDragging" class="drop-overlay">
        <div class="drop-card">
          松开鼠标打开文件
          <span>支持 .md / .markdown / .txt</span>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="notice" class="toast" :class="`toast--${notice.kind}`">{{ notice.text }}</div>
    </Transition>

    <input ref="fileInputElement" hidden type="file"
      accept=".md,.markdown,.mdown,.mkd,.mdx,.txt,text/markdown,text/plain" @change="handleFileInputChange" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import EditorPane from '@/components/EditorPane.vue'
import EmptyState from '@/components/EmptyState.vue'
import PreviewPane from '@/components/PreviewPane.vue'
import tocbot from 'tocbot'
import { measureDocument, renderMarkdown } from '@/core/markdown'
import { useDocument } from '@/composables/useDocument'
import { extractMarkdownDrop } from '@/utils/file'

type ViewMode = 'split' | 'edit' | 'preview'

const viewModes: Array<{ value: ViewMode; label: string }> = [
  { value: 'split', label: '分栏' },
  { value: 'edit', label: '编辑' },
  { value: 'preview', label: '预览' },
]

const {
  content,
  fileName,
  fileHandle,
  hasDocument,
  dirty,
  notice,
  notify,
  openFile,
  updateContent,
  createBlank,
  exportCopy,
  saveAs,
  save,
} = useDocument()

const mode = ref<ViewMode>('split')
const isDragging = ref(false)
const fileInputElement = ref<HTMLInputElement | null>(null)

let dragDepth = 0

const renderedHtml = computed(() => {
  return renderMarkdown(content.value)
})
const stats = computed(() => {
  return measureDocument(content.value)
})

const workspaceClass = computed(() => {
  return hasDocument.value ? `workspace--${mode.value}` : 'workspace--empty'
})

const outlineVisible = ref(true)
const tocElement = ref<HTMLElement | null>(null)

let tocInitialized = false

/** 初始化或同步 tocbot 大纲（社区库负责目录构建、滚动高亮与平滑滚动） */
const syncTocbot = (): void => {
  if (!tocElement.value) {
    return
  }
  if (!tocInitialized) {
    if (!document.querySelector('.preview-scroll')) {
      return
    }
    tocbot.init({
      tocElement: tocElement.value,
      contentSelector: '.markdown-body',
      headingSelector: 'h1, h2, h3, h4, h5, h6',
      orderedList: false,
      scrollSmooth: false,
      collapseDepth: 6,
      headingsOffset: 16,
      scrollContainer: '.preview-scroll',
      disableTocScrollSync: true,
      headingLabelCallback: (text) => {
        return text.replace(/#\s*$/, '').trim()
      },
    })
    tocInitialized = true
    return
  }
  tocbot.refresh()
}

watch(renderedHtml, () => {
  nextTick(syncTocbot)
})

watch(hasDocument, () => {
  nextTick(syncTocbot)
})

const saveStateText = computed(() => {
  if (!hasDocument.value) {
    return '未打开文件'
  }
  return dirty.value ? '有未保存的修改' : '没有未保存的修改'
})

const storageHint = computed(() => {
  return fileHandle.value ? '可直接写回原文件' : '保存时选择位置，或导出下载'
})

const handleOpenClick = (): void => {
  fileInputElement.value?.click()
}

const handleFileInputChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    openFile(file, null)
  }
  target.value = ''
}

const hasFilePayload = (dataTransfer: DataTransfer | null): boolean => {
  if (!dataTransfer) {
    return false
  }
  return Array.from(dataTransfer.types).includes('Files')
}

const handleDragEnter = (event: DragEvent): void => {
  if (!hasFilePayload(event.dataTransfer)) {
    return
  }
  event.preventDefault()
  dragDepth += 1
  isDragging.value = true
}

const handleDragOver = (event: DragEvent): void => {
  if (!hasFilePayload(event.dataTransfer)) {
    return
  }
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const handleDragLeave = (event: DragEvent): void => {
  if (!hasFilePayload(event.dataTransfer)) {
    return
  }
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) {
    isDragging.value = false
  }
}

const handleDrop = (event: DragEvent): void => {
  event.preventDefault()
  dragDepth = 0
  isDragging.value = false
  if (!event.dataTransfer) {
    return
  }
  extractMarkdownDrop(event.dataTransfer).then((picked) => {
    if (!picked) {
      notify('没有找到可打开的 Markdown 文件', 'error')
      return
    }
    openFile(picked.file, picked.handle)
  })
}

const handleKeydown = (event: KeyboardEvent): void => {
  const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'
  if (!isSaveShortcut) {
    return
  }
  event.preventDefault()
  if (event.shiftKey) {
    saveAs()
    return
  }
  save()
}

const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
  if (!dirty.value) {
    return
  }
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('dragenter', handleDragEnter)
  window.addEventListener('dragover', handleDragOver)
  window.addEventListener('dragleave', handleDragLeave)
  window.addEventListener('drop', handleDrop)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('dragenter', handleDragEnter)
  window.removeEventListener('dragover', handleDragOver)
  window.removeEventListener('dragleave', handleDragLeave)
  window.removeEventListener('drop', handleDrop)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (tocInitialized) {
    tocbot.destroy()
    tocInitialized = false
  }
})
</script>

<style lang="scss" scoped>
@use './styles/button';

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 顶部工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 18px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: relative;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  &__mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(140deg, #2563eb, #7c3aed);
    color: #ffffff;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.28);
    flex: none;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  &__file {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 320px;
    font-size: 12px;
    color: var(--text-muted);
  }

  &__filename {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__dirty {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--warning);
    flex: none;
  }
}

.toolbar__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.segmented {
  display: flex;
  padding: 3px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: 10px;

  button {
    border: 0;
    background: transparent;
    padding: 4px 11px;
    font-size: 12px;
    color: var(--text-muted);
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      color: var(--text);
    }

    &.is-active {
      background: var(--surface);
      color: var(--text);
      box-shadow: var(--shadow-sm);
    }
  }
}

/* 工作区 */
.workspace {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  padding: 12px;

  &--empty {
    padding: 16px;
  }
}

.empty-wrap {
  flex: 1;
  min-height: 0;
}

.pane {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 16px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, #fcfdff, var(--surface));
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  &__tag {
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--surface-muted);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: none;
    color: var(--text-muted);
  }
}

.preview-scroll {
  flex: 1;
  min-height: 0;
  /* tocbot scrollContainer 依赖标题 offsetTop 与容器 scrollTop 同坐标系，
     必须让本容器成为标题的 offsetParent，否则高亮判定会滞后一个页头高度 */
  position: relative;
  overflow: auto;
  padding: 26px 34px 72px;
}

/* 大纲侧栏（目录由 tocbot 渲染，样式通过 :deep 作用于库生成的 DOM） */
.pane--outline {
  flex: 0 0 248px;
}

.outline-toc {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 10px 14px;
  font-size: 12.5px;

  :deep(.toc-list) {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  :deep(.toc-list .toc-list) {
    padding-left: 12px;
  }

  :deep(.toc-link) {
    display: block;
    overflow: hidden;
    padding: 5px 8px;
    border-radius: 6px;
    color: var(--text-muted);
    line-height: 1.45;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: background 0.15s ease, color 0.15s ease;
  }

  :deep(.toc-link:hover) {
    background: var(--surface-muted);
    color: var(--text);
  }

  :deep(.toc-link.is-active-link) {
    background: #eaf1fe;
    color: var(--accent-strong);
    font-weight: 600;
  }
}

/* 底部状态栏 */
.statusbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 20px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;

  &__spacer {
    flex: 1;
  }

  &__hint {
    color: var(--text-soft);
  }

  &__warn {
    color: var(--warning);
    font-weight: 600;
  }
}

/* 拖放遮罩 */
.drop-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(37, 99, 235, 0.08);
  backdrop-filter: blur(2px);
  pointer-events: none;
}

.drop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 26px 44px;
  border-radius: var(--radius-lg);
  border: 2px dashed var(--accent);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow-float);
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-strong);

  span {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
  }
}

/* 提示条 */
.toast {
  position: fixed;
  left: 50%;
  bottom: 46px;
  z-index: 60;
  transform: translateX(-50%);
  max-width: min(72vw, 560px);
  padding: 10px 18px;
  border-radius: 10px;
  background: #111827;
  color: #f8fafc;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: var(--shadow-float);
  overflow: hidden;
  text-overflow: ellipsis;

  &--success {
    background: #14532d;
  }

  &--error {
    background: #7f1d1d;
  }
}

/* 过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
