import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import('../mock/index')
import "cesium/Build/Cesium/Widgets/widgets.css";
const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(store)
// 路由准备完毕再挂载
router.isReady().then(() => app.mount('#app'))
