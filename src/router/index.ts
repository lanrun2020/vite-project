import { createRouter, createWebHashHistory, RouteRecordRaw  } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router