import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// content script 独立构建 dist/content.js 与独立样式 dist/content.css，
// 由 manifest.json 的 content_scripts 注入到 .md/.txt 原始文本页。
// emptyOutDir 必须为 false，避免清空主构建（viewer/popup）产物。
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'chrome110',
    lib: {
      entry: resolve(import.meta.dirname, 'src/content/main.ts'),
      formats: ['iife'],
      name: 'MarkdownPlusContent',
      fileName: () => 'content.js',
      cssFileName: 'content',
    },
  },
})
