// 人口统计柱状图 模拟
import Cesium from "@/utils/importCesium"

const entity: Array<object> = []
let primitive: object
let primitives: any
export const addCylinder = (viewer: any, active: boolean) => {
  if (active) {
    if (entity?.length) return
    const points = Array(10000).fill('').map(() => {
      return {
        lon: 100 + Math.random() * 100 - 50,
        lat: Math.random() * 160 - 80,
        num: Math.random() * 50
      }
    })
    primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    points.forEach((item) => {
      const cylinder = addCylinderItem(item)
      primitives.add(cylinder)
    })
  } else {
    if (primitives) {
      primitives.removeAll()
    }
  }
}
const addCylinderItem = (point: { lon: number, lat: number, num: number }) => {
  const center = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.num * 1000)
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.CylinderGeometry({
      length: point.num * 2000,
      topRadius: 5000.0,
      bottomRadius: 5000.0,
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.5, point.num / 50, 0, 1))
    },
    modelMatrix: modelMatrix, // 提供位置参数
  });
  primitive = new Cesium.Primitive({
    geometryInstances: instance,
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      faceForward: true,
      translucent: true,
    })
  });
  return primitive
}
