// 雷达扫描 扇形扫描
import Cesium from "@/utils/importCesium"
let entities: Array<any> = []
export const addScanWall = (viewer: any, active: boolean) => {
  if (active) {
    // 雷达扫描
    if (entities?.length) {
      viewer.flyTo(entities)
      return
    }
    const entity = viewer.entities.add({
      id: "scan",
      name: "Scan",
      position: Cesium.Cartesian3.fromDegrees(114, 30),
      ellipsoid: {
        radii: new Cesium.Cartesian3(50000.0, 50000.0, 50000.0),
        maximumCone: Cesium.Math.toRadians(90),
        material: new Cesium.WallScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.8),
          10000,// 循环时长
          1,//速度
          30,//圈数
          0.1,//环高
        ),
        outline: true,
        outlineColor: Cesium.Color.BLUE.withAlpha(0.2),
        outlineWidth: 1,
      },
    })
    entities.push(entity)
    console.log(entity);
    setTimeout(()=>{
      entity.ellipsoid.outlineColor = Cesium.Color.RED.withAlpha(1),
      console.log(entity);
    },6000)
    let heading = 0;
    entities.push(viewer.entities.add({
      id: "wall",
      wall: {
        positions: new Cesium.CallbackProperty(() => {
          heading -= 1;
          return Cesium.Cartesian3.fromDegreesArrayHeights(
            calcPoints(114, 30, 50000, heading)
          );
        }, false),
        material: Cesium.Color.AQUAMARINE.withAlpha(0.5),
      },
    }));
    viewer.flyTo(entities)
  } else {
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
}

// 根据两个点 开始角度、夹角度 求取立面的扇形
const computeCirclularFlight = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  fx: number,
  angle: number
) => {
  const positionArr: Array<number> = [];
  positionArr.push(x1);
  positionArr.push(y1);
  positionArr.push(0);
  const radius = Cesium.Cartesian3.distance(
    Cesium.Cartesian3.fromDegrees(x1, y1),
    Cesium.Cartesian3.fromDegrees(x2, y2)
  );
  for (let i = fx; i <= fx + angle; i++) {
    const h = radius * Math.sin((i * Math.PI) / 180.0);
    const r = Math.cos((i * Math.PI) / 180.0);
    const x = (x2 - x1) * r + x1;
    const y = (y2 - y1) * r + y1;
    positionArr.push(x);
    positionArr.push(y);
    positionArr.push(h);
  }
  return positionArr;
};

// 根据第一个点 偏移距离 角度 求取第二个点的坐标
const calcPoints = (
  x1: number,
  y1: number,
  radius: number,
  heading: number
) => {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(x1, y1)
  );
  const rx = radius * Math.cos((heading * Math.PI) / 180.0);
  const ry = radius * Math.sin((heading * Math.PI) / 180.0);
  const translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
  const d = Cesium.Matrix4.multiplyByPoint(
    m,
    translation,
    new Cesium.Cartesian3()
  );
  const c = Cesium.Cartographic.fromCartesian(d);
  const x2 = Cesium.Math.toDegrees(c.longitude);
  const y2 = Cesium.Math.toDegrees(c.latitude);
  return computeCirclularFlight(x1, y1, x2, y2, 0, 90);
};