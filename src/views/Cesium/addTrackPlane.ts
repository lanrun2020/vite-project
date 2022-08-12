// 追踪扫描 （追踪飞机模型）
import Cesium from "@/utils/importCesium"
import { calcPoints, getHeading, getPitch, getRoutePoints } from './util'
let entities: Array<object> = []
let onTickcallback1: Function

export const addTrackPlane = (viewer: any, active: boolean) => {
  if (active) {
    if (entities.length) return
    const startPoint = Cesium.Cartesian3.fromDegrees(
      103,
      32,
      0
    )
    let endPoint = Cesium.Cartesian3.fromDegrees(
      105,
      32,
      100000
    )
    let heading = 0
    entities.push(viewer.entities.add({
      position: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.midpoint(startPoint, endPoint, new Cesium.Cartesian3())
      }, false),
      cylinder: {
        length: new Cesium.CallbackProperty(() => {
          return Cesium.Cartesian3.distance(startPoint, endPoint)
        }, false),
        topRadius: 50000,
        bottomRadius: 0,
        material: new Cesium.RadarScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.6),
          30000,// 循环时长
          6.0,//速度
          20,//圈数
          .2,//环高
        ),
      },
      orientation: new Cesium.CallbackProperty(() => {
        const h = getHeading(startPoint, endPoint)
        const hpr = new Cesium.HeadingPitchRoll(
          Cesium.Math.toRadians(90), Cesium.Math.toRadians(90), Cesium.Math.toRadians(0)
        )
        const p = getPitch(startPoint, endPoint)
        hpr.pitch = hpr.pitch - p;
        hpr.heading = hpr.heading + h
        return Cesium.Transforms.headingPitchRollQuaternion(startPoint, hpr);
      }, false),
    }))
    const startPoint2 = Cesium.Cartesian3.fromDegrees(
      105,
      32,
      0
    )
    entities.push(viewer.entities.add({
      position: new Cesium.CallbackProperty(() => {
        return endPoint
      }, false),
      model: {
        uri: `/model/CesiumAir.glb`,
        scale: 2,
        minimumPixelSize: 60,
      },
      orientation: new Cesium.CallbackProperty(() => {
        const h = getHeading(startPoint2, endPoint)
        const hpr = new Cesium.HeadingPitchRoll(
          Cesium.Math.toRadians(180), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)
        )
        hpr.heading = hpr.heading + h
        return Cesium.Transforms.headingPitchRollQuaternion(startPoint2, hpr);
      }, false),
    }))

    viewer.clock.onTick.addEventListener(onTickcallback1 = () => {
      heading += 0.1
      endPoint = calcPoints(105, 32, 200000, heading, 500000)
    })
    const points = getRoutePoints(105, 32, 200000, 500000) //获取圆路径上的点
    entities.push(viewer.entities.add({
      polyline: {
        positions: points,
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.ORANGE,
          dashLength: 8.0,
        }),
      }
    }))
    const start = Cesium.JulianDate.now()
    const stop = Cesium.JulianDate.addSeconds(start, points.length, new Cesium.JulianDate())
    //时间段循环
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    //Set timeline to simulation bounds
    viewer.timeline.zoomTo(start, stop);
  } else {
    if (entities.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity);
      })
      viewer.clock.onTick.removeEventListener(onTickcallback1)
      entities = []
    }
  }

}