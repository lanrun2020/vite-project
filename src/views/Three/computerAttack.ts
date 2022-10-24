import * as T from "three";
import floorImg from '../../assets/dalishi.jpg'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import {
  CSS2DRenderer,
  CSS2DObject
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { InitFlyLine } from "@/utils/flyLine";
import pointPng from '@/assets/point.png';
const THREE = T
let that: any
export default class computerAttack {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private raycaster
  private group = new THREE.Group()
  private labelRenderer: any
  private beIntersectObject = []
  private transformControls: any
  private model: any
  private controls: any
  private requestId: any
  private flyManager: InitFlyLine
  constructor(dom: HTMLElement) {
    that = this
    this.dom = dom
    this.flyManager = new InitFlyLine({
      texture: pointPng,
    })
    this.raycaster = new THREE.Raycaster() //光线投射 光线投射用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）。
    this.init()
  }
  // 设置透视相机
  setCamera() {
    this.camera = new THREE.PerspectiveCamera(50, this.dom.offsetWidth / this.dom.offsetHeight, 0.1, 4000);
    this.camera.position.set(0, 18, 32); //(x,y,z)
    this.scene.add(this.camera);
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    // this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor(0x041336);
    this.labelRenderer = new CSS2DRenderer(); //新建CSS2DRenderer
    this.labelRenderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.dom.appendChild(this.labelRenderer.domElement);

    // 将呈现器的输出添加到HTML元素
    this.dom.appendChild(this.renderer.domElement);
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置控制器
  setControls() {
    this.controls = new OrbitControls(this.camera, this.labelRenderer.domElement) //轨道控制器
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    this.controls.update();
    this.controls.enableDamping = true; // 阻尼（惯性）是否启用
    this.controls.dampingFactor = 0.05; // 阻尼系数
    this.controls.screenSpacePanning = false; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
    this.controls.minDistance = 5; //移动最小距离
    this.controls.maxDistance = 400; //移动最大距离
    this.controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }

  // 渲染
  render() {
    if (this.renderer && this.labelRenderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
    }
  }

  // 动画
  animate() {
    this.requestId = requestAnimationFrame(() => this.animate());
    this.controls.update()
    // 设置画布的大小
    this.flyManager.animation()

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
      that.labelRenderer.setSize(that.dom.offsetWidth, that.dom.offsetHeight);
    }
  }

  setScene() {
    this.scene = new THREE.Scene();
    // Grid 添加网格辅助对象
    // const helper = new THREE.GridHelper(100, 50, 0x303030, 0x303030); //长度1000 划分为50份
    // this.scene.add(helper);
    const axesHelper = new THREE.AxesHelper(500); //辅助三维坐标系
    // this.scene.add(axesHelper)

    // const rgbeLoader = new RGBELoader();
    // //资源较大，使用异步加载
    // rgbeLoader.loadAsync(`/model/home.hdr`).then((texture) => {
    //   texture.mapping = THREE.EquirectangularReflectionMapping;
    //   //将加载的材质texture设置给背景和环境
    //   this.scene.background = texture;
    //   this.scene.environment = texture;
    // });
  }

  addModel() {
    const loader = new GLTFLoader();
    loader.load(`/model/class6.glb`, function (gltf: any) {
      const model = gltf.scene;
      // model.scale.set(1, 1, 1)
      model.position.set(-20, 0, -19.2)
      let start = 1
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const mc = model.clone()
          mc.translateX(i * 10)
          mc.translateZ(j * 10)
          that.addLabel(mc, 'IP:192.168.2.' + start++)
          that.group.add(mc)
        }
      }
      that.scene.add(that.group)
    });
  }

  addLabel(object: THREE.Mesh, text: string) {
    const div = document.createElement("div");
    div.className = "computer-box-label";
    div.textContent = text;
    const earthLabel = new CSS2DObject(div);
    earthLabel.position.set(-1.5, 3, -0.5);
    object.add(earthLabel);
  }

  addFlyline() {
    // 平滑曲线
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-20, 2, -20),
      new THREE.Vector3(-10, 10, -10),
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(10, 10, 10),
      new THREE.Vector3(20, 2, 20),
      new THREE.Vector3(0, 10, 20),
      new THREE.Vector3(-20, 2, 20)
    ]);
    // curve.getPoints(pointCount);
    const allPoints = curve.getPoints(2500);
    //制作飞线动画
    const flyMesh = this.flyManager.addFly({
      curve: allPoints, //飞线飞线其实是N个点构成的
      color: "rgba(255,255,255,1)", //点的颜色
      width: 0.1, //点的半径
      length: 1250, //飞线的长度（点的个数）
      speed: 15, //飞线的速度
      repeat: Infinity, //循环次数
    });
    this.scene.add(flyMesh);
  }

  addFlyline2() {
    // 平滑曲线
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-20, 2, -20),
      new THREE.Vector3(-20, 10, 0),
      new THREE.Vector3(-20, 2, 20)
    ]);
    // curve.getPoints(pointCount);
    const allPoints = curve.getPoints(2500);
    //制作飞线动画
    const flyMesh = this.flyManager.addFly({
      curve: allPoints, //飞线飞线其实是N个点构成的
      color: "rgba(255,255,255,1)", //点的颜色
      width: 0.1, //点的半径
      length: 1250, //飞线的长度（点的个数）
      speed: 15, //飞线的速度
      repeat: Infinity, //循环次数
    });
    this.scene.add(flyMesh);
  }

  addLine() {
    // 三维2次贝赛尔曲线
    // const curve2 = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-20, 2, -20),
    //   new THREE.Vector3(0, 20, 0),
    //   new THREE.Vector3(20, 2, 20)
    // );
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-20, 2, -20),
      new THREE.Vector3(-10, 10, -10),
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(10, 10, 10),
      new THREE.Vector3(20, 2, 20),
      new THREE.Vector3(0, 10, 20),
      new THREE.Vector3(-20, 2, 20)
    ]);
    //getPoints是基类Curve的方法，返回一个vector3对象作为元素组成的数组
    const points = curve.getPoints(100); //分段数100，返回101个顶点
    const geometry = new THREE.BufferGeometry()
    // geometry.setAttribute('position', new BufferAttribute(pointArr, 3))
    geometry.setFromPoints(points);
    const material2 = new THREE.LineBasicMaterial({
      color: 'rgb(27, 180, 176)',
      lineWidth: 10,
      transparent: true,
      opacity: 1
    })
    // const lineMaterial = new THREE.LineBasicMaterial({ color: '#ff0000', side: THREE.DoubleSide })
    const line = new THREE.Line(geometry, material2)
    this.scene.add(line)
  }

  // 创建地板
  setFloor() {
    if (this.scene) {
      const geometry = new THREE.BoxGeometry(50, 0.2, 50); //创建一个立方体几何对象Geometry
      const texture = new THREE.TextureLoader().load(
        floorImg
      ); //首先，获取到纹理
      // 设置阵列模式
      texture.wrapS = THREE.repeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // uv两个方向纹理重复数量
      texture.repeat.set(6, 6);
      // 偏移效果
      // texture.offset = new THREE.Vector2(0.5, 0.5)
      const material1 = new THREE.MeshBasicMaterial({ map: texture })//side 镜像翻转
      const material = [material1, material1, material1, material1, material1, material1]; //然后创建一个phong材质来处理着色，并传递给纹理映射
      const cube1 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      // cube1.material.map.repeat.set(20,20)
      cube1.position.set(0, 0, 0)
      this.scene.add(cube1); //网格模型添加到场景中
    }
  }

  // 停止渲染
  stop() {
    cancelAnimationFrame(this.requestId)
    window.removeEventListener('resize', this.onWindowResize);
    this.dom.removeEventListener('mousemove', this.handleMousemove)
    this.dom.removeEventListener('click', this.handleMouseDown);
  }

  handleMousemove(event: any) {
    event.preventDefault();
    const mouse = new THREE.Vector2(0, 0);
    mouse.x = ((event.clientX - that.dom.offsetLeft) / that.dom.offsetWidth) * 2 - 1;
    mouse.y = - ((event.clientY - that.dom.offsetTop) / that.dom.offsetHeight) * 2 + 1;
    that.raycaster.setFromCamera(mouse, that.camera);
  }

  handleMouseDown(event: any) {
    let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector = vector.unproject(that.camera); // 将屏幕的坐标转换成三维场景中的坐标
    that.raycaster = new THREE.Raycaster(that.camera.position, vector.sub(that.camera.position).normalize());
    const intersects = that.raycaster.intersectObjects(that.group.children);
    if (intersects.length > 0) {
      // intersects[0].object.material = material2
    }
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
    this.addFlyline();
    this.addFlyline2();
    this.setFloor();
    this.animate();
    window.addEventListener('resize', this.onWindowResize);
    this.dom.addEventListener('mousemove', this.handleMousemove, false)
    this.dom.addEventListener('click', this.handleMouseDown, false);
  }
}
