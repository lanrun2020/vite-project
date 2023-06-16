import * as T from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import flagImg from '../../assets/guoqi.png'
import terrain from '../../assets/floor5.jpeg'
import cloud from '../../assets/cloud.png'
import lavatile from '../../assets/lavatile.jpg'
import { getFlowMaterial, getTestMaterial, getSunMaterial, getFlagMaterial, getSeaMaterial, getWaterMaterial, getScanMaterial, getFlowMaterialByY, getRotateScanMaterial, getRotateMaterialByY, getRotateMaterialByY2, getRotateMaterialByY3, getUpDownRotateMaterial } from './shaderMaterial'
const THREE = T
let that: materialScene
export default class materialScene {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls: OrbitControls
  private requestId: number
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
    this.addCubeAndPlane();
    // this.addShaderTorus()
    // this.addCircle();
    // this.addCircle3();
    // this.addCylinder();
    // this.addFlag();
    // this.addTextPlane();
    // this.addPlane();
    // this.addRotationCylinder()
    // this.addBufferGeometry(); // 自定义几何缓存体
    // this.addWater();
    // this.addSea();
    this.addPoints()

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
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
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
    this.controls.maxDistance = 2500; //移动最大距离
    // this.controls.maxPolarAngle = Math.PI / 2.5; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
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
    this.shaderMaterialList.forEach((material: THREE.ShaderMaterial) => {
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

     //创建一个长方体2
     const geometry2 = new THREE.BoxGeometry(10, 10, 10);
     const testMaterial = getTestMaterial() //流动材质
     this.shaderMaterialList.push(testMaterial) //用于刷新材质的时间参数
     const cube2 = new THREE.Mesh(geometry2, testMaterial);
     cube2.position.set(0, 0, 0)

     //创建一个球体
     const geometry3 = new THREE.SphereGeometry(10, 32, 32);
     const Sphere = new THREE.Mesh(geometry3, testMaterial);
     Sphere.position.set(0, 40, 0)
    // this.scene.add(cube)
    // this.scene.add(plane)
    this.scene.add(cube2)
    this.scene.add(Sphere)
  }

  addShaderTorus() {
    const SunMaterial = getSunMaterial({url1:cloud, url2:lavatile}) //流动材质
    this.shaderMaterialList.push(SunMaterial) //用于刷新材质的时间参数
    SunMaterial.uniforms[ 'texture1' ].value.wrapS = SunMaterial.uniforms[ 'texture1' ].value.wrapT = THREE.RepeatWrapping;
    SunMaterial.uniforms[ 'texture2' ].value.wrapS = SunMaterial.uniforms[ 'texture2' ].value.wrapT = THREE.RepeatWrapping;
    /*
    THREE.RepeatWrapping 是 three.js 中 TextureLoader 类的 wrapS 和 wrapT 属性的一种取值，用于设置纹理在超出其纹理坐标范围时如何包装。
    THREE.RepeatWrapping 表示当纹理坐标超出 [0,1] 范围时，纹理会被无缝重复平铺以填充超出部分。
    例如，如果将 repeat 属性设置为 (2, 2)，则每个纹理图像都会沿着 u 轴和 v 轴方向重复两次。
    这种包装方式通常用于创建具有连续性和规律性的纹理，例如地板、墙壁等表面。在创建这些表面时，
    我们可以使用 THREE.RepeatWrapping 设置纹理的重复次数，并通过调整 offset 属性来控制纹理在表面上的起始位置
    在 three.js 中，除了 THREE.RepeatWrapping 之外，还有以下两个与纹理包装（wrapping）相关的常量：
    THREE.ClampToEdgeWrapping：这是 TextureLoader 类中 wrapS 和 wrapT 属性的默认值。
    它表示当纹理坐标超出 [0,1] 范围时，超出部分会被截断并拉伸到边缘。这种包装方式通常用于避免出现纹理重复和无缝平铺而导致的边缘问题。
    THREE.MirroredRepeatWrapping：这种包装方式与 THREE.RepeatWrapping 类似，不同的是它会使用镜像翻转来填充超出范围的部分。
    例如，如果将 repeat 属性设置为 (2, 2)，则每个纹理图像都会沿着 u 轴和 v 轴方向重复两次，并且每个重复的纹理图像会被镜像翻转以填充超出部分。
    这些包装方式可以通过设置 TextureLoader 类的相应属性（wrapS、wrapT、repeat 和 offset）来进行配置，从而控制纹理在表面上的映射方式
    */
    const mesh = new THREE.Mesh( new THREE.TorusGeometry( 0.65, 0.3, 30, 30 ), SunMaterial );
    mesh.rotation.x = 0.3;
    mesh.rotation.y = 350;
    this.scene.add( mesh );
  }

  addTextPlane() {
    //创建一个长方体
    const geometry = new THREE.BoxGeometry(14, 4, 0.1);
    // const geometry = new THREE.CylinderGeometry(7.2, 7.2, 10, 32, 1, true);//true上下底面不封闭
    const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, side: THREE.DoubleSide });
    // const flowMaterial = getFlowMaterial() //流动材质
    // this.shaderMaterialList.push(flowMaterial) //用于刷新材质的时间参数
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const c = canvas.getContext('2d')!;
    c.fillStyle = 'rgba(0,0,0,0.0)';
    c.fillRect(0, 0, 512, 128);
    // 文字
    c.beginPath();
    c.translate(256, 64);
    c.fillStyle = "#00ffff"; //文本填充颜色
    c.font = "bold 36px 宋体"; //字体样式设置
    c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText("起点", 0, 0);

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.wrapS = THREE.RepeatWrapping;
    const tubeShader = {
      vertexshader: `
      varying vec3 vp;
      varying vec2 vUv;
      uniform float time;
      uniform float repeat;
      void main() {
        vp = position;
        vUv = uv;
        float dis = vUv.x;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix  * modelPosition;
      }
          `,
      fragmentshader: `
      varying vec2 vUv;
      uniform sampler2D u_map;
      uniform float u_opacity;
      uniform float time;
      uniform vec3 color;
      void main() {
          vec2 vUv2 = vUv;
          // vUv2.x = fract(vUv.x + time * 0.3);
          gl_FragColor = texture2D(u_map, vUv2) + vec4(color, u_opacity * 0.2);;
      }`
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x000000),
          type: "v3"
        },
        time: {
          value: 1,
          type: "f"
        },
        repeat: { //周期
          value: 1.5,
          type: "f"
        },
        u_opacity: {
          value: 0.0,
          type: "f"
        },
        u_map: {
          value: canvasTexture,
          type: "t2"
        }
      },
      // side: THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
      transparent: true,// 是否透明
      vertexShader: tubeShader.vertexshader, // 顶点着色器
      fragmentShader: tubeShader.fragmentshader // 片元着色器
    })
    this.shaderMaterialList.push(material)
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 12, 0)
    this.scene.add(cube)
  }

  addFlag() {
    //旗杆
    const geometry = new THREE.CylinderGeometry(0.2, 0.2, 30, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(-30, 15, -25)
    this.scene.add(cylinder);

    //旗帜
    const flagMaterial = getFlagMaterial({ url: flagImg })
    this.shaderMaterialList.push(flagMaterial)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(12, 8, 128, 128), flagMaterial)
    plane.position.set(-23.9, 25.8, -25)
    this.scene.add(plane)
  }

  addSea() {
    //旗帜
    const flagMaterial = getSeaMaterial()
    this.shaderMaterialList.push(flagMaterial)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 128, 128), flagMaterial)
    plane.position.set(0, 0, 0)
    plane.rotateX(- Math.PI / 2)
    this.scene.add(plane)
  }

  addWater() {
    //旗帜
    const flagMaterial = getWaterMaterial()
    this.shaderMaterialList.push(flagMaterial)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 1, 1), flagMaterial)
    plane.position.set(0, 0, 0)
    plane.rotateX(-Math.PI / 2)
    this.scene.add(plane)
    /* 监听鼠标移动，并改变着色器使用的 iMouse 参数 */
    // let mouseStartPosition = null; // 鼠标起始位置
    // window.addEventListener("mousemove", function (event) {
    //     if (!mouseStartPosition) {
    //         mouseStartPosition = {x: event.clientX, y: event.clientY}
    //     } else {
    //       flagMaterial.uniforms.iMouse.value.x = event.clientX - mouseStartPosition.x;
    //       flagMaterial.uniforms.iMouse.value.y = event.clientY - mouseStartPosition.y;
    //     }
    // })
  }

  addPoints() {
    const geometry = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0
    ]);
    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    // const material = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } );
    const material = new THREE.PointsMaterial({ size: 0.1, color: 0x888888 });
    const mesh = new THREE.Points(geometry, material);
    this.scene.add(mesh)
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
    mesh.position.set(0, -0.1, 0)
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
    const geometry = new THREE.CylinderGeometry(2, 2, 10, 32, 1, true);//true上下底面不封闭
    const flowMaterial = getFlowMaterialByY({ height: 10, thickness: 0.1, speed: 0.3, repeat: 16 }) //沿Y轴的流动材质
    const cylinder = new THREE.Mesh(geometry, flowMaterial);
    this.shaderMaterialList.push(flowMaterial)
    cylinder.position.set(0, 8.1, -20)
    this.scene.add(cylinder);

    //圆锥
    const geometry2 = new THREE.CylinderGeometry(4, 0, 8, 32, 1, true);
    const flowMaterial2 = getFlowMaterialByY({ height: 8 }) //沿Y轴的流动材质
    const cylinder2 = new THREE.Mesh(geometry2, flowMaterial2);
    this.shaderMaterialList.push(flowMaterial2)
    cylinder2.position.set(8, 4.2, -20)
    this.scene.add(cylinder2);

    //圆柱2 立体旋转扫描
    const geometry3 = new THREE.CylinderGeometry(5, 5, 16, 32, 1, true);//true上下底面不封闭
    const flowMaterial3 = getRotateMaterialByY() //绕y轴的旋转材质
    const cylinder3 = new THREE.Mesh(geometry3, flowMaterial3);
    this.shaderMaterialList.push(flowMaterial3)
    cylinder3.position.set(-20, 8.1, -20)
    this.scene.add(cylinder3);

    //圆柱2 立体旋转扫描
    const geometry31 = new THREE.CylinderGeometry(5, 5, 16, 32, 1, true);//true上下底面不封闭
    const flowMaterial31 = getRotateMaterialByY2() //绕y轴的旋转材质
    const cylinder31 = new THREE.Mesh(geometry31, flowMaterial31);
    this.shaderMaterialList.push(flowMaterial31)
    cylinder31.position.set(-20, 8.1, 20)
    this.scene.add(cylinder31);

    const geometry4 = new THREE.CylinderGeometry(8, 0, 16, 5, 1, false);//true上下底面不封闭
    // const geometry4 = new THREE.OctahedronGeometry(5);
    const flowMaterial4 = getUpDownRotateMaterial() //绕y轴的旋转材质
    const flowMaterial41 = getUpDownRotateMaterial({ opacity: 1, bool: false }) //绕y轴的旋转材质
    const cylinder4 = new THREE.Mesh(geometry4, flowMaterial4);
    this.shaderMaterialList.push(flowMaterial4)
    this.shaderMaterialList.push(flowMaterial41)

    const edges3 = new THREE.EdgesGeometry(geometry4);
    const line3 = new THREE.LineSegments(edges3, flowMaterial41);
    // this.scene.add(cylinderMesh,line3);
    this.scene.add(cylinder4, line3);

  }

  addRotationCylinder() {
    //圆柱2 立体旋转扫描
    const geometry31 = new THREE.CylinderGeometry(5, 5, 16, 32, 1, false);//true上下底面不封闭
    const flowMaterial31 = getRotateMaterialByY3({ edge: 2 }) //绕y轴的旋转材质
    const cylinder31 = new THREE.Mesh(geometry31, flowMaterial31);
    this.shaderMaterialList.push(flowMaterial31)
    cylinder31.position.set(-20, 8.1, 20)
    this.scene.add(cylinder31);
  }

  addBufferGeometry() {
    const geometry = new THREE.BufferGeometry() //创建一个Buffer类型几何体对象
    const geometry2 = new THREE.BoxGeometry(3, 3, 3)
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
