<template>
  <div>
    <div id="simpleScene"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import simpleScene from "./simpleScene"
let scene: any
onMounted(() => {
  init();
});
onUnmounted(() => {
  scene.stop()
})
const init = () => {
  const dom = document.getElementById("simpleScene") as HTMLElement;
  scene = new simpleScene(dom);
};
</script>
<style>
#simpleScene {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>