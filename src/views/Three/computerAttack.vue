<template>
  <div>
    <div id="computerAttack"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import computerAttack from "./computerAttack"
let map: any
onMounted(() => {
  init();
});
onUnmounted(() => {
  map.stop()
})
const init = () => {
  const dom = document.getElementById("computerAttack") as HTMLElement;
  map = new computerAttack(dom);
};
</script>
<style>
#computerAttack {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>