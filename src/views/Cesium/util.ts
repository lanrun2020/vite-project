
import Cesium from '@/utils/importCesium'

// 经纬度 转 屏幕坐标
const pointsTurnToScreen = (scene: any, lng: number, lat: number) => {
  let pos = Cesium.Cartesian3.fromDegrees(lng, lat); // 经纬度 转 笛卡尔世界坐标
  return Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, pos); // 笛卡尔世界坐标 转 屏幕坐标
};

// 根据点坐标集合将坐标点加上时间参数
const computeCirclularFlight = (Points: Array<object>, start: object) => {
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
// 根据第一个点 偏移距离 角度 求取第二个点的坐标
function calcPoints(x1: number = 105, y1: number = 30, radius: number = 10000, heading: number = 1, height: number = 100000) {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1))
  const rx = radius * Math.cos((heading * Math.PI) / 180.0)
  const ry = radius * Math.sin((heading * Math.PI) / 180.0)
  const translation = Cesium.Cartesian3.fromElements(rx, ry, 0)//变化
  const d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3())
  const c = Cesium.Cartographic.fromCartesian(d)
  const x2 = Cesium.Math.toDegrees(c.longitude)
  const y2 = Cesium.Math.toDegrees(c.latitude)
  return Cesium.Cartesian3.fromDegrees(x2, y2, height)
}

// 根据两个坐标点,获取Heading(朝向)
function getHeading(pointA: typeof Cesium.Cartesian3.fromDegrees, pointB: typeof Cesium.Cartesian3.fromDegrees) {
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

// 根据两个坐标点,获取Pitch(俯仰角)
function getPitch(pointA: typeof Cesium.Cartesian3, pointB: typeof Cesium.Cartesian3): number {
  let transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  const vector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
  let direction = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transfrom, transfrom), vector, vector);
  Cesium.Cartesian3.normalize(direction, direction);
  //因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
  return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
}

// 获取圆形路径上的点
function getRoutePoints(lng: number, lat: number, radius: number, height: number) {
  let h = 0
  const points: Array<Object> = Array(3600).fill('').map(() => {
    h += 0.1
    return calcPoints(lng, lat, radius, h, height)
  })
  return points
}

export { pointsTurnToScreen, computeCirclularFlight, calcPoints, getHeading, getPitch, getRoutePoints }