import axios from "axios";
import * as T from "three";
import TWEEN from "tween"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getFlowMaterialByY, getScanMaterial, getTextMaterial } from './shaderMaterial'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'
const THREE = T
let that: chinaMap
export default class chinaMap {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls: OrbitControls
  private requestId: number
  private group = new THREE.Group()
  private lineGroup = new THREE.Group()
  private offsetX = 110 //坐标x偏移
  private offsetY = 32 //坐标y偏移，使地图中心的位置为0,0
  private scaleMap = 1.2 //缩放倍数
  private bgColor = 0x131A2C
  private pickColor = '#ffaa00'
  private raycaster: THREE.Raycaster
  private previousObj = null
  private previousObj2 = null
  private preCenter: THREE.Vector3
  private distance = [55, 15, 5]
  private level = 0
  private shaderMaterialList = []
  private clock: THREE.Clock
  private options = {
    depth: 1, // 定义图形拉伸的深度，默认100
    steps: 0, // 拉伸面方向分为多少级，默认为1
    bevelEnabled: true, // 表示是否有斜角，默认为true
    bevelThickness: 0, // 斜角的深度，默认为6
    bevelSize: 0, // 表示斜角的高度，高度会叠加到正常高度
    bebelSegments: 0, // 斜角的分段数，分段数越高越平滑，默认为1
    curveSegments: 0 // 拉伸体沿深度方向分为多少段，默认为1
  }
  constructor(dom: HTMLElement) {
    that = this
    this.dom = dom
    this.clock = new THREE.Clock()
    this.init()
    this.raycaster = new THREE.Raycaster()
  }
  // 设置透视相机
  setCamera() {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.dom.offsetWidth / this.dom.offsetHeight,
      1,
      4000
    );
    this.camera.position.set(0, 50, 0); //(x,y,z)
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.renderer.setClearColor(0x041336);
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置控制器
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement) //轨道控制器
    this.controls.update();
    this.controls.enableDamping = true; // 阻尼（惯性）是否启用
    this.controls.dampingFactor = 0.05; // 阻尼系数
    // this.controls.screenSpacePanning = false; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
    // controls.minDistance = 50; //移动最小距离
    this.controls.maxDistance = 1500; //移动最大距离
    // this.controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
    this.controls.maxPolarAngle = Math.PI * 0.325;
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
    this.controls.update()
    this.shaderMaterialList.forEach((material: THREE.ShaderMaterial) => {
      material.uniforms.time.value = this.clock.getElapsedTime()
    })
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.render();
    TWEEN.update();
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
    }
  }

  addGUI() {
    const gui = new GUI();
    this.dom.appendChild(gui.domElement)
    gui.domElement.style.position = 'absolute'
    gui.domElement.style.right = '0px'
    const parameters = {
      color: 0xffaa00
    }
    gui.addColor(parameters, 'color')
    .name('color')
    .onChange((value) => this.guiUpdate(value))
  }
  guiUpdate(value) {
    this.pickColor = value
  }

  setScene() {
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0xcccccc); //背景颜色
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002); //雾效果
    // 辅助三维坐标系
    const axesHelper = new THREE.AxesHelper(500);
    // this.scene.add(axesHelper)
    // Grid 添加网格辅助对象
    const helper = new THREE.GridHelper(100, 30, 0x303030, 0x303030); //长度1000 划分为50份
    // helper.rotation.x = Math.PI / 2
    // this.scene.add(helper);
  }

  // 停止渲染
  stop() {
    cancelAnimationFrame(this.requestId)
    window.removeEventListener('resize', this.onWindowResize)
    this.dom.removeEventListener('mousemove', this.handleMousemove)
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
  
  // 扩散扫描 圆
  addDiffuseCircle() {
    const geometry = new THREE.CircleGeometry(40, 128, 0); //半径，分段
    const scanMaterial = getScanMaterial({repeat:4,thickness:0.1})
    this.shaderMaterialList.push(scanMaterial)
    const circle = new THREE.Mesh(geometry, scanMaterial);
    circle.rotation.x = -Math.PI / 2
    circle.position.y = 0.1
    this.scene.add(circle);
  }
  drawShape(shapeArr: Array<Array<Array<number>>>) {
    const arr = []
    shapeArr.forEach((posArr: Array<Array<number>>) => {
      const shape = new THREE.Shape();
      shape.moveTo(posArr[0][0] - this.offsetX, posArr[0][1] - this.offsetY);
      posArr.forEach((item: Array<number>) => {
        shape.lineTo(item[0] - this.offsetX, item[1] - this.offsetY);
      });
      arr.push(shape)
    })
    return arr;
  }

  //绘制多边形
  drawExtrude(geometrys: Array<Array<Array<number>>>, properties: {adcode:number,name:string,center}) {
    const group = new THREE.Group()
    const shapeArr = this.drawShape(geometrys)
    this.drawLine(group, geometrys); //传递数据画出地图边线
    this.addCyliner(group, properties.center)
    this.addTextPlane(group, properties.name, properties.center)
    const geometry = new THREE.ExtrudeGeometry(shapeArr, this.options); //挤压几何体
    const material1 = new THREE.MeshPhongMaterial({ // 镜面高光材质
      color: this.bgColor, // 多面体面颜色
      specular: this.bgColor //材质高光颜色
    });
    const material2 = new THREE.MeshBasicMaterial({
      color: 0x008bfb // 侧面颜色
    });
    const shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2]);
    shapeGeometryObj.name = properties.adcode;
    shapeGeometryObj.children.push(group)
    return shapeGeometryObj
  }
  //绘制边界线
  drawLine(group, Arr: Array<Array<Array<number>>>) {
    Arr.forEach((posArr: Array<Array<number>>) => {
      const geometry1 = new THREE.BufferGeometry();
      const geometry2 = new THREE.BufferGeometry();
      const points1: Array<number> = []
      const points2: Array<number> = []
      posArr.forEach((item: Array<number>) => {
        points1.push(
          item[0] - this.offsetX,
          1.01,
          (-item[1] + this.offsetY)*this.scaleMap,
        );
        points2.push(
          item[0] - this.offsetX,
          -0.01,
          (-item[1] + this.offsetY)*this.scaleMap,
        );
      });
      if (points1.length) {
        geometry1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points1)!, 3))
        geometry2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points2)!, 3))
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x008bfb });
        const line1 = new THREE.Line(geometry1, lineMaterial);
        const line2 = new THREE.Line(geometry2, lineMaterial);
        group.add(line1,line2)
      }
    })
  }
  //文本标签
  addTextPlane(group, textContent,position) {
    if(!position || !position.length) return
    const width = textContent.length/1.5
    const height = 0.8
    const fontSize = 1
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.font = "bold " + fontSize + "px 宋体"
    const textWidth = tempCtx.measureText(textContent).width;
    const material = getTextMaterial({ textContent,textWidth })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 128, 128), material)
    plane.position.set(position[0] - this.offsetX, 1.4, -position[1] + this.offsetY)
    plane.position.z = this.scaleMap * plane.position.z
    group.add(plane)
  }
  async drawMap() {
    await axios.get('/chinaMap/china.json').then((res) => {
      this.scene.remove(this.group)
      this.scene.remove(this.lineGroup)
      this.group = new THREE.Group()
      this.lineGroup = new THREE.Group()
      // this.controls.target = new THREE.Vector3(0, 0, 0)
      const features = res.data.features
      features.forEach((worldItem: { type: string, properties: { adcode: number, name:string,center }, geometry: { coordinates: Array<Array<Array<Array<number>>>> } }) => {
        const grometrys = []
        worldItem.geometry.coordinates.forEach((worldChildItem: Array<Array<Array<number>>>) => {
          const points = []
          worldChildItem.forEach((countryItem: Array<Array<number>>) => { //每个版块的点数组
            points.push(...countryItem)
          });
          grometrys.push(points)
        });
        const mesh = this.drawExtrude(grometrys, worldItem.properties) //传递数据画出地图的shape，返回结果再传到drawExtrude方法得到ExtrudeGeometry网格
        this.group.add(mesh)
      });
      this.group.scale.y = this.scaleMap; //group里面包含所有版块网格
      this.group.rotation.x = -Math.PI / 2
      this.scene.add(this.group);
    })
  }
  addCyliner(group, position) {
    if(!position || !position.length) return
    const h = Math.random()*4
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, h, 12, 1, true);//true上下底面不封闭
    const flowMaterial = getFlowMaterialByY({ height: h, thickness: 0.98, speed: 0.5, repeat: 2 }) //沿Y轴的流动材质
    const cylinder = new THREE.Mesh(geometry, flowMaterial);
    this.shaderMaterialList.push(flowMaterial)
    cylinder.position.set(position[0] - this.offsetX, h/2+1, (-position[1] + this.offsetY)*1.2-0.2)
    group.add(cylinder)
  }

  async drawMap2(code: string, num: number) {
    if (this.level === 0 && num === -1) {
      return
    }
    if (this.level === 2 && num === 1) {
      return
    }
    this.level += num
    that.camera.position.z = that.distance[that.level]
    if (num === -1) {
      if (this.level === 0) {
        this.drawMap()
        return
      } else {
        code = code.toString().slice(0, (this.level) * 2).padEnd(6, '0')
      }
    }
    await axios.get(`https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`).then((res) => {
      this.scene.remove(this.group)
      this.scene.remove(this.lineGroup)
      this.group = new THREE.Group()
      this.lineGroup = new THREE.Group()
      const features = res.data.features
      features.forEach((worldItem: { type: string, properties: { adcode: number }, geometry: { coordinates: Array<Array<Array<Array<number>>>> } }) => {
        worldItem.geometry.coordinates.forEach((worldChildItem: Array<Array<Array<number>>>) => {
          worldChildItem.forEach((countryItem: Array<Array<number>>) => { //每个版块的点数组
            // this.drawExtrude(this.drawShape(countryItem), worldItem.properties.adcode) //传递数据画出地图的shape，返回结果再传到drawExtrude方法得到ExtrudeGeometry网格
            // this.drawLine(countryItem); //传递数据画出地图边线
          });
        });
      });
      that.camera.position.x = that.preCenter.x
      that.camera.position.y = that.preCenter.y
      this.group.scale.y = 1; //group里面包含所有版块网格
      this.scene.add(this.group);
      this.lineGroup.scale.y = 1; //lineGruop里面包含所有线的网格
      this.scene.add(this.lineGroup);
    }).catch((error) => {
      console.log(error);
    })
  }

  handleMousemove(event: MouseEvent) {
    event.preventDefault();
    const mouse = new THREE.Vector2(0, 0);
    mouse.x = ((event.clientX - that.dom.offsetLeft) / that.dom.offsetWidth) * 2 - 1;
    mouse.y = - ((event.clientY - that.dom.offsetTop) / that.dom.offsetHeight) * 2 + 1;
    that.raycaster.setFromCamera(mouse, that.camera);
    const intersects = that.raycaster.intersectObjects(that.group.children, false);
    if (intersects[0] && intersects[0].object ) {
      // console.log(intersects[0].object);
      if (that.previousObj !== intersects[0].object){ //获取到了与上次不同的对象
          //先把之前的scale修改为初始值
          if(that.previousObj) { //之前有获取的对象
            const obj2 = that.previousObj
            that.previousObj = null
            obj2.material[0].color = new THREE.Color(that.bgColor);
            that.animateMap(obj2, 0.0, 200, 'z')
            that.animateMap(obj2.children[0], 0.0, 200, 'y')
          }
          intersects[0].object['material'][0].color = new THREE.Color(that.pickColor); //选中的面板颜色
          that.previousObj = intersects[0].object; //previousObj保存悬浮的对象，鼠标移开后恢复颜色。
          const obj = intersects[0].object
          that.animateMap(obj, 0.5, 160, 'z')
          that.animateMap(obj.children[0], 0.5, 160, 'y')
      }
    } else if(that.previousObj) { //鼠标没有获取到对象,并且之前有获取的对象
      const obj = that.previousObj
      that.previousObj = null
      obj.material[0].color = new THREE.Color(that.bgColor);
      that.animateMap(obj, 0.0, 200, 'z')
      that.animateMap(obj.children[0], 0.0, 200, 'y')
    }
  }

  animateMap(obj,scaleH,time,axis) { //current1相机当前位置,target1相机目标位置，current2控制器当前位置，target2控制器目标位置
    const tween = new TWEEN.Tween({
      scale: obj.position[axis],
    });
    tween.to({
      scale: scaleH,
    }, time);
    tween.onUpdate(function () {
      obj.position[axis] = this.scale;
    })
    tween.start();
  }

  handleClick(event: MouseEvent) {
    event.preventDefault();
    if (event.type === 'contextmenu' && that.previousObj2) {
      that.controls.target = that.preCenter
      that.drawMap2(that.previousObj2.name, -1)
      return
    }
    const mouse = new THREE.Vector2(0, 0);
    mouse.x = ((event.clientX - that.dom.offsetLeft) / that.dom.offsetWidth) * 2 - 1;
    mouse.y = - ((event.clientY - that.dom.offsetTop) / that.dom.offsetHeight) * 2 + 1;
    that.raycaster.setFromCamera(mouse, that.camera);
    const intersects = that.raycaster.intersectObjects(that.group.children);
    if (intersects[0] && intersects[0].object) {
      that.previousObj2 = intersects[0].object
      that.preCenter = that.controls.target
      that.controls.target = that.previousObj2.geometry.boundingSphere.center
      that.drawMap2(that.previousObj2.name, 1)
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
    this.addDiffuseCircle();
    this.addGUI();
    await this.drawMap();
    window.addEventListener('resize', this.onWindowResize);
    this.dom.addEventListener('mousemove', this.handleMousemove, false)
    // this.dom.addEventListener('click', this.handleClick, false)
    // this.dom.addEventListener('contextmenu', this.handleClick, false)
    this.animate();
  }
}
