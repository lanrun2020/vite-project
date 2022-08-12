// 环绕卫星
import Cesium from "@/utils/importCesium"
let entities: Array<object> = []
let entity: any
export const addSatellite2 = (viewer: any, active: boolean) => {
  if (active) {
    if (entities.length && entity) {
      viewer.flyTo(entity)
    } else {
      let lng = 110
      entity = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            0,
            28,
            800000,
            120,
            28,
            800000,
            -120,
            28,
            800000,
            0,
            28,
            800000,
          ]),
          width: 1,
          arcType: Cesium.ArcType.RHUMB,
          material: Cesium.Color.WHITE
        }
      })
      entities?.push(entity)
      viewer.flyTo(entity)
      entities?.push(viewer.entities.add({
        position: new Cesium.CallbackProperty(() => {
          lng += 0.02
          return Cesium.Cartesian3.fromDegrees(lng, 28, 800000)
        }, false),
        model: {
          uri: `/model/satellite.glb`,
          scale: 600000,
          minimumPixelSize: 50,
        },
        viewFrom: new Cesium.Cartesian3(-170.0, 28, 0.0),
      }))
      entities?.push(viewer.entities.add({
        position: new Cesium.CallbackProperty(() => {
          lng += 0.02
          return Cesium.Cartesian3.fromDegrees(lng, 28, 400000)
        }, false),
        cylinder: {
          length: 800000,
          topRadius: 0,
          bottomRadius: 300000,
          material: new Cesium.RadarScanMaterialProperty(
            new Cesium.Color(.1, 1, 0, 0.7),
            80000,// 循环时长
            6.0,//速度
            30,//圈数
            .1,//环高
          )
        },
      }))
    }
  } else {
    if (entities?.length) {
      entities.forEach((item) => {
        viewer.entities.remove(item)
      })
      entities = []
      entity = null
    }
  }
}