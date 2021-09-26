import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import mountContent from './components/dialog'
const app = createApp(App)
app.provide('$mountContent', mountContent)
app.use(store).use(router).mount('#app')
