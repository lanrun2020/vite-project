import axios from "axios";
import { fa } from "element-plus/es/locale";
import * as T from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
  private flowMaterial: any
  private scanMaterial: any
  private scanMaterial2: any
  constructor(dom: HTMLElement) {
    that = this
    this.dom = dom
    this.clock = new THREE.Clock()
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
    this.addModel();
    this.addCircle();
    this.addCircle2();
    window.addEventListener('resize', this.onWindowResize);
    this.animate();
  }

  // 设置场景
  setScene() {
    this.scene = new THREE.Scene();
    // Grid 添加网格辅助对象
    const helper = new THREE.GridHelper(100, 30, 0x303030, 0x303030); //长度1000 划分为50份
    this.scene.add(helper);
    // 辅助三维坐标系
    const axesHelper = new THREE.AxesHelper(500); 
    this.scene.add(axesHelper)
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.renderer.setClearColor(0x041336);
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置透视相机
  setCamera() {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(75,this.dom.offsetWidth / this.dom.offsetHeight,1,1000);
    this.camera.position.set(0,30,50)
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
    this.flowMaterial.uniforms.time.value = this.clock.getElapsedTime()
    this.scanMaterial.uniforms.time.value = this.clock.getElapsedTime()
    this.scanMaterial2.uniforms.time.value = this.clock.getElapsedTime()
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

  addModel() {
    //创建一个立方体
    const geometry = new THREE.BoxGeometry(50, 2, 10);
    const planwG = new THREE.PlaneGeometry(50,5);
    const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
    this.flowMaterial = this.getMaterial()
    const cube = new THREE.Mesh(geometry, [basicMaterial,basicMaterial,this.flowMaterial,basicMaterial,basicMaterial,basicMaterial]);
    cube.position.set(0,1,0)
    const plane = new THREE.Mesh(planwG,this.flowMaterial)
    plane.position.set(0,0.1,10)
    plane.rotation.set(Math.PI/2,0,0)
    this.scene.add(cube)
    this.scene.add(plane)
  }

  addCircle() {
    const geometry = new THREE.CircleGeometry( 10, 128, 0, Math.PI*1.8); //半径，分段
    // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 ,side:THREE.DoubleSide } );
    this.scanMaterial = this.getScanMaterial()
    const circle = new THREE.Mesh( geometry, this.scanMaterial );
    circle.position.set(-25,0.5,-25)
    circle.rotation.x = -Math.PI/2
    this.scene.add( circle );
  }

  addCircle2() {
    const geometry = new THREE.CircleGeometry( 10, 128, 0, Math.PI*1.8); //半径，分段
    // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 ,side:THREE.DoubleSide } );
    this.scanMaterial2 = this.getScanMaterial2()
    const circle = new THREE.Mesh( geometry, this.scanMaterial2 );
    circle.position.set(25,0.5,-25)
    circle.rotation.x = -Math.PI/2
    this.scene.add( circle );
  }

  // 材质1
  getMaterial() {
    const tubeShader = {
      vertexshader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
          `,
      fragmentshader: `
      varying vec2 vUv;
          uniform float u_opacity;
          uniform vec3 color;
          uniform vec3 color2;
          uniform float time;
          uniform float speed;
          uniform float repeatX;
          uniform float thickness;
          void main() {
              bool b = bool(step(fract(vUv.x * repeatX - time*speed),thickness));
              float a1 = step(fract(vUv.x * repeatX - time*speed),thickness);
              float a2 = step(thickness,fract(vUv.x * repeatX - time*speed));
              gl_FragColor = b?vec4(color,fract(vUv.x * repeatX - time*speed) * u_opacity * a1) : vec4(color2,a2);
          }`
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x00ffff),
          type: "v3"
        },
        color2: {
          value: new THREE.Color(0x666666),
          type: "v3"
        },
        time: {
          value: 1,
          type: "f"
        },
        repeatX: {
          value: 10,
          type: "f"
        },
        thickness: {
          value: 0.5,
          type: "f"
        },
        speed: {
          value: 1.0,
          type: "f"
        },
        u_opacity: {
          value: 1.0,
          type: "f"
        },
      },
      side:THREE.DoubleSide,//side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
      transparent: true,//是否透明
      vertexShader: tubeShader.vertexshader, // 顶点着色器
      fragmentShader: tubeShader.fragmentshader // 片元着色器
    })
    return material
  }

  // 扫描材质1
  getScanMaterial() {
    const tubeShader = {
      vertexshader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
          `,
      fragmentshader: `
      varying vec2 vUv;
          uniform float u_opacity;
          uniform vec3 color;
          uniform vec3 color2;
          uniform float time;
          uniform float speed;
          uniform float repeat;
          uniform float thickness;
          void main() {
            float sp = 1.0/(repeat*2.0);
            float dis = distance(vUv,vec2(0.5,0.5)) - 0.1*time;
            float dis2 = distance(vUv,vec2(0.5,0.5));
            float m = mod(dis, sp);
            float a = step(m, sp*thickness); //用于分段,值为0或1
            gl_FragColor = vec4(color, u_opacity * a * (0.5 - dis2));
          }`
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x00ffff),
          type: "v3"
        },
        color2: {
          value: new THREE.Color(0x666666),
          type: "v3"
        },
        time: {
          value: 1,
          type: "f"
        },
        repeat: {
          value: 3,
          type: "f"
        },
        thickness: {
          value: 0.5,
          type: "f"
        },
        speed: {
          value: 1.0,
          type: "f"
        },
        u_opacity: {
          value: 1.0,
          type: "f"
        },
      },
      side:THREE.DoubleSide,//side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
      transparent: true,//是否透明
      vertexShader: tubeShader.vertexshader, // 顶点着色器
      fragmentShader: tubeShader.fragmentshader // 片元着色器
    })
    return material
  }
  //扫描材质2
  getScanMaterial2() {
    const tubeShader = {
      vertexshader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
          `,
      fragmentshader: `
      varying vec2 vUv;
          uniform float u_opacity;
          uniform vec3 color;
          uniform vec3 color2;
          uniform float time;
          uniform float speed;
          uniform float repeat;
          uniform float thickness;
          void main() {
            float sp = 1.0/(repeat*2.0);
            float dis = distance(vUv,vec2(0.5,0.5)) - 0.1*time;
            float dis2 = distance(vUv,vec2(0.5,0.5));
            float m = mod(dis, sp);
            float a = step(m, sp*thickness); //用于分段,值为0或1
            gl_FragColor = vec4(color, u_opacity * a * (0.5 - dis2));
          }`
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x00ffff),
          type: "v3"
        },
        color2: {
          value: new THREE.Color(0x666666),
          type: "v3"
        },
        time: {
          value: 1,
          type: "f"
        },
        repeat: {
          value: 3,
          type: "f"
        },
        thickness: {
          value: 0.5,
          type: "f"
        },
        speed: {
          value: 1.0,
          type: "f"
        },
        u_opacity: {
          value: 1.0,
          type: "f"
        },
      },
      side:THREE.DoubleSide,//side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
      transparent: true,//是否透明
      vertexShader: tubeShader.vertexshader, // 顶点着色器
      fragmentShader: tubeShader.fragmentshader // 片元着色器
    })
    return material
  }
}
