<template>
  <div id="cloud"></div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import cloudScene from "./cloud"
let scene: any
onMounted(() => {
  init();
});
onUnmounted(() => {
  scene.stop()
})
const init = () => {
  const dom = document.getElementById("cloud") as HTMLElement;
  scene = new cloudScene(dom);
};
</script>
<style>
#cloud {
  width: 100%;
  height: 100%;
}
</style>