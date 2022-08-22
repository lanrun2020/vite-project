// 静态雷达模型
import Cesium from "@/utils/importCesium"

let model: any = null
export const addStaticRadar = (viewer: any, active: boolean) => {
  if (active) {
    if (model) {
      viewer.flyTo(model)
      return
    }
    model = viewer.entities.add({
      id: "model1",
      position: Cesium.Cartesian3.fromDegrees(103.955572, 30.559105, 443),
      model: {
        uri: `/model/radar_static.gltf`,
        scale: 0.01,
      },
    });
    viewer.flyTo(model)
  } else {
    if (model) {
      viewer.entities.remove(model);
      model = null
    }
  }
}