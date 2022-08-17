import * as T from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import dalishi from '../../assets/dalishi.jpg'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const THREE = T
let keyStates: any
let idleAction: any, runAction: any, walkAction: any
// const keyStates = (object: { [key: string]: unknown }) => {
// }
let that: any
let mixer: any
export default class ThreeJs2 {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private cubeCamera!: THREE.CubeCamera
  private renderer!: THREE.WebGLRenderer
  private controls: any
  private requestId: any
  private clock!: THREE.Clock

  constructor(dom: HTMLElement) {
    that = this
    this.dom = dom
    this.init()
  }
  // 设置透视相机
  setCamera () {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.dom.offsetWidth / this.dom.offsetHeight,
      0.1,
      1000
    );
    this.camera.position.z = 75;
  }

  // 设置渲染器
  setRenderer () {
    this.renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置控制器
  setControls () {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement) //轨道控制器
    this.controls.update();
    this.controls.enableDamping = true; // 阻尼（惯性）是否启用
    this.controls.dampingFactor = 0.05; // 阻尼系数
    this.controls.screenSpacePanning = false; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
    // controls.minDistance = 50; //移动最小距离
    this.controls.maxDistance = 1500; //移动最大距离
    this.controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }
  // 创建网格模型
  setCube () {
    if (this.scene) {
      const geometry = new THREE.BoxGeometry(20, 20, 20); //创建一个立方体几何对象Geometry
      // const material2 = new THREE.MeshBasicMaterial({ color: 0xfff, transparent: true, opacity: 0.8 }); //材质对象Material
      const texture = new THREE.TextureLoader().load(
        dalishi
      ); //首先，获取到纹理
      const material1 = new THREE.MeshBasicMaterial({ map: texture })//side 镜像翻转
      const material = [material1, material1, material1, material1, material1, material1]; //然后创建一个phong材质来处理着色，并传递给纹理映射
      const cube1 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      cube1.position.set(40, 0, 0)
      this.scene.add(cube1); //网格模型添加到场景中

      const material2 = new THREE.MeshStandardMaterial({
        roughness: 0.01,//粗糙度 0平滑镜面反射  1完全漫反射
        metalness: 1 //金属度 非金属0 金属1
      });

      const cube2 = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15), material2);
      cube2.position.set(-40, 0, 0)
      this.scene.add(cube2);
    }
  }

  setSphere () {
    if (this.scene) {
      const sphereMaterial = new THREE.MeshLambertMaterial({ //MeshLambertMaterial  漫反射效果
        color: 0x0000ff,
        opacity: 0.3,
        transparent: true
      });//材质对象
      const sphereMaterial2 = new THREE.MeshPhongMaterial({  //MeshPhongMaterial   镜面反射，高光效果
        color: 0x0000ff,
        specular: 0x4488ee,
        shininess: 12
      });//材质对象
      const sphereMaterial3 = new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30, flatShading: true })
      // 球体网格模型
      const geometry = new THREE.SphereGeometry(10, 60, 60); //球半径，后面两个参数经纬度细分数，控制球表面精度
      const mesh = new THREE.Mesh(geometry, sphereMaterial3); //网格模型对象Mesh
      mesh.translateY(90); //球体网格模型沿Y轴正方向平移120
      this.scene.add(mesh);

      const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
      cubeRenderTarget.texture.type = THREE.HalfFloatType;
      this.cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
      const material3 = new THREE.MeshStandardMaterial({ //网格标准材质
        envMap: cubeRenderTarget.texture,
        roughness: 0.01,
        metalness: 1
      });
      const sphere2 = new THREE.Mesh(new THREE.IcosahedronGeometry(15, 15), material3); //20面几何体 (半径，精细度)，精细度大于0时，将添加更多的顶点
      sphere2.position.set(0, 0, 0)
      this.scene.add(sphere2);

      // const textureLoader = new THREE.TextureLoader();
      // let textureEquirec = textureLoader.load('textures/2294472375_24a3b8ef46_o.jpg');
      // textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
      // textureEquirec.encoding = THREE.sRGBEncoding;
      const geometry5 = new THREE.IcosahedronGeometry(400, 15);
      const sphereMaterial5 = new THREE.MeshStandardMaterial({
        // color: 0x000000,
        opacity: 0.1,
        transparent: true,
        roughness: 0,
        metalness: 1
      });
      const sphereMesh = new THREE.Mesh(geometry, sphereMaterial5);
      sphereMesh.position.set(0, 0, 30)
      this.scene.add(sphereMesh);
    }
  }

  // 渲染
  render () {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // 动画
  animate () {
    this.requestId = requestAnimationFrame(() => this.animate());
    this.cubeCamera.update(this.renderer, this.scene);
    this.controls.update()
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    const mixerUpdateDelta = this.clock.getDelta();
    if (mixer) {
      mixer.update(mixerUpdateDelta);
    }
    // if ()
    // if (keyStates['KeyW']) {
    // that.setWeight(idleAction, )
    // that.setWeight(walkAction, 0)
    // }
    this.render();
  }
  // 设置光源
  setLight () {
    if (this.scene) {
      // 环境光
      // var ambient = new THREE.AmbientLight(0xffffff);
      // scene.add(ambient);

      // 点光源
      const point = new THREE.PointLight(0xffffff);
      point.position.set(100, 100, 100); //点光源位置
      // 通过add方法插入场景中，不插入的话，渲染的时候不会获取光源的信息进行光照计算
      this.scene.add(point); //点光源添加到场景中
      this.scene.add(new THREE.AmbientLight(0x111111));

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.125); //方向光

      directionalLight.position.set(1, 1, 1)
      directionalLight.position.normalize();
      this.scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(300, 300, 300);
      this.scene.add(pointLight);

      pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })));
    }
  }

  // 监听窗口变化，重新设置画布大小
  onWindowResize () {
    if (that.dom && that.dom.offsetWidth) {
      that.camera.aspect = that.dom.offsetWidth / that.dom.offsetHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(that.dom.offsetWidth, that.dom.offsetHeight);
    }
  }

  setScene () {
    this.scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xcccccc); //背景颜色
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002); //雾效果

    // Grid 添加网格辅助对象
    const helper = new THREE.GridHelper(1000, 50, 0x303030, 0x303030); //长度1000 划分为50份
    helper.position.y = -50;
    this.scene.add(helper);

    const rgbeLoader = new RGBELoader();
    //资源较大，使用异步加载
    rgbeLoader.loadAsync(`/model/air3.hdr`).then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      //将加载的材质texture设置给背景和环境
      this.scene.background = texture;
      this.scene.environment = texture;
    });
  }

  addSolider () {
    const loader = new GLTFLoader();
    loader.load(`/model/Soldier.glb`, function (gltf) {
      const model = gltf.scene;
      model.scale.set(12, 12, 12)
      model.position.set(0, 0, 40)
      that.scene.add(model);
      model.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = false;
      });
      const animations = gltf.animations;
      mixer = new THREE.AnimationMixer(model);
      idleAction = mixer.clipAction(animations[0]);
      walkAction = mixer.clipAction(animations[3]);
      runAction = mixer.clipAction(animations[1]);

      that.setWeight(idleAction, 1)
      that.setWeight(runAction, 0)
      that.setWeight(walkAction, 0)
    });
  }
  setWeight (action: any, weight: number) {

    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
    action.play()

  }
  // 停止渲染
  stop () {
    window.removeEventListener('resize', this.onWindowResize)
    cancelAnimationFrame(this.requestId)
  }
  // 开始渲染
  // start() {
  //   this.animate();
  // }
  // 初始化
  init () {
    // 第一步新建一个场景
    this.setScene();
    keyStates = {}
    this.clock = new THREE.Clock();
    document.addEventListener('keydown', (event) => {
      // keyStates[event.code] = true;
      if (event.code === 'KeyW') {
        that.setWeight(runAction, 1)
      }
    });
    document.addEventListener('keyup', (event) => {
      // keyStates[event.code] = false;
      if (event.code === 'KeyW') {
        that.setWeight(runAction, 0)
      }
    });
    this.setRenderer();
    this.setCamera();
    this.setLight();
    this.setControls();
    this.setCube();
    this.setSphere();
    this.addSolider()
    window.addEventListener('resize', this.onWindowResize);
    this.animate();
  }
}
