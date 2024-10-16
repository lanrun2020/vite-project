// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// //@ts-nocheck
import * as T from "three";
import ForceGraph from 'force-graph';
import floorImg from '../../assets/floor5.jpeg'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import {
  CSS2DRenderer,
  CSS2DObject
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { InitFlyLine } from "@/utils/flyLine";
import pointPng from '@/assets/point.png';
import { getScanMaterial } from './shaderMaterial'
const THREE = T
let that: computerAttack
export default class computerAttack {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private raycaster: THREE.Raycaster
  private group = new THREE.Group()
  private lineGroup = new THREE.Group()
  private labelRenderer: CSS2DRenderer
  private rushMaterialList = []
  private transformControls: TransformControls
  private clock!: THREE.Clock
  private time = 0
  private controls: OrbitControls
  private requestId: number
  private flyManager: InitFlyLine
  private selectNodeId: null
  private PModel: THREE.Group
  constructor(dom: HTMLElement) {
    this.clock = new THREE.Clock()
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
    this.camera = new THREE.PerspectiveCamera(50, this.dom.offsetWidth / this.dom.offsetHeight, 1, 4000); //near值设置为1,值太小模型材质会出现闪烁
    this.camera.position.set(0, 60, 100); //(x,y,z)
    this.scene.add(this.camera);
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    // this.renderer.setPixelRatio( window.devicePixelRatio );
    // this.renderer.setClearColor(0xdddddd);
    this.renderer.setClearAlpha(0.0);
    this.labelRenderer = new CSS2DRenderer(); //新建CSS2DRenderer
    this.labelRenderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.dom.appendChild(this.labelRenderer.domElement);

    // 将呈现器的输出添加到HTML元素
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置控制器
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement) //轨道控制器
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    this.scene.add(this.transformControls);
    this.transformControls.addEventListener('mouseDown', () => {
      // 平移开始时禁用相机控件
      this.controls.enabled = false;
    });
    this.transformControls.addEventListener('change', () => {
      // 如果界面显示性能不好，则在模型移动完成后（mouseUp事件）调用以下代码
      // 更新模型位置，移除相关连线
      const res = this.lineGroup.children.filter((line) => {
        return line.sourceId === this.PModel['information'].id
      })
      const res2 = this.lineGroup.children.filter((line) => {
        return line.targetId === this.PModel['information'].id
      })
      res.forEach((line) => {
        this.lineGroup.remove(line) // 移除原来的线
        this.addLine(this.PModel.position.x, this.PModel.position.z, line.targetX, line.targetY, line.sourceId, line.targetId) // 添加新的连线
      })
      res2.forEach((line) => {
        this.lineGroup.remove(line)
        this.addLine(line.sourceX, line.sourceY, this.PModel.position.x, this.PModel.position.z, line.sourceId, line.targetId)
      })
    });
    this.transformControls.addEventListener('mouseUp', () => {
      // 平移结束时启用相机控件
      this.controls.enabled = true;
      // // 更新模型位置，移除相关连线
      // const res = this.lineGroup.children.filter((line)=>{
      //   return line.sourceId === this.PModel.information.id
      // })
      // const res2 = this.lineGroup.children.filter((line)=>{
      //   return line.targetId === this.PModel.information.id
      // })
      // res.forEach((line)=>{
      //   this.lineGroup.remove(line) // 移除原来的线
      //   this.addLine(this.PModel.position.x,this.PModel.position.z,line.targetX,line.targetY,line.sourceId,line.targetId) // 添加新的连线
      // })
      // res2.forEach((line)=>{
      //   this.lineGroup.remove(line)
      //   this.addLine(line.sourceX,line.sourceY,this.PModel.position.x,this.PModel.position.z,line.sourceId,line.targetId)
      // })
    });
    // 指定某个对象绑定到transformControls上，比如点击物体时可将物体绑定
    this.controls.update();
    this.controls.enableDamping = true; // 阻尼（惯性）是否启用
    this.controls.dampingFactor = 0.05; // 阻尼系数
    this.controls.screenSpacePanning = false; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
    this.controls.minDistance = 0; //移动最小距离
    this.controls.maxDistance = 2300; //移动最大距离
    this.controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }

  // 渲染
  render() {
    if (this.renderer && this.labelRenderer && this.scene && this.camera) {
      // if (this.camera.position.y<0){this.camera.position.set(this.camera.position.x,0,this.camera.position.z)}
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
      if (this.rushMaterialList.length) {
        this.rushMaterialList.forEach((material) => {
          material.uniforms.time.value = this.clock.getElapsedTime()
        })
      }
    }
  }

  // 动画
  animate() {
    this.requestId = requestAnimationFrame(() => this.animate());
    this.controls.update()
    // 设置画布的大小
    // this.flyManager.animation()
    // this.time = this.clock.getElapsedTime()
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.render();
  }

  // 设置光源
  setLight() {
    if (this.scene) {
      // 环境光
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambient);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 0, 100);
      this.scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.5);
      // pointLight.add( new THREE.Mesh( new THREE.SphereGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) ) );
      pointLight.position.set(-50, 50, -100)
      this.scene.add(pointLight);
      const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
      // pointLight2.add( new THREE.Mesh( new THREE.SphereGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) ) );
      pointLight2.position.set(50, 50, -100)
      this.scene.add(pointLight2);

      // const rectLight3 = new THREE.RectAreaLight( 0xAFFFFF, 10, 50, 10 );
      // rectLight3.position.set( 0, 0, 25 );
      // this.scene.add( rectLight3 );
      // this.scene.add( new RectAreaLightHelper( rectLight3 ) );
      // 环境光
      //  const ambient = new THREE.AmbientLight(0xbbbbbb);
      //  this.scene.add(ambient);
      //  const directionalLight = new THREE.DirectionalLight(0x666666);
      //  directionalLight.add( new THREE.Mesh( new THREE.SphereGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) ) );
      //  directionalLight.position.set(0, 20, 20);
      //  this.scene.add(directionalLight);
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
    // this.scene.background = new THREE.Color(0x000000);
    // this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
    // Grid 添加网格辅助对象
    const helper = new THREE.GridHelper(1500, 50, 0x60b1b5, 0x60b1b5); //长度1000 划分为50份
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
    const options = [{
      type: 'Host',
      url: `/model/XM.glb`
    }, {
      type: 'Switch',
      url: `/model/routerN.glb`
    }]
    const res = [
      {
        "default_gateway": "192.168.0.1",
        "role": "instance",
        "os": "linux",
        "emulation": "kvm",
        "ip": "2390|192.168.0.66,2391|192.168.8.40",
        "to_node": "网络_n80wipyf",
        "netmask": "255.255.255.0",
        "name": "kail0.66/8.40",
        "y_coordinates": -12.99999999999784,
        "id": 419,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": -99.9999999999966,
        "ram": 1024
      },
      {
        "role": "instance",
        "os": "linux",
        "emulation": "kvm",
        "ip": "2390|192.168.0.66,2391|192.168.8.40",
        "to_node": "8网段",
        "netmask": "255.255.255.0",
        "name": "kail0.66/8.40",
        "y_coordinates": -12.99999999999784,
        "id": 419,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": -99.9999999999966,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.8.1",
        "role": "instance",
        "os": "linux",
        "emulation": "docker",
        "ip": "2392|192.168.8.2,2393|192.168.30.3",
        "to_node": "8网段",
        "netmask": "255.255.255.0",
        "name": "8.2/30.3",
        "y_coordinates": -15,
        "id": 420,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.30.1",
        "role": "instance",
        "os": "linux",
        "emulation": "docker",
        "ip": "2392|192.168.8.2,2393|192.168.30.3",
        "to_node": "30网段",
        "netmask": "255.255.255.0",
        "name": "8.2/30.3",
        "y_coordinates": -15,
        "id": 420,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.8.1",
        "role": "instance",
        "os": "linux",
        "emulation": "docker",
        "ip": "2394|192.168.8.11,2395|192.168.30.7",
        "to_node": "8网段",
        "netmask": "255.255.255.0",
        "name": "8.11/30.7",
        "y_coordinates": -15,
        "id": 421,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.30.1",
        "role": "instance",
        "os": "linux",
        "emulation": "docker",
        "ip": "2394|192.168.8.11,2395|192.168.30.7",
        "to_node": "30网段",
        "netmask": "255.255.255.0",
        "name": "8.11/30.7",
        "y_coordinates": -15,
        "id": 421,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.40.1",
        "role": "instance",
        "os": "xp",
        "emulation": "docker",
        "ip": "2396|192.168.40.6",
        "to_node": "40网段",
        "netmask": "255.255.255.0",
        "name": "40.6",
        "y_coordinates": -15,
        "id": 422,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.40.1",
        "role": "instance",
        "os": "xp",
        "emulation": "docker",
        "ip": "2397|192.168.40.9",
        "to_node": "40网段",
        "netmask": "255.255.255.0",
        "name": "40.9",
        "y_coordinates": -15,
        "id": 423,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.30.1",
        "role": "instance",
        "os": "win7",
        "emulation": "docker",
        "ip": "2398|192.168.30.6,2399|192.168.40.5",
        "to_node": "30网段",
        "netmask": "255.255.255.0",
        "name": "30.6/40.5",
        "y_coordinates": -15,
        "id": 424,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "role": "instance",
        "os": "win7",
        "emulation": "docker",
        "ip": "2398|192.168.30.6,2399|192.168.40.5",
        "to_node": "40网段",
        "netmask": "255.255.255.0",
        "name": "30.6/40.5",
        "y_coordinates": -15,
        "id": 424,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.30.1",
        "role": "instance",
        "os": "win7",
        "emulation": "docker",
        "ip": "2400|192.168.30.8,2401|192.168.40.8",
        "to_node": "30网段",
        "netmask": "255.255.255.0",
        "name": "30.8/40.8",
        "y_coordinates": -15,
        "id": 425,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "role": "instance",
        "os": "win7",
        "emulation": "docker",
        "ip": "2400|192.168.30.8,2401|192.168.40.8",
        "to_node": "40网段",
        "netmask": "255.255.255.0",
        "name": "30.8/40.8",
        "y_coordinates": -15,
        "id": 425,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "default_gateway": "192.168.30.1",
        "role": "instance",
        "os": "xp",
        "emulation": "docker",
        "ip": "2402|192.168.30.11,2403|192.168.40.11",
        "to_node": "30网段",
        "netmask": "255.255.255.0",
        "name": "30.11/40.11",
        "y_coordinates": -15,
        "id": 426,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "role": "instance",
        "os": "xp",
        "emulation": "docker",
        "ip": "2402|192.168.30.11,2403|192.168.40.11",
        "to_node": "40网段",
        "netmask": "255.255.255.0",
        "name": "30.11/40.11",
        "y_coordinates": -15,
        "id": 426,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": 68,
        "ram": 1024
      },
      {
        "os": "",
        "emulation": "",
        "name": "8网段",
        "y_coordinates": -86,
        "id": 427,
        "category": "Switch",
        "to_node": "8.2",
        "x_coordinates": -62
      },
      {
        "os": "",
        "emulation": "",
        "name": "8网段",
        "y_coordinates": -86,
        "id": 427,
        "category": "Switch",
        "to_node": "8.11",
        "x_coordinates": -62
      },
      {
        "os": "",
        "emulation": "",
        "name": "30网段",
        "y_coordinates": -90,
        "id": 428,
        "category": "Switch",
        "to_node": "30.6",
        "x_coordinates": 40
      },
      {
        "os": "",
        "emulation": "",
        "name": "30网段",
        "y_coordinates": -90,
        "id": 428,
        "category": "Switch",
        "to_node": "30.8",
        "x_coordinates": 40
      },
      {
        "os": "",
        "emulation": "",
        "name": "30网段",
        "y_coordinates": -90,
        "id": 428,
        "category": "Switch",
        "to_node": "30.11",
        "x_coordinates": 40
      },
      {
        "os": "",
        "emulation": "",
        "name": "40网段",
        "y_coordinates": -90,
        "id": 429,
        "category": "Switch",
        "to_node": "40.6",
        "x_coordinates": 40
      },
      {
        "os": "",
        "emulation": "",
        "name": "40网段",
        "y_coordinates": -90,
        "id": 429,
        "category": "Switch",
        "to_node": "40.9",
        "x_coordinates": 40
      }
    ]
    const arr = new Array(5).fill('').map((item, index) => {
      return {
        "default_gateway": "192.168.2.9",
        "role": "instance",
        "os": "linux",
        "emulation": "kvm",
        "ip": "2390|192.168.0.66,2391|192.168.8.40",
        "to_node": "40网段",
        "netmask": "255.255.255.0",
        "name": "9527" + index,
        "y_coordinates": -12.99999999999784,
        "id": 9527 + index,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": -99.9999999999966,
        "ram": 1024
      }
    })
    const arr2 = new Array(5).fill('').map((item, index) => {
      return {
        "default_gateway": "192.168.2.9",
        "role": "instance",
        "os": "linux",
        "emulation": "kvm",
        "ip": "2390|192.168.0.66,2391|192.168.8.40",
        "to_node": "8网段",
        "netmask": "255.255.255.0",
        "name": "9527" + index,
        "y_coordinates": -12.99999999999784,
        "id": 9527 + index,
        "category": "Host",
        "cpuCount": 2,
        "x_coordinates": -99.9999999999966,
        "ram": 1024
      }
    })
    // res.push(...arr2)
    // res.push(...arr)
    const links = []
    const newlinks = []
    const nodes = []
    res.forEach((item: any) => {
      const copy_id = item.id
      item.id = item.name
      item.copy_id = copy_id
      const index = nodes.filter((node) => {
        return node.copy_id === copy_id
      })
      links.push({
        source: item.id,
        target: item.to_node
      })
      if (!index.length) {
        nodes.push(item)
      }
    })
    links.forEach((link) => {
      const index = nodes.filter((node) => {
        return node.name === link.target
      })
      if (index.length) {
        newlinks.push(link)
      }
    })
    // const force = d3.forceSimulation().nodes(nodes).force("link",d3.forceLink(newlinks).id(d => d.id)).force("x",d3.forceX()).force("y",d3.forceY()).force('charge',d3.forceManyBody()).stop()
    // force.tick(100)
    const graph = ForceGraph()(document.getElementById('graph')).graphData({ nodes, links: newlinks }).warmupTicks(300) //只使用tick300次布局，以减少布局时长
    setTimeout(() => {
      const loader = new GLTFLoader();
      // const loader = new FBXLoader()
      nodes.forEach((node) => {
        const { url } = options.find((opt) => {
          return opt.type === node.category
        })
        loader.load(url, (gltf) => {
          const mroot = gltf.scene
          mroot['information'] = node
          const bbox = new THREE.Box3().setFromObject(mroot)
          const cent = bbox.getCenter(new THREE.Vector3())
          const size = bbox.getSize(new THREE.Vector3())
          const maxAxis = Math.max(size.x, size.y, size.z)
          const Scalar = 10 / maxAxis // 模型加载为10个单位大小,模型加载标量大小
          mroot.scale.multiplyScalar(Scalar) // 模型加载为10个单位大小
          bbox.setFromObject(mroot)
          bbox.getCenter(cent)
          bbox.getSize(size)
          mroot.position.copy(cent).multiplyScalar(-1)
          mroot.position.y += (size.y * 0.5); //高度
          mroot.position.x = node.y//因为布局位置做了参数交换，界面展示更好看
          mroot.position.z = node.x
          // new Array(200).fill('').map(() => {
          //   const model = mroot.clone()
          //   model.position.x = Math.random()*800 - 400
          //   model.position.z = Math.random()*800 - 400
          //   that.group.add(model)
          // })
          that.group.add(mroot)
          const boxGeometry = new THREE.BoxGeometry(...size)
          const material = new THREE.MeshBasicMaterial({ color: 0xfff, transparent: true, opacity: 0.1 })
          const cube1 = new THREE.Mesh(boxGeometry, material)
          cube1.position.copy(mroot.position)
          cube1.position.y += size.y * 0.5
          that.addLabel(mroot, node.name, size.y / Scalar)
        }, undefined, (error) => {
          console.log('模型加载错误', error);
        })
      })
      newlinks.forEach((link) => {
        this.addLine(link.source.y, link.source.x, link.target.y, link.target.x, link.source.id, link.target.id)
      })
      that.scene.add(that.group)
      that.scene.add(that.lineGroup)
      this.setFloor(150)
    }, 200)
  }

  getTubeMaterial() {
    // 第一步新建一个场景
    const tubeShader = {
      vertexshader: `
          uniform float size;
          uniform float time;
          uniform float u_len;
          attribute float u_index;
          varying vec2 vUv;
          uniform vec3 color;
          uniform float u_opacity;
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
            uniform float isTexture;
            uniform float time;
            uniform float speed;
            uniform float repeatX;
            void main() {
                vec4 u_color = vec4(color,u_opacity);
                gl_FragColor =  vec4(color,fract(vUv.x * repeatX - time*speed) * u_opacity * step(0.5,fract(vUv.x * repeatX - time*speed)));
            }`
    }
    const tubeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x00ffff),
          type: "v3"
        },
        time: {
          value: this.time,
          type: "f"
        },
        u_len: {
          value: 10,
          type: "f"
        },
        repeatX: {
          value: 5,
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
      transparent: true,
      // depthTest: false,
      vertexShader: tubeShader.vertexshader,
      fragmentShader: tubeShader.fragmentshader
    })
    return tubeMaterial
  }

  addLine(x1, y1, x2, y2, sourceId, targetId) {
    //平滑曲线
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x1, 0.5, y1),
      new THREE.Vector3((x1 + x2) / 2, Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 10, (y1 + y2) / 2),
      new THREE.Vector3(x2, 0.5, y2),
    ]);
    const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.05, 10, false); //path路径 tubularSegments分段 radius半径 radialSegments管道横截面分段 close是否闭合
    const linematerial = this.getTubeMaterial()
    const mesh = new THREE.Mesh(tubeGeometry, linematerial);
    this.rushMaterialList.push(linematerial)
    mesh.sourceId = sourceId
    mesh.targetId = targetId
    mesh.sourceX = x1
    mesh.sourceY = y1
    mesh.targetX = x2
    mesh.targetY = y2
    this.lineGroup.add(mesh);
  }

  addLabel(object: THREE.Group, text: string, height: number) {
    const div = document.createElement("div");
    div.className = "computer-box-label";
    div.style.cursor = "pointer";
    div.style.pointerEvents = 'auto';
    div.addEventListener('click', (event: MouseEvent) => {
      console.log('点击了标签', text);
      event.stopPropagation() // 阻止事件冒泡
    })
    div.textContent = text;
    const earthLabel = new CSS2DObject(div);
    earthLabel.position.set(0, height, 0);
    object.add(earthLabel);
  }

  addFlyline(x1, y1, x2, y2) {
    // 平滑曲线
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x1, 2, y1),
      new THREE.Vector3((x1 + x2) / 2, 5, (y1 + y2) / 2),
      new THREE.Vector3(x2, 2, y2),
    ]);
    // curve.getPoints(pointCount);
    const allPoints = curve.getPoints(500);
    //制作飞线动画
    const flyMesh = this.flyManager.addFly({
      curve: allPoints, //飞线飞线其实是N个点构成的
      color: "rgba(255,255,255,1)", //点的颜色
      width: 0.1, //点的半径
      length: 500, //飞线的长度（点的个数）
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


  // 创建地板
  setFloor(radius) {
    if (this.scene) {
      // const radius = 476
      // const geometry = new THREE.BoxGeometry(200, 2, 200); //创建一个立方体几何对象Geometry
      const geometry = new THREE.CylinderGeometry(radius, radius - 0.5, 2, 180);//圆台
      const geometry2 = new THREE.CylinderGeometry(radius - 1, radius - 1.5, 2, 180);//圆台
      const geometry3 = new THREE.RingGeometry(radius - 1.5, radius - 1, 180);//圆环
      const texture = new THREE.TextureLoader().load(
        floorImg
      ); //首先，获取到纹理
      // 设置阵列模式
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // uv两个方向纹理重复数量
      texture.repeat.set(15, 15);
      const material1 = new THREE.MeshBasicMaterial({ map: texture, color: 0xdddddd })//贴图表面
      const material2 = new THREE.MeshBasicMaterial({ color: 0x666666 })

      const material4 = new THREE.MeshBasicMaterial({
        color: 0x00ffff // 发光颜色
      });
      // const material = [material2, material2, material1, material3, material2, material2]; //然后创建一个phong材质来处理着色，并传递给纹理映射
      const cube1 = new THREE.Mesh(geometry, [material4, material1, material2]); //网格模型对象Mesh
      const cube2 = new THREE.Mesh(geometry2, [material4, material2, material1]); //网格模型对象Mesh
      const cube3 = new THREE.Mesh(geometry3, material4); //网格模型对象Mesh
      cube1.position.set(0, -1, 0)
      cube2.position.set(0, -5, 0)
      cube3.position.set(0, 0.1, 0)
      cube3.rotation.x = -Math.PI / 2

      const geometry6 = new THREE.CircleGeometry(150, 128, 0); //半径，分段
      const scanMaterial = getScanMaterial({ repeat: 2, thickness: 0.01, opacity: 0.6 })
      this.rushMaterialList.push(scanMaterial)
      const circle = new THREE.Mesh(geometry6, scanMaterial);
      circle.position.set(0, 1, 0)
      circle.rotation.x = -Math.PI / 2

      this.scene.add(circle);
      this.scene.add(cube1); //网格模型添加到场景中
      this.scene.add(cube2); //网格模型添加到场景中
      this.scene.add(cube3);
    }
  }

  // 停止渲染
  stop() {
    cancelAnimationFrame(this.requestId)
    window.removeEventListener('resize', this.onWindowResize);
    this.dom.removeEventListener('mousemove', this.handleMousemove)
    this.dom.removeEventListener('click', this.handleMouseDown);
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

  handleMousemove(event: MouseEvent) {
    event.preventDefault();
    const mouse = new THREE.Vector2(0, 0);
    mouse.x = ((event.clientX - that.dom.offsetLeft) / that.dom.offsetWidth) * 2 - 1;
    mouse.y = - ((event.clientY - that.dom.offsetTop) / that.dom.offsetHeight) * 2 + 1;
    that.raycaster.setFromCamera(mouse, that.camera);
    const intersects = that.raycaster.intersectObjects(that.group.children)
    if (intersects.length > 0) {
      that.dom.style.cursor = "pointer"
      if (intersects[0].object) {
        const PModel = that.getParent(intersects[0].object)
        const info = PModel.information
        if (that.selectNodeId === info.id) { //与上次覆盖节点相同，将不会发起请求
        } else {
          that.selectNodeId = info.id
          console.log('覆盖节点模型，发起请求', info.id);
        }
      }
    } else {
      that.dom.style.cursor = "default"
    }
  }

  handleMouseDown(event: MouseEvent) {
    let vector = new THREE.Vector3(((event.clientX - that.dom.offsetLeft) / that.dom.offsetWidth) * 2 - 1, -((event.clientY - that.dom.offsetTop) / that.dom.offsetHeight) * 2 + 1, 0.5);
    vector = vector.unproject(that.camera); // 将屏幕的坐标转换成三维场景中的坐标
    that.raycaster = new THREE.Raycaster(that.camera.position, vector.sub(that.camera.position).normalize());
    const intersects = that.raycaster.intersectObjects(that.group.children); //false不检测物体的后代
    if (intersects.length > 0) {
      if (intersects[0].object) {
        that.PModel = that.getParent(intersects[0].object)
        if (that.PModel && that.PModel['information']) {
          const info = that.PModel['information']
          that.transformControls.attach(that.PModel)
          that.transformControls.showY = false
          console.log('点击了节点：', info);
        }
      }
    } else {
      that.transformControls.detach()
    }
  }

  getParent(obj) {
    if (obj && obj.parent) {
      if (obj.parent.information) {
        return obj.parent
      } else {
        return that.getParent(obj.parent)
      }
    }
  }


  // 初始化
  async init() {
    this.setScene();
    this.setRenderer();
    this.setCamera();
    this.setLight();
    this.setControls();
    this.addModel();
    // this.addFlyline();
    // this.addFlyline2();
    this.animate();
    // this.setFloor();

    window.addEventListener('resize', this.onWindowResize);
    this.dom.addEventListener('mousemove', this.handleMousemove, false)
    this.dom.addEventListener('click', this.handleMouseDown, false);
  }
}
