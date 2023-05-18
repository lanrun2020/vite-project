// 多页扇形旋转扫描效果
import Cesium from "@/utils/importCesium"

let entity
const defaultPoint = { lng: 121.5061830727844, lat:31.22723471021075 }
export const addScanEllipse = (viewer: any, active: boolean, point: { lng: number, lat: number } = defaultPoint) => {
  if (active) {
    if (entity) {
      viewer.flyTo(entity)
      return
    }
    entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 200,
        // 椭圆长半轴长度
        semiMajorAxis: 200,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // height: 0.0,
        // extrudedHeight: 0,
        material: new Cesium.RotationMaterialProperty({
          color: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
        }),
      },
    })
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lng + 0.003, point.lat - 0.005),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 500,
        // 椭圆长半轴长度
        semiMajorAxis: 500,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // height: 0.0,
        // extrudedHeight: 0,
        material: new Cesium.Rotation2MaterialProperty({
          color: new Cesium.Color(0.0, 1.0, 1.0, 1.0),
        }),
      },
    })
    viewer.flyTo(entity)
  } else {
    if (entity) {
        viewer.entities.remove(entity)
        entity = null
    }
  }
};