<template>
  <div>
    <div id="demo"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "@vue/runtime-core";
// import ThreeJs2 from "./index"
import ThreeJs2 from "./three"
let T: any
onMounted(() => {
  init();
});
onUnmounted(() => {
  T.stop()
})
const init = () => {
  const dom = document.getElementById("demo") as HTMLElement;
  // ThreeJs2(dom)
  T = new ThreeJs2(dom);
  // T.start()
};
</script>
<style>
#demo {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>