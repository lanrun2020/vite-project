<template>
  <div>
    <div id="demo5"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
// let camera: any, controls: any, scene: any, renderer: any;
let camera: any, scene: any, renderer: any, stats: any;
let cube: any, sphere: any, torus: any, material;
let cubeCamera: any, cubeRenderTarget: any;

let controls: any;
onMounted(() => {
  init();
})
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResized);
})
const init = () => {
  let dom = document.getElementById("demo5") as HTMLDivElement
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setAnimationLoop(animation);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  if (dom) {
    dom.appendChild(renderer.domElement);
  } else {
    document.body.appendChild(renderer.domElement);
  }
  renderer.setSize(dom.offsetWidth, dom.offsetHeight);
  window.addEventListener('resize', onWindowResized);

  camera = new THREE.PerspectiveCamera(60, dom.offsetWidth / dom.offsetHeight, 1, 1000);
  camera.position.z = 75;

  scene = new THREE.Scene();
  scene.rotation.y = 0.5; // avoid flying objects occluding the sun

  const rgbeLoader = new RGBELoader();
  rgbeLoader.loadAsync(`/model/air3.hdr`).then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    //将加载的材质texture设置给背景和环境
    scene.background = texture;
    scene.environment = texture;
  });
  // new RGBELoader()
  //   .setPath('textures/equirectangular/')
  //   .load('quarry_01_1k.hdr', function (texture) {

  //     texture.mapping = THREE.EquirectangularReflectionMapping;

  //     scene.background = texture;
  //     scene.environment = texture;

  //   });

  //

  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
  cubeRenderTarget.texture.type = THREE.HalfFloatType;

  cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

  //

  material = new THREE.MeshStandardMaterial({
    envMap: cubeRenderTarget.texture,
    roughness: 0.05,
    metalness: 1
  });

  // const gui = new GUI();
  // gui.add(material, 'roughness', 0, 1);
  // gui.add(material, 'metalness', 0, 1);
  // gui.add(renderer, 'toneMappingExposure', 0, 2).name('exposure');

  sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(15, 8), material);
  scene.add(sphere);

  const material2 = new THREE.MeshStandardMaterial({
    roughness: 0.1,
    metalness: 1
  });

  cube = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15), material2);
  cube.position.set(20, 30, 20)
  scene.add(cube);

  torus = new THREE.Mesh(new THREE.TorusKnotGeometry(8, 3, 128, 16), material2);
  torus.position.set(-20, -30, -20)
  scene.add(torus);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  // controls.autoRotate = true; 自转

}
const onWindowResized = () => {
  let dom = document.getElementById("demo5") as HTMLDivElement
  renderer.setSize(dom.offsetWidth, dom.offsetHeight);

  camera.aspect = dom.offsetWidth / dom.offsetHeight;
  camera.updateProjectionMatrix();

}
const animation = (msTime: any) => {

  const time = msTime / 1000;

  // cube.position.x = Math.cos(time) * 30;
  // cube.position.y = Math.sin(time) * 30;
  // cube.position.z = Math.sin(time) * 30;

  // cube.rotation.x += 0.02;
  // cube.rotation.y += 0.03;

  // torus.position.x = Math.cos(time + 10) * 30;
  // torus.position.y = Math.sin(time + 10) * 30;
  // torus.position.z = Math.sin(time + 10) * 30;

  // torus.rotation.x += 0.02;
  // torus.rotation.y += 0.03;

  cubeCamera.update(renderer, scene);

  controls.update();

  renderer.render(scene, camera);

  // stats.update();

}
</script>
<style>
#demo5 {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>