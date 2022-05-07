<template>
  <div class="app-wrapper">
    <el-container style="height: 100vh">
      <el-menu class="el-menu-vertical-demo" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b" @select="menuSelect">

          <el-menu-item index="/home">
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
              <el-menu-item index="/barchart">
                example1
              </el-menu-item>
              <el-menu-item index="/linechart">
                example2
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

      </el-menu>
      <el-container>
        <el-header height="50px"></el-header>
        <el-main class="el-main">
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
  Location,
  Document,
  Compass,
  Menu as IconMenu,
  Setting,
} from "@element-plus/icons-vue";

const menuSelect: Function = (path: string) => {
  if (path !== router.currentRoute.value.path) {
    router.push({ path });
  }
};
</script>
<style lang="scss">
.app-wrapper {
  .el-main {
    padding: 10px;
  }
}

.el-menu-vertical-demo {
  width: 200px;
  min-height: 100vh;
}
</style>