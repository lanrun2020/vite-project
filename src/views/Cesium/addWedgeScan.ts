// 动态墙
import Cesium from "@/utils/importCesium"
import { chengdu } from "./geo"
let entity: Array<object> = []
const arr = new Array(chengdu.length / 2).fill('3000')
export const addWedgeScan = (viewer: any, active: boolean) => {
  if (active) {
    if (entity?.length) {
      viewer.flyTo(entity)
      return}
    entity = []
    entity.push(viewer.entities.add({
      name: "Wedge",
      position: Cesium.Cartesian3.fromDegrees(-102.0, 35.0, 50000.0),
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(-102.0, 35.0, 50000.0),
        new Cesium.HeadingPitchRoll(Cesium.Math.PI / 1.5, 0, 0.0)
      ),
      ellipsoid: {
        radii: new Cesium.Cartesian3(500000.0, 500000.0, 500000.0), //椭球的半径
        innerRadii: new Cesium.Cartesian3(10000.0, 10000.0, 10000.0), //椭球内部的半径
        minimumClock: Cesium.Math.toRadians(-15.0), //椭圆形的最小时钟角度
        maximumClock: Cesium.Math.toRadians(15.0), //椭圆形的最大时钟角度
        minimumCone: Cesium.Math.toRadians(75.0), //椭圆体的最小锥角
        maximumCone: Cesium.Math.toRadians(105.0), //椭圆体的最大锥角
        material: Cesium.Color.DARKCYAN.withAlpha(0.3),
        outline: true,
      },
    }))
    let radius = 400000.0
    entity.push(viewer.entities.add({
      name: "Wedge2",
      position: Cesium.Cartesian3.fromDegrees(-102.0, 35.0, 50000.0),
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(-102.0, 35.0, 50000.0),
        new Cesium.HeadingPitchRoll(Cesium.Math.PI / 1.5, 0, 0.0)
      ),
      ellipsoid: {
        radii: new Cesium.CallbackProperty(() => {
          if (radius > 500000){
            radius = 0
          }
          radius += 2000
          return new Cesium.Cartesian3(radius, radius, radius)
        },false), //椭球的半径
        minimumClock: Cesium.Math.toRadians(-15.0), //椭圆形的最小时钟角度
        maximumClock: Cesium.Math.toRadians(15.0), //椭圆形的最大时钟角度
        minimumCone: Cesium.Math.toRadians(75.0), //椭圆体的最小锥角
        maximumCone: Cesium.Math.toRadians(105.0), //椭圆体的最大锥角
        material: Cesium.Color.DARKCYAN.withAlpha(0.3),
        outline: false,
      },
    }))
    let Radians = 0
    entity.push(viewer.entities.add({
      name: "Wedge3",
      position: Cesium.Cartesian3.fromDegrees(-102.0, 35.0, 50000.0),
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(-102.0, 35.0, 50000.0),
        new Cesium.HeadingPitchRoll(Cesium.Math.PI / 1.5, 0, 0.0)
      ),
      ellipsoid: {
        radii: new Cesium.Cartesian3(500000.0, 500000.0, 500000.0), //椭球的半径
        innerRadii: new Cesium.Cartesian3(10000.0, 10000.0, 10000.0), //椭球内部的半径
        minimumClock: new Cesium.CallbackProperty(() => {
          if (Radians > 15){
            Radians = -15
          }
          Radians += 0.1
          return Cesium.Math.toRadians(Radians)
        },false), //椭圆形的最小时钟角度
        maximumClock: new Cesium.CallbackProperty(() => {
          return Cesium.Math.toRadians(Radians+0.01)
        },false), //椭圆形的最大时钟角度
        minimumCone: Cesium.Math.toRadians(75.0), //椭圆体的最小锥角
        maximumCone: Cesium.Math.toRadians(105.0), //椭圆体的最大锥角
        material: Cesium.Color.DARKCYAN.withAlpha(0.3),
        outline: false,
      },
    }))
    entity.push(viewer.entities.add({
      name: "Partial ellipsoid",
      position: Cesium.Cartesian3.fromDegrees(-95.0, 34.0, 300000),
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(-95.0, 34.0, 300000.0),
        new Cesium.HeadingPitchRoll(0, 0, 0.0)
      ),
      ellipsoid: {
        radii: new Cesium.Cartesian3(300000.0, 300000.0, 300000.0),
        innerRadii: new Cesium.Cartesian3(1.0, 1.0, 300000.0),
        minimumClock: Cesium.Math.toRadians(0.0),
        maximumClock: Cesium.Math.toRadians(360.0),
        minimumCone: Cesium.Math.toRadians(0.0),
        maximumCone: Cesium.Math.toRadians(80.0),
        material: Cesium.Color.DARKCYAN.withAlpha(0.3),
        stackPartitions: 32,
        slicePartitions: 32,
        outline: true,
      },
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