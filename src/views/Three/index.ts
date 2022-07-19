import * as T from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const THREE = T
import dalishi from '../../assets/dalishi.jpg'
export default function ThreeJs2(dom: any) {
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let mesh: THREE.Mesh
  let controls: any
  // 设置透视相机
  const setCamera = () => {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    camera = new THREE.PerspectiveCamera(
      75,
      dom.offsetWidth / dom.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
  }

  // 设置渲染器
  const setRenderer = () => {
    renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    renderer.setSize(dom.offsetWidth, dom.offsetHeight);
    dom.appendChild(renderer.domElement);
  }

  // 设置控制器
  const setControls = () => {
    controls = new OrbitControls(camera, renderer.domElement) //控制器
    controls.update();
    controls.enableDamping = true; // 阻尼（惯性）是否启用
    controls.dampingFactor = 0.05; // 阻尼系数
    controls.screenSpacePanning = false; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
    controls.minDistance = 100; //移动最小距离
    controls.maxDistance = 500; //移动最大距离
    controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }
  // 创建网格模型
  const setCube = () => {
    if (scene) {
      const geometry = new THREE.BoxGeometry(20, 20, 20); //创建一个立方体几何对象Geometry
      // const material2 = new THREE.MeshBasicMaterial({ color: 0xfff, transparent: true, opacity: 0.8 }); //材质对象Material
      const texture = new THREE.TextureLoader().load(
        dalishi
      ); //首先，获取到纹理
      const material1 = new THREE.MeshBasicMaterial({ map: texture })//side 镜像翻转
      const material = [material1, material1, material1, material1, material1, material1]; //然后创建一个phong材质来处理着色，并传递给纹理映射
      mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      scene.add(mesh); //网格模型添加到场景中

      const material2 = new THREE.MeshStandardMaterial({
        roughness: 0.01,//粗糙度 0平滑镜面反射  1完全漫反射
        metalness: 1 //金属度 非金属0 金属1
      });

      let cube = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15), material2);
      cube.position.set(-40, 0, 0)
      scene.add(cube);
    }
  }

  const setSphere = () => {
    if (scene) {

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
      let geometry = new THREE.SphereGeometry(10, 60, 60); //球半径，后面两个参数经纬度细分数，控制球表面精度
      let mesh = new THREE.Mesh(geometry, sphereMaterial3); //网格模型对象Mesh
      mesh.translateY(40); //球体网格模型沿Y轴正方向平移120
      scene.add(mesh);

      let cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
      cubeRenderTarget.texture.type = THREE.HalfFloatType;
      let material3 = new THREE.MeshStandardMaterial({
        // envMap: cubeRenderTarget.texture,
        roughness: 0.05,
        metalness: 1
      });
      let sphere2 = new THREE.Mesh(new THREE.IcosahedronGeometry(15, 15), material3); //20面几何体 (半径，精细度)，精细度大于0时，将添加更多的顶点
      sphere2.position.set(-80, 0, 0)
      scene.add(sphere2);
    }
  }

  // 渲染
  const render = () => {
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // 动画
  const animate = () => {
    if (mesh) {
      requestAnimationFrame(animate);
      controls.update()
      // 设置画布的大小
      renderer.setSize(dom.offsetWidth, dom.offsetHeight);
      render();
    }
  }

  // 设置光源
  const setLight = () => {
    if (scene) {

      // 环境光
      // var ambient = new THREE.AmbientLight(0xffffff);
      // scene.add(ambient);

      // 点光源
      var point = new THREE.PointLight(0xffffff);
      point.position.set(100, 100, 100); //点光源位置
      // 通过add方法插入场景中，不插入的话，渲染的时候不会获取光源的信息进行光照计算
      scene.add(point); //点光源添加到场景中
      scene.add(new THREE.AmbientLight(0x111111));

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.125); //方向光

      directionalLight.position.set(1, 1, 1)
      directionalLight.position.normalize();
      scene.add(directionalLight);

      let pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(300, 300, 300);
      scene.add(pointLight);


      pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })));
    }
  }

  // 监听窗口变化，重新设置画布大小
  const onWindowResize = () => {
    camera.aspect = dom.offsetWidth / dom.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dom.offsetWidth, dom.offsetHeight);
  }

  const setScene = () => {
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xcccccc); //背景颜色
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002); //雾效果

    // Grid 添加网格
    const helper = new THREE.GridHelper(1000, 50, 0x303030, 0x303030); //长度1000 划分为50份
    helper.position.y = -50;
    scene.add(helper);


    const rgbeLoader = new RGBELoader();
    //资源较大，使用异步加载
    rgbeLoader.loadAsync(`/model/air3.hdr`).then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      //将加载的材质texture设置给背景和环境
      scene.background = texture;
      scene.environment = texture;
    });

  }
  // 初始化
  const init = () => {
    // 第一步新建一个场景
    setScene();
    setRenderer();
    setCamera();
    setLight();
    setControls();
    setCube();
    setSphere();
    window.addEventListener('resize', onWindowResize);
    animate();
  }
  init()
}

