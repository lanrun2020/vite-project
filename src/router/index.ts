import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    component: () => import('../views/Login/index.vue'),
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: 'home',
    children: [
      {
        path: 'home',
        component: () => import('../views/Home/index.vue'),
      },
      {
        path: 'example1',
        component: () => import('../views/Three/example1.vue'),
      },
      {
        path: 'example2',
        component: () => import('../views/Three/example2.vue'),
      },
      {
        path: 'example3',
        component: () => import('../views/Three/example3.vue'),
      },
      {
        path: 'orbit',
        component: () => import('../views/Three/Orbit.vue'),
      },
      {
        path: 'cesium',
        component: () => import('../views/Cesium/index.vue'),
      },
      {
        path:'flightPath',
        component: () => import('../views/Echarts/flightPath.vue'),
      }
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router