// 飞机航线
import Cesium from "@/utils/importCesium"
import { computeCirclularFlight, getHeading } from './util'
import lineMaterialProperty from "@/materials/lineMaterial";
const lineMaterial = new lineMaterialProperty({ color: new Cesium.Color(0, 0, 1, 0.2), repeat: 1, speed: 0.4, thickness: 0.1 })
let entities: Array<object> = []
let renderId: any
let primitives: any

// 获取流动曲线上多个连续点
const generateCurve = (startPoint: object, endPoint: object, length: number, height = 0) => {
  const addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
  const midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic =
    Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height = height || 6000; // 将起始点、终点两个坐标点之间的距离除x,设置为此中间点的高度
  const midPoint = new Cesium.Cartesian3();
  Cesium.Ellipsoid.WGS84.cartographicToCartesian(
    midPointCartographic,
    midPoint
  ); // 初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转笛卡尔坐标（x,y,z）
  const spline = new Cesium.CatmullRomSpline({
    // 立方样条曲线
    times: [0.0, 0.5, 1], // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
    points: [startPoint, midPoint, endPoint], // 控制点,points.length必须 ≥ 2
  });
  const curvePoints: Array<object> = [spline.evaluate(0)];
  for (let i = 2, len = length; i <= len - 2; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  curvePoints.push(spline.evaluate(1));
  return curvePoints; // 返回曲线上的多个点坐标集合
};

export const addPlaneLine = (viewer: any, active: boolean) => {
  if (active) {
    if (entities?.length) return
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({})
    viewer.scene.globe.depthTestAgainstTerrain = true;
    const start = Cesium.JulianDate.now()
    const stop = Cesium.JulianDate.addSeconds(start, 500, new Cesium.JulianDate()) //一个点一秒
    //时间段循环
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.timeline.zoomTo(start, stop);
    const airList = new Array(500).fill('').map((item, index) => {
      const lon = 0 + Math.random() * 180 - 90
      const lon2 = lon + Math.random() * 180 - 90
      const lat = 0 + Math.random() * 90 - 45
      const lat2 = lat + Math.random() * 90 - 45
      return {
        id: index,
        startPoint: Cesium.Cartesian3.fromDegrees(lon, lat, 100),
        endPoint: Cesium.Cartesian3.fromDegrees(lon2, lat2, 100)
      }
    })
    // const instances:any = getInstances(Cesium.Cartesian3.fromDegrees(110, 30, 100),Cesium.Cartesian3.fromDegrees(130, 45, 100), start)
    // const polylines = new Cesium.PolylineCollection();
    primitives = viewer.scene.primitives.add(new Cesium.PolylineCollection())
    airList.forEach((item, index) => {
      addPlane(viewer, item, 500, start, primitives)
    })
    console.log(primitives);
    
    // primitives = viewer.scene.primitives.add(polylines)
    // viewer.scene.primitives.add(
    //   new Cesium.ModelInstanceCollection({
    //     url: `/model/CesiumAir.glb`,
    //     instances: instances,
    //   })
    // );

    // const render = () => { // 实时更新
    //   renderId = requestAnimationFrame(render)
    // }
  } else {
    lineMaterial.close()
    primitives.removeAll()
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      // cancelAnimationFrame(renderId)
      entities = []
    }
  }
}

const addPlane = (viewer: any, item: any, num: number, start: any, polylines:any) => {
  //轨迹起点，终点
  const startPoint = item.startPoint
  const endPoint = item.endPoint
  const points = generateCurve(startPoint, endPoint, num, 25000) //轨迹点集合，获取路径上的点
  const propertyLine = computeCirclularFlight(points, start)
  // console.log('points:' ,points);
  // console.log('propertyLine:' ,propertyLine);
  // const path = viewer.entities.add({
  //   position: propertyLine,
  //   name: 'plane path',
  //   id: "planePath" + item.id,
  //   path: {
  //     show: true,
  //     leadTime: 0,
  //     trailTime: 500,
  //     width: 2,
  //     resolution: 1,
  //     material: Cesium.Color.BLUE
  //   }
  // })
  const airPlane = viewer.entities.add({
    id: "modelPlane" + item.id,
    position: propertyLine,
    model: {
      uri: `/model/un.glb`,
      scale: 3,
      minimumPixelSize: 50,
    },
    orientation: new Cesium.VelocityOrientationProperty(propertyLine)
  })
  // entities.push(path);
  entities.push(airPlane)

  // const instance = new Cesium.GeometryInstance({
  //   geometry: new Cesium.CylinderGeometry({
  //     length: point.num * 2000,
  //     topRadius: 5000.0,
  //     bottomRadius: 5000.0,
  //   }),
  //   attributes: {
  //     color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.5, point.num / 50, 0, 1))
  //   },
  //   modelMatrix: modelMatrix, // 提供位置参数
  // });
  const source = `
    uniform vec4 color;\n
    czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        float dis = materialInput.s;\n\
        material.alpha = dis * color.a ;\n\
        material.diffuse = color.rgb;\n\
        return material;\n\
    }`

  const t = polylines.add({
    positions : points,
    width : 2,
    // material: lineMaterial.getMaterial(),
    material: new Cesium.Material({
      fabric : {
          uniforms: {
            color: new Cesium.Color(.1, 1, 0, 1),
          },
          source: source
        },
        translucent: true,
    })
  });
  // const primitive = {
  //   positions: points,
  //   // name: 'plane path',
  //   id: "planePath" + item.id,
  //   show: true,
  //   width: 2,
  //   material: Cesium.Color.BLUE
  // }
  // primitives.add({
  //   positions: points,
  //   name: 'plane path',
  //   id: "planePath" + item.id,
  //   show: true,
  //   width: 2,
  //   material: Cesium.Color.BLUE
  // })
  // const primitive = Cesium.Model.fromGltf({
  //     id: item.id,
  //     url: `/model/CesiumAir.glb`, // 本地文件
  //     // modelMatrix: towerMt4Tower,
  //     scale: 100, // 放大倍数
  //   })
  // return primitive
}

function getInstances(startP:any,endP:any,start:any) {
  const instances = [];
  const gridSize = Math.sqrt(1000);
  const cLon = 110;
  const cLat = 32;
  const spacing = 0.01;
  const height = 10000.0;
  const points = generateCurve(startP, endP, 200, 15000) //轨迹点集合，获取路径上的点
  const propertyLine = computeCirclularFlight(points, start)
  for (let y = 0; y < gridSize; ++y) {
    for (let x = 0; x < gridSize; ++x) {
      const longitude = cLon + spacing * (x - gridSize / 2);
      const latitude = cLat + spacing * (y - gridSize / 2);
      const position = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
      const heading = Math.random();
      const pitch = Math.random();
      const roll = Math.random();
      const scale = 20;
      const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        new Cesium.CallbackProperty(()=>{
          return position
        },false),
        new Cesium.HeadingPitchRoll(heading, pitch, roll)
      );
      Cesium.Matrix4.multiplyByUniformScale(
        modelMatrix,
        scale,
        modelMatrix
      );
      instances.push({
        modelMatrix: modelMatrix
      });
    }
  }
  return instances;
}