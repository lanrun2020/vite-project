import * as T from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import flagImg from '../../assets/guoqi.png'
import terrain from '../../assets/floor5.jpeg'
import {getFlowMaterial, getFlagMaterial,getScanMaterial,getFlowMaterialByY,getRotateScanMaterial } from './shaderMaterial'
const THREE = T
let that: any
export default class materialScene {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls: any
  private requestId: any
  private clock!: THREE.Clock
  private shaderMaterialList: object[] = [] //保存场景中的自定义shader材质，用于更新时间参数
  constructor(dom: HTMLElement) {
    that = this
    this.dom = dom
    this.clock = new THREE.Clock()
    this.init()
  }

  // 初始化
  async init() {
    // 创建场景、灯光、摄像机、渲染器、场景控制器等
    this.setScene();
    this.setRenderer();
    this.setCamera();
    this.setLight();
    this.setControls();

    //添加场景物体
    // this.addCubeAndPlane();
    // this.addCircle();
    // this.addCircle3();
    // this.addCylinder();
    // this.addFlag();
    this.addPlane();

    this.addBufferGeometry(); // 自定义几何缓存体

    window.addEventListener('resize', this.onWindowResize);
    this.animate();
  }

  // 设置场景
  setScene() {
    this.scene = new THREE.Scene();
    // Grid 添加网格辅助对象
    const helper = new THREE.GridHelper(100, 30, 0x303030, 0x303030); //长度1000 划分为50份
    // this.scene.add(helper);
    // 辅助三维坐标系
    const axesHelper = new THREE.AxesHelper(500);
    this.scene.add(axesHelper)
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.renderer.setClearColor(0x041336);
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置透视相机
  setCamera() {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(75, this.dom.offsetWidth / this.dom.offsetHeight, 1, 100000);
    this.camera.position.set(0, 30, 50)
  }

  // 设置光源
  setLight() {
    if (this.scene) {
      // 环境光
      const ambient = new THREE.AmbientLight(0xbbbbbb);
      this.scene.add(ambient);
      const directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(10, -50, 300);
      this.scene.add(directionalLight);
    }
  }

  // 设置控制器
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement) //轨道控制器
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
    this.shaderMaterialList.forEach((material: any) => {
      material.uniforms.time.value = this.clock.getElapsedTime()
    })
    this.controls.update()
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.render();
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
    window.removeEventListener('resize', this.onWindowResize)
    cancelAnimationFrame(this.requestId)
  }

  addCubeAndPlane() {
    //创建一个长方体
    const geometry = new THREE.BoxGeometry(50, 5, 10);
    const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, side: THREE.DoubleSide });
    const flowMaterial = getFlowMaterial() //流动材质
    this.shaderMaterialList.push(flowMaterial) //用于刷新材质的时间参数
    const cube = new THREE.Mesh(geometry, [basicMaterial, basicMaterial, flowMaterial, basicMaterial, basicMaterial, basicMaterial]);
    cube.position.set(0, 3, 0)

    const planeGeometry = new THREE.PlaneGeometry(50, 5);
    const plane = new THREE.Mesh(planeGeometry, flowMaterial)
    plane.position.set(0, 0.1, 10)
    plane.rotation.set(Math.PI / 2, 0, 0)
    this.scene.add(cube)
    this.scene.add(plane)
  }

  addFlag() {
    //旗杆
    const geometry = new THREE.CylinderGeometry(0.2, 0.2, 30, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(-30, 15, -25)
    this.scene.add(cylinder);

    //旗帜
    const flagMaterial = getFlagMaterial({url:flagImg})
    this.shaderMaterialList.push(flagMaterial)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(12, 8, 128, 128), flagMaterial)
    plane.position.set(-23.9, 25.8, -25)
    this.scene.add(plane)
  }

  addPlane() {
    const worldWidth = 200, worldDepth = 200;
    const planeGeometry = new THREE.PlaneGeometry(100, 100, worldWidth - 1, worldDepth - 1);//长宽,长宽分段
    const data = this.generateHeight(worldWidth, worldDepth);
    planeGeometry.rotateX(- Math.PI / 2);
    // const vertices = planeGeometry.attributes.position.array;
    // for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    //   vertices[ j + 1 ] = data[ i ] * 10;
    // }
    const texture = new THREE.TextureLoader().load(terrain); //首先，获取到材质贴图纹理
    const material = new THREE.MeshBasicMaterial({ map: texture });//添加到材质上
    material.side = THREE.DoubleSide
    const mesh = new THREE.Mesh(planeGeometry, material);
    mesh.position.set(0,-0.1,0)
    this.scene.add(mesh);
  }
  //获取点位高度
  generateHeight(width: number, height: number) {
    const size = width * height, data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] += 0
    }
    return data;
  }
  // 扩散扫描 圆
  addCircle() {
    const geometry = new THREE.CircleGeometry(10, 128, 0, Math.PI * 1.8); //半径，分段
    // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 ,side:THREE.DoubleSide } );
    const scanMaterial = getScanMaterial()
    this.shaderMaterialList.push(scanMaterial)
    const circle = new THREE.Mesh(geometry, scanMaterial);
    circle.position.set(-30, 0.1, -25)
    circle.rotation.x = -Math.PI / 2
    this.scene.add(circle);
  }

  // 旋转扫描 圆
  addCircle3() {
    const geometry = new THREE.CircleGeometry(10, 128,); //半径，分段
    const scanMaterial4 = getRotateScanMaterial()
    this.shaderMaterialList.push(scanMaterial4)
    const circle = new THREE.Mesh(geometry, scanMaterial4);
    circle.position.set(30, 0.1, -25)
    circle.rotation.x = -Math.PI / 2
    this.scene.add(circle);
  }

  // 圆柱
  addCylinder() {
    //圆柱
    const geometry = new THREE.CylinderGeometry(2, 2, 16, 32, 1, true);//true上下底面不封闭
    const flowMaterial = getFlowMaterialByY({height:16,thickness:0.3}) //沿Y轴的流动材质
    const cylinder = new THREE.Mesh(geometry, flowMaterial);
    this.shaderMaterialList.push(flowMaterial)
    cylinder.position.set(0, 8.1, -20)
    this.scene.add(cylinder);

    //圆锥
    const geometry2 = new THREE.CylinderGeometry(4, 0, 8, 32, 1, true);
    const flowMaterial2 = getFlowMaterialByY({height:8}) //沿Y轴的流动材质
    const cylinder2 = new THREE.Mesh(geometry2, flowMaterial2);
    this.shaderMaterialList.push(flowMaterial2)
    cylinder2.position.set(8, 4.2, -20)
    this.scene.add(cylinder2);

  }

  addBufferGeometry() {
    const geometry = new THREE.BufferGeometry() //创建一个Buffer类型几何体对象
    const geometry2 = new THREE.BoxGeometry(3,3,3)
    console.log(geometry2);
    //类型数组创建顶点数据
    const vertices = new Float32Array([
      0, 0, 0, //顶点1坐标
      10, 0, 0, //顶点2坐标
      10, 10, 0, //顶点3坐标
      0, 0, 0, //顶点1坐标
      10, 10, 0, //顶点3坐标
      0, 10, 0, //顶点4坐标
      0, 0, 0, //顶点1坐标
      0, 0, 10, //顶点3坐标
      0, 10, 10, //顶点4坐标
      0, 0, 0, //顶点1坐标
      0, 10, 10, //顶点3坐标
      0, 10, 0 //顶点4坐标
    ]);
    // 创建属性缓冲区对象
    const attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
    // 设置几何体attributes属性的位置属性
    geometry.attributes.position = attribue;
    // 三角面(网格)渲染模式
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff, //三角面颜色
      side: THREE.DoubleSide //两面可见
    }); //材质对象
    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    this.scene.add(mesh)
  }
}
