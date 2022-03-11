import store from '@/store'
import { createRouter, createWebHashHistory, RouteRecordRaw  } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path:'/login',
    component: () => import('../views/Login/index.vue'),
  },
  {
    path:'/orbit',
    component: () => import('../views/Three/Orbit.vue'),
  },
  {
    path:'/terrain',
    component: () => import('../views/Three/Terrain.vue'),
  },
  {
    path:'/exportTable',
    component: () => import('../views/Table/exportTable.vue'),
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect:'home',
    children: [
      {
        path: 'home',
        component: () => import('../views/Home/index.vue'),
      },
      {
        path: 'barChart',
        component: () => import('../views/Echarts/barChart.vue'),
      },
      {
        path: 'lineChart',
        component: () => import('../views/Echarts/lineChart.vue'),
      },
      {
        path: 'cesium',
        component: () => import('../views/Cesium/index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
router.beforeEach((to, from, next) => {
  store.commit('CLEAR_CANCEL')
  next()
})
export default router