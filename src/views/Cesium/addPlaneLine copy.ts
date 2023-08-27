// 飞机航线
import Cesium from "@/utils/importCesium"
let entities: Array<object> = []
let renderId: any
let primitives: any
let primitivesModel: any
let primitivesModel2: any
let _time: any
const num = 1000 //一个轨迹上的点个数
const lineNum = 500 //轨迹数量
const start = new Cesium.JulianDate(2459905, 21600, Cesium.TimeStandard.UTC);
const stop = Cesium.JulianDate.addSeconds(start, num, new Cesium.JulianDate()) //一个点一秒
// 获取流动曲线上多个连续点
const generateCurve = (startPoint: object, endPoint: object, length: number, height = 0) => {
  const addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
  const midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic =
    Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height = height || 6000; // 将起始点、终点两个坐标点之间的距离除x,设置为此中间点的高度
  const midPoint = new Cesium.Cartesian3();
  Cesium.Ellipsoid.WGS84.cartographicToCartesian(
    midPointCartographic,
    midPoint
  ); // 初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转笛卡尔坐标（x,y,z）
  const spline = new Cesium.CatmullRomSpline({
    // 立方样条曲线
    times: [0.0, 0.5, 1], // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
    points: [startPoint, midPoint, endPoint], // 控制点,points.length必须 ≥ 2
  });
  const curvePoints: Array<object> = [spline.evaluate(0)];
  for (let i = 1, len = length; i <= len - 2; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  curvePoints.push(spline.evaluate(1));
  return curvePoints; // 返回曲线上的多个点坐标集合
};

export const addPlaneLine = (viewer: any, active: boolean) => {
  if (active) {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({})
    viewer.scene.globe.depthTestAgainstTerrain = true;
    //时间段循环
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.timeline.zoomTo(start, stop);
    _time = viewer.clock.currentTime.secondsOfDay
    viewer.clock.shouldAnimate = true
    const airList = new Array(lineNum).fill('').map((item, index) => {
      const lon = 0 + Math.random() * 180 - 90
      const lon2 = lon + Math.random() * 180 - 90
      const lat = 0 + Math.random() * 90 - 45
      const lat2 = lat + Math.random() * 90 - 45
      return {
        id: index,
        startPoint: Cesium.Cartesian3.fromDegrees(lon, lat, 50000),
        endPoint: Cesium.Cartesian3.fromDegrees(lon2, lat2, 50000)
      }
    })
    const airList2 = new Array(lineNum).fill('').map((item, index) => {
      const lon = Math.random() * 180 - 180
      const lon2 = lon + Math.random() * 180
      const lat = 0 + Math.random() * 90 - 45
      const lat2 = lat + Math.random() * 90 - 45
      return {
        id: index,
        startPoint: Cesium.Cartesian3.fromDegrees(lon, lat, 50000),
        endPoint: Cesium.Cartesian3.fromDegrees(lon2, lat2, 50000)
      }
    })

    primitives = viewer.scene.primitives.add(new Cesium.PolylineCollection())
    airList.forEach((item) => { //创建所有飞机轨迹 添加到primitives
      addPlane(item, num, start, primitives, 0,0)
    })
    airList2.forEach((item) => { //创建所有ufo的轨迹 添加到primitives
      addPlane(item, num, start, primitives, airList.length,1)
    })

    const instances:any = getInstances(airList.length) //飞机轨迹数量
    primitivesModel = new Cesium.ModelInstanceCollection({
      url: `/model/un.glb`,
      size: 5,
      minimumPixelSize: 20,
      instances: instances
    })

    const instances2:any = getInstances(airList2.length) // ufo轨迹数量
    primitivesModel2 = new Cesium.ModelInstanceCollection({
      url: `/model/CesiumAir.glb`,
      size: 5,
      minimumPixelSize: 20,
      instances: instances2
    })

    const primitivesModelList = [primitivesModel,primitivesModel2]
    const tick = () => {
          primitives._polylines.forEach((polyline:any,index:number) => {
            const position = polyline.id.propertyPosition.getValue(viewer.clock.currentTime) //查点坐标位置
            if(position){ //修改模型所在位置矩阵
              const quaternion = polyline.id.orientation.getValue(viewer.clock.currentTime)
              const mtx4  = Cesium.Matrix4.fromTranslationQuaternionRotationScale(position,quaternion,new Cesium.Cartesian3(1, 1, 1))
              primitivesModelList[polyline.id.pathTypeIndex]._instances[index-polyline.id.startIndex].modelMatrix = mtx4 //instances方式添加的模型，更新飞机位置
            }
            polyline._material.uniforms.curP = polyline.id.propertyIndex.getValue(viewer.clock.currentTime)//查当时时刻，飞机运行到第几个点
          })
          renderId = Cesium.requestAnimationFrame(tick);
      }
      tick()
      viewer.scene.primitives.add(primitivesModel)
      viewer.scene.primitives.add(primitivesModel2)

    // console.log(viewer.scene.primitives);

    // const render = () => { // 实时更新
    //   renderId = requestAnimationFrame(render)
    // }
  } else {
    cancelAnimationFrame(renderId)
    viewer.clock.currentTime = start.clone();
    viewer.clock.shouldAnimate = false
    primitives.removeAll()
    viewer.scene.primitives.remove(primitivesModel)
    viewer.scene.primitives.remove(primitivesModel2)
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
}

// 根据点坐标集合将坐标点加上时间参数
const computeCirclularFlight = (Points: Array<object>, start: object) => {
  const propertyPosition = new Cesium.SampledPositionProperty();
  const propertyIndex = new Cesium.SampledProperty(Number)
  // let t = 0
  for (let i = 0; i < Points.length; i++) {
    // t = t + Math.random()
    const time = Cesium.JulianDate.addSeconds(
      start,
      i * 1,
      new Cesium.JulianDate()
    );
    propertyPosition.addSample(time, Points[i]);
    propertyIndex.addSample(time, i); //存当前是第几个点
  }
  return {
    propertyPosition,
    propertyIndex
  };
}

const addPlane = (item: any, num: number, start: any, primitives:any, startIndex:number,pathTypeIndex:number) => {
  //轨迹起点，终点
  const startPoint = item.startPoint
  const endPoint = item.endPoint
  const points = generateCurve(startPoint, endPoint, num, 50000) //轨迹点集合，获取路径上的点
  const {propertyPosition,propertyIndex} = computeCirclularFlight(points, start)
  const orientation = new Cesium.VelocityOrientationProperty(propertyPosition)
  // console.log(points);
  // const tt = points.map((p) => {
  //   return [points]
  // })
  // console.log('points:' ,points);
  // console.log('propertyLine:' ,propertyLine);
  // const path = viewer.entities.add({ //entity方式加载path
  //   position: propertyLine,
  //   name: 'plane path',
  //   id: "planePath" + item.id,
  //   path: {
  //     show: true,
  //     leadTime: 0,
  //     trailTime: 500,
  //     width: 2,
  //     resolution: 1,
  //     material: Cesium.Color.BLUE
  //   }
  // })
  // entities.push(path);
  // console.log(path);
  // const airPlane = viewer.entities.add({ //entity方式加载model
  //   id: "modelPlane" + item.id,
  //   position: propertyLine,
  //   model: {
  //     uri: `/model/un.glb`,
  //     scale: 10,
  //     minimumPixelSize: 30,
  //   },
  //   orientation: new Cesium.VelocityOrientationProperty(propertyLine)
  // })
  // entities.push(airPlane)
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
      id: item.id, //路径id
      startIndex, //此路径第一个点起始下标
      pathTypeIndex, //此路径类型下标，第一种飞机路径都是为0，第二种ufo路径都是为1，...类推其他（每一种路径类型下面的所有路径都是相同值）
      propertyIndex, //存路径点下标
      propertyPosition, //存路径点地理位置
      orientation, //存路径点方向
    },
    positions : points,
    width : 2,
    material: new Cesium.Material({
      fabric : {
          uniforms: {
            color: new Cesium.Color(.1, 1, 0, 1),
            curP: 0.0,
            allP: num,
          },
          source: source
        },
        translucent: true,
    })
  });
  // const origin = Cesium.Cartesian3.fromDegrees(95.0, 40.0, 200000.0);
  // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
  // primitives.add(Cesium.Model.fromGltf({
  //   id:item.id,
  //   url: `/model/un.glb`,
  //   scale:30,
  //   minimumPixelSize:60,
  //   modelMatrix,
  //   color: '#ffffff',
  // }))
}
function getInstances(num:number) {
  const instances = new Array(num).fill('').map(()=>{
    return {
      modelMatrix: new Cesium.Matrix4(),
    }
  });
  return instances;
}
