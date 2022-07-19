<template>
  <div>
    <div id="demo4"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import dalishi from '../../assets/dalishi.jpg'

let camera: any, controls: any, scene: any, renderer: any;
let mesh: any
onMounted(() => {
  init();
})
const init = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  let dom = document.getElementById("demo4")
  if (dom) {
    dom.appendChild(renderer.domElement);
  } else {
    document.body.appendChild(renderer.domElement);
  }

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(400, 200, 0);

  // controls

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  // world
  const geometry = new THREE.BoxGeometry(10, 10, 10); //创建一个立方体几何对象Geometry
  const texture = new THREE.TextureLoader().load(
    dalishi
  ); //首先，获取到纹理
  const material1 = new THREE.MeshBasicMaterial({ map: texture })
  const material = [material1, material1, material1, material1, material1, material1]; //然后创建一个phong材质来处理着色，并传递给纹理映射
  const mesh = new THREE.Mesh(geometry, material);
  // mesh.position.x = 0;
  // mesh.position.y = 0;
  // mesh.position.z = 0;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false;
  scene.add(mesh);

  // lights

  const dirLight1 = new THREE.DirectionalLight(0xffffff);
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x002288);
  dirLight2.position.set(- 1, - 1, - 1);
  scene.add(dirLight2);

  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);

  //

  window.addEventListener('resize', onWindowResize);
  animate()
}

const onWindowResize = () => {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

const animate = () => {

  requestAnimationFrame(animate);

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render();

}

const render = () => {

  renderer.render(scene, camera);

}
</script>