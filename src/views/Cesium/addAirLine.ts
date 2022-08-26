// 飞机航线2
import Cesium from "@/utils/importCesium"
import { computeCirclularFlight, getHeading } from './util'
import axios from "axios";

let entities: Array<object> = []
let renderId:any
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
        // material: new Cesium.PolylineMaterialProperty({
        //   color: new Cesium.Color(0.0, 0.0, 1.0, 1.0),
        //   repeat: 5
        // }),
      }
    }))
    const plane = viewer.entities.add({
      id: "modelPlane",
      position: property,
      model: {
        uri: `/model/CesiumAir.glb`,
        scale: 0,
        minimumPixelSize: 40,
      },
      viewFrom: new Cesium.Cartesian3(-170.0, 0.0, 0.0),
      orientation: new Cesium.VelocityOrientationProperty(property),
    })
    entities.push(plane)

    let current = Cesium.clone(Cesium.Cartesian3.fromDegrees(
      103.95223,
      30.57428,
      2000
    ))
    const render = ()=>{
      const res = plane.position.getValue(viewer.clock.currentTime,new Cesium.Cartesian3())
      let quaternion = plane.orientation.getValue(viewer.clock.currentTime,new Cesium.Quaternion())
      if(!quaternion){
        viewer.clock.currentTime = viewer.clock.startTime
        quaternion = plane.orientation.getValue(viewer.clock.startTime,new Cesium.Quaternion())
      }
      const hpr = Cesium.HeadingPitchRoll.fromQuaternion(quaternion);
    // let transform = Cesium.Transforms.eastNorthUpToFixedFrame(res);
    // transform = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(quaternion), res);
    // viewer.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90.0),Cesium.Math.toRadians(0.0),-10.0))
    viewer.camera.flyTo({
      destination:res,
      duration:0.0,
      orientation:{
        heading: Cesium.Cartesian3.equals(current,res)?Cesium.Math.toRadians(0):getHeading(current,res),
        pitch: Cesium.Math.toRadians(0),
        roll: 0
    }})
    current = Cesium.clone(res)
  //   viewer.camera.flyTo({destination:res,duration:0.0,orientation:{
  //     heading:hpr.heading + Cesium.Math.toRadians(-45),
  //     pitch: Cesium.Math.toRadians(0),
  //     roll: 0
  // }})
    // viewer.camera.setView({
    //     destination:res,
    //     orientation:new Cesium.HeadingPitchRoll(
    //       hpr.heading + Cesium.Math.toRadians(-45),
    //       Cesium.Math.toRadians(0),
    //       Cesium.Math.toRadians(0),
    //     )
    //   })
      
      
      // console.log(hpr);
      renderId = requestAnimationFrame(render)
    }
    render()
    console.log(viewer.camera);
    // viewer.trackedEntity = entity;
    // entity.viewFrom = new Cesium.Cartesian3(-10.0, 7.0, 4.0);
  } else {
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
      cancelAnimationFrame(renderId)
    }
  }
}
