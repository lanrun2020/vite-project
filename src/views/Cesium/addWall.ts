// 动态墙
// 流动管道
import Cesium from "@/utils/importCesium"
let entity: Array<object> | null = null

export const addWall = (viewer: any, active: boolean) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(106, 32.5, 600000),
      duration: 1.6,
      orientation: {
        // 指向
        heading: Cesium.Math.toRadians(-30),
        // 视角
        pitch: Cesium.Math.toRadians(-55),
        roll: 0
      }
    });

    if (entity?.length) return
    entity = []
    entity?.push(viewer.entities.add({
      name: "Green wall from surface with outline",
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          104.0,
          36.0,
          100000.0,
          103.0,
          36.0,
          100000.0,
          103.0,
          35.0,
          100000.0,
          104.0,
          35.0,
          100000.0,
          104.0,
          36.0,
          100000.0,
        ]),
        material: new Cesium.WallScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.6),
          3000,// 循环时长
          1.0,//速度
          3,//圈数
          .5,//环高
        ),
        outline: false,
      }
    }))
  } else {
    if (entity?.length) {
      entity.forEach((item) => {
        viewer.entities.remove(item)
      })
      entity = null
    }
  }
}