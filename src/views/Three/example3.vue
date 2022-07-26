<template>
  <div>
    <div id="demo4"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import { fa } from "element-plus/lib/locale";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera: any, controls: any, scene: any, renderer: any, dom: HTMLElement, mixer: any, idleAction: any, walkAction: any, runAction: any, clock: any, model: any, flag: boolean = true
let speed: number = 0.4

let keyState = {
  'KeyW': false,
  'KeyA': false,
  'KeyS': false,
  'KeyD': false,
}
onMounted(() => {
  init();
})
const init = () => {
  dom = document.getElementById("demo4")!
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  const helper = new THREE.GridHelper(1000, 50, 0x303030, 0x303030); //长度1000 划分为50份
  // helper.position.y = -50;
  scene.add(helper);
  let axesHelper = new THREE.AxesHelper(500); //辅助三维坐标系
  scene.add(axesHelper);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(dom.offsetWidth, dom.offsetHeight);

  camera = new THREE.PerspectiveCamera(50, dom.offsetWidth / dom.offsetHeight, 0.1, 4000);
  camera.position.set(0, 100, 400); //(x,y,z)

  // 点光源
  var point = new THREE.PointLight(0xffffff);
  point.position.set(100, 100, 100); //点光源位置
  // 通过add方法插入场景中，不插入的话，渲染的时候不会获取光源的信息进行光照计算
  scene.add(point); //点光源添加到场景中
  scene.add(new THREE.AmbientLight(0xffffff)); //场景亮度
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2); //方向光

  directionalLight.position.set(200, 200, 200)
  directionalLight.position.normalize();
  scene.add(directionalLight);


  let pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(300, 300, 300);
  scene.add(pointLight);

  controls = new OrbitControls(camera, renderer.domElement) //轨道控制器
  controls.update();
  controls.enableDamping = true; // 阻尼（惯性）是否启用
  controls.dampingFactor = 0.05; // 阻尼系数
  controls.screenSpacePanning = false; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
  controls.minDistance = 5; //移动最小距离
  controls.maxDistance = 2500; //移动最大距离
  controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI

  if (dom) {
    dom.appendChild(renderer.domElement);
  } else {
    document.body.appendChild(renderer.domElement);
  }
  addSolider()


  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyW':
        keyState.KeyW = true
        break
      case 'KeyA':
        keyState.KeyA = true
        break
      case 'KeyS':
        keyState.KeyS = true
        if (flag) {
          model.rotation.y += Math.PI
          flag = false
        }
        break
      case 'KeyD':
        keyState.KeyD = true
        break
    }
  });
  // document.addEventListener()
  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyW':
        keyState.KeyW = false
        break
      case 'KeyA':
        keyState.KeyA = false
        break
      case 'KeyS':
        keyState.KeyS = false
        flag = true
        break
      case 'KeyD':
        keyState.KeyD = false
        break
    }

  });

  dom.addEventListener('mousedown', () => {

    dom.requestPointerLock();

  });
  dom.addEventListener('mouseup', () => {

  });
  dom.addEventListener('mousemove', (event) => {
    console.log(document.pointerLockElement && document.pointerLockElement.id === 'demo4');
    if (document.pointerLockElement && document.pointerLockElement.id === 'demo4') {
      model.rotation.y -= event.movementX / 500;
      model.rotation.x -= event.movementY / 500;
    }
  });

  animate()
}

const onWindowResize = () => {
  if (dom && dom.offsetWidth) {
    camera.aspect = dom.offsetWidth / dom.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.offsetWidth, dom.offsetHeight);
  }
}

const animate = () => {

  requestAnimationFrame(animate);
  controls.update()
  let mixerUpdateDelta = clock.getDelta();
  if (mixer) {
    mixer.update(mixerUpdateDelta);
  }
  if (model) {
    camera.lookAt(model.position)
  }
  soliderMove()
  render();
}

const soliderMove = () => {
  if (keyState.KeyW) {
    setWeight(walkAction, 1)
    model.position.z -= speed * Math.cos(model.rotation.y)
    model.position.x -= speed * Math.sin(model.rotation.y)
    camera.position.z = model.position.z + 100 * Math.cos(model.rotation.y)
    camera.position.x = model.position.x + 100 * Math.sin(model.rotation.y)
    camera.position.y = 160
  }
  if (keyState.KeyA) {
    model.rotation.y += Math.PI / 90
    camera.position.z = model.position.z + 100 * Math.cos(model.rotation.y)
    camera.position.x = model.position.x + 100 * Math.sin(model.rotation.y)
  }
  if (keyState.KeyD) {
    model.rotation.y -= Math.PI / 90
    camera.position.z = model.position.z + 100 * Math.cos(model.rotation.y)
    camera.position.x = model.position.x + 100 * Math.sin(model.rotation.y)
  }
  // if (keyState.KeyS) {
  //   setWeight(walkAction, 1)
  //   model.position.z -= speed * Math.cos(model.rotation.y)
  //   model.position.x -= speed * Math.sin(model.rotation.y)
  // }
}
const addSolider = () => {
  const loader = new GLTFLoader();
  loader.load(`/model/Soldier.glb`, function (gltf) {
    model = gltf.scene;
    model.scale.set(12, 12, 12)
    model.position.set(0, 0, 0)
    model.rotation.y = Math.PI  //旋转180度
    scene.add(model);
    model.traverse(function (object: any) {
      if (object.isMesh) object.castShadow = false;
    });
    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(model);
    idleAction = mixer.clipAction(animations[0]);
    walkAction = mixer.clipAction(animations[3]);
    runAction = mixer.clipAction(animations[1]);

    setWeight(idleAction, 0)
    setWeight(runAction, 0)
    setWeight(walkAction, 0)
  });
}
const setWeight = (action: any, weight: number) => {

  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
  action.play()

}
const render = () => {

  renderer.render(scene, camera);

}
</script>
<style>
#demo4 {
  width: 100%;
  height: calc(100vh - 80px);
}
</style>