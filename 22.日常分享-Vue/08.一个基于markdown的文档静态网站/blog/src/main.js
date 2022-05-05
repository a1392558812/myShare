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

import VueKinesis from '@/static/vue-kinesis/vue-kinesis'

import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from 'highlight.js'
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index'
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css'
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index'

import loading from './components/loading/loading.vue'
import createLoadingLikeDirective from './directive/loading'

VMdPreview.use(githubTheme, { Hljs: hljs })
VMdPreview.use(createCopyCodePlugin())
VMdPreview.use(createLineNumbertPlugin())

const app = createApp(App)
  .directive('loading', createLoadingLikeDirective(loading))
  .use(store)
  .use(router)
  .use(store)
  .use(VMdPreview)
  .use(VueKinesis)
  .use((app, option) => {
    console.log('app, option', app, option)
  }, { data: '这是一个🐮🍺插件' })
app.mount('#app')
