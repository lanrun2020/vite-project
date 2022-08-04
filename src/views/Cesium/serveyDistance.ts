// 测距
import Cesium from "@/utils/importCesium"
let Points: Array<{ lng: number, lat: number }> = []
let cartesian = null;
let handler: any
let num: number = 0
let entity: Array<Object> = []
let length: number = 0
let activeShapePoints: any = []
const serveyDistance = (viewer: any, active: boolean) => {
  if (active) {
    let scene = viewer.scene
    let ellipsoid = scene.globe.ellipsoid;
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

    handler.setInputAction((event: any) => {
      cartesian = viewer.camera.pickEllipsoid(event.position, ellipsoid);
      if (cartesian) {
        let cartographic = ellipsoid.cartesianToCartographic(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        activeShapePoints.push(cartesian)
        num++
        addPoint(viewer, longitude, latitude)
        Points.push({ lng: longitude, lat: latitude })
        computeDistance(viewer)
        if (num == 1) {
          entity?.push(viewer.entities.add({
            polyline: {
              positions: new Cesium.CallbackProperty(() => {
                return activeShapePoints
              }, false),
              width: 2,
              material: Cesium.Color.RED,
              clampToGround: true,
            },
          }));
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
            text: '总长度:' + getDistance(length),
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
        num = 0
        Points = []
        // setTimeout(() => {
        activeShapePoints = []
        // }, 100)
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
    let start = Cesium.Cartographic.fromDegrees(Points[num - 2].lng, Points[num - 2].lat)
    let end = Cesium.Cartographic.fromDegrees(Points[num - 1].lng, Points[num - 1].lat)
    let geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(start, end);
    let distance = geodesic.surfaceDistance
    length += distance
    entity?.push(viewer.entities.add({
      label: {
        font: "20px sans-serif",
        text: getDistance(distance),
        pixelOffset: new Cesium.Cartesian2(0.0, -20),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 10000000.0)
      },
      position: getMidPoint(start, end)
    }));
  }
}
const getDistance = (distance: number) => {
  if (distance > 1000) {
    return (distance / 1000).toFixed(2) + 'km'
  } else {
    return distance.toFixed(2) + 'm'
  }
}
const getMidPoint = (start: any, end: any) => {
  const geodesic = new Cesium.EllipsoidGeodesic()
  const scratch = new Cesium.Cartographic();
  geodesic.setEndPoints(start, end);
  const midpointCartographic = geodesic.interpolateUsingFraction(
    0.5,
    scratch
  );
  return Cesium.Cartesian3.fromRadians(
    midpointCartographic.longitude,
    midpointCartographic.latitude
  );
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
export { reset, serveyDistance }