import * as T from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
const THREE = T
let that: loadDxfFile
export default class loadDxfFile {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private helper!: THREE.GridHelper
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls: OrbitControls
  private requestId: number
  private cube!: THREE.Mesh
  constructor(dom: HTMLElement) {
    that = this
    this.dom = dom
    this.init()
  }

  // 初始化
  async init() {
    // 第一步新建一个场景
    this.setScene();
    this.setRenderer();
    this.setCamera();
    this.setLight();
    this.setControls();
    // this.addModel();
    window.addEventListener('resize', this.onWindowResize);
    this.animate();
  }

  // 设置场景
  setScene() {
    this.scene = new THREE.Scene();
    // Grid 添加网格辅助对象
    this.helper = new THREE.GridHelper(30000, 100, 0x303030, 0x303030); //长度 划分段
    console.log(this.helper);
    
    this.helper.rotation.x = Math.PI / 2
    this.scene.add(this.helper);
    // 辅助三维坐标系
    const axesHelper = new THREE.AxesHelper(50000);
    // this.scene.add(axesHelper)
  }

  // 设置渲染器
  setRenderer() {
    //抗锯齿
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: 'highp'
    });
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.renderer.setClearColor(0x041336);
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置透视相机
  setCamera() {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(75, this.dom.offsetWidth / this.dom.offsetHeight, 1, 200000);
    this.camera.position.set(0, 0, 5000)
    console.log(this.camera.position);
    
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

  // 设置控制器
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement) //轨道控制器
    this.controls.update();
    //按键引用
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    }
    console.log(this.controls);
    
    this.controls.enableDamping = false; // 阻尼（惯性）是否启用
    // this.controls.dampingFactor = 0.05; // 阻尼系数
    this.controls.enableRotate = false; //启用或禁用摄像机水平或垂直旋转
    // this.controls.enablePan = false; //启用或禁用摄像机平移
    // this.controls.enableZoom = false; //启用或禁用摄像机的缩放
    this.controls.screenSpacePanning = true; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
    // controls.minDistance = 50; //移动最小距离
    this.controls.maxDistance = 20000; //移动最大距离
    this.controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }

  // 渲染
  render() {
    if (this.renderer && this.scene && this.camera) {
      // this.controls.getZoom()
      // console.log(this.camera.position);
      // const scale = this.camera.position.z / 5000;
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
    // if(this.cube){
    //   const position = this.cube.position.clone()
    //   this.camera.lookAt(position)
    //   this.controls.target = position
    // }
  }

  // 监听窗口变化，重新设置画布大小
  onWindowResize() {
    if (that.dom && that.dom.offsetWidth) {
      that.camera.aspect = that.dom.offsetWidth / that.dom.offsetHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(that.dom.offsetWidth, that.dom.offsetHeight);
    }
  }

  // 停止渲染
  stop() {
    cancelAnimationFrame(this.requestId)
    window.removeEventListener('resize', this.onWindowResize)
    this.renderer.forceContextLoss()
    this.renderer.dispose()
    this.scene.clear()
    this.scene = null
    this.requestId = null
    this.camera = null
    this.controls = null
    this.renderer.domElement = null
    this.renderer = null
    this.dom = null
  }

  addModel() {
    //创建一个立方体
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x666666 });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(-10, 1, 0)
    this.scene.add(this.cube)
  }
}
