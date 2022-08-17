// 飞机航线2
import Cesium from "@/utils/importCesium"
import { computeCirclularFlight } from './util'
import axios from "axios";

let entities: Array<object> = []

// 获取流动曲线上多个连续点
const generateCurve = async () => {
  const alt: any = []
  const gs: any = []
  const points: any = []
  // const time: any = []
  await axios.get('/flydata.json').then((res) => {
    const track = res.data['CCA4516'].track;
    track.forEach((item: any) => {
      alt.push(item.alt * 30)
      gs.push(item.gs)
      points.push(Cesium.Cartesian3.fromDegrees(...item.coord,item.gs))
      // const t = getTime(item.timestamp * 1000)
      // time.push(t)
    })
  })
  return points
};

export const addAirLine = async (viewer: any, active: boolean) => {
  if (active) {
    //起点，终点
    const points:any = await generateCurve() //获取路径上的点
    const start = Cesium.JulianDate.now()
    const stop = Cesium.JulianDate.addSeconds(start, points.length, new Cesium.JulianDate())
    //时间段循环
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    //Set timeline to simulation bounds
    viewer.timeline.zoomTo(start, stop);

    const property = computeCirclularFlight(points, start)

    //Populate it with data
    if (entities?.length) return
    entities.push(viewer.entities.add({
      id: "Blueline",
      name: "Blue dashed line",
      polyline: {
        positions: points,
        width: 3,
        material: new Cesium.PolylineMaterialProperty({
          color: new Cesium.Color(0.0, 0.0, 1.0, 1.0),
          repeat: 5
        }),
      }
    }))
    const entity = viewer.entities.add({
      id: "modelPlane",
      position: property,
      model: {
        uri: `/model/CesiumAir.glb`,
        scale: 2,
        minimumPixelSize: 40,
      },
      viewFrom: new Cesium.Cartesian3(-170.0, 0.0, 0.0),
      orientation: new Cesium.VelocityOrientationProperty(property),
    })
    entities.push(entity)
    // viewer.trackedEntity = entity;
    // entity.viewFrom = new Cesium.Cartesian3(-10.0, 7.0, 4.0);
  } else {
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
}
