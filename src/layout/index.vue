<template>
  <div class="app-wrapper">
    <el-container style="height: 100vh">
      <el-menu class="el-menu-vertical-demo" :collapse="isCollapse" :collapse-transition="false" :style="{ width: isCollapse ? '68px' : '200px' }"
        background-color="#565656" text-color="#fff" active-text-color="#ffd04b" @select="menuSelect">
        <el-menu-item index="/home">
          <el-icon>
            <HomeFilled />
          </el-icon>
          <template v-slot:title>
            <span>首页</span>
          </template>
        </el-menu-item>
        <el-sub-menu index="/">
          <template v-slot:title>
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>Three.js</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/threejs/example1">
              example1
            </el-menu-item>
            <el-menu-item index="/threejs/example2">
              example2
            </el-menu-item>
            <el-menu-item index="/threejs/example3">
              example3
            </el-menu-item>
            <el-menu-item index="/threejs/orbit">
              Orbit
            </el-menu-item>
            <el-menu-item index="/threejs/water">
              Water
            </el-menu-item>
            <el-menu-item index="/threejs/chinaMap">
              chinaMap
            </el-menu-item>
            <el-menu-item index="/threejs/computerAttack">
              computerAttack
            </el-menu-item>
            <el-menu-item index="/threejs/simpleScene">
              simpleScene
            </el-menu-item>
            <el-menu-item index="/threejs/materialScene">
              materialScene
            </el-menu-item>
            <el-menu-item index="/threejs/outLine">
              outLine
            </el-menu-item>
            <el-menu-item index="/threejs/sceneBuild">
              SceneBuild
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item index="/cesium">
          <el-icon>
            <Compass />
          </el-icon>
          <template v-slot:title>
            <span>Cesium</span>
          </template>
        </el-menu-item>
        <el-sub-menu index="/echarts">
          <template v-slot:title>
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>Echarts</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/echarts/flightPath">
              flightPath
            </el-menu-item>
            <el-menu-item index="/echarts/china">
              china
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-sub-menu index="/animation">
          <template v-slot:title>
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>Animation</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/animation/example1">
              example1
            </el-menu-item>
            <el-menu-item index="/animation/example2">
              example2
            </el-menu-item>
            <el-menu-item index="/animation/example3">
              example3
            </el-menu-item>
            <el-menu-item index="/animation/example4">
              example4
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-menu-item index="/webgl">
          <el-icon>
            <Compass />
          </el-icon>
          <template v-slot:title>
            <span>WebGL</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/graph">
          <el-icon>
            <Compass />
          </el-icon>
          <template v-slot:title>
            <span>Graph</span>
          </template>
        </el-menu-item>
      </el-menu>

      <el-container>
        <el-header>
          <Header @collapseChange='collapseChange'></Header>
        </el-header>
        <el-main id="main" class="el-main">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import router from "../router";
import {
  Compass,
  HomeFilled,
  Menu as IconMenu,
} from "@element-plus/icons-vue";
import { onMounted, ref } from "vue";
import Header from './child/header.vue';
onMounted(() => {
  // if (!localStorage.getItem('token')) {
  //   router.push('/login')
  // }
})
let isCollapse = ref(false)
// eslint-disable-next-line @typescript-eslint/ban-types
const menuSelect = (path: string) => {
  if (path !== router.currentRoute.value.path) {
    console.log('push',path);
    router.push({ path });
  }
};
const collapseChange = () => {
  isCollapse.value = !isCollapse.value
}
</script>
<style lang="scss">
.app-wrapper {
  .el-main {
    padding: 0px;
    height: calc(100vh - 80px);
    background-color: #fff;
  }
}

.el-menu-vertical-demo {
  width: 200px;
  min-height: 100vh;
  border: none;
  flex-shrink: 0;
}

.el-header {
  background-color: #424242;
  height: auto;
  color: #fff;
}
</style>