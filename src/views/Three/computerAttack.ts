import { mode } from "cesium";
import * as T from "three";
import { BufferAttribute } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const THREE = T
let that: any
export default class computerAttack {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private raycaster
  private beIntersectObject = []
  private transformControls: any
  private model: any
  private controls: any
  private requestId: any
  constructor(dom: HTMLElement) {
    that = this
    this.dom = dom
    this.init()
    this.raycaster = new THREE.Raycaster() //光线投射 光线投射用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）。
  }
  // 设置透视相机
  setCamera() {
    this.camera = new THREE.PerspectiveCamera(50, this.dom.offsetWidth / this.dom.offsetHeight, 0.1, 4000);
    this.camera.position.set(0, 1, 4); //(x,y,z)
    this.scene.add(this.camera);
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    // this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor(0x041336);
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置控制器
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement) //轨道控制器
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    this.controls.update();
    this.controls.enableDamping = true; // 阻尼（惯性）是否启用
    this.controls.dampingFactor = 0.05; // 阻尼系数
    this.controls.screenSpacePanning = false; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
    // controls.minDistance = 50; //移动最小距离
    this.controls.maxDistance = 1500; //移动最大距离
    this.controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }

  // 渲染
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // 动画
  animate() {
    this.requestId = requestAnimationFrame(() => this.animate());
    this.controls.update()
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.render();
  }

  // 设置光源
  setLight() {
    if (this.scene) {
      // 环境光
      const ambient = new THREE.AmbientLight(0xbbbbbb);
      this.scene.add(ambient);
      const directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(10, -50, 300);
      this.scene.add(directionalLight);
    }
  }

  // 监听窗口变化，重新设置画布大小
  onWindowResize() {
    if (that.dom && that.dom.offsetWidth) {
      that.camera.aspect = that.dom.offsetWidth / that.dom.offsetHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(that.dom.offsetWidth, that.dom.offsetHeight);
    }
  }

  setScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x999999);
    this.scene.add(new THREE.AmbientLight(0x999999));
    // Grid 添加网格辅助对象
    const helper = new THREE.GridHelper(100, 50, 0x303030, 0x303030); //长度1000 划分为50份
    this.scene.add(helper);

    const axesHelper = new THREE.AxesHelper(500); //辅助三维坐标系
    this.scene.add(axesHelper)
  }

  addModel() {
    const loader = new GLTFLoader();
    loader.load(`/model/computer.glb`, function (gltf: any) {
      const model = gltf.scene;
      // that.beIntersectObject.push(gltf.scene)
      model.scale.set(1, 1, 1)
      model.position.set(0, 0, 0)
      // that.scene.add(model);
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
          const mc = model.clone()
          mc.translateX(i * 1.5)
          mc.translateZ(j * 2)
          that.scene.add(mc)
        }
      }

      // that.model.traverse(function (object: any) {
      //   if (object.isMesh) object.castShadow = false;
      // });
    });
  }

  addLine() {
    const pointArr = new Float32Array([
      0, 0, 0,
      5, 5, 5,
    ])
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(pointArr, 3))
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#ff0000', side: THREE.DoubleSide })
    const line = new THREE.Line(geometry, lineMaterial)
    this.scene.add(line)
  }

  // 停止渲染
  stop() {
    cancelAnimationFrame(this.requestId)
    this.dom.addEventListener('mousemove', this.handleMousemove)
  }

  handleMousemove(event: any) {
    event.preventDefault();
    const mouse = new THREE.Vector2(0, 0);
    mouse.x = ((event.clientX - that.dom.offsetLeft) / that.dom.offsetWidth) * 2 - 1;
    mouse.y = - ((event.clientY - that.dom.offsetTop) / that.dom.offsetHeight) * 2 + 1;
    that.raycaster.setFromCamera(mouse, that.camera);
    // const intersects = that.raycaster.intersectObjects(that.beIntersectObject);
    // if (that.previousObj) {
    //   that.previousObj.material[0].color = new THREE.Color(that.bgColor);
    //   that.previousObj.scale.set(1, 1, 1)
    // }
    // if (intersects[0] && intersects[0].object) {
    //   intersects[0].object.material[0].color = new THREE.Color(0xffaa00);
    //   that.previousObj = intersects[0].object; //previousObj保存悬浮的对象，鼠标移开后恢复颜色。
    //   that.previousObj.scale.set(1, 1, 1.5)
    // }
  }

  // 初始化
  async init() {
    // 第一步新建一个场景
    this.setScene();
    this.setRenderer();
    this.setCamera();
    this.setLight();
    this.setControls();
    this.addModel();
    this.addLine();
    this.animate();
    window.addEventListener('resize', this.onWindowResize);
    this.dom.addEventListener('mousemove', this.handleMousemove, false)
  }
}
