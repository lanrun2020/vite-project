// 动态墙
import Cesium from "@/utils/importCesium"
import { chengdu } from "./geo"
let entity: Array<object> = []
const arr = new Array(chengdu.length / 2).fill('3000')
export const addWall = (viewer: any, active: boolean) => {
  if (active) {
    if (entity?.length) {
      viewer.flyTo(entity)
      return}
    entity = []
    entity?.push(viewer.entities.add({
      name: "Green wall from surface with outline",
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArray(chengdu),
        maximumHeights: arr,
        outline: false,
        outlineColor: Cesium.Color(.1, 1, 0, 0.6),
        outlineWidth: 20,
        material: new Cesium.WallScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.6),
          3000,// 循环时长
          1.0,//速度
          6,//圈数
          .5,//环高
        ),
        // outline: false,
      }
    }))
    viewer.flyTo(entity)
  } else {
    if (entity?.length) {
      entity.forEach((item) => {
        viewer.entities.remove(item)
      })
      entity = []
    }
  }
}