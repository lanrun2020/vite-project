// 环绕卫星
import Cesium from "@/utils/importCesium"
// import { trackedEntity } from './util'
let entities: Array<object> = []
let entity: any
let renderId: number

const callback = (id:number) => {
  renderId = id
}
export const addSatellite2 = (viewer: any, active: boolean) => {
  if (active) {
    if (entities.length && entity) {
      viewer.flyTo(entity)
    } else {
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
          material: new Cesium.Color(0,1,1,0.4),
        }
      })
      entities?.push(entity)
      // viewer.flyTo(entity)
      let lng = 110
      const satellite = viewer.entities.add({
        id: 'satelliteModel',
        position: new Cesium.CallbackProperty(() => {
          return Cesium.Cartesian3.fromDegrees(lng, 28, 800000)
        }, false),
        model: {
          uri: `/model/satellite.glb`,
          scale: 600000,
          minimumPixelSize: 50,
        },
      })
      entities?.push(satellite)
      const radar = viewer.entities.add({
        id: 'radar',
        position: new Cesium.CallbackProperty(() => {
          //和模型使用的同一个lng,只是位置的高度不同
          lng += 0.001
          return Cesium.Cartesian3.fromDegrees(lng, 28, 400000)
        }, false),
        cylinder: {
          length: 800000,
          topRadius: 0,
          bottomRadius: 50000,
          material: new Cesium.RadarScanMaterialProperty(
            new Cesium.Color(.0, 1.0, 1.0, 1.0),
            80000,// 循环时长
            4.0,//速度
            50,//圈数
            .1,//环高
          )
        },
      })
      viewer.trackedEntity = satellite
      // viewer.trackedEntity = radar
      entities?.push(radar)
      // trackedEntity(viewer, radar, callback)
    }
  } else {
    if (entities?.length) {
      entities.forEach((item) => {
        viewer.entities.remove(item)
      })
      entities = []
      entity = null
      // cancelAnimationFrame(renderId)
    }
  }
}