/** 支持的 Markdown 及纯文本扩展名 */
export const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkd', '.mdx', '.txt']

/** 打开后的 Markdown 文档 */
export interface OpenedMarkdown {
  /** 读取到的文件对象 */
  file: File
  /** 文件系统句柄，仅通过拖放或 File System Access 打开时存在 */
  handle: FileSystemFileHandle | null
}

const MARKDOWN_PICKER_TYPES: FilePickerAcceptType[] = [
  {
    description: 'Markdown 文件',
    accept: {
      'text/markdown': ['.md', '.markdown', '.mdown', '.mkd'],
      'text/plain': ['.txt'],
    },
  },
]

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * 判断文件名是否为支持的 Markdown / 纯文本文件。
 * @param name 文件名
 * @returns 是否支持
 */
export const isMarkdownFileName = (name: string): boolean => {
  const lowerName = name.toLowerCase()
  return MARKDOWN_EXTENSIONS.some((extension) => {
    return lowerName.endsWith(extension)
  })
}

/**
 * 判断当前页面是否支持 File System Access API 的打开 / 保存对话框。
 * @returns 是否支持
 */
export const canUseFileSystemAccess = (): boolean => {
  return typeof window.showOpenFilePicker === 'function' && typeof window.showSaveFilePicker === 'function'
}

/**
 * 读取文件文本内容。
 * @param file 文件对象
 * @returns 文件文本
 */
export const readFileText = (file: File): Promise<string> => {
  return file.text()
}

/**
 * 通过 File System Access 选择保存位置；用户取消时返回 null。
 * @param suggestedName 建议文件名
 * @returns 保存目标句柄
 */
export const pickSaveTarget = (suggestedName: string): Promise<FileSystemFileHandle | null> => {
  const savePicker = window.showSaveFilePicker
  if (!savePicker) {
    return Promise.resolve(null)
  }
  return savePicker({
    suggestedName,
    types: MARKDOWN_PICKER_TYPES,
  }).catch((error) => {
    if (isAbortError(error)) {
      return null
    }
    throw error
  })
}

const ensureWritePermission = (handle: FileSystemFileHandle): Promise<void> => {
  if (typeof handle.queryPermission !== 'function') {
    return Promise.resolve()
  }
  return handle.queryPermission({ mode: 'readwrite' }).then((state) => {
    if (state === 'granted') {
      return Promise.resolve()
    }
    if (typeof handle.requestPermission !== 'function') {
      return Promise.reject(new Error('没有写入该文件的权限'))
    }
    return handle.requestPermission({ mode: 'readwrite' }).then((nextState) => {
      if (nextState === 'granted') {
        return Promise.resolve()
      }
      return Promise.reject(new Error('没有写入该文件的权限'))
    })
  })
}

/**
 * 将文本写回文件系统句柄；需要时先申请写入权限。
 * @param handle 文件句柄
 * @param text 待写入文本
 * @returns 写入完成的 Promise
 */
export const writeToHandle = (handle: FileSystemFileHandle, text: string): Promise<void> => {
  return ensureWritePermission(handle)
    .then(() => {
      return handle.createWritable()
    })
    .then((writable) => {
      return writable
        .write(text)
        .then(() => {
          return writable.close()
        })
        .catch((error) => {
          return writable.abort().then(() => {
            return Promise.reject(error)
          })
        })
    })
}

/**
 * 通过浏览器下载方式导出文本（File System Access 不可用时的回退方案）。
 * @param text 文本内容
 * @param fileName 下载文件名
 */
export const downloadText = (text: string, fileName: string): void => {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}

/**
 * 确保文件名带有 Markdown 扩展名。
 * @param name 原始文件名
 * @returns 补全扩展名后的文件名
 */
export const ensureMarkdownExtension = (name: string): string => {
  const trimmed = name.trim() || '未命名.md'
  return isMarkdownFileName(trimmed) ? trimmed : `${trimmed}.md`
}

/**
 * 从拖放数据中取出第一个 Markdown 文件，并尽量获取对应的文件系统句柄。
 * 必须在 drop 事件同步阶段调用，否则 DataTransfer 会失效。
 * @param dataTransfer 拖放数据
 * @returns 文件与句柄；没有可用的 Markdown 文件时返回 null
 */
export const extractMarkdownDrop = (dataTransfer: DataTransfer): Promise<OpenedMarkdown | null> => {
  const files = Array.from(dataTransfer.files)
  const markdownFile = files.find((file) => {
    return isMarkdownFileName(file.name)
  })
  if (!markdownFile) {
    return Promise.resolve(null)
  }

  const handlePromises = Array.from(dataTransfer.items)
    .filter((item) => {
      return item.kind === 'file'
    })
    .map((item) => {
      const getHandle = item.getAsFileSystemHandle
      if (typeof getHandle !== 'function') {
        return Promise.resolve<FileSystemHandle | null>(null)
      }
      return Promise.resolve(getHandle.call(item)).catch(() => {
        return null
      })
    })

  return Promise.all(handlePromises).then((handles) => {
    const matchedHandle = handles.find((handle) => {
      return Boolean(handle) && handle?.kind === 'file' && handle.name === markdownFile.name
    })
    return {
      file: markdownFile,
      handle: matchedHandle ? (matchedHandle as FileSystemFileHandle) : null,
    }
  })
}
