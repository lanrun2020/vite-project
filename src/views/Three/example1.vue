<template>
  <div id="demo"></div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
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
  height: 100%;
}
</style>