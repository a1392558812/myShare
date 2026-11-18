import { ref, shallowRef, watch } from 'vue'
import {
  MARKDOWN_EXTENSIONS,
  canUseFileSystemAccess,
  downloadText,
  ensureMarkdownExtension,
  isMarkdownFileName,
  pickSaveTarget,
  readFileText,
  writeToHandle,
} from '@/utils/file'

/** 提示消息类型 */
export type NoticeKind = 'info' | 'success' | 'error'

/** 页面右上角提示 */
export interface Notice {
  kind: NoticeKind
  text: string
}

/**
 * 管理当前 Markdown 文档的状态与文件读写（打开、编辑、保存、导出）。
 * @returns 文档状态与操作方法
 */
export const useDocument = () => {
  const content = ref('')
  const fileName = ref('未命名.md')
  const fileHandle = shallowRef<FileSystemFileHandle | null>(null)
  const hasDocument = ref(false)
  const dirty = ref(false)
  const notice = ref<Notice | null>(null)

  let baseline = ''
  let noticeTimer: number | null = null

  /**
   * 展示一条短暂提示，2.6 秒后自动消失。
   * @param text 提示文案
   * @param kind 提示类型
   */
  const notify = (text: string, kind: NoticeKind = 'info'): void => {
    notice.value = { kind, text }
    if (noticeTimer !== null) {
      window.clearTimeout(noticeTimer)
    }
    noticeTimer = window.setTimeout(() => {
      notice.value = null
      noticeTimer = null
    }, 2600)
  }

  const loadDocument = (name: string, text: string, handle: FileSystemFileHandle | null): void => {
    content.value = text
    fileName.value = name
    fileHandle.value = handle
    hasDocument.value = true
    baseline = text
    dirty.value = false
  }

  const confirmDiscard = (): boolean => {
    if (!dirty.value) {
      return true
    }
    return window.confirm('当前文档有未保存的修改，继续操作将丢失这些修改，确定继续吗？')
  }

  /**
   * 读取并打开一个文件；非 Markdown 文件会被拒绝。
   * @param file 文件对象
   * @param handle 可选的写入句柄（拖放或受支持的打开方式提供）
   * @returns 是否成功打开
   */
  const openFile = (file: File, handle: FileSystemFileHandle | null = null): Promise<boolean> => {
    if (!isMarkdownFileName(file.name)) {
      notify(`暂不支持该文件，请使用 ${MARKDOWN_EXTENSIONS.join(' / ')} 文件`, 'error')
      return Promise.resolve(false)
    }
    if (!confirmDiscard()) {
      return Promise.resolve(false)
    }
    return readFileText(file)
      .then((text) => {
        loadDocument(file.name, text, handle)
        notify(`已打开 ${file.name}`, 'success')
        return true
      })
      .catch(() => {
        notify('读取文件失败，请确认文件未被占用后重试', 'error')
        return false
      })
  }

  /**
   * 同步编辑区内容，并刷新未保存状态。
   * @param value 最新的 Markdown 源码
   */
  const updateContent = (value: string): void => {
    content.value = value
    dirty.value = hasDocument.value && value !== baseline
  }

  /**
   * 新建一个空白文档。
   * @returns 是否创建成功
   */
  const createBlank = (): boolean => {
    if (!confirmDiscard()) {
      return false
    }
    loadDocument('未命名.md', '', null)
    notify('已新建空白文档', 'info')
    return true
  }

  const markSaved = (message: string): void => {
    baseline = content.value
    dirty.value = false
    notify(message, 'success')
  }

  /**
   * 通过浏览器下载导出当前内容的副本。
   */
  const exportCopy = (): void => {
    if (!hasDocument.value) {
      return
    }
    downloadText(content.value, ensureMarkdownExtension(fileName.value))
    notify('已导出下载副本', 'success')
  }

  /**
   * 另存为：优先使用保存对话框写入磁盘，不支持时降级为下载。
   * @returns 是否完成保存
   */
  const saveAs = (): Promise<boolean> => {
    if (!hasDocument.value) {
      return Promise.resolve(false)
    }
    const suggestedName = ensureMarkdownExtension(fileName.value)
    if (!canUseFileSystemAccess()) {
      downloadText(content.value, suggestedName)
      markSaved('浏览器不支持直接写文件，已下载副本')
      return Promise.resolve(true)
    }
    return pickSaveTarget(suggestedName)
      .then((handle) => {
        if (!handle) {
          return false
        }
        return writeToHandle(handle, content.value).then(() => {
          fileHandle.value = handle
          fileName.value = handle.name
          markSaved(`已保存为 ${handle.name}`)
          return true
        })
      })
      .catch((error: unknown) => {
        notify(error instanceof Error ? error.message : '保存失败，请重试', 'error')
        return false
      })
  }

  /**
   * 保存当前文档：已有句柄时直接写回原文件，否则走另存为流程。
   * @returns 是否保存成功
   */
  const save = (): Promise<boolean> => {
    if (!hasDocument.value) {
      return Promise.resolve(false)
    }
    const handle = fileHandle.value
    if (!handle) {
      return saveAs()
    }
    return writeToHandle(handle, content.value)
      .then(() => {
        markSaved(`已保存到 ${fileName.value}`)
        return true
      })
      .catch((error: unknown) => {
        notify(error instanceof Error ? error.message : '保存失败，请重试', 'error')
        return false
      })
  }

  watch([fileName, dirty, hasDocument], () => {
    const prefix = dirty.value ? '• ' : ''
    document.title = hasDocument.value ? `${prefix}${fileName.value} — Markdown Plus` : 'Markdown Plus'
  })

  return {
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
  }
}
