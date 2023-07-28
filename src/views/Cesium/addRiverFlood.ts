// 动态河流
import Cesium from "@/utils/importCesium"
let entity: any = null
export const addRiverFlood = (viewer:any, active:boolean) => {
    if (active) {
      viewer.scene.terrainProvider = Cesium.createWorldTerrain({
        requestVertexNormals: true,
        requestWaterMask: false
      })
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(110.1, 32, 10000),
        duration: 1.6
      })
      let waterH = 270
      let x = 1
      viewer.scene.globe.depthTestAgainstTerrain = true
      entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(110.1, 32),
        ellipse: {
          semiMinorAxis: 10000,
          semiMajorAxis: 10000,
          height: 0,
          extrudedHeight: new Cesium.CallbackProperty(() => {
            waterH += 0.15 * x
            if (waterH > 310) {
              x = -1
            }
            if (waterH < 270) {
              x = 1
            }
            return waterH
          }, false), // 多边形凸出面高度
          material: Cesium.Color.BLUE.withAlpha(0.3)
        }
      })
    } else {
      viewer.scene.terrainProvider=new Cesium.EllipsoidTerrainProvider({});
      viewer.entities.remove(entity)
    }

}