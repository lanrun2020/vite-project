import Cesium from "@/utils/importCesium"

let model: any = null
export const addStaticRadar = (viewer: any, active: boolean) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(104, 32, 1000000),
      duration: 1.6
    });
    if(model) return
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