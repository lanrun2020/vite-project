<template>
  <div>
    <div id="china"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import chinaMap from "./chinaMap"
let map: any
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
  height: calc(100vh - 80px);
}
</style>