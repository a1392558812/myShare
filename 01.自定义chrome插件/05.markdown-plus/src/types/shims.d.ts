declare module 'markdown-it-task-lists'
declare module 'markdown-it-footnote'
declare module 'markdown-it-mark'
declare module 'markdown-it-sub'
declare module 'markdown-it-sup'

type FilePickerAcceptType = {
  description?: string
  accept: Record<string, string[]>
}

type FilePickerOptions = {
  types?: FilePickerAcceptType[]
  excludeAcceptAllOption?: boolean
  multiple?: boolean
  suggestedName?: string
}

type FileHandlePermissionDescriptor = {
  mode?: 'read' | 'readwrite'
}

interface FileSystemHandle {
  queryPermission?: (descriptor?: FileHandlePermissionDescriptor) => Promise<PermissionState>
  requestPermission?: (descriptor?: FileHandlePermissionDescriptor) => Promise<PermissionState>
}

interface Window {
  showOpenFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle[]>
  showSaveFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle>
}

interface DataTransferItem {
  getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>
}
