import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const toAbsolutePath = (relativePath: string): string => {
  return fileURLToPath(new URL(relativePath, import.meta.url))
}

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': toAbsolutePath('./src'),
    },
  },
  server: {
    open: '/viewer.html',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'chrome110',
    rollupOptions: {
      input: {
        viewer: toAbsolutePath('./viewer.html'),
        popup: toAbsolutePath('./popup.html'),
      },
    },
  },
})
