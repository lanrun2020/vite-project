<template>
  <div>
    <div id="demo"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import ThreeJs2 from "./index";
import { ref } from 'vue'
onMounted(() => {
  init();
  resizeListener();
});

const init = () => {
  const dom = document.getElementById("demo") as HTMLDivElement;
  ThreeJs2(dom);
};
const resizeListener = () => {
  // window.addEventListener('resize',() =>)
};
</script>
<style>
#demo {
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
}
</style>