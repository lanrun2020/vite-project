// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as T from "three";
import * as d3 from "d3";
import ForceGraph from 'force-graph';
import floorImg from '../../assets/floor5.jpeg'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import {
  CSS2DRenderer,
  CSS2DObject
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { InitFlyLine } from "@/utils/flyLine";
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import pointPng from '@/assets/point.png';
import arrow1 from '@/assets/666.png';
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
  private tubeMaterial2: any
  private beIntersectObject = []
  private transformControls: any
  private model: any
  private clock!: THREE.Clock
  private time = -10
  private controls: any
  private requestId: any
  private flyManager: InitFlyLine
  private texture: any
  private selectNodeId:null
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
    this.camera = new THREE.PerspectiveCamera(50, this.dom.offsetWidth / this.dom.offsetHeight, 0.1, 4000);
    this.camera.position.set(0, 24, 32); //(x,y,z)
    this.scene.add(this.camera);
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha:true,
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
    this.controls.minDistance = 2; //移动最小距离
    this.controls.maxDistance = 300; //移动最大距离
    this.controls.maxPolarAngle = Math.PI / 2.1 ; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }

  // 渲染
  render() {
    if (this.renderer && this.labelRenderer && this.scene && this.camera) {
      // if (this.camera.position.y<0){this.camera.position.set(this.camera.position.x,0,this.camera.position.z)}
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
      if(this.tubeMaterial2){
        // console.log(this.clock.getElapsedTime());
        this.tubeMaterial2.uniforms.time.value = this.clock.getElapsedTime()
      }
    }
  }

  // 动画
  animate() {
    // console.log(this.clock.getElapsedTime());
    this.requestId = requestAnimationFrame(() => this.animate());
    this.controls.update()
    // 设置画布的大小
    this.flyManager.animation()
    // this.time = this.clock.getElapsedTime()
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.render();
  }

  // 设置光源
  setLight() {
    if (this.scene) {
      // 环境光
      const ambient = new THREE.AmbientLight(0xffffff, 1);
      this.scene.add(ambient);
      const directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(0, 0, 100);
      this.scene.add(directionalLight);

      const pointLight = new THREE.PointLight( 0xffffff, 1 );
      // pointLight.add( new THREE.Mesh( new THREE.SphereGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) ) );
      pointLight.position.set(-50,5,-100)
      this.scene.add( pointLight );
      const pointLight2 = new THREE.PointLight( 0xffffff, 1 );
      // pointLight2.add( new THREE.Mesh( new THREE.SphereGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) ) );
      pointLight2.position.set(50,5,-100)
      this.scene.add( pointLight2 );

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
    // Grid 添加网格辅助对象
    // const helper = new THREE.GridHelper(100, 50, 0x303030, 0x303030); //长度1000 划分为50份
    // this.scene.add(helper);
    const axesHelper = new THREE.AxesHelper(500); //辅助三维坐标系
    this.scene.add(axesHelper)

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
    const links = []
    const newlinks = []
    const nodes = []
    // const loader2 = new GLTFLoader();
    // loader2.load(`/model/class6.glb`, function (gltf: any) {
    //   const model = gltf.scene;
    //   // model.rotation.y = Math.PI / 2
    //   // that.addLabel(model, 'computer', 1)
    //   that.group.add(model)
    // })
    res.forEach((item) => {
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
    // console.log(links);
    // console.log(newlinks);

    // const force = d3.forceSimulation().nodes(nodes).force("link",d3.forceLink(newlinks).id(d => d.id)).force("x",d3.forceX()).force("y",d3.forceY()).force('charge',d3.forceManyBody()).stop()
    // force.tick(100)
    const graph = ForceGraph()(document.getElementById('graph')).graphData({ nodes, links: newlinks }).warmupTicks(300)
    // console.log(nodes,newlinks);
    setTimeout(() => {
      const zoomNumY = 1
      const zoomNumX = 1
      // const zoomNumY = 3.6
      // const zoomNumX = 3
      let model = null
      let model2 = null
      const loader = new GLTFLoader();
      loader.load(`/model/999.glb`, function (gltf: any) {
        model = gltf.scene;
        model.scale.set(2, 2, 2)
        // model.rotation
        // model.rotation.y = Math.PI / 2
        nodes.forEach((node) => {
          if (node.category === 'Host') {
            // const mc = model.clone()
            // mc.information = node
            // mc.position.set(node.y / zoomNumY + 0.2, 0.8, node.x / zoomNumX + 0.2)
            // that.group.add(mc)
            const mroot = model.clone()
            mroot.position.set(node.y, 0, node.x)
            mroot.information = node
            const bbox = new THREE.Box3().setFromObject(mroot)
            const cent = bbox.getCenter(new THREE.Vector3())
            const size = bbox.getSize(new THREE.Vector3())
            const maxAxis = Math.max(size.x, size.y, size.z)
            mroot.scale.multiplyScalar(10.0 / maxAxis) // 模型加载为2个单位大小
            bbox.setFromObject(mroot)
            bbox.getCenter(cent)
            bbox.getSize(size)
            mroot.position.copy(cent)
            mroot.position.y -= (size.y * 0.5);
            that.scene.add(mroot)
            that.addLabel(mroot, node.name, 1)
          }
        })
      });
      loader.load(`/model/router6.glb`, function (gltf: any) {
        model2 = gltf.scene;
        model2.scale.set(2,2,2)
        model2.rotation.y = Math.PI / 2
        nodes.forEach((node) => {
          if (node.category === 'Switch') {
            const mroot = model2.clone()
            mroot.position.set(node.y, 0, node.x)
            mroot.information = node
            const bbox = new THREE.Box3().setFromObject(mroot)
            const cent = bbox.getCenter(new THREE.Vector3())
            const size = bbox.getSize(new THREE.Vector3())
            const maxAxis = Math.max(size.x, size.y, size.z)
            mroot.scale.multiplyScalar(10.0 / maxAxis) // 模型加载为2个单位大小
            bbox.setFromObject(mroot)
            bbox.getCenter(cent)
            bbox.getSize(size)
            mroot.position.copy(cent)
            mroot.position.y += (size.y * 0.5);
            that.scene.add(mroot)
            that.addLabel(mroot, node.name, 1)
          }
        })
      })
      newlinks.forEach((link,index) => {
        this.addLine(link.source.y / zoomNumY, link.source.x / zoomNumX, link.target.y / zoomNumY, link.target.x / zoomNumX)
      })
      that.scene.add(that.group)
    }, 100)
  }

  addLabel(object: THREE.Mesh, text: string, height) {
    const div = document.createElement("div");
    div.className = "computer-box-label";
    div.textContent = text;
    const earthLabel = new CSS2DObject(div);
    earthLabel.position.set(0, height, 1);
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
    
  addLine(x1, y1, x2, y2) {
    //平滑曲线
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x1, 4, y1),
      new THREE.Vector3((x1 + x2) / 2, Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 6, (y1 + y2) / 2),
      new THREE.Vector3(x2, 4, y2),
    ]);
    //getPoints是基类Curve的方法，返回一个vector3对象作为元素组成的数组
    const points = curve.getPoints(50); //分段数100，返回101个顶点
    const tubeGeometry = new THREE.TubeGeometry(curve, 1000, 0.03, 100, false); //path路径 tubularSegments分段 radius半径 radialSegments管道横截面分段 close是否闭合
    // const material6 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const tubeMaterial = new THREE.MeshPhongMaterial({
      map: this.texture,
      transparent: true,
      color: 0x47d8fa,
      side: THREE.DoubleSide,
      //opacity: 0.4,
    });
    const positions = []
    points.forEach((point) => {
      positions.push(point.x, point.y, point.z)
    })
    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    const mesh = new THREE.Mesh(tubeGeometry, this.tubeMaterial2);
    this.scene.add(mesh);
    // const geometry = new THREE.BufferGeometry()
    // const geometry = new LineGeometry();
    // geometry.setPositions(positions);
    // geometry.setFromPoints(points);
    // geometry.setColors(255,0,0)
    const material2 = new THREE.LineBasicMaterial({
      color: 'rgb(27, 180, 176)',
      transparent: true,
      opacity: 1
    })
    const matLine = new LineMaterial({
      color: 0x00fdf5,
      linewidth: 0.02, // in world units with size attenuation, pixels otherwise
      vertexColors: false,
      //resolution:  // to be set by renderer, eventually
      dashed: false,
      alphaToCoverage: true,

    });
    // const lineMaterial = new THREE.LineBasicMaterial({ color: '#ff0000', side: THREE.DoubleSide })
    const line = new THREE.Line(geometry, matLine)
    // const line = new Line2(geometry, customMaterial);
    // this.scene.add(line)
  }

  // 创建地板
  setFloor() {
    if (this.scene) {
      const radius = 150
      // const geometry = new THREE.BoxGeometry(200, 2, 200); //创建一个立方体几何对象Geometry
      const geometry = new THREE.CylinderGeometry( radius, radius - 0.5, 2, 180 );//圆台
      const geometry2 = new THREE.CylinderGeometry( radius - 1, radius - 1.5, 2, 180 );//圆台
      const geometry3 = new THREE.RingGeometry( radius - 1.5, radius -1, 180 );//圆环
      const texture = new THREE.TextureLoader().load(
        floorImg
      ); //首先，获取到纹理
      // 设置阵列模式
      texture.wrapS = THREE.repeatWrapping;
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
      this.scene.add(cube1); //网格模型添加到场景中
      this.scene.add(cube2); //网格模型添加到场景中
      this.scene.add(cube3);
    }
  }
  // 创建canvas贴图
  generateTexture() {

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    const image = context.getImageData(0, 0, 256, 256);

    let x = 0, y = 0;

    for (let i = 0, j = 0, l = image.data.length; i < l; i += 4, j++) {

      x = j % 256;
      y = (x === 0) ? y + 1 : y;

      image.data[i] = 255;
      image.data[i + 1] = 255;
      image.data[i + 2] = 255;
      image.data[i + 3] = Math.floor(x ^ y);

    }
    context.putImageData(image, 0, 0);
    // this.dom.appendChild(canvas)
    return canvas;

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
    const intersects = that.raycaster.intersectObjects(that.group.children)
    if (intersects.length > 0) {
      that.dom.style.cursor= "pointer"
      if(intersects[0].object) {
        const info = that.getInfo(intersects[0].object)
        // console.log(info);
        if(that.selectNodeId === info.id){
          // console.log('none');
        }else{
          that.selectNodeId = info.id
          // console.log('发起请求');
        }
      }
    }else{
      that.dom.style.cursor= "default"
    }
  }

  handleMouseDown(event: any) {
    let vector = new THREE.Vector3(((event.clientX - that.dom.offsetLeft)  / that.dom.offsetWidth) * 2 - 1, -((event.clientY - that.dom.offsetTop) / that.dom.offsetHeight) * 2 + 1, 0.5);
    vector = vector.unproject(that.camera); // 将屏幕的坐标转换成三维场景中的坐标
    that.raycaster = new THREE.Raycaster(that.camera.position, vector.sub(that.camera.position).normalize());
    const intersects = that.raycaster.intersectObjects(that.group.children);
    // if (that.previousObj){
      // that.previousObj.material = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x666666, emissive: 0x000000, shininess: 10, opacity: 1, transparent: true })
    // }
    if (intersects.length > 0) {
      if(intersects[0].object){
        const info = that.getInfo(intersects[0].object)
        console.log(info);
      }
    }
  }

  getInfo(obj) {
    if(obj && obj.parent){
      if(obj.parent.information){
        return obj.parent.information
      } else {
        return that.getInfo(obj.parent)
      }
    }
  }


  // 初始化
  async init() {
    const textureLoader = new THREE.TextureLoader();
    this.texture = textureLoader.load(arrow1); //./ZS箭头.svg  ./arrow.jpg
    // 设置阵列模式为 RepeatWrapping
    this.texture.wrapS = THREE.RepeatWrapping
    this.texture.wrapT = THREE.RepeatWrapping

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
            // vec4 v_color = vec4(color,u_opacity);
              // if( u_index < time + u_len && u_index > time){
              // }
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              // vertexColors = true;
          }
          `,
      fragmentshader: `
      varying vec2 vUv;
          uniform sampler2D u_map;
          uniform float u_opacity;
          uniform vec3 color;
          uniform float isTexture;
          uniform float time;
          uniform float speed;
          uniform float repeatX;
          void main() {
              vec4 u_color = vec4(color,u_opacity);
              // gl_FragColor = u_color * texture2D(u_map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
              gl_FragColor =u_color * texture2D(u_map, vec2(fract(vUv.x * repeatX - time*speed),vUv.y));

              // gl_FragColor = vec4(1.0, 1.0, 0, 1.0);
          }`
  }
    this.tubeMaterial2 = new THREE.ShaderMaterial({
      uniforms:{
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
        u_map: {
          value: this.texture,
          type: "t2"
        },
        repeatX: {
          value: 5.0,
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
      transparent: true,
      // depthTest: false,
      vertexShader: tubeShader.vertexshader,
      fragmentShader: tubeShader.fragmentshader
    })
    this.setScene();
    this.setRenderer();
    this.setCamera();
    this.setLight();
    this.setControls();
    this.addModel();
    // this.addLine();
    // this.addFlyline();
    // this.addFlyline2();
    this.setFloor();
    this.animate();
    window.addEventListener('resize', this.onWindowResize);
    this.dom.addEventListener('mousemove', this.handleMousemove, false)
    this.dom.addEventListener('click', this.handleMouseDown, false);
  }
}
