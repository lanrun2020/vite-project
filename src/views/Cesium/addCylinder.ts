// 人口统计柱状图 模拟
import Cesium from "@/utils/importCesium"

const entity: Array<object> = []
let primitive: object
let primitives: any
export const addCylinder = (viewer: any, active: boolean) => {
  if (active) {
    if (entity?.length) return
    // let points =  Array.from({ length: 10000 }).map((any, i) => {
    //   return {
    //     lon:100 + Math.random()*20,
    //     lat:20 + Math.random()*20,
    //     num:[Math.random()*50,Math.random()*50,Math.random()*50]
    //   }
    // })

    const points = Array(10000).fill('').map((any, i) => {
      return {
        lon: 100 + Math.random() * 100 - 50,
        lat: Math.random() * 160 - 80,
        num: Math.random() * 50
      }
    })
    //   primitive = new Cesium.Primitive({
    //     geometryInstances: [],
    //     appearance : new Cesium.PerInstanceColorAppearance({
    //       flat : true,
    //       faceForward:true,
    //       translucent : true,
    //       material:new Cesium.PolylineTrailLinkMaterialProperty(
    //         Cesium.Color.BLUE,
    //         3000,
    //         redimg,
    //         1
    //       )
    //     })
    // });
    primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    points.forEach((item) => {
      const cylinder = addCylinderItem(item)
      primitives.add(cylinder)
    })
  } else {
    if (primitives) {
      primitives.removeAll()
    }
  }
}
const addCylinderItem = (point: { lon: number, lat: number, num: number }) => {
  // const sum = point.num.reduce((prev, curr) => {
  //   return prev + curr;
  // });
  const r = Math.random()
  const center = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.num * 1000)
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.CylinderGeometry({
      length: point.num * 2000,
      topRadius: 5000.0,
      bottomRadius: 5000.0,
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.5, point.num / 50, 0, 1))
    },
    modelMatrix: modelMatrix, // 提供位置参数
  });
  // point.num.forEach((n, index) => {
  //   let h = n * 1000
  //   let startH = 0
  //   for (let i = 0; i < index; i++) {
  //     startH += point.num[i] * 1000
  //   }
  //   let h2 = 0
  //   let d = h / 300
  //   var center = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, h + 2 * startH)
  //   var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
  //   var hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(
  //     new Cesium.HeadingPitchRoll(0.0, 0, 0.0)// 中心点水平旋转90度
  //   );
  //   var hpr = Cesium.Matrix4.fromRotationTranslation(
  //     hprRotation,
  //     new Cesium.Cartesian3(0.0, 0.0, 0.0)// 不平移
  //   );
  //   Cesium.Matrix4.multiply(modelMatrix, hpr, modelMatrix);
  //   let instance = new Cesium.GeometryInstance({
  //     geometry: new Cesium.CylinderGeometry({
  //       length: h * 2,
  //       topRadius: 5000.0,
  //       bottomRadius: 5000.0,
  //     }),
  //     attributes: {
  //       color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(r, 1 - n / sum, 1, 1))
  //     },
  //     modelMatrix: modelMatrix, // 提供位置参数
  //   });
  //   arr.push(instance)
  // })
  primitive = new Cesium.Primitive({
    geometryInstances: instance,
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      faceForward: true,
      translucent: true,
    })
  });
  return primitive

  // entity.push(viewer.entities.add({
  //   position: new Cesium.CallbackProperty(() => {
  //     return Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 2 * sum + 10)
  //   }, false),
  //   label: {
  //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 2000000.0),
  //     text: num + 'W',
  //     font: "20px sans-serif",
  //     pixelOffset: new Cesium.Cartesian2(0.0, -10.0),
  //   },
  // }))
}
