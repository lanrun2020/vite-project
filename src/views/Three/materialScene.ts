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
  private scanMaterial3: any
  private scanMaterial4: any
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
    this.addCircle3();
    this.addCylinder();
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
    this.renderer = new THREE.WebGLRenderer({
      antialias:true,
      alpha:true
    });
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
    this.scanMaterial3.uniforms.time.value = this.clock.getElapsedTime()
    this.scanMaterial4.uniforms.time.value = this.clock.getElapsedTime()
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
    const geometry = new THREE.BoxGeometry(50, 5, 10);
    const planwG = new THREE.PlaneGeometry(50,5);
    const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, side:THREE.DoubleSide});
    this.flowMaterial = this.getMaterial()
    const cube = new THREE.Mesh(geometry, [basicMaterial,basicMaterial,this.flowMaterial,basicMaterial,basicMaterial,basicMaterial]);
    cube.position.set(0,3,0)
    const plane = new THREE.Mesh(planwG,this.flowMaterial)
    plane.position.set(0,0.1,10)
    plane.rotation.set(Math.PI/2,0,0)
    this.scene.add(cube)
    this.scene.add(plane)
  }

  // 扩散扫描 圆
  addCircle() {
    const geometry = new THREE.CircleGeometry( 10, 128, 0, Math.PI*1.8); //半径，分段
    // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 ,side:THREE.DoubleSide } );
    this.scanMaterial = this.getScanMaterial()
    const circle = new THREE.Mesh( geometry, this.scanMaterial );
    circle.position.set(-25,0.5,-25)
    circle.rotation.x = -Math.PI/2
    this.scene.add(circle);
  }

   // 旋转扫描 圆2
   addCircle3() {
    const geometry = new THREE.CircleGeometry( 10, 128,); //半径，分段
    this.scanMaterial4 = this.getScanMaterial4()
    const circle = new THREE.Mesh( geometry, this.scanMaterial4 );
    circle.position.set(0,0.5,25)
    circle.rotation.x = -Math.PI/2
    this.scene.add( circle );
    // new Array(10).fill('').forEach((item, index)=>{
    //   const cc = circle.clone()
    //   cc.position.x += 30*index
    //   this.scene.add( cc );
    // })
  }

  // 圆柱
  addCylinder() {
    //圆柱
    const geometry = new THREE.CylinderGeometry(2, 2, 8, 32, 1, true);//true上下底面不封闭
    this.scanMaterial3 = this.getScanMaterial3()
    const cylinder = new THREE.Mesh(geometry, this.scanMaterial3);
    cylinder.position.set(0,4.2,-20)
    this.scene.add(cylinder);

    //圆锥
    const geometry2 = new THREE.CylinderGeometry(4, 0, 8, 32, 1, true);
    const cylinder2 = new THREE.Mesh(geometry2, this.scanMaterial3);
    cylinder2.position.set(8,4.2,-20)
    this.scene.add(cylinder2);

  }

  // 材质1 扫描
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

  // 扫描材质1 扩散扫描材质
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
  //扫描材质2 旋转扫描材质
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
          uniform float PI;
          void main() {
            // bool b2 = bool(step((vUv.x - 0.5), 0.0));
            bool b = bool(step((vUv.x - 0.5),0.0));
            // float a = b2 ? (vUv.y-0.5)-(vUv.x - 0.5)*fract(-time) : (vUv.x - 0.5) - (vUv.y-0.5);
            // float a = b2 ? 0.5:0.0;
            float x = b ? 0.0 : degrees(acos((vUv.y-0.5)/sqrt((vUv.x - 0.5)*(vUv.x - 0.5) + (vUv.y - 0.5)*(vUv.y - 0.5)))) /360.0;
            // float sp = 1.0/(repeat*2.0);
            // float dis = distance(vUv,vec2(0.5,0.5)) - 0.1*time;
            // float dis2 = distance(vUv,vec2(0.5,0.5));
            // float eagle = asin((vUv.x - 0.5)/sqrt((vUv.x - 0.5)*(vUv.x - 0.5) + (vUv.y - 0.5)*(vUv.y - 0.5)) + fract(time))/PI;
            // float eagle = atan((vUv.y - 0.5)/(vUv.x - 0.5) - fract(time)*PI)/PI;
            // float m = mod(dis, sp);
            // float a = step(m, sp*thickness); //用于分段,值为0或1
            gl_FragColor = vec4(color, x);
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
        PI: {
          value: Math.PI,
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

  // 扫描材质3
  getScanMaterial3() {
    const tubeShader = {
      vertexshader: `
        varying vec2 vUv;
        varying vec3 modelPos;
        void main() {
          modelPos = position;
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
        `,
      fragmentshader: `
        varying vec2 vUv;
        varying vec3 modelPos;
        uniform float u_opacity;
        uniform vec3 color;
        uniform vec3 color2;
        uniform float time;
        uniform float speed;
        uniform float repeat;
        uniform float thickness;
        void main() {
          float sp = 1.0/(repeat);
          float dis = fract(modelPos.y/repeat - speed*time);
          float m = mod(dis, 0.5);
          float a = step(m, sp*thickness); //用于分段,值为0或1
          gl_FragColor = vec4(color,u_opacity*(1.0 - modelPos.y/4.0)*a);
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
          value: 0.7,
          type: "f"
        },
        speed: {
          value: 1.0,
          type: "f"
        },
        u_opacity: {
          value: 0.8,
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

  // 扫描材质4 旋转矩阵的运用
  getScanMaterial4() {
    //常用矩阵
    //modelMatrix模型矩阵
    //modelViewMatrix模型视图矩阵
    //projectionMatrix投影矩阵
    //normalMatrix正规矩阵
    const eagleFuc = `
    float eagleFuc(float x,float y) { //计算此位置的角度的弧度值
      if(x>0.0){
        if(y<0.0){
          return atan(y/x) + 2.0*PI;
        }
        if(y>0.0){
          return atan(y/x);
        }
      }else{
        if(x<0.0){
          return atan(y/x)+PI;
        }else{
          if(y>0.0){
            return PI/2.0;
          }else{
            if(y<0.0){
              return -PI/2.0;
            }else{
              return 0.0;
            }
          }
        }
      }
    }
    `
    const tubeShader = {
      vertexshader: `
        varying vec2 vUv;
        varying vec2 vUv2;
        varying vec3 modelPos;
        uniform float time;
        uniform float speed;
        uniform float PI;
        `+eagleFuc+`
        //degrees 弧度转角度
        float computeX(float eagle){ //eagle旋转角度
          return sqrt((vUv.x-0.5)*(vUv.x-0.5) + (vUv.y-0.5)*(vUv.y-0.5)) * cos(radians(eagle + degrees(eagleFuc(vUv.x-0.5,vUv.y-0.5))  ));
        }
        float computeY(float eagle){
          return sqrt((vUv.x-0.5)*(vUv.x-0.5) + (vUv.y-0.5)*(vUv.y-0.5)) * sin(radians(eagle + degrees(eagleFuc(vUv.x-0.5,vUv.y-0.5))  ));
        }
        void main() {
          float eagle = fract(-speed*time)*360.0;//旋转的角度
          modelPos = position;
          vUv = uv; //记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
          vUv2 = uv;
          // modelPos.z += 5.0;
          vUv2.x = 0.5 + computeX(eagle); //旋转后的位置x
          vUv2.y = 0.5 + computeY(eagle); //旋转后的位置y
          vec4 mvPosition = modelViewMatrix * vec4(modelPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
        `,
      fragmentshader: `
        varying vec2 vUv2;
        uniform float u_opacity;
        uniform vec3 color;
        uniform float PI;
        `+eagleFuc+`
        void main() {
          float e = eagleFuc(vUv2.x-0.5,vUv2.y-0.5)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
          gl_FragColor = vec4(color, e * u_opacity);
        }`
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x00ffff),
          type: "v3"
        },
        time: {
          value: 1,
          type: "f"
        },
        speed: {
          value: 1.0,
          type: "f"
        },
        u_opacity: {
          value: 0.9,
          type: "f"
        },
        PI: {
          value: Math.PI,
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
