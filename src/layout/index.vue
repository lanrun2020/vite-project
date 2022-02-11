<template>
  <el-container style="height: 100vh">
      <el-menu
        class="el-menu-vertical-demo"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <template v-for="item in menuList" :key="item.id">
          <el-sub-menu v-if="item.children" :index="item.id">
            <template v-slot:title>
              <el-icon><setting /></el-icon>
              <span>{{ item.menuName }}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item
                v-for="child in item.children"
                :index="child.id"
                :key="child.id"
                @click="menuClick(child)"
                >{{ child.menuName }}</el-menu-item
              >
            </el-menu-item-group>
          </el-sub-menu>
          <el-menu-item v-else :index="item.id" @click="menuClick(item)">
            <el-icon><setting /></el-icon>
            <template v-slot:title>
              <span>{{ item.menuName }}</span>
              </template>
          </el-menu-item>
        </template>
      </el-menu>
    <el-container>
      <el-main>
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import router from "../router"
import {
  Location,
  Document,
  Menu as IconMenu,
  Setting,
} from '@element-plus/icons-vue'
 const menuList :Array<any> = [
        {
          id: '1',
          menuName: '首页',
          menuUrl: '/home',
          parentId: '0'
        },
        {
          id: '2',
          menuName: 'Echarts',
          parentId: '0',
          children: [{
            id: '21', menuName: '柱状图', menuUrl: '/barchart', parentId: '2'
          },{
            id: '22', menuName: '折线图', menuUrl: '/linechart', parentId: '2'
          }]
        },
        {
          id: '3',
          menuName: 'Cesium',
          menuUrl: '/cesium',
          parentId: '0'
        },
      ]
const menuClick: Function = (item:any) => {
  if (item.menuUrl !== router.currentRoute.value.path) {
    router.push({ path: item.menuUrl })
  }
}
</script>
<style lang="scss">
.el-menu-vertical-demo{
  width: 200px;
  min-height: 100vh;
}
</style>