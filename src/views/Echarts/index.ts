import * as THREE from "three";
import dalishi from '../../assets/dalishi.jpg'
export default function ThreeJs2(dom: Element) {
  //@ts-ignore
  let scene: THREE.Scene
  //@ts-ignore
  let camera: THREE.PerspectiveCamera
  //@ts-ignore
  let renderer: THREE.WebGLRenderer
  //@ts-ignore
  let ambientLight: THREE.AmbientLight
  //@ts-ignore
  let mesh: THREE.Mesh
   // 新建透视相机
   const setCamera = () => {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
  }
    // 设置渲染器
   const setRenderer = () => {
      renderer = new THREE.WebGLRenderer();
      // 设置画布的大小
      renderer.setSize(window.innerWidth, window.innerHeight);
      //这里 其实就是canvas 画布  renderer.domElement
      const rendererDom = renderer.domElement
      // rendererDom.style.width = '100%'
      // rendererDom.style.height = '100%'
      dom.appendChild(renderer.domElement);
    }
    // 创建网格模型
 const setCube = () => {
    if (scene) {
      const geometry = new THREE.BoxGeometry(1,1,1); //创建一个立方体几何对象Geometry
      const material2 = new THREE.MeshBasicMaterial({ color: 0xfff,transparent:true, opacity:0.8  }); //材质对象Material
      const texture = new THREE.TextureLoader().load(
        dalishi
      ); //首先，获取到纹理
      const material = [new THREE.MeshBasicMaterial({ map: texture }),new THREE.MeshBasicMaterial({ map: texture }),new THREE.MeshBasicMaterial({ map: texture }),material2,material2,material2]; //然后创建一个phong材质来处理着色，并传递给纹理映射
      mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      scene.add(mesh); //网格模型添加到场景中
      render();
    }
  }
   // 渲染
  const render = () => {
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
      // 设置画布的大小
    }
  }
    // 动画
   const animate = () => {
      if (mesh) {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
          // 设置画布的大小
      renderer.setSize(window.innerWidth, window.innerHeight);
      setCamera()
      render();
      }
    }
       // 设置环境光
  // const setLight = () => {
  //   if (scene) {
  //     ambientLight = new THREE.AmbientLight(0xffffff); // 环境光
  //     scene.add(ambientLight);
  //   }
  // }
  const init = () => {
    // 第一步新建一个场景
    scene = new THREE.Scene();
    setCamera();
    setRenderer();
    setCube();
    animate();
  }
  init()
}

