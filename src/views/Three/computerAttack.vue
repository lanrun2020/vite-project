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
  position: relative;
}
.computer-box-label{
  width: 120px;
  height: 30px;
  font-size: 12px;
  color: rgb(0, 220, 224);
  border: 1px solid rgba(0, 83, 91, 0.083);
  background-color: rgba(0, 58, 55, 0.018);
}

</style>