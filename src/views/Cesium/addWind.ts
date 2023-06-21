// 迁徙线
import Cesium from "@/utils/importCesium"
import lineMaterialProperty from "@/materials/lineMaterial";
let primitives: any
const lineMaterial = new lineMaterialProperty({ color: new Cesium.Color(.1, 1, 0, 0.5), repeat: 1, speed: 0.4, thickness: 0.5 })
export const addWind = (viewer: any, active: boolean) => {
  if (active) {
  const points = Array(1000).fill('').map(() => {
    return {
      lon: 100 + Math.random() * 50 - 20,
      lat: Math.random() * 130 - 80,
      num: Math.random() * 50
    }
  })
  primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
  const instances = []
  points.forEach((item) => {
    const instance = addCylinderItem(item)
    instances.push(instance)
  })
  const primitive = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.PolylineMaterialAppearance({
      material: lineMaterial.getMaterial()
    })
  });
  primitives.add(primitive)
  } else {
    if (primitives) {
      primitives.removeAll()
    }
  }
}
const addCylinderItem = (point: { lon: number, lat: number, num: number }) => {
  const points = [point.lon,point.lat,point.lon - 2.5,point.lat - 2.5]
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolylineGeometry({
      positions: Cesium.Cartesian3.fromDegreesArray(points),
      width: 4.0,
    })
  });
  return instance
}