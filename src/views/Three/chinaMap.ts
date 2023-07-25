import axios from "axios";
import * as T from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getTextMaterial } from './shaderMaterial'
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
  private offsetX = 110
  private offsetY = 32
  private bgColor = 0x131A2C
  private raycaster: THREE.Raycaster
  private previousObj = null
  private previousObj2 = null
  private preCenter: THREE.Vector3
  private distance = [55, 15, 5]
  private level = 0
  private options = {
    depth: 1, // 定义图形拉伸的深度，默认100
    steps: 0, // 拉伸面方向分为多少级，默认为1
    bevelEnabled: true, // 表示是否有斜角，默认为true
    bevelThickness: 0, // 斜角的深度，默认为6
    bevelSize: 0, // 表示斜角的高度，高度会叠加到正常高度
    bebelSegments: 0, // 斜角的分段数，分段数越高越平滑，默认为1
    curveSegments: 0 // 拉伸体沿深度方向分为多少段，默认为1
  }
  private options2 = {
    depth: 0, // 定义图形拉伸的深度，默认100
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
    this.init()
    this.raycaster = new THREE.Raycaster()
  }
  // 设置透视相机
  setCamera() {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.dom.offsetWidth / this.dom.offsetHeight,
      0.1,
      1000
    );
    this.camera.up.set(0, 0, 1);
    this.camera.position.z = 75;
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
    this.controls.update()
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.render();
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

  setScene() {
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0xcccccc); //背景颜色
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002); //雾效果
    // 辅助三维坐标系
    const axesHelper = new THREE.AxesHelper(500);
    this.scene.add(axesHelper)
    // Grid 添加网格辅助对象
    const helper = new THREE.GridHelper(100, 30, 0x303030, 0x303030); //长度1000 划分为50份
    helper.rotation.x = Math.PI / 2
    this.scene.add(helper);
  }

  // 停止渲染
  stop() {
    window.removeEventListener('resize', this.onWindowResize)
    this.dom.addEventListener('mousemove', this.handleMousemove)
    cancelAnimationFrame(this.requestId)
  }
  drawShape(posArr: Array<Array<number>>) {
    const shape = new THREE.Shape();
    shape.moveTo(posArr[0][0] - this.offsetX, posArr[0][1] - this.offsetY);
    posArr.forEach((item: Array<number>) => {
      shape.lineTo(item[0] - this.offsetX, item[1] - this.offsetY);
    });
    return shape;
  }

  //绘制多边形
  drawExtrude(shapeObj: THREE.Shape, code: number) {
    const geometry = new THREE.ExtrudeGeometry(shapeObj, this.options); //挤压几何体
    const material1 = new THREE.MeshPhongMaterial({ // 镜面高光材质
      color: this.bgColor, // 多面体面颜色
      specular: this.bgColor //材质高光颜色
    });
    const material2 = new THREE.MeshBasicMaterial({
      color: 0x008bfb // 侧面颜色
    });
    const shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2]);
    shapeGeometryObj.name = code;
    this.group.add(shapeGeometryObj);
  }
  //绘制边界线
  drawLine(posArr: Array<Array<number>>) {
    const geometry1 = new THREE.BufferGeometry();
    const geometry2 = new THREE.BufferGeometry();
    const points1: Array<number> = []
    const points2: Array<number> = []

    posArr.forEach((item: Array<number>) => {
      points1.push(
        item[0] - this.offsetX,
        item[1] - this.offsetY,
        1.01
      );
      points2.push(
        item[0] - this.offsetX,
        item[1] - this.offsetY,
        -0.01
      );
    });
    if (points1) {
      geometry1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points1)!, 3))
      geometry2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points2)!, 3))
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x008bfb });
      const line1 = new THREE.Line(geometry1, lineMaterial);
      const line2 = new THREE.Line(geometry2, lineMaterial);
      this.lineGroup.add(line1);
      this.lineGroup.add(line2);
    }
  }
  //文本标签
  addTextPlane(textContent,position) {
    if(!position || !position.length) return
    const width = 3
    const height = 1.0
    const fontSize = 1
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.font = "bold " + fontSize + "px 宋体"
    const textWidth = tempCtx.measureText(textContent).width;
    const material = getTextMaterial({ textContent,textWidth })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 128, 128), material)
    plane.position.set(position[0] - this.offsetX, position[1] - this.offsetY,2.0)
    this.scene.add(plane)
  }
  async drawMap() {
    await axios.get('/chinaMap/china.json').then((res) => {
      this.scene.remove(this.group)
      this.scene.remove(this.lineGroup)
      this.group = new THREE.Group()
      this.lineGroup = new THREE.Group()
      this.controls.target = new THREE.Vector3(0, 0, 0)
      const features = res.data.features
      features.forEach((worldItem: { type: string, properties: { adcode: number, name:string,center }, geometry: { coordinates: Array<Array<Array<Array<number>>>> } }) => {
        worldItem.geometry.coordinates.forEach((worldChildItem: Array<Array<Array<number>>>) => {
          worldChildItem.forEach((countryItem: Array<Array<number>>) => { //每个版块的点数组
            this.drawExtrude(this.drawShape(countryItem), worldItem.properties.adcode) //传递数据画出地图的shape，返回结果再传到drawExtrude方法得到ExtrudeGeometry网格
            this.drawLine(countryItem); //传递数据画出地图边线
          });
        });
        that.addTextPlane(worldItem.properties.name,worldItem.properties.center)
      });
      that.camera.position.x = 0
      that.camera.position.y = 0
      this.group.scale.y = 1; //group里面包含所有版块网格
      this.scene.add(this.group);
      this.lineGroup.scale.y = 1; //lineGruop里面包含所有线的网格
      this.scene.add(this.lineGroup);
    })
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
            this.drawExtrude(this.drawShape(countryItem), worldItem.properties.adcode) //传递数据画出地图的shape，返回结果再传到drawExtrude方法得到ExtrudeGeometry网格
            this.drawLine(countryItem); //传递数据画出地图边线
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
    const intersects = that.raycaster.intersectObjects(that.group.children);
    if (that.previousObj) {
      that.previousObj.material[0].color = new THREE.Color(that.bgColor);
      that.previousObj.scale.set(1, 1, 1)
    }
    if (intersects[0] && intersects[0].object) {
      intersects[0].object['material'][0].color = new THREE.Color(0xffaa00);
      that.previousObj = intersects[0].object; //previousObj保存悬浮的对象，鼠标移开后恢复颜色。
      that.previousObj.scale.set(1, 1, 1.5)
    }
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
    await this.drawMap();
    window.addEventListener('resize', this.onWindowResize);
    this.dom.addEventListener('mousemove', this.handleMousemove, false)
    // this.dom.addEventListener('click', this.handleClick, false)
    // this.dom.addEventListener('contextmenu', this.handleClick, false)
    this.animate();
  }
}
