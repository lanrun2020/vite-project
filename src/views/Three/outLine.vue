<template>
 <div>
  <div id="graph"></div>
  <div id="outline"></div>
 </div>
</template>

<script setup lang='ts'>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import Stats from 'three/examples/jsm/libs/stats.module.js'
// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { onMounted, onUnmounted } from 'vue'
import outLine from './outLine'
let outLineSene:any
onMounted(()=>{
  init()
})
onUnmounted(() => {
  outLineSene.stop()
})
const init = () => {
  const dom = document.getElementById("outline") as HTMLElement;
  outLineSene = new outLine(dom);
}
</script>

<style lang="scss">
#outline {
  width: 100%;
  height: calc(100vh - 80px);
  position: relative;
  /* color: #00fdf5; */
  background-image: linear-gradient(90deg,rgb(0, 31, 84), rgb(0, 73, 150),rgb(0, 31, 84));
}
.computer-box-label2{
  /* width: 120px; */
  /* height: 30px; */
  padding: 5px;
  font-size: 12px;
  color: rgb(255, 255, 255);
  border: 1px solid rgba(0, 83, 91, 0.083);
  background-color: rgb(0, 0, 0);
}
.computer-box-label{
  color: rgb(0, 255, 255);
  /* width: 80px; */
  font-size: 14px;
  padding: 10px;
  padding-bottom: 6px;
  background: url('@/assets/msg-bg.png') no-repeat;
  background-size: cover;
}
#graph{
  display: none;
}
</style>
