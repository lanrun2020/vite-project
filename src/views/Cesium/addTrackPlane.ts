import Cesium from "@/utils/importCesium"

let entities: Array<object> = []
let onTickcallback1: Function

// 根据第一个点 偏移距离 角度 求取第二个点的坐标
function calcPoints(x1, y1, radius, heading) {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1))
  const rx = radius * Math.cos((heading * Math.PI) / 180.0)
  const ry = radius * Math.sin((heading * Math.PI) / 180.0)
  const translation = Cesium.Cartesian3.fromElements(rx, ry, 0)//变化
  const d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3())
  const c = Cesium.Cartographic.fromCartesian(d)
  const x2 = Cesium.Math.toDegrees(c.longitude)
  const y2 = Cesium.Math.toDegrees(c.latitude)
  return Cesium.Cartesian3.fromDegrees(x2, y2, 365000)
}
// 根据两个坐标点,获取Heading(朝向)
function getHeading(pointA, pointB) {
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

export const addTrackPlane = (viewer: any, active: boolean) => {
  if (active) {
    // viewer.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(103.8, 30, 200000),
    //   duration: 1.6,
    //   orientation: {
    //     // 指向
    //     heading: Cesium.Math.toRadians(0),
    //     // 视角
    //     pitch: Cesium.Math.toRadians(-45),
    //     roll: 0
    //   }
    // });
    if (entities.length) return
    const startPoint = Cesium.Cartesian3.fromDegrees(
      105,
      32,
      0
    )
    let endPoint = Cesium.Cartesian3.fromDegrees(
      102,
      31,
      800000
    )
    entities.push(viewer.entities.add({
      position: startPoint,
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 100000,
        // 椭圆长半轴长度
        semiMajorAxis: 100000,
        material: new Cesium.RadarScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.4),
          10000,// 循环时长
          2.0,//速度
          4,//圈数
          .1,//环高
        ),
      },
    }));
    const l = Cesium.Cartesian3.distance(startPoint, endPoint)
    entities.push(viewer.entities.add({
      position: new Cesium.CallbackProperty(() => { return endPoint }, false),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 100000,
        // 椭圆长半轴长度
        semiMajorAxis: 100000,
        height: 800000,
        material: new Cesium.RadarScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.4),
          10000,// 循环时长
          2.0,//速度
          4,//圈数
          .1,//环高
        ),
      },
    }));
    const addPointCartesian = new Cesium.Cartesian3();
    Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
    const midPointCartesian = new Cesium.Cartesian3();
    Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
    const midPointCartographic =
      Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
    // console.log(midPointCartographic);
    let midPoint = new Cesium.Cartesian3();
    Cesium.Ellipsoid.WGS84.cartographicToCartesian(
      midPointCartographic,
      midPoint
    ); // 初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转笛卡尔坐标（x,y,z）

    let heading = 0
    // let position2 = Cesium.Cartesian3.fromDegrees(105,31,36500)
    entities.push(viewer.entities.add({
      position: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.midpoint(startPoint, endPoint, new Cesium.Cartesian3())
    }, false),
      cylinder: {
        length: l,
        topRadius: 100000,
        bottomRadius: 0,
        material: new Cesium.RadarScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.3),
          30000,// 循环时长
          6.0,//速度
          20,//圈数
          .2,//环高
        ),
        // Cesium.Color.AQUAMARINE.withAlpha(0.3),
      },
      orientation: new Cesium.CallbackProperty(e => {
        // let m = this.getModelMatrix(this.originPosition, this.targetPosition);
        // let hpr = this.getHeadingPitchRoll(m);
        let h = getHeading(endPoint,startPoint)
        console.log(h);
        let hpr = new Cesium.HeadingPitchRoll(
          Cesium.Math.toRadians(0),h, Cesium.Math.toRadians(0)
        )
        hpr.pitch = hpr.pitch + Cesium.Math.TWO_PI/2;
        return Cesium.Transforms.headingPitchRollQuaternion(endPoint, hpr);
    }, false),
      // orientation: new Cesium.CallbackProperty(() => {
      //   return Cesium.Transforms.headingPitchRollQuaternion(
      //     endPoint,
      //     new Cesium.HeadingPitchRoll(
      //       Cesium.Math.toRadians(0),
      //       // Cesium.Math.toRadians(300),
      //       // getHeading(startPoint, endPoint),
      //       Cesium.Math.toRadians(20),
      //       Cesium.Math.toRadians(10),
      //     )
      //   )
      // }, false),
    }))
    // viewer.clock.onTick.addEventListener(onTickcallback1 = () => {
    //   heading += 0.5
    //   endPoint = calcPoints(102, 31, 800000, heading)
    //   // midPoint = calcPoints()
    // })
  } else {
    if (entities.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity);
      })
      entities = []
    }
  }

}