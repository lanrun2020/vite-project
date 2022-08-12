// 道路
import lineMaterialProperty from "@/materials/lineMaterial";
import Cesium from "@/utils/importCesium"
import axios from "axios";
const lineMaterial = new lineMaterialProperty({ color: new Cesium.Color(.1, 1, 0, 0.5), repeat: 1, speed: 0.4, thickness: 0.5 })
let primitives: any

export const addLoad = async (viewer: any, active: boolean) => {
  if (active) {
    if (!primitives) {
      primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
      await axios.get('/lines-bus.json').then((res) => {
        const data = res.data
        let points: Array<any> = [];
        const result = data.map(function (busLine: any) {
          let prevPt = [];
          points = []
          for (let i = 0; i < busLine.length; i += 2) {
            let pt = [busLine[i], busLine[i + 1]];
            if (i > 0) {
              pt = [prevPt[0] + pt[0], prevPt[1] + pt[1]];
            }
            prevPt = pt;
            points.push(pt[0] / 1e4 - 0.0055, pt[1] / 1e4 - 0.002);
          }
          return points
        })
        result.forEach((points: any) => {
          primitives.add(addCylinderItem(points))
        })
      })
    }
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(116.23, 39.8, 250000.0)
    });
  } else {
    if (primitives) {
      lineMaterial.close()
      primitives.removeAll()
      primitives = null
    }
  }
}
const addCylinderItem = (points: any) => {
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolylineGeometry({
      positions: Cesium.Cartesian3.fromDegreesArray(points),
      width: 2.0,
    })
  })
  const primitive = new Cesium.Primitive({
    geometryInstances: instance,
    appearance: new Cesium.PolylineMaterialAppearance({
      material: lineMaterial.getMaterial()
    })
  });
  return primitive
}