import Cesium from "@/utils/importCesium"
let entities: Array<any> = []
const startPoint = { longitude: 110, latitude: 32 }
const endPoint = [
  { longitude: 113, latitude: 32 },
  { longitude: 112, latitude: 31 },
  { longitude: 110, latitude: 30 },
  { longitude: 108, latitude: 32 },
  { longitude: 106, latitude: 31 }
]
export const addFlyLine = (viewer: any, active: boolean) => {
  if (active) {
    createFlyLine(viewer, startPoint, endPoint)
  } else {
    destroyFlyLine(viewer)
  }
}
// 创建迁徙线
const createFlyLine = (viewer, start: { longitude: number, latitude: number }, endPoints: Array<{ longitude: number, latitude: number }>) => {
  const startPoint = Cesium.Cartesian3.fromDegrees(
    start.longitude,
    start.latitude,
    0
  ); // Cartesian3.fromDegrees经纬度转为笛卡尔坐标位置
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(start.longitude, start.latitude - 5, 500000),
    duration: 1.6,
    orientation: {
      // 指向
        heading: Cesium.Math.toRadians(0),
        // 视角
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      }
  });
  if(entities?.length) return
  // 终点与飞行线
  const material = new Cesium.PolylineTrailLinkMaterialProperty(
    Cesium.Color.BLUE,
    3000
  );
  endPoints.forEach((item) => {
    const endPoint = Cesium.Cartesian3.fromDegrees(
      item.longitude,
      item.latitude,
      0
    );
    entities.push(viewer.entities.add({
      polyline: {
        positions: generateCurve(startPoint, endPoint), // 多个点坐标构成线条路径
        width: 15,
        material: material,
      },
    }));
  })
};
// 获取流动曲线上多个连续点
const generateCurve = (startPoint: any, endPoint: any) => {
  const addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
  const midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic =
    Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height =
    Cesium.Cartesian3.distance(startPoint, endPoint) / 5; // 将起始点、终点两个坐标点之间的距离除5,设置为此中间点的高度
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
  let curvePoints: Array<any> = [];
  for (let i = 0, len = 200; i <= len; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  return curvePoints; // 返回曲线上的多个点坐标集合
};
const destroyFlyLine = (viewer: any) => {
  if (entities?.length) {
    entities.forEach((entity) => {
      viewer.entities.remove(entity)
    })
    entities = []
  }
}