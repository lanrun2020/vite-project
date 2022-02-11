<template>
  <div class="toolbox" :style="{right:toolActive?'-1px':'-302px'}">
    <span class="switchbox" @click="toolboxChange">
      <i class=" switchicon" :class="{'el-icon-d-arrow-right':toolActive,'el-icon-d-arrow-left':!toolActive}"></i>
    </span>
    <div class="tool-box-content"  >
     <toolitem v-for="item in toolList" :key="item.key" :activeIndex='activeIndex' :value="item.value" :label="item.title" @toolChecked='toolChecked'></toolitem>
    </div>
  </div>
</template>

<script setup='props, { emit }' lang="ts">
import component from './toolitem.vue'
import Toolitem from './toolitem.vue'
let toolActive:boolean = true
let activeIndex:number = -1 
const props = defineProps<{
    toolList:Array<any>
  }>()
const emit = defineEmits(['toolChecked'])
const components = {Toolitem}
const toolboxChange = () => {
  toolActive = !toolActive
}
const toolChecked = (active:boolean, value:number) => {
  if (active) {
    activeIndex = value
  } else {
    activeIndex = -1
  }
  emit('toolChecked', active, value)
}

</script>

<style lang='scss' scoped>
.toolbox{
  position: absolute;
  width: 300px;
  top: 18vh;
  right: -1px;
  z-index: 1;
  height: 60vh;
  border-radius: 2px;
  border: 1px solid rgb(0, 195, 255);
  background-color: rgba(0, 0, 0, 0.25);
  transition: right 0.15s linear;
}
.switchbox{
  position: absolute;
  display: inline-block;
  padding: 10px 1px;
  border: 1px solid rgb(0, 195, 255);
  border-radius: 2px 0 0 2px;
  left: 0;
  top: 50%;
  transform: translateX(-100%) translateY(-50%);
  cursor: pointer;
  color: rgb(0, 195, 255,0.6);
}
.switchicon{
  font-size: 32px;
  font-weight: bold;
}
.switchbox:hover{
  color: rgb(0, 195, 255);
}
.tool-box-content{
  display: flex;
}
</style>

function emit(arg0: string, active: boolean, value: number) {
  throw new Error('Function not implemented.')
}
