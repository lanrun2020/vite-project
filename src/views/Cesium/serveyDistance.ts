// 测量距离
import Cesium from "@/utils/importCesium"
import { getDistance, getMidPoint } from "./util";
let Points: Array<{ lng: number, lat: number }> = []
let cartesian = null;
let handler: any
let num = 0
let entity: Array<any> = []
let length = 0
let activeEntity: any
let activeShapePoints: any = []
const serveyDistance = (viewer: any, active: boolean) => {
  if (active) {
    const scene = viewer.scene
    const ellipsoid = scene.globe.ellipsoid;
    activeEntity = viewer.entities.add({
      polyline: {
        positions: activeShapePoints,
        width: 2,
        material: Cesium.Color.RED,
        clampToGround: true,
      }
    })
    entity?.push(activeEntity)
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction((event: any) => {
      cartesian = viewer.camera.pickEllipsoid(event.position, ellipsoid);
      if (cartesian) {
        const cartographic = ellipsoid.cartesianToCartographic(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        // 地形高度(下面两个二选一就行)
        const height2 = viewer.scene.globe.getHeight(cartographic)
        console.log(height2);
        activeShapePoints.push(cartesian)
        num++
        addPoint(viewer, longitude, latitude)
        Points.push({ lng: longitude, lat: latitude })
        computeDistance(viewer)
        if (num == 1) {
          activeEntity.polyline.positions = new Cesium.CallbackProperty(() => {
            return activeShapePoints
          }, false)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((event: any) => {
      const newPosition = viewer.scene.pickPosition(event.endPosition);
      if (Cesium.defined(newPosition)) {
        activeShapePoints.pop();
        activeShapePoints.push(newPosition);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(() => {
      if (num > 1) {
        activeShapePoints.pop()
        entity?.push(viewer.entities.add({
          label: {
            font: "20px sans-serif",
            text: '总长度:' + setDistanse(length),
            pixelOffset: new Cesium.Cartesian2(0.0, -40),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 10000000.0)
          },
          polyline: {
            positions: activeShapePoints,
            width: 2,
            material: Cesium.Color.RED,
            clampToGround: true,
          },
          position: Cesium.Cartesian3.fromDegrees(Points[num - 1].lng, Points[num - 1].lat)
        }));
        activeShapePoints = []
        num = 0
        Points = []
        length = 0
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  } else {
    reset(viewer)
  }
};
const addPoint = (viewer: any, longitude: number, latitude: number) => {
  entity?.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    point: {
      show: true, // default
      color: Cesium.Color.SKYBLUE, // default: WHITE
      pixelSize: 10, // default: 1
      outlineColor: Cesium.Color.YELLOW, // default: BLACK
      outlineWidth: 3, // default: 0
    },
    label: {
      font: "20px sans-serif",
      text: num.toString(),
      pixelOffset: new Cesium.Cartesian2(0.0, -20),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 10000000.0)
    },
  }));
}
const computeDistance = (viewer: any) => {
  if (num > 1) {
    const start = Cesium.Cartographic.fromDegrees(Points[num - 2].lng, Points[num - 2].lat)
    const end = Cesium.Cartographic.fromDegrees(Points[num - 1].lng, Points[num - 1].lat)
    // let geodesic = new Cesium.EllipsoidGeodesic();
    // geodesic.setEndPoints(start, end);
    const distance = getDistance(start, end)
    length += distance
    entity?.push(viewer.entities.add({
      label: {
        font: "20px sans-serif",
        text: setDistanse(distance),
        pixelOffset: new Cesium.Cartesian2(0.0, -20),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 10000000.0)
      },
      position: getMidPoint(start, end)
    }));
  }
}
const setDistanse = (distance: number) => {
  if (distance > 1000) {
    return (distance / 1000).toFixed(2) + 'km'
  } else {
    return distance.toFixed(2) + 'm'
  }
}

const reset = (viewer: any) => {
  num = 0
  Points = []
  handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
  handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)//移除事件
  handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)//移除事件

  if (entity?.length) {
    entity.forEach((item) => {
      viewer.entities.remove(item)
    })
    entity = []
  }
}
export { serveyDistance }