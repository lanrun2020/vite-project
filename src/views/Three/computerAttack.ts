// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as T from "three";
import * as d3 from "d3"
import floorImg from '../../assets/woodFloor2.jpg'
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
    this.controls.maxPolarAngle = Math.PI / 2; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }

  // 渲染
  render() {
    if (this.renderer && this.labelRenderer && this.scene && this.camera) {
      // if (this.camera.position.y<0){this.camera.position.set(this.camera.position.x,0,this.camera.position.z)}
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
      const ambient = new THREE.AmbientLight(0xbbbbbb,0.1);
      this.scene.add(ambient);
      const directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(10, -50, 300);
      this.scene.add(directionalLight);

      const pointLight = new THREE.PointLight( 0xffffff, 1 );
			pointLight.add( new THREE.Mesh( new THREE.SphereGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
      pointLight.position.set(0,50,0)
			this.scene.add( pointLight );

      // const rectLight3 = new THREE.RectAreaLight( 0xAFFFFF, 10, 50, 10 );
			// 	rectLight3.position.set( 0, 0, 25 );
			// 	this.scene.add( rectLight3 );
			// 	this.scene.add( new RectAreaLightHelper( rectLight3 ) );
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
    // const axesHelper = new THREE.AxesHelper(500); //辅助三维坐标系
    // this.scene.add(axesHelper)

    const rgbeLoader = new RGBELoader();
    //资源较大，使用异步加载
    rgbeLoader.loadAsync(`/model/home.hdr`).then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      //将加载的材质texture设置给背景和环境
      this.scene.background = texture;
      this.scene.environment = texture;
    });
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
    res.forEach((item) => {
      const copy_id = item.id
      item.id = item.name
      item.copy_id = copy_id
      const index = nodes.filter((node)=>{
        return node.copy_id === copy_id
      })
      links.push({
        source:item.id,
        target:item.to_node
      })
      if(!index.length){
        nodes.push(item)
      }
    })
    links.forEach((link) => {
      const index = nodes.filter((node)=>{
        return node.name === link.target
      })
      if(index.length) {
        newlinks.push(link)
      }
    })
    const force = d3.forceSimulation().nodes(nodes).force("link",d3.forceLink(newlinks).id(d => d.id)).alpha(0).alphaDecay(1) 
    console.log(force)
    newlinks.forEach((link)=>{
      this.addLine(link.source.x,link.source.y,link.target.x,link.target.y)
    })
    let model = null
    let model2 = null
    const loader = new GLTFLoader();
    loader.load(`/model/class6.glb`, function (gltf: any) {
      model = gltf.scene;
      nodes.forEach((node)=>{
        if(node.category === 'Host'){
          const mc = model.clone()
          mc.position.set(node.x, -1, node.y)
          that.addLabel(mc, 'IP:' + node.name)
          that.group.add(mc)
        }
      })
      // model.scale.set(1, 1, 1)
    });
    loader.load(`/model/router2.glb`,function(gltf: any){
      model2 = gltf.scene;
      // model2.scale.set(5, 5, 5)
      nodes.forEach((node)=>{
        if(node.category === 'Switch'){
          const mc = model2.clone()
          mc.position.set(node.x, 2, node.y)
          that.addLabel(mc, 'IP:' + node.name)
          that.group.add(mc)
        }
      })
    })
    // nodes.map((node)=>{
    //   const mc = node.category === 'Host' ? model.clone() : model2.clone()
    //     mc.position.set(node.x, 0, node.y)
    //     that.addLabel(mc, 'IP:' + node.name)
    //     that.group.add(mc)
    // })
    that.scene.add(that.group)
  }

  addLabel(object: THREE.Mesh, text: string) {
    const div = document.createElement("div");
    div.className = "computer-box-label";
    div.textContent = text;
    const earthLabel = new CSS2DObject(div);
    earthLabel.position.set(-1.5, 3, -0.5);
    object.add(earthLabel);
  }

  addFlyline(x1,y1,x2,y2) {
    // 平滑曲线
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x1, 2, y1),
      new THREE.Vector3((x1+x2)/2, 5, (y1+y2)/2),
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

  addLine(x1,y1,x2,y2) {
    // 三维2次贝赛尔曲线
    // const curve2 = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-20, 2, -20),
    //   new THREE.Vector3(0, 20, 0),
    //   new THREE.Vector3(20, 2, 20)
    // );
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x1, 2, y1),
      new THREE.Vector3((x1+x2)/2, 2, (y1+y2)/2),
      new THREE.Vector3(x2, 2, y2),
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
      const geometry = new THREE.BoxGeometry(100, 2, 100); //创建一个立方体几何对象Geometry
      const texture = new THREE.TextureLoader().load(
        floorImg
      ); //首先，获取到纹理
      // 设置阵列模式
      texture.wrapS = THREE.repeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // uv两个方向纹理重复数量
      texture.repeat.set(15, 15);
      // 偏移效果
      // texture.offset = new THREE.Vector2(0.5, 0.5)
      const material1 = new THREE.MeshBasicMaterial({ map: texture })//side 镜像翻转
      // const material1 = new THREE.MeshStandardMaterial({
      //   roughness: 0.2,//粗糙度 0平滑镜面反射  1完全漫反射
      //   metalness: 1 //金属度 非金属0 金属1
      // });

      // const material2 = new THREE.MeshStandardMaterial({
      //   roughness: 0.05,//粗糙度 0平滑镜面反射  1完全漫反射
      //   metalness: 1 //金属度 非金属0 金属1
      // });
      // const material2 = new THREE.MeshBasicMaterial({
      //   color: 0x37ffed // 侧面颜色
      // });
      const texture2 = new THREE.Texture( this.generateTexture() );
      const cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: texture2, refractionRatio: 0.98, reflectivity: 0.9 } );
			const cubeMaterial2 = new THREE.MeshPhongMaterial( { color: 0xccfffd, envMap: texture2, refractionRatio: 0.985 } );
			const material2 = new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x666666, emissive: 0x000000, shininess: 10, opacity: 0.1, transparent: true } )
      const material = [material2, material2, material1, material2, material2, material2]; //然后创建一个phong材质来处理着色，并传递给纹理映射
      const cube1 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      // cube1.material.map.repeat.set(20,20)
      cube1.position.set(0, -2, 0)
      this.scene.add(cube1); //网格模型添加到场景中
    }
  }
  // 创建canvas贴图
  generateTexture() {

    const canvas = document.createElement( 'canvas' );
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext( '2d' )!;
    const image = context.getImageData( 0, 0, 256, 256 );

    let x = 0, y = 0;

    for ( let i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++ ) {

      x = j % 256;
      y = ( x === 0 ) ? y + 1 : y;

      image.data[ i ] = 255;
      image.data[ i + 1 ] = 255;
      image.data[ i + 2 ] = 255;
      image.data[ i + 3 ] = Math.floor( x ^ y );

    }
    context.putImageData( image, 0, 0 );
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
