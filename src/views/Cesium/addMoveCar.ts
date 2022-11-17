// 控制汽车模型移动
import Cesium from "@/utils/importCesium"

let model: any = null
export const addMoveCar = (viewer: any, active: boolean) => {
  if (active) {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({})
    viewer.scene.globe.depthTestAgainstTerrain = true;
    if (model) {
      viewer.flyTo(model)
      return
    }
    model = viewer.entities.add({
      id: "modelCar",
      position: Cesium.Cartesian3.fromDegrees(103.9551, 30.56, 0),
      model: {
        uri: `/model/SUV.glb`,
        scale: 1,
        minimumPixelSize: 60,
        scene: viewer.scene,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND //模型贴地
      },
    });
    viewer.flyTo(model,{
      duration: 2,
      offset: new Cesium.HeadingPitchRange(0, -90, 2000)
    })
  } else {
    if (model) {
      viewer.entities.remove(model);
      model = null
    }
  }
}