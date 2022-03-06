<template>
  <div>
    <div id="demo2"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import { ref } from "vue";
import * as THREE from "three";
const domWidth = ref(2);
const domHeight = ref(1);
const scene = new THREE.Scene(); //场景
let camera = new THREE.PerspectiveCamera(75, domWidth.value / domHeight.value, 0.1, 1000);
let dom = ref(<any>null);
const renderer = new THREE.WebGLRenderer(); //renderer（渲染器）
   
//要创建一个立方体，我们需要一个BoxGeometry（立方体）对象. 这个对象包含了一个立方体中所有的顶点（vertices）和面（faces）
const geometry = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load("/src/assets/dalishi.jpg"); //首先，获取到材质贴图纹理
const material = new THREE.MeshBasicMaterial({ map: texture });//添加到材质上
//  new THREE.MeshBasicMaterial({ color: 0x00ff00 }); //绿色材质
const cube = new THREE.Mesh(geometry, material); //Mesh（网格）。 网格包含一个几何体以及作用在此几何体上的材质，我们可以直接将网格对象放入到我们的场景中，并让它在场景中自由移动
onMounted(() => {
  init();
});
const animate = () => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  dom = document.getElementById("demo2");
  if (dom) {
    domWidth.value = dom.offsetWidth;
    domHeight.value = dom.offsetHeight;
    renderer.setSize(domWidth.value, domHeight.value);
  }
  requestAnimationFrame(animate); //每帧都会执行（正常情况下是60次/秒）
  //PerspectiveCamera (透视摄像机) 参数1.视野角度（FOV） 2.长宽比（aspect ratio） 3.近截面（near） 4.远截面（far）
  camera = new THREE.PerspectiveCamera(75, domWidth.value / domHeight.value, 0.1, 1000);
  //轨道控制 镜头的移动
  camera.position.z = 5; //相机距离屏幕距离
  // controls.update();
  renderer.render(scene, camera);//渲染场景
};
const init = () => {
  dom = document.getElementById("demo2");
  if (dom) {
    domWidth.value = dom.offsetWidth;
    domHeight.value = dom.offsetHeight;
    renderer.setSize(domWidth.value, domHeight.value);
    dom.appendChild(renderer.domElement);
  }
  
  var light = new THREE.AmbientLight( 0x00ff00 ); // soft white light
  var axesHelper = new THREE.AxesHelper( 5 );
  // controls.update();
  scene.add( axesHelper );
  scene.add( light );
  scene.add(cube);
  animate();
};
</script>
<style>
#demo2 {
  width: 100%;
  height: calc(100vh - 76px);
}
</style>