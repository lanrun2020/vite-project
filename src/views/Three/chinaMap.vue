<template>
  <div id="china"></div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import chinaMap from "./chinaMap"
let map: chinaMap
onMounted(() => {
  init();
});
onUnmounted(() => {
  map.stop()
})
const init = () => {
  const dom = document.getElementById("china") as HTMLElement;
  map = new chinaMap(dom);
};
</script>
<style>
#china {
  width: 100%;
  height: 100%;
}
</style>