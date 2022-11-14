<template>
  <div class="toolbox" :style="{ right: toolActive ? '-1px' : '-302px' }">
    <span class="switchbox" @click="toolActive = !toolActive">
      <el-icon class="switchicon">
        <d-arrow-right v-if="toolActive" />
        <d-arrow-left v-else />
      </el-icon>
    </span>
    <div class="tool-box-content">
      <toolitem v-for="item in toolList" :key="item.value" :value="item.value"
        :label="item.title" :active="item.active" @toolChecked="toolChecked"></toolitem>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Toolitem from "./toolitem.vue";
import { DArrowRight, DArrowLeft } from "@element-plus/icons-vue";

let toolActive = ref(true);

//props带默认值的写法
const props = withDefaults(defineProps<{
  toolList?: Array<{ value: number, title: string, active:boolean }>;
}>(), { toolList: () => [] });

const emit = defineEmits(["toolChecked"]);

const toolChecked = (active: boolean, value: number) => {
  emit("toolChecked", !active, value);
};
</script>

<style lang='scss' scoped>
.toolbox {
  position: absolute;
  width: 300px;
  top: 18vh;
  right: -1px;
  z-index: 1;
  height: 60vh;
  border-radius: 2px;
  border: 1px solid rgb(0, 195, 255);
  background-color: rgba(0, 0, 0, 0.75);
  transition: right 0.15s linear;
}

.switchbox {
  position: absolute;
  display: inline-block;
  padding: 10px 1px;
  border: 1px solid rgb(0, 195, 255);
  border-radius: 2px 0 0 2px;
  left: 0;
  top: 50%;
  transform: translateX(-100%) translateY(-50%);
  cursor: pointer;
  color: rgb(0, 195, 255, 0.6);
  background-color: rgba(0, 0, 0, 0.75);
}

.switchicon {
  font-size: 32px;
  font-weight: bold;
}

.switchbox:hover {
  color: rgb(0, 195, 255);
}

.tool-box-content {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
/*滚动条整体粗细样式*/
::-webkit-scrollbar {
    /*高宽分别对应横竖滚动条的尺寸*/
    width: 8px;
    height: 8px;
}

/*滚动条里面小方块*/
::-webkit-scrollbar-thumb {
    border-radius: 10px !important;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
    background: rgb(74, 74, 74);
    /* 颜色 */
    /* background:#b6b6b6!important; */
    /* 线性渐变背景 */
}

/*滚动条轨道*/
::-webkit-scrollbar-track {
    border-radius: 10px !important;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
    background: rgb(0, 0, 0, 0) !important;
}
</style>
