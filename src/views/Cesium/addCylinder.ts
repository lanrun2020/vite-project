// 人口统计柱状图 模拟
import Cesium from "@/utils/importCesium"
import redimg from '../../assets/newredLine.png'

let entity: Array<object> = []
let primitive:object
export const addCylinder = (viewer: any, active: boolean) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105, 26, 500000),
      duration: 1.6,
      orientation: {
        // 指向
        heading: Cesium.Math.toRadians(0),
        // 视角
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      }
    });

    if (entity?.length) return

    // const points = [{
    //   lon: 105,
    //   lat: 31,
    //   num: [20],
    // },
    // {
    //   lon: 105.6,
    //   lat: 31.6,
    //   num: [25,8],
    // },
    // {
    //   lon: 104.2,
    //   lat: 31.4,
    //   num: [46],
    // },
    // {
    //   lon: 105.2,
    //   lat: 30,
    //   num: [28, 16],
    // }]


    // let points =  Array.from({ length: 10000 }).map((any, i) => {
    //   return {
    //     lon:100 + Math.random()*20,
    //     lat:20 + Math.random()*20,
    //     num:[Math.random()*50,Math.random()*50,Math.random()*50]
    //   }
    // })

    let points = Array(1000).fill(null).map((any, i) => {
      return {
        lon: 100 + Math.random() * 20,
        lat: 20 + Math.random() * 20,
        num: [Math.random() * 50, Math.random() * 50, Math.random() * 50]
      }
    })

    points.forEach((item) => {
      addCylinderItem(viewer, item, Number((Math.random() * 49 + 1).toFixed(0)))
    })
      primitive = new Cesium.Primitive({
        geometryInstances: entity,
        appearance : new Cesium.PerInstanceColorAppearance({
          flat : true,
          faceForward:true,
          translucent : true,
          material:new Cesium.PolylineTrailLinkMaterialProperty(
            Cesium.Color.BLUE,
            3000,
            redimg,
            1
          )
        })
    });
    viewer.scene.primitives.add(primitive)
  } else {
    if (entity?.length) {
      viewer.scene.primitives.remove(primitive)
      entity.forEach((item) => {
        viewer.entities.remove(item)
      })
      entity = []
    }
  }
}
const addCylinderItem = (viewer: any, point: { lon: number, lat: number, num: Array<number> }, num: number) => {
  const sum = point.num.reduce((prev, curr) => {
    return prev + curr;
  });
  const r = Math.random()
  point.num.forEach((n, index) => {
    let h = n * 1000
    let startH = 0
    for (let i = 0; i < index; i++) {
      startH += point.num[i] * 1000
    }
    let h2 = 0
    let d = h / 300
    var center = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, h + 2 * startH)
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    var hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(
      new Cesium.HeadingPitchRoll(0.0, 0, 0.0)// 中心点水平旋转90度
    );
    var hpr = Cesium.Matrix4.fromRotationTranslation(
      hprRotation,
      new Cesium.Cartesian3(0.0, 0.0, 0.0)// 不平移
    );
    Cesium.Matrix4.multiply(modelMatrix, hpr, modelMatrix);
    let instance = new Cesium.GeometryInstance({
      geometry: new Cesium.CylinderGeometry({
        length: h * 2,
        topRadius: 5000.0,
        bottomRadius: 5000.0,
      }),
      attributes: {
        // color: new Cesium.ColorGeometryInstanceAttribute ( r, 1 - n / sum, 1, 1 )
        // color:Cesium.ColorGeometryInstanceAttribute.fromColor()
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(r, 1 - n / sum, 1, 1))
      },
      modelMatrix: modelMatrix, // 提供位置参数
    });
    entity.push(instance)



    // entity.push(viewer.entities.add({
    //   // position: new Cesium.CallbackProperty(() => {
    //   //   if (h2 < h) {
    //   //     h2 += d
    //   //   } else {
    //   //     h2 = h
    //   //   }
    //   //   return Cesium.Cartesian3.fromDegrees(point.lon, point.lat, h2 + 2 * startH)
    //   // }, false),
    //   position:Cesium.Cartesian3.fromDegrees(point.lon, point.lat, h + 2 * startH),
    //   cylinder: {
    //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 2000000.0),
    //     // length: new Cesium.CallbackProperty(() => {
    //     //   return h2 * 2
    //     // }, false),
    //     length:h * 2,
    //     topRadius: 5000.0,
    //     bottomRadius: 5000.0,
    //     material: new Cesium.Color(r, 1 - n / sum, 1, 1),
    //     // material:Cesium.Color.fromCssColorString('#'+num+'ADDF'),
    //     //   material: Cesium.Color.fromRandom({
    //     //     alpha: 1
    //     // }),
    //   },
    // }))
  })

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
