import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './static/common.css'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from 'highlight.js'

VMdPreview.use(githubTheme, {
  Hljs: hljs
})
createApp(App)
  .use(router)
  .use(store)
  .use(VMdPreview)
  .mount('#app')
