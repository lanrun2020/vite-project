<template>
  <div>
    <div id="materialScene"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import materialScene from "./materialScene"
let scene: any
onMounted(() => {
  init();
});
onUnmounted(() => {
  scene.stop()
})
const init = () => {
  const dom = document.getElementById("materialScene") as HTMLElement;
  scene = new materialScene(dom);
};
</script>
<style>
#materialScene {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>