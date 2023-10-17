import { createApp } from 'vue'
import App from './App.vue'
import sizeDirective from './directive/sizeDirective'
import drag from './directive/drag'

import router from './router'
// import store from './store'
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
import 'ol/ol.css'
import '../src/assets/font/iconfont.css'
const app = createApp(App)
app.use(ElementPlus)
app.use(drag)
app.use(router)
app.directive('size-ob',sizeDirective)
// app.use(store)
// 路由准备完毕再挂载
router.isReady().then(() => app.mount('#app'))
// createApp(App).mount('#app')
