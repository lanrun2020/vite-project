<template>
  <div>
    <div id="demo5"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
// let camera: any, controls: any, scene: any, renderer: any;
let camera: any, scene: any, renderer: any, stats: any;
let cube: any, sphere: any, torus: any, material;

let cubeCamera: any, cubeRenderTarget: any;

let controls: any;
onMounted(() => {
  init();
})
// const init = () => {
//   scene = new THREE.Scene();
//   scene.background = new THREE.Color(0xcccccc);
//   // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   let dom = document.getElementById("demo5")
//   if (dom) {
//     dom.appendChild(renderer.domElement);
//   } else {
//     document.body.appendChild(renderer.domElement);
//   }

//   camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
//   camera.position.set(400, 200, 0);

//   // controls

//   controls = new OrbitControls(camera, renderer.domElement);
//   // controls.listenToKeyEvents( window ); // optional

//   //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

//   controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
//   controls.dampingFactor = 0.05;

//   controls.screenSpacePanning = false;

//   controls.minDistance = 100;
//   controls.maxDistance = 500;

//   controls.maxPolarAngle = Math.PI / 2;

//   // world

//   const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
//   const material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });

//   for (let i = 0; i < 500; i++) {

//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.x = Math.random() * 1600 - 800;
//     mesh.position.y = 0;
//     mesh.position.z = Math.random() * 1600 - 800;
//     mesh.updateMatrix();
//     mesh.matrixAutoUpdate = false;
//     scene.add(mesh);

//   }

//   // lights

//   const dirLight1 = new THREE.DirectionalLight(0xffffff);
//   dirLight1.position.set(1, 1, 1);
//   scene.add(dirLight1);

//   const dirLight2 = new THREE.DirectionalLight(0x002288);
//   dirLight2.position.set(- 1, - 1, - 1);
//   scene.add(dirLight2);

//   const ambientLight = new THREE.AmbientLight(0x222222);
//   scene.add(ambientLight);

//   //

//   window.addEventListener('resize', onWindowResize);
//   animate()
// }

// const onWindowResize = () => {

//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);

// }

// const animate = () => {

//   requestAnimationFrame(animate);

//   controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

//   render();

// }

// const render = () => {

//   renderer.render(scene, camera);

// }


const init = () => {

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResized);

  // stats = Stats;
  // document.body.appendChild(stats.dom);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
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
    metalness: 0
  });

  cube = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15), material2);
  scene.add(cube);

  torus = new THREE.Mesh(new THREE.TorusKnotGeometry(8, 3, 128, 16), material2);
  scene.add(torus);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;

}
const onWindowResized = () => {

  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

}
const animation = (msTime: any) => {

  const time = msTime / 1000;

  cube.position.x = Math.cos(time) * 30;
  cube.position.y = Math.sin(time) * 30;
  cube.position.z = Math.sin(time) * 30;

  cube.rotation.x += 0.02;
  cube.rotation.y += 0.03;

  torus.position.x = Math.cos(time + 10) * 30;
  torus.position.y = Math.sin(time + 10) * 30;
  torus.position.z = Math.sin(time + 10) * 30;

  torus.rotation.x += 0.02;
  torus.rotation.y += 0.03;

  cubeCamera.update(renderer, scene);

  controls.update();

  renderer.render(scene, camera);

  // stats.update();

}
</script>