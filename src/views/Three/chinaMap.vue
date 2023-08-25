<template>
  <div id="china">
    <div class="tool-box">
      <ScrollBar>
        <div v-for="(item, index) in toolList" class="tool-item" :class="{ 'tool-active': item.active }" :key="index"
          @click="changeToolItem(item, index)">
          {{ item.name }}
        </div>
      </ScrollBar>
    </div>
    <div class="echarts-plane" :class="{'show-plane': toolList[chartIndex].active && toolList[chartIndex].show}">
        <div id="echarts"></div>
        <el-icon v-if="toolList[chartIndex].show && toolList[chartIndex].active" class="close-icon" @click="toolList[chartIndex].show = false"><Close /></el-icon>
        <el-icon v-if="!toolList[chartIndex].show && toolList[chartIndex].active" class="open-icon" @click="toolList[chartIndex].show = true"><DArrowRight /></el-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import chinaMap from "./chinaMap"
import ScrollBar from '../../components/scrollBar.vue'
import {
  Close,DArrowRight
} from "@element-plus/icons-vue";
let map: chinaMap
let chartIndex = ref(0)
let toolList = ref([
  {
    name: '2022GDP',
    active: false,
    show: true,
    value: 'addGDP',
    chart: true,
  }, {
    name: '2022人口',
    active: false,
    show: true,
    value: 'addPopulation',
    chart: true,
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
const changeToolItem = (item, index) => {
  item.active = !item.active
  if(item.active) {
    item.show = true
    toolList.value.forEach((tool) => {
      if(tool.active && tool.value!=item.value) {
        map[tool.value](false)
        tool.active = false
      }
    })
  }
  if(item.chart) {
    chartIndex.value = index
  }
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
    width: 300px;
    height: 60px;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
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
      // flex-grow: 1;
      flex-shrink: 0;
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
    z-index: 999;
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
}
.computer-box-label {
  color: #00ffaa;
  /* width: 80px; */
  font-size: 14px;
  padding: 10px;
  padding-bottom: 6px;
  background: rgba(0,0,0,0.6);
  // background: url('@/assets/msg-bg.png') no-repeat;
  // background-size: cover;
}
</style>