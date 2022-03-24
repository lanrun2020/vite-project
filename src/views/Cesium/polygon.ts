import Cesium from "@/utils/importCesium"
let arr2:Array<number> = [] 
let polygonPoints:Array<{lng:number,lat:number}> = []
let primitiveArr:Array<any> = []
const addPolygon2 = (viewer:any, longitude: number, latitude: number) => {
  if (arr2.length <= 4) {
    arr2.push(longitude, latitude);
    polygonPoints.push({ lng: longitude, lat: latitude })
  } else {
    //验证添加点的位置是否符合凸多边形的构成
    let s = polygonFilter2({ lat: latitude, lng: longitude }, polygonPoints)
    if (s) {
      arr2.push(longitude, latitude);
      polygonPoints.push({ lng: longitude, lat: latitude })
    } else {
      return
    }
  }
  if (arr2.length > 4) {
    if (primitiveArr.length > 0) {
      viewer.scene.primitives.remove(primitiveArr[0])
      primitiveArr = []
    }
    let primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(arr2)
          ),
        height:0,
        extrudedHeight:320,
        }),
      }),
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: Cesium.Material.fromType("Stripe"),
      }),
    })
    primitiveArr.push(primitive)
    viewer.scene.primitives.add(
      primitive
    );
  }
};
const polygonFilter2 = (checkPoint: { lat: number, lng: number }, polygonPoints: Array<any>) => { //首尾相连边
  let length = polygonPoints.length
  let p1 = polygonPoints[0]
  let p2 = polygonPoints[length - 1]
  let p3 = polygonPoints[1]
  let p4 = polygonPoints[length - 2]
  let c2 = checkPoint.lat - (checkPoint.lng - p2.lng) * (p2.lat - p1.lat) / (p2.lng - p1.lng) - p2.lat //第一个点，最后一个点
  let c1 = p4.lat - (p4.lng - p2.lng) * (p2.lat - p1.lat) / (p2.lng - p1.lng) - p2.lat

  let c3 = p2.lat - (p2.lng - p3.lng) * (p3.lat - p1.lat) / (p3.lng - p1.lng) - p3.lat //最开始两个点
  let c4 = checkPoint.lat - (checkPoint.lng - p3.lng) * (p3.lat - p1.lat) / (p3.lng - p1.lng) - p3.lat

  let c5 = checkPoint.lat - (checkPoint.lng - p4.lng) * (p4.lat - p2.lat) / (p4.lng - p2.lng) - p4.lat //最后两个点
  let c6 = p1.lat - (p1.lng - p4.lng) * (p4.lat - p2.lat) / (p4.lng - p2.lng) - p4.lat
  let r1, r2, r3
  if (c5 <= 0) {
    r1 = c6 <= 0 ? true : false
  } else {
    r1 = c6 >= 0 ? true : false
  }
  if (c3 <= 0) {
    r2 = c4 <= 0 ? true : false
  } else {
    r2 = c4 >= 0 ? true : false
  }
  if (c1 <= 0) {
    r3 = c2 >= 0 ? true : false
  } else {
    r3 = c2 <= 0 ? true : false
  }
  return r1 && r2 && r3
}
const polygonFilter = (checkPoint: { lat: number, lng: number }, polygonPoints: Array<any>) => { //判断点是否处于多边形内部
  var counter = 0;
  var i;
  var xinters;
  var p1, p2;
  var pointCount = polygonPoints.length;
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
const reset = () => {
  arr2 = []
  polygonPoints = []
  primitiveArr = []
}
export {reset,addPolygon2}