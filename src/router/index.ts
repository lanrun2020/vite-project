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
        path: 'cesium',
        component: () => import('../views/Cesium/index.vue'), //若采用懒加载,页面加载缓慢
      },
      {
        path: 'webgl',
        component: () => import('../views/WebGL/index.vue'),
      },
      {
        path: 'graph',
        component: () => import('../views/Graph/index.vue'),
      },
      {
        path: 'openlayers',
        component: () => import('../views/OpenLayers/index.vue'),
      }
    ],
  },
  {
    path: '/threejs',
    component: () => import('../layout/index.vue'),
    redirect: 'example1',
    children: [
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
        path: 'water',
        component: () => import('../views/Three/waterPlane.vue'),
      },
      {
        path: 'chinaMap',
        component: () => import('../views/Three/chinaMap.vue'),
      },
      {
        path: 'computerAttack',
        component: () => import('../views/Three/computerAttack.vue'),
      },
      {
        path: 'simpleScene',
        component: () => import('../views/Three/simpleScene.vue'),
      },
      {
        path: 'materialScene',
        component: () => import('../views/Three/materialScene.vue'),
      },
      {
        path: 'outLine',
        component: () => import('../views/Three/outLine.vue'),
      },
      {
        path: 'sceneBuild',
        component: () => import('../views/Three/sceneBuild.vue'),
      },
      {
        path: 'loadDxf',
        component: () => import('../views/Three/loadDxf.vue'),
      },
      {
        path: 'cloud',
        component: () => import('../views/Three/cloud.vue'),
      },
    ],
  },
  {
    path: '/echarts',
    component: () => import('../layout/index.vue'),
    redirect: 'flightPath',
    children: [
      {
        path: 'flightPath',
        component: () => import('../views/Echarts/flightPath.vue'),
      },
      {
        path: 'china',
        component: () => import('../views/Echarts/chinaMap.vue'),
      }
    ],
  },
  {
    path: '/animation',
    component: () => import('../layout/index.vue'),
    redirect: 'example1',
    children: [
      {
        path: 'example1',
        component: () => import('../views/Animation/example1.vue'),
      },
      {
        path: 'example2',
        component: () => import('../views/Animation/example2.vue'),
      },
      {
        path: 'example3',
        component: () => import('../views/Animation/example3.vue'),
      },
      {
        path: 'example4',
        component: () => import('../views/Animation/example4.vue'),
      },
      {
        path: 'example5',
        component: () => import('../views/Animation/example5.vue'),
      },
      {
        path: 'example6',
        component: () => import('../views/Animation/example6.vue'),
      },
      {
        path: 'example7',
        component: () => import('../views/Animation/example7.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router