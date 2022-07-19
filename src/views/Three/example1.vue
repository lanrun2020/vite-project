<template>
  <div>
    <div id="demo"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import ThreeJs2 from "./index"

onMounted(() => {
  init();
});

const init = () => {
  const dom = document.getElementById("demo") as HTMLDivElement;
  ThreeJs2(dom);
};
</script>
<style>
#demo {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>