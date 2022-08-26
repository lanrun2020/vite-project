// 飞机航线
import Cesium from "@/utils/importCesium"
import { equal } from "assert";
import CallbackProperty from "cesium/Source/DataSources/CallbackProperty";
import { computeCirclularFlight, getHeading } from './util'
let entities: Array<object> = []
let renderId:any
// 根据两个坐标点,获取Heading(朝向)
// const getHeading = (pointA: object, pointB: object) => {
//   //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
//   const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
//   //向量AB
//   const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
//   //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
//   //AB为世界坐标中的向量
//   //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
//   const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
//   //归一化
//   const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
//   //heading
//   const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
//   return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
// }

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

export const addPlaneModel = (viewer: any, active: boolean) => {
  if (active) {
    //起点，终点
    const startPoint = Cesium.Cartesian3.fromDegrees(
      103.95223,
      30.57428,
      100
    );
    const endPoint = Cesium.Cartesian3.fromDegrees(
      116.410745,
      39.510251,
      // 121.557468,
      // 31.203037,
      100
    );
    // 121.557468纬度:31.203037
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
    const points = generateCurve(startPoint, endPoint, 50,15000) //获取路径上的点
    
    const pointsLine = generateCurve(Cesium.Cartesian3.fromDegrees(
      103.95223,
      30.57428,
      100
    ), Cesium.Cartesian3.fromDegrees(
      115.410745,
      39.510251,
      100
    ), 40, 5000)
    const start = Cesium.JulianDate.now()
    const stop = Cesium.JulianDate.addSeconds(start, points.length, new Cesium.JulianDate())
    //时间段循环
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    //Set timeline to simulation bounds
    viewer.timeline.zoomTo(start, stop);

    const property = computeCirclularFlight(points, start)
    const propertyLine = computeCirclularFlight(pointsLine, start)
    //Populate it with data
    if (entities?.length) return
    entities.push(viewer.entities.add({
      id: "Blueline",
      name: "Blue dashed line",
      polyline: {
        positions: pointsLine,
        width: 3,
        material: new Cesium.PolylineMaterialProperty({
          color: new Cesium.Color(0.0, 0.0, 1.0, 1.0),
          repeat: 10
        }),
      }
    }))
    const plane = viewer.entities.add({
      id: "modelPlane",
      position: property,
      // model: {
      //   uri: `/model/ufo.glb`,
      //   scale: 0,
      //   minimumPixelSize: 60,
      // },
      orientation:new Cesium.VelocityOrientationProperty(property)
      // viewFrom: new Cesium.Cartesian3(-170.0, 0.0, 0.0),
      // orientation: new Cesium.HeadingPitchRoll(
      //   Cesium.Math.toRadians(0),
      //   Cesium.Math.toRadians(0),
      //   Cesium.Math.toRadians(0),
      // ),
    })
    const plane2 = viewer.entities.add({
      id: "modelPlane2",
      position: propertyLine,
      model: {
        uri: `/model/ufo.glb`,
        scale: 2,
        minimumPixelSize: 60,
      },
      orientation:new Cesium.VelocityOrientationProperty(propertyLine)
    })
    entities.push(plane)
    entities.push(plane2)

    let current:any
    current = Cesium.clone(startPoint)
    // plane.orientation = new Cesium.VelocityOrientationProperty(plane.position)
    // console.log(plane.position)
    // plane.model.alignedAxis = new Cesium.VelocityVectorProperty(plane.position, true)
    // viewer.trackedEntity = plane
    // viewer.trackedEntity.viewFrom = new Cesium.Cartesian3(-2000, 0, 1000)
    const render = () => {
      let res = plane.position.getValue(viewer.clock.currentTime,new Cesium.Cartesian3())
      let quaternion = plane.orientation.getValue(viewer.clock.currentTime,new Cesium.Quaternion())
      if(!quaternion || !res){
        viewer.clock.currentTime = viewer.clock.startTime
        quaternion = plane.orientation.getValue(viewer.clock.startTime,new Cesium.Quaternion())
        res = plane.position.getValue(viewer.clock.currentTime,new Cesium.Cartesian3())
      }
      
      // viewer.camera.position = res
      // const hpr = Cesium.HeadingPitchRoll.fromQuaternion(quaternion);
      // console.log(Cesium.Math.toDegrees(hpr.heading));

      // hpr.heading += Cesium.Math.toRadians(0),
      // hpr.pitch += Cesium.Math.toRadians(180),
      // hpr.roll += Cesium.Math.toRadians(90),
      // console.log(hpr);
      // console.log(res);
      // console.log(viewer.camera);
      //
      let transform = Cesium.Transforms.eastNorthUpToFixedFrame(res);
      transform = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(quaternion),res);
      // viewer.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90.0),Cesium.Math.toRadians(0.0),-10.0))
      // console.log(startPoint,res);
      // console.log(Cesium.Cartesian3.equals(current,res));
      
      viewer.camera.flyTo({
        destination:res,
        duration:0.0,
        orientation:{
          heading: Cesium.Cartesian3.equals(current,res)?Cesium.Math.toRadians(0):getHeading(current,res),
          pitch: Cesium.Math.toRadians(0),
          roll: 0
      }})
      current = Cesium.clone(res)
      // viewer.camera.setView({
      //   destination:res,
        // orientation:new Cesium.HeadingPitchRoll(
        //   hpr.heading + Cesium.Math.toRadians(-90),
        //   hpr.pitch + Cesium.Math.toRadians(-45),
        //   Cesium.Math.toRadians(0),
        // )
      // })
      // console.log(hpr);
      renderId = requestAnimationFrame(render)
    }
    const radarH = 5000 //雷达高度
    const startPoint2 = Cesium.Cartesian3.fromDegrees(
      103.95223,
      30.57428,
      0
    )
    const endPoint2 = Cesium.Cartesian3.fromDegrees(
      115.410745,
      39.510251,
      0
    )
    const points2 = generateCurve(startPoint2, endPoint2, 40, 2500) //获取路径上的点
    const property2 = computeCirclularFlight(points2, start)
    entities.push(viewer.entities.add({
      position: property2,
      cylinder: {
        length: radarH,
        topRadius: 0.0,
        bottomRadius: 2000.0,
        material: new Cesium.RadarScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.9),
          10000,// 循环时长
          1.0,//速度
          20,//圈数
          0.2,//环高
        )
      },
    }))
    render()
  } else {
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      cancelAnimationFrame(renderId)
      entities = []
    }
  }
}