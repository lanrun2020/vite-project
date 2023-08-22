<template>
  <div id="china">
    <div class="tool-box">
      <div v-for="(item,index) in toolList" class="tool-item" :class="{'tool-active':item.active}" :key="index" @click="changeToolItem(item)">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import chinaMap from "./chinaMap"
let map: chinaMap
let toolList = ref([
  {
    name: '柱状图',
    active: false,
    value: 'addCyliners'
  },{
    name: '飞线',
    active: false,
    value: 'addFlyLine'
  },{
    name: '打印',
    active: false,
    value: 'printLog'
  }
])
onMounted(() => {
  init();
});
onUnmounted(() => {
  map.stop()
})
const changeToolItem = (item) => {
  item.active = !item.active
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
}
</style>