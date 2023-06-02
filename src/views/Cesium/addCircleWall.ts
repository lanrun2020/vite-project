// 圆形墙 模拟
import Cesium from "@/utils/importCesium"
import redimg from '../../assets/newredLine.png'
import * as turf from '@turf/turf'
let entities: Array<object> = []

//turf计算圆
const computeCircle = () => {
  const center = [110, 35];
  const radius = 100;
  const options = {steps: 360, units: 'kilometers', properties: {foo: 'bar'}};
  const circle = turf.circle(center, radius, options);
  return circle.geometry.coordinates.flat(Infinity)
}

const calcPoints = (
  x1: number,
  y1: number,
  radius: number,
  edge: number,
  height: number,
) => {
  const points = []
  for(let i=0;i<=360;i+=360/edge){
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(x1, y1)
    );
    const rx = radius * Math.cos((i * Math.PI) / 180.0);
    const ry = radius * Math.sin((i * Math.PI) / 180.0);
    const translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
    const d = Cesium.Matrix4.multiplyByPoint(
      m,
      translation,
      new Cesium.Cartesian3()
    );
    const c = Cesium.Cartographic.fromCartesian(d);
    const x2 = Cesium.Math.toDegrees(c.longitude);
    const y2 = Cesium.Math.toDegrees(c.latitude);
    points.push(x2,y2,height)
  }
  return points
};
export const addCircleWall = (viewer: any, active: boolean) => {
  if (active) {
    if (entities?.length) return
    const position = computeCircle()
    const p2 = calcPoints(110,35,5000,9,10000)
    entities.push(viewer.entities.add({
      name: "wall234",
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(p2),
        material: new Cesium.WallScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.6),
          3000,// 循环时长
          1.0,//速度
          6,//圈数
          .5,//环高
        ),
        outline: false,
      },
    }));
    entities.push(viewer.entities.add({
      name: "cylinder678",
      position: Cesium.Cartesian3.fromDegrees(110.0, 35.2, 10000.0),
      cylinder: {
        length: 10000.0,
        topRadius: 5000.0,
        bottomRadius: 5000.0,
        material: new Cesium.CylinderWallMaterialProperty({color:new Cesium.Color(0.0, 1.0, 0.0, 1.0), gradual:true}),
      },
    }))
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110, 35, 20000.0),
      duration: 1.6
    });
  } else {
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
}
