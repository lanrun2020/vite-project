<template>
  <div id="china">
    <div class="tool-box">
      <div v-for="(item, index) in toolList" class="tool-item" :class="{ 'tool-active': item.active }" :key="index"
        @click="changeToolItem(item)">
        {{ item.name }}
      </div>
    </div>
    <div class="echarts-plane" :class="{'show-plane': toolList[0].active && toolList[0].show}">
        <div id="echarts"></div>
        <el-icon v-if="toolList[0].show && toolList[0].active" class="close-icon" @click="toolList[0].show = false"><Close /></el-icon>
        <el-icon v-if="!toolList[0].show && toolList[0].active" class="open-icon" @click="toolList[0].show = true"><DArrowRight /></el-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import chinaMap from "./chinaMap"
import {
  Close,DArrowRight
} from "@element-plus/icons-vue";
let map: chinaMap
let toolList = ref([
  {
    name: '2022GDP',
    active: false,
    show: true,
    value: 'addCyliners'
  }, {
    name: '飞线',
    active: false,
    value: 'addFlyLine'
  }, {
    name: '打印',
    active: false,
    value: 'printLog'
  }
])
onMounted(() => {
  init();
  // initCharts()
});
onUnmounted(() => {
  map.stop()
})
const changeToolItem = (item) => {
  item.active = !item.active
  if(item.active) item.show = true
  map[item.value](item.active)
}
const init = () => {
  const dom = document.getElementById("china") as HTMLElement;
  map = new chinaMap(dom);
};
</script>
<style lang="scss">
#china {
  width: 100%;
  height: 100%;
  position: relative;

  .tool-box {
    max-width: 300px;
    height: 60px;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    color: rgb(151, 151, 151);
    border: 1px solid #00ffff47;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    background: rgba($color: #000000, $alpha: 0.5);
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    user-select: none; //禁止用户选中文本（连续点击时文本会被选中，体验不好）

    .tool-item {
      padding: 20px;
      cursor: pointer;
    }

    .tool-active {
      color: #00ffff;
    }
  }

  .echarts-plane {
    position: absolute;
    left: -500px;
    top: 0;
    // transform: translateY(-50%);
    width: 500px;
    height: 800px;
    background: rgba($color: #000000, $alpha: 0.5);
    transition: all 0.3s;
    #echarts {
      width: 100%;
      height: 100%;
    }
    &.show-plane {
      left: 0px;
    }
    .close-icon {
      position: absolute;
      top: 12px;
      right: 4px;
      color: #648d8d;
      font-size: 24px;
      margin: 4px;
    }
    .open-icon {
      position: absolute;
      top: 12px;
      right: -34px;
      color: #00ffff;
      font-size: 24px;
    }
  }

}</style>