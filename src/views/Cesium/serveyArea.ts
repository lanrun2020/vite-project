// 测量面积
import Cesium from "@/utils/importCesium"
let Points: Array<{ lng: number, lat: number }> = []
let cartesian = null;
let handler: any
let num: number = 0
let entity: Array<Object> = []
let length: number = 0
let activeEntity: any
let activeShapePoints: any = []
const serveyArea = (viewer: any, active: boolean) => {
  if (active) {
    let scene = viewer.scene
    let ellipsoid = scene.globe.ellipsoid;
    activeEntity = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(activeShapePoints),
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.WHITE.withAlpha(0.7)
        ),
      },
    })
    entity?.push(activeEntity)
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
        // computeDistance(viewer)
        if (num == 1) {
          activeEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(activeShapePoints)
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
            text: '总面积:' + getArea(activeShapePoints) + 'km²',
            pixelOffset: new Cesium.Cartesian2(0.0, -40),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 10000000.0)
          },
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(activeShapePoints),
            material: new Cesium.ColorMaterialProperty(
              Cesium.Color.WHITE.withAlpha(0.7)
            ),
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
const getArea = (Points: Array<any>) => {
  let area = 0
  let p1: any, p2: any
  if (Points.length > 2) {
    for (let i = 0; i < Points.length; i++) {
      p1 = Points[i]
      p2 = Points[(i + 1) % Points.length]
      area += p1.x * p2.y
      area -= p2.x * p1.y
    }
  }
  return Math.abs(area / 1000000).toFixed(6)
}

const addPoint = (viewer: any, longitude: number, latitude: number) => {
  entity?.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    point: {
      show: true, // default
      color: Cesium.Color.SKYBLUE, // default: WHITE
      pixelSize: 5, // default: 1
      outlineColor: Cesium.Color.YELLOW, // default: BLACK
      outlineWidth: 2, // default: 0
    },
  }));
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
export { serveyArea }