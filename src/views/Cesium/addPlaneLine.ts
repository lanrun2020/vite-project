// 飞机航线
import Cesium from "@/utils/importCesium"
import { computeCirclularFlight, getHeading } from './util'
let entities: Array<object> = []
let renderId: any

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
  for (let i = 2, len = length; i <= len - 2; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  curvePoints.push(spline.evaluate(1));
  return curvePoints; // 返回曲线上的多个点坐标集合
};

export const addPlaneLine = (viewer: any, active: boolean) => {
  if (active) {
    if (entities?.length) return
    const start = Cesium.JulianDate.now()
    const stop = Cesium.JulianDate.addSeconds(start, 1200, new Cesium.JulianDate()) //一个点一秒
    //时间段循环
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.timeline.zoomTo(start, stop);
    const airList = new Array(100).fill('').map((item, index) => {
      const lon = 100 + Math.random() * 70 - 35
      const lon2 = lon + Math.random() * 70 - 35
      const lat = 30 + Math.random() * 60 - 30
      const lat2 = lat + Math.random() * 60 - 30
      return {
        id: index,
        startPoint: Cesium.Cartesian3.fromDegrees(lon, lat, 100),
        endPoint: Cesium.Cartesian3.fromDegrees(lon2, lat2, 100)
      }
    })
    // const primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    airList.forEach((item) => {
     addPlane(viewer, item, 1200, start)
      // primitives.add(p)
    })

    // const render = () => { // 实时更新
    //   renderId = requestAnimationFrame(render)
    // }
  } else {
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      // cancelAnimationFrame(renderId)
      entities = []
    }
  }
}

const addPlane = (viewer: any, item: any, num: number, start: any) => {
  //轨迹起点，终点
  const startPoint = item.startPoint
  const endPoint = item.endPoint
  const points = generateCurve(startPoint, endPoint, num, 15000) //轨迹点集合，获取路径上的点
  const propertyLine = computeCirclularFlight(points, start)
  const path = viewer.entities.add({
    position: propertyLine,
    name: 'plane path',
    id: "planePath" + item.id,
    path: {
      show: true,
      leadTime: 0,
      trailTime: 1200,
      width: 2,
      resolution: 1,
      material: Cesium.Color.BLUE
    }
  })
  const airPlane = viewer.entities.add({
    id: "modelPlane" + item.id,
    position: propertyLine,
    model: {
      uri: `/model/CesiumAir.glb`,
      scale: 1,
      minimumPixelSize: 30,
    },
    orientation: new Cesium.VelocityOrientationProperty(propertyLine)
  })
  entities.push(path);
  entities.push(airPlane)

  // const instance = new Cesium.GeometryInstance({
  //   geometry: new Cesium.CylinderGeometry({
  //     length: point.num * 2000,
  //     topRadius: 5000.0,
  //     bottomRadius: 5000.0,
  //   }),
  //   attributes: {
  //     color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.5, point.num / 50, 0, 1))
  //   },
  //   modelMatrix: modelMatrix, // 提供位置参数
  // });

  // const primitive = new Cesium.Primitive({
  //   geometryInstances: instance,
  //   appearance: new Cesium.PerInstanceColorAppearance({
  //     flat: true,
  //     faceForward: true,
  //     translucent: true,
  //   })
  // });
  // const primitive = Cesium.Model.fromGltf({
  //     id: item.id,
  //     url: `/model/CesiumAir.glb`, // 本地文件
  //     // modelMatrix: towerMt4Tower,
  //     scale: 100, // 放大倍数
  //   })
  // return primitive
}