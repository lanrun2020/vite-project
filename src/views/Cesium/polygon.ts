// 点击地图 构造多边形
import Cesium from "@/utils/importCesium"
let arr2: Array<number> = []
let polygonPoints: Array<{ lng: number, lat: number }> = []
let primitiveArr: Array<any> = []

let cartesian = null;
let handler: any
const addPolygon2 = (viewer: any, active: boolean) => {
  if (active) {
    const scene = viewer.scene
    const ellipsoid = scene.globe.ellipsoid;
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction((event: any) => {
      cartesian = viewer.camera.pickEllipsoid(event.position, ellipsoid);
      if (cartesian) {
        const cartographic = ellipsoid.cartesianToCartographic(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        addPolygon(viewer, longitude, latitude)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 右键多边形构造完成
    handler.setInputAction((event: any) => {
      arr2 = []
      polygonPoints = []
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  } else {
    if(primitiveArr.length){
      primitiveArr.forEach((primitive)=>{
        viewer.scene.primitives.remove(primitive)
      })
      primitiveArr = []
    }
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)//移除事件
  }
};
const addPolygon = (viewer: any, longitude: number, latitude: number) => {
  if (arr2.length <= 4) {
    arr2.push(longitude, latitude);
    polygonPoints.push({ lng: longitude, lat: latitude })
  } else {
    //验证添加点的位置是否符合凸多边形的构成
    const s = polygonFilter2({ lat: latitude, lng: longitude }, polygonPoints)
    if (s) {
      arr2.push(longitude, latitude);
      polygonPoints.push({ lng: longitude, lat: latitude })
    } else {
      return
    }
  }
  if (arr2.length > 4) {
    // if (primitiveArr.length > 0) {
    //   viewer.scene.primitives.remove(primitiveArr[0])
    //   primitiveArr = []
    // }
    const primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(arr2)
          ),
          height: 0,
          extrudedHeight: 320,
        }),
      }),
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: Cesium.Material.fromType("Stripe"),
      }),
    })
    primitive.myData = {
      id:'polygon1',
    }
    primitiveArr.forEach((primitive)=>{
      viewer.scene.primitives.remove(primitive)
    })
    primitiveArr.push(primitive)
    viewer.scene.primitives.add(
      primitive
    );
  }
}
const polygonFilter2 = (checkPoint: { lat: number, lng: number }, polygonPoints: Array<any>) => { //首尾相连边
  const length = polygonPoints.length
  const p1 = polygonPoints[0]
  const p2 = polygonPoints[length - 1]
  const p3 = polygonPoints[1]
  const p4 = polygonPoints[length - 2]

  const c1 = p4.lat - (p4.lng - p2.lng) * (p2.lat - p1.lat) / (p2.lng - p1.lng) - p2.lat //第一个点，最后一个点
  const c2 = checkPoint.lat - (checkPoint.lng - p2.lng) * (p2.lat - p1.lat) / (p2.lng - p1.lng) - p2.lat

  const c3 = p2.lat - (p2.lng - p3.lng) * (p3.lat - p1.lat) / (p3.lng - p1.lng) - p3.lat //最开始两个点
  const c4 = checkPoint.lat - (checkPoint.lng - p3.lng) * (p3.lat - p1.lat) / (p3.lng - p1.lng) - p3.lat

  const c5 = checkPoint.lat - (checkPoint.lng - p4.lng) * (p4.lat - p2.lat) / (p4.lng - p2.lng) - p4.lat //最后两个点
  const c6 = p1.lat - (p1.lng - p4.lng) * (p4.lat - p2.lat) / (p4.lng - p2.lng) - p4.lat

  let res = true
  if (c5 <= 0) {
    res = res && c6 <= 0 ? true : false
  } else {
    res = res && c6 >= 0 ? true : false
  }
  if (c3 <= 0) {
    res = res && c4 <= 0 ? true : false
  } else {
    res = res && c4 >= 0 ? true : false
  }
  if (c1 <= 0) {
    res = res && c2 >= 0 ? true : false
  } else {
    res = res && c2 <= 0 ? true : false
  }
  return res
}
// 判断点是否处于多边形内部
const polygonFilter = (checkPoint: { lat: number, lng: number }, polygonPoints: Array<any>) => {
  let counter = 0;
  let i;
  let xinters;
  let p1, p2;
  const pointCount = polygonPoints.length;
  p1 = polygonPoints[0];
  for (i = 1; i <= pointCount; i++) {
    p2 = polygonPoints[i % pointCount];
    if (
      checkPoint.lat > Math.min(p1.lat, p2.lat) &&
      checkPoint.lat <= Math.max(p1.lat, p2.lat)
    ) {
      if (checkPoint.lng <= Math.max(p1.lng, p2.lng)) {
        if (p1.lat != p2.lat) {
          xinters = (checkPoint.lat - p1.lat) * (p2.lng - p1.lng) / (p2.lat - p1.lat) + p1.lng;
          if (p1.lng == p2.lng || checkPoint.lng <= xinters) {
            counter++;
          }
        }
      }
    }
    p1 = p2;
  }
  if (counter % 2 == 0) {
    return false;
  } else {
    return true;
  }
}
export { addPolygon2 }