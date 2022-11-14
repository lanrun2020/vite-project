// 静态雷达模型
import Cesium from "@/utils/importCesium"

let model: any = null
export const addStaticRadar = (viewer: any, active: boolean) => {
  if (active) {
    viewer.scene.globe.depthTestAgainstTerrain = true;
    if (model) {
      viewer.flyTo(model)
      return
    }
    model = viewer.entities.add({
      id: "model_radar",
      position: Cesium.Cartesian3.fromDegrees(103.955572, 30.559105),
      model: {
        uri: `/model/radar_static.gltf`,
        scale: 0.01,
        // scale: 150,
        minimumPixelSize: 60,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND //模型贴地
      },
    });

  } else {
    if (model) {
      viewer.entities.remove(model);
      model = null
    }
  }
}