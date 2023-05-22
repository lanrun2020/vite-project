// 多页扇形旋转扫描效果
import Cesium from "@/utils/importCesium"

let entities:Array<typeof Cesium.viewer.entity> = []
const defaultPoint = { lng: 121.5061830727844, lat:31.22723471021075 }
export const addScanEllipse = (viewer: any, active: boolean, point: { lng: number, lat: number } = defaultPoint) => {
  if (active) {
    if (entities.length) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(defaultPoint.lng, defaultPoint.lat, 5000.0),
        duration: 1.6
      });
      return
    }
    entities.push(viewer.entities.add({
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
          speed: 0.5,
          outLineShow: true,
          outLineWidth: 0.02,
          edge: 3.0,
          percent: 0.4,
          gradual: true,
          reverse: true,
          radiusLine: true,
          radiusLineNumber: 6.0,
        }),
      },
    }))
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lng + 0.003, point.lat - 0.005),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 500,
        // 椭圆长半轴长度
        semiMajorAxis: 500,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // height: 0.0,
        // extrudedHeight: 0,
        material: new Cesium.RotationMaterialProperty({
          color: new Cesium.Color(0.0, 1.0, 1.0, 1.0),
          speed: 0.5,
          outLineShow: true,
          outLineWidth: 0.02,
          edge: 1.0,
          percent: 0.2,
          gradual: true,
          radiusLine: true,
        }),
      },
    }))
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lng - 0.003, point.lat + 0.005),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 500,
        // 椭圆长半轴长度
        semiMajorAxis: 500,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // height: 0.0,
        // extrudedHeight: 0,
        material: new Cesium.RotationMaterialProperty({
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 0.5,
          outLineShow: true,
          outLineWidth: 0.02,
          edge: 3.0,
          percent: 0.3,
          gradual: true,
        }),
      },
    }))
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(defaultPoint.lng, defaultPoint.lat, 5000.0),
      duration: 1.6
    });
  } else {
    if (entities.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
};