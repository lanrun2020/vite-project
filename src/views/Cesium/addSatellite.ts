// 人造卫星
import Cesium from "@/utils/importCesium"
import redimg from "@/assets/redLine.png"
import addRadar, { } from '@/views/Cesium/importMaterial'
let entities: Array<object> | null = null
let primitive, primitives
export const addSatellite = (viewer: any, active: boolean) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(113, 28.5, 600000),
      duration: 1.6,
      orientation: {
        // 指向
        heading: Cesium.Math.toRadians(-30),
        // 视角
        pitch: Cesium.Math.toRadians(-55),
        roll: 0
      }
    });

    if (entities?.length) return
    entities = []
    const entity1 = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(110.0, 30.0, 200000),
      cylinder: {
        length: 400000,
        topRadius: 0,
        bottomRadius: 150000,
        material: new Cesium.RadarScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.8),
          10000,// 循环时长
          1,//速度
          30,//圈数
          0.1,//环高
        )
      },
    })
    const entity2 = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(114.0, 34.0, 200000),
      cylinder: {
        length: 400000,
        topRadius: 0,
        bottomRadius: 120000,
        material: new Cesium.RadarScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.3),
          30000,// 循环时长
          6.0,//速度
          2,//圈数
          .9,//环高
        )
      },
    })
    entities.push(entity1)
    entities.push(entity2)

    entities.push(viewer.entities.add({
      id: "satellite",
      position: Cesium.Cartesian3.fromDegrees(110.0, 30.0, 400000),
      model: {
        uri: `/model/satellite.glb`,
        scale: 300000,
        minimumPixelSize: 50,
      },
      viewFrom: new Cesium.Cartesian3(-170.0, 0.0, 0.0),
    }))

    entities.push(viewer.entities.add({
      id: "satellite2",
      position: Cesium.Cartesian3.fromDegrees(114.0, 34.0, 400000),
      model: {
        uri: `/model/satellite.glb`,
        scale: 300000,
        minimumPixelSize: 50,
      },
      viewFrom: new Cesium.Cartesian3(-170.0, 0.0, 0.0),
    }))

    // var center = Cesium.Cartesian3.fromDegrees(115, 30, 200000)
    // var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    // let instance = new Cesium.GeometryInstance({
    //   geometry: new Cesium.CylinderGeometry({
    //     length: 400000,
    //     topRadius: 0.0,
    //     bottomRadius: 100000.0,
    //     vertexFormat: Cesium.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
    //   }),
    //   modelMatrix: modelMatrix, // 提供位置参数
    // });
    // primitive = new Cesium.Primitive({
    //   geometryInstances: instance,
    //   appearance: new Cesium.MaterialAppearance({
    //     material: new Cesium.Material({
    //       fabric: {
    //         type: Cesium.Material.RadarScanType,
    //         uniforms: {
    //           color: new Cesium.Color(.1,1,0,1),
    //           repeat: 12,
    //           thickness:0.5,// 环高
    //         },
    //         source: Cesium.Material.RadarScanSource,
    //       },
    //     })
    //   })
    // });
    // primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    // primitives.add(primitive)
  } else {
    if (entities?.length) {
      entities.forEach((item) => {
        viewer.entities.remove(item)
      })
      // primitives.removeAll()
      entities = null
    }
  }
}