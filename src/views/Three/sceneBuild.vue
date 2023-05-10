<template>
  <div id="sceneBuildCard">
    <div id="sceneBuild"></div>
    <div class="tool-card">
      <div></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import sceneBuild from "./sceneBuild"
let scene: any
onMounted(() => {
  init();
});
onUnmounted(() => {
  scene.stop()
})
const init = () => {
  const dom = document.getElementById("sceneBuild") as HTMLElement;
  scene = new sceneBuild(dom);
};
</script>
<style lang="scss">
#sceneBuildCard {
  position: relative;
  width: 100%;
  height: 100%;

  #sceneBuild {
    width: 100%;
    height: 100%;
  }

  .tool-card {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>