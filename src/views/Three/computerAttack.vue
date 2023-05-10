<template>
  <div id="graph"></div>
  <div id="computerAttack"></div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import computerAttack from "./computerAttack"
let map: computerAttack
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
  height: 100%;
  /* height: calc(100vh - 80px); */
  position: relative;
  /* background: url('../../assets/sceneBG.jpg') no-repeat;
  background-size: cover;
  background-position: center; */
  /* color: #00fdf5; */
  background-image: linear-gradient(90deg, rgb(0, 31, 84), rgb(0, 73, 150), rgb(0, 31, 84));
}

.computer-box-label2 {
  /* width: 120px; */
  /* height: 30px; */
  padding: 5px;
  font-size: 12px;
  color: rgb(255, 255, 255);
  border: 1px solid rgba(0, 83, 91, 0.083);
  background-color: rgb(0, 0, 0);
}

.computer-box-label {
  color: rgb(0, 255, 255);
  /* width: 80px; */
  font-size: 14px;
  padding: 10px;
  padding-bottom: 6px;
  background: url('@/assets/msg-bg.png') no-repeat;
  background-size: cover;
}

/* .computer-box-label::after {
    content: "";
    width: calc(100% + 22px);
    height: 39px;
    background-position: 0 0;
    position: absolute;
    bottom: -40px;
    left: -22px;
    background: url('@/assets/corner.png') no-repeat;
} */
#graph {
  display: none;
}</style>