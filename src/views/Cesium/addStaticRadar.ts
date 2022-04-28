// 静态雷达模型
import Cesium from "@/utils/importCesium"

let model: any = null
export const addStaticRadar = (viewer: any, active: boolean) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(103.8, 30, 200000),
      duration: 1.6,
      orientation: {
        // 指向
        heading: Cesium.Math.toRadians(0),
        // 视角
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      }
    });
    if (model) return
    model = viewer.entities.add({
      id: "model1",
      position: Cesium.Cartesian3.fromDegrees(104, 32, 0),
      model: {
        uri: `/model/radar_static.gltf`,
        scale: 20,
      },
    });
  } else {
    if (model) {
      viewer.entities.remove(model);
      model = null
    }
  }
}