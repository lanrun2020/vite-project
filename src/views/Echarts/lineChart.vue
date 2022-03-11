<template>
  <div>
    <div id="demo2"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import { ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
const domWidth = ref(2);
const domHeight = ref(1);
const scene = new THREE.Scene(); //场景
scene.background = new THREE.Color( 0xcccccc );
scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

//PerspectiveCamera (透视摄像机) 参数1.视野角度（FOV） 2.长宽比（aspect ratio） 3.近截面（near） 4.远截面（far）
let camera = new THREE.PerspectiveCamera(60, domWidth.value / domHeight.value, 1, 1000);
camera.position.set(400, 400, 400)
let dom = ref(<any>null);
const renderer = new THREE.WebGLRenderer(); //renderer（渲染器）
let controls = new OrbitControls(camera,renderer.domElement)
//要创建一个立方体，我们需要一个BoxGeometry（立方体）对象. 这个对象包含了一个立方体中所有的顶点（vertices）和面（faces）
const geometry = new THREE.BoxGeometry(20, 20, 20);
const texture = new THREE.TextureLoader().load("/src/assets/dalishi.jpg"); //首先，获取到材质贴图纹理
const material = new THREE.MeshBasicMaterial({ map: texture });//添加到材质上
//  new THREE.MeshBasicMaterial({ color: 0x00ff00 }); //绿色材质
const cube = new THREE.Mesh(geometry, material); //Mesh（网格）。 网格包含一个几何体以及作用在此几何体上的材质，我们可以直接将网格对象放入到我们的场景中，并让它在场景中自由移动
onMounted(() => {
  init();
});
const animate = () => {
  // scene.rotation.x += 0.01;
  // scene.rotation.z -= 0.01;
  dom = document.getElementById("demo2");
  if (dom) {
    domWidth.value = dom.offsetWidth;
    domHeight.value = dom.offsetHeight;
    renderer.setSize(domWidth.value, domHeight.value);
  }
  controls.update()
  renderer.render(scene, camera);//渲染场景
  requestAnimationFrame(animate); //每帧都会执行（正常情况下是60次/秒）
};
const addMesh = () => {
  const geometry2 = new THREE.CylinderGeometry( 0, 4, 40, 6, 1 );
  const material2 = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
  for ( let i = 0; i < 500; i ++ ) {
    const mesh = new THREE.Mesh( geometry2, material2 );
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = Math.random() * 1600 - 800;
    mesh.position.z = Math.random() * 1600 - 800;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add( mesh );
    const timer = setInterval(()=>{
      mesh.position.y +=10
      if(mesh.position.y > 800){
        mesh.position.y = -800
      }
      mesh.updateMatrix();
    },20)
  }
  }
const init = () => {
  dom = document.getElementById("demo2");
  if (dom) {
    domWidth.value = dom.offsetWidth;
    domHeight.value = dom.offsetHeight;
    renderer.setSize(domWidth.value, domHeight.value);
    dom.appendChild(renderer.domElement);
  }
  addMesh()
  // var light = new THREE.AmbientLight( 0x00ff00 ); // soft white light
  const dirLight1 = new THREE.DirectionalLight( 0xffffff );
  dirLight1.position.set( 1, 1, 1 );
  scene.add( dirLight1 );

  const dirLight2 = new THREE.DirectionalLight( 0x002288 );
  dirLight2.position.set( - 1, - 1, - 1 );
  scene.add( dirLight2 );

  const ambientLight = new THREE.AmbientLight( 0x222222 );
  scene.add( ambientLight );
  var axesHelper = new THREE.AxesHelper( 500 ); //辅助三维坐标系
  controls = new OrbitControls(camera,renderer.domElement)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 100;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI / 2;
  scene.add( axesHelper );
  // scene.add( light );
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