import Cesium from "@/utils/importCesium"
import { createLine } from "./flowline3";
import redimg from '../../assets/redLine.png'
import CallbackProperty from "cesium/Source/DataSources/CallbackProperty";

let entities: Array<object> = []
// 根据两个坐标点,获取Heading(朝向)
const getHeading = (pointA:object, pointB:object) => {
  //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  //向量AB
  const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
  //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
  //AB为世界坐标中的向量
  //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
  const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
  //归一化
  const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
  //heading
  const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
  return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
}

const computeCirclularFlight2 = ( Points:Array<object>,start:object) => {
  const property = new Cesium.SampledPositionProperty();
  for (let i = 0; i < Points.length; i++) {
    const time = Cesium.JulianDate.addSeconds(
      start,
      i * 1,
      new Cesium.JulianDate()
    );
    property.addSample(time, Points[i]);
  }
  return property;
}
// 获取流动曲线上多个连续点
const generateCurve = (startPoint: object, endPoint: object, length:number) => {
  const addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
  const midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic =
    Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height = 10000 ||
    Cesium.Cartesian3.distance(startPoint, endPoint) / 100; // 将起始点、终点两个坐标点之间的距离除x,设置为此中间点的高度
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
  let curvePoints: Array<object> = [spline.evaluate(0)];
  for (let i = 2, len = length; i <= len - 2; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  curvePoints.push(spline.evaluate(1));
  return curvePoints; // 返回曲线上的多个点坐标集合
};

export const addPlaneModel = (viewer:any, active: boolean) => {
  if (active) {
     //起点，终点
     const startPoint = Cesium.Cartesian3.fromDegrees(
      103.95223,
      30.57428,
      5000
    );
    const endPoint = Cesium.Cartesian3.fromDegrees(
      116.410745,
      39.510251,
      5000
    );
    // viewer.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(103, 26, 500000),
    //   duration: 1.6,
    //   orientation: {
    //     // 指向
    //       heading: Cesium.Math.toRadians(0),
    //       // 视角
    //       pitch: Cesium.Math.toRadians(-45),
    //       roll: 0
    //     }
    // });
    const points = generateCurve(startPoint,endPoint,50) //获取路径上的点
    const start = Cesium.JulianDate.now()
    const stop = Cesium.JulianDate.addSeconds(start, points.length, new Cesium.JulianDate())
    //时间段循环
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    //Set timeline to simulation bounds
    viewer.timeline.zoomTo(start, stop);
   
    let property = computeCirclularFlight2(points,start)
    
    //Populate it with data
    if (entities?.length) return
    entities.push(viewer.entities.add({
      id: "Blueline",
      name: "Blue dashed line",
      polyline: {
        positions:points,
        width: 20,
        material: new Cesium.PolylineTrailLinkMaterialProperty(
          Cesium.Color.RED,
          1000,
          redimg,
          1,
          25
        ),
      }
    }))
    const plane = viewer.entities.add({
      id: "modelPlane",
      position: property,
      model: {
        uri: `/model/CesiumAir.glb`,
        scale: 2,
        minimumPixelSize:60,
      },
      viewFrom: new Cesium.Cartesian3(-170.0, 0.0, 0.0),
      orientation: new Cesium.VelocityOrientationProperty(property),
    })
    entities.push(plane);

    // viewer.trackedEntity = plane;
    // viewer.camera.setView({
    //   destination: new Cesium.CallbackProperty(()=>{
       
        
    //     return air.position
    //   },false),
    //   duration: 1.6,
    // });
    // createLine(viewer,true, points)
  } else {
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
}