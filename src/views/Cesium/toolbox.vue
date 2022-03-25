<template>
  <div class="toolbox" :style="{ right: toolActive ? '-1px' : '-302px' }">
    <span class="switchbox" @click="toolActive = !toolActive">
      <el-icon class="switchicon">
        <d-arrow-right v-if="toolActive" />
        <d-arrow-left v-else />
      </el-icon>
    </span>
    <div class="tool-box-content">
      <toolitem
        v-for="item in toolList"
        :key="item.value"
        :activeIndex="activeIndex"
        :value="item.value"
        :label="item.title"
        @toolChecked="toolChecked"
      ></toolitem>
    </div>
    <el-button v-if="activeIndex === 3" @click="emit('finishPolygon')">完成</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Toolitem from "./toolitem.vue";
import { DArrowRight, DArrowLeft } from "@element-plus/icons-vue";

let toolActive = ref(true);
let activeIndex = ref(-1);

//props带默认值的写法
const props = withDefaults(defineProps<{
  toolList?: Array<{ value: number, title: string }>;
}>(), { toolList: () => [] });

const emit = defineEmits(["toolChecked", 'finishPolygon']);

//监听
// watch(activeIndex, () => {
//   console.log('activeIndex change')
// })

const toolChecked = (active: boolean, value: any) => {
  if (active) {
    activeIndex.value = value;
  } else {
    activeIndex.value = -1;
  }
  emit("toolChecked", active, value);
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
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
