// 飞机航线
import Cesium from "@/utils/importCesium"
import { addPlaneLine } from "./addPlaneLine"
let renderId: any
let primitivesLine: any
let primitivesModelList: any[] = []
let handler: any
let timer:any
const lineNum = 100 //一种轨迹的数量
const alltime = 50000 //实时数据时间段长度，秒
let start: any; //起始时间
let stop: any //终止时间 一个点一秒
let clockCUR: any
export const addPlaneLineByTime = (viewer: any, active: boolean) => {
  if (active) {
    clockCUR = new Cesium.Clock({
      startTime : viewer.clock.currentTime.clone(),
      currentTime : viewer.clock.currentTime.clone(),
      stopTime : Cesium.JulianDate.addSeconds(viewer.clock.currentTime.clone(), alltime, new Cesium.JulianDate()),
      clockRange : Cesium.ClockRange.LOOP_STOP,
      clockStep : Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
      canAnimate: false
    });
    clockCUR.shouldAnimate = true

    start = viewer.clock.currentTime
    // stop = Cesium.JulianDate.addSeconds(start, alltime, new Cesium.JulianDate()) //终止时间 一个点一秒
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({})
    viewer.scene.globe.depthTestAgainstTerrain = true;
    //时间段循环
    // viewer.clock.startTime = start.clone();
    // viewer.clock.stopTime = stop.clone();
    // viewer.clock.currentTime = start.clone();
    // viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    // viewer.timeline.zoomTo(start, stop);
    // viewer.clock.shouldAnimate = true
    // viewer.clock.canAnimate = false
    const airList = new Array(lineNum).fill('').map((item, index) => {
      const lon = Math.random() * 180 - 90
      const lat = Math.random() * 90 - 45
      return {
        id: index,
        lon,
        lat,
      }
    })
    const airList2 = new Array(lineNum).fill('').map((item, index) => {
      const lon = Math.random() * 180 - 90
      const lat = Math.random() * 90 - 45
      return {
        id: index,
        lon,
        lat,
      }
    })
    primitivesLine = viewer.scene.primitives.add(new Cesium.PolylineCollection())
    const pathList = [ //轨迹数据
      {
        url: `/model/CesiumAir.glb`,
        scale: 100,
        minimumPixelSize: 50,
        airList: airList,
      },
      {
        url: `/model/airplane02.glb`,
        scale: 100,
        minimumPixelSize: 50,
        airList: airList2,
      }
    ]
    let pathStartIndex = 0
    primitivesModelList = []
    pathList.forEach((path, index) => {
      path.airList.forEach((item) => {
        addPlane(item, primitivesLine, pathStartIndex, index, primitivesModelList, path) //item轨迹， num轨迹点数量，start轨迹起始时间，primitives用于存放轨迹primitive
      })
      pathStartIndex += path.airList.length
    })
    primitivesModelList.forEach((model) => {
      viewer.entities.add(model)
    })
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let pickedPath: any[] = []
    handler.setInputAction((clickEvent: any) => {
      const pickModel = viewer.scene.pick(clickEvent.position);
      if (pickModel && pickModel.id) {
        if (pickModel.id.model) { //点击的是模型
          viewer.trackedEntity= pickModel.id
        } else {//点击的是路径线
          pickedPath.forEach((path) => {
            path._material.uniforms.color = new Cesium.Color(0, 1, 0, 1)
          })
          pickedPath = []
          pickModel.primitive._material.uniforms.color = new Cesium.Color(1, 0, 0, 1)
          pickedPath.push(pickModel.primitive)
        }
      } else { //undefined
        viewer.trackedEntity = undefined
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    const tick = () => {
      primitivesLine._polylines.forEach((polyline: any, index: number) => {
        clockCUR.currentTime = Cesium.JulianDate.fromDate(new Date())
        polyline._material.uniforms.curP = polyline.id.propertyIndex.getValue(clockCUR.currentTime)//查当时时刻，飞机运行到第几个点
        primitivesModelList[index].position = polyline.id.propertyPosition
      })
      renderId = Cesium.requestAnimationFrame(tick);
    }
    tick()
    const timeTick = () => {
      primitivesLine._polylines.forEach((polyline: any) => {
        const time = Cesium.JulianDate.addSeconds(
          start,
          polyline.id.num,//第一个点时间差为0
          new Cesium.JulianDate()
        );
        polyline.id.num += 1
        const c3 = new Cesium.Cartesian3.fromDegrees(polyline.id.lon + Math.random()*2,polyline.id.lat + Math.random()*2,50000)
        polyline.id.pointList.push(c3)
        polyline.positions = polyline.id.pointList
        polyline.id.propertyPosition.addSample(time,c3)
        polyline.id.propertyIndex.addSample(time, polyline.id.num - 1)
        polyline._material.uniforms.allP = polyline.id.num - 1 //目前轨迹上所有点数量
      })
    }
    timeTick()
    timeTick()//初始加载时，需要至少两个点

    let count = 2
    timer = setInterval(() => { //一秒查询一次
      if(count>alltime){
        clearInterval(timer)
      }else{
        count ++
        timeTick()
      }
    },1000)
    // addPlaneLine(viewer,active)

  } else {
    clearInterval(timer)
    cancelAnimationFrame(renderId)
    // viewer.clock.shouldAnimate = false
    // viewer.clock.currentTime = start.clone();
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    primitivesLine.removeAll()
    viewer.scene.primitives.remove(primitivesLine)
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
    handler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL)//移除事件
    primitivesModelList.forEach((primitives) => {
      viewer.scene.primitives.remove(primitives)
    })
  }
}

// 根据点坐标集合将坐标点加上时间参数
const computeCirclularFlight2 = () => {
  const propertyPosition = new Cesium.SampledPositionProperty();
  const propertyIndex = new Cesium.SampledProperty(Number)
  return {
    propertyPosition,
    propertyIndex
  };
}

const addPlane = (item: any, primitives: any, startIndex: number, pathTypeIndex: number, primitivesModelLsit2:any,path:any) => {
  //轨迹起点，终点
  const lon = item.lon
  const lat = item.lat
  const pointList:any = []
  const { propertyPosition, propertyIndex } = computeCirclularFlight2()
  const orientation = new Cesium.VelocityOrientationProperty(propertyPosition)
  const source = `
    uniform vec4 color;\n
    uniform float curP;\n
    uniform float allP;\n
    czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        float dis = materialInput.s;\n\
        bool b = bool(step(dis, curP/allP));\n\
        material.alpha = b ? color.a : 0.0;\n\
        material.diffuse = color.rgb;\n\
        return material;\n\
    }`

  primitives.add({
    id: {
      id: 'path' + pathTypeIndex + '_' + item.id, //路径id
      num: 0,//路径点数量
      startIndex, //此路径第一个点起始下标
      pathTypeIndex, //此路径类型下标，第一种飞机路径都是为0，第二种ufo路径都是为1，...类推其他（每一种路径类型下面的所有路径都是相同值）
      propertyIndex, //存路径点下标
      propertyPosition, //存路径点地理位置
      orientation, //存路径点方向
      pointList,
      lon,
      lat,
    },
    positions: pointList,
    width: 1,
    material: new Cesium.Material({
      fabric: {
        uniforms: {
          color: new Cesium.Color(0, 1, 0, 1),
          curP: 0.0,
          allP: 1,
        },
        source: source
      },
      translucent: true,
    })
  });
  const modelEntity = {
    position: propertyPosition,
    model: {
      uri: path.url,
      scale: path.scale,
      minimumPixelSize: path.minimumPixelSize,
    },
    orientation: orientation,
  }
  primitivesModelLsit2.push(modelEntity)
}