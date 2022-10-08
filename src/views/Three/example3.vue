<template>
  <div id="demo4"></div>
</template>
<script setup lang="ts">
import { onMounted, reactive, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera: any, controls: any, scene: any, renderer: any, dom: HTMLElement, mixer: any, idleAction: any, walkAction: any, runAction: any, clock: any, model: any, flag = true
let speed = 0.4

let keyState = reactive({
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
})
onMounted(() => {
  init();
})
watch(() => keyState.KeyA, (newVal, oldVal) => {
  if (newVal && model) {
    model.rotation.y += Math.PI / 4
    // if (keyState.KeyW) {
    //   model.rotation.y += Math.PI / 4
    // } else {
    //   model.rotation.y += Math.PI / 4
    // }
  }
  // if (!newVal && model) {
  // model.rotation.y -= Math.PI / 4
  // }
})
const init = () => {
  dom = document.getElementById("demo4")!
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  console.log(scene);
  scene.position.set(0, 0, 20)

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
        // model.rotation.y -= Math.PI / 90
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

  dom.addEventListener('click', () => {
    if (!document.pointerLockElement) {
      dom.requestPointerLock();
    }
  });
  // dom.addEventListener('mouseup', () => {

  // });
  dom.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement) {
      model.rotation.y -= event.movementX / 1000;
      // camera.position.y -= event.movementY / 40
      // if (camera.position.y < 0) {
      //   camera.position.y = 0
      // }
      // }
      // camera.rotation._x = model.rotation.x
      // camera.rotation._y = model.rotation.y
      // camera.rotation._z = model.rotation.z
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
    // const position = model.position\
    // const position = new THREE.Vector3()
    // position.x = model.position.x + 10
    // position.z = model.position.z + 20
    // position.z = model.position.z - 75 * Math.cos(model.rotation.y)
    // position.x = model.position.x - 75 * Math.sin(model.rotation.y)
    camera.lookAt(model.position)
    // console.log(model.position);

  }
  soliderMove()
  render();
}

const soliderMove = () => {
  if (keyState.KeyW) {
    setWeight(walkAction, 1)
    model.position.z -= speed * Math.cos(model.rotation.y)
    model.position.x -= speed * Math.sin(model.rotation.y)
    camera.position.z = model.position.z + 50 * Math.cos(model.rotation.y)
    camera.position.x = model.position.x + 50 * Math.sin(model.rotation.y)
    camera.position.y = model.position.y + 30
  }
  if (!keyState.KeyW && keyState.KeyA) {
    // setWeight(walkAction, 1)
    model.position.z -= speed * Math.cos(model.rotation.y + Math.PI / 4)
    model.position.x -= speed * Math.sin(model.rotation.y + Math.PI / 4)
    // model.rotation.y += Math.PI / 90
    // camera.position.z = model.position.z + 100 * Math.cos(model.rotation.y)
    // camera.position.x = model.position.x + 100 * Math.sin(model.rotation.y)
  }
  if (keyState.KeyD) {
    // model.rotation.y -= Math.PI / 90
    // camera.position.z = model.position.z + 100 * Math.cos(model.rotation.y)
    // camera.position.x = model.position.x + 100 * Math.sin(model.rotation.y)
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
    const wordPosition = new THREE.Vector3()
    model.getWorldPosition(wordPosition)
    console.log(model.position);
    console.log(wordPosition);


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
  height: 100%;
}
</style>