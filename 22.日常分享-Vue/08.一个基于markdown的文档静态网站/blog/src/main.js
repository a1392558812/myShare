import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import 'jquery'

import './static/mCustomScrollbar/jquery.mCustomScrollbar.concat.min'
import './static/mCustomScrollbar/jquery.mCustomScrollbar.css'
import './static/mCustomScrollbar/mCSB_buttons.png'

import './static/common.css'
import './static/reset.css'

import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from 'highlight.js'
VMdPreview.use(githubTheme, {
  Hljs: hljs
})
createApp(App).use(store)
  .use(router)
  .use(store)
  .use(VMdPreview)
  .mount('#app')
