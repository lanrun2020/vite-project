// 人造卫星
import Cesium from "@/utils/importCesium"
import radarMaterialsProperty from "./RadarMaterial2"
let entities: Array<object> | null = null
let primitives: any
const radarMaterial = new radarMaterialsProperty({ color: new Cesium.Color(.1, 1, 0, 0.8), repeat: 1, thickness: 0.8, gradual: true, gradualValue: 0.6 })
const radarMaterial2 = new radarMaterialsProperty({ color: new Cesium.Color(.1, 1, 0, 1), repeat: 10, thickness: 0.2 })

export const addSatellite = (viewer: any, active: boolean) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(116, 24.5, 1200000),
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
      position: Cesium.Cartesian3.fromDegrees(118, 34),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 100000,
        // 椭圆长半轴长度
        semiMajorAxis: 100000,
        height: 1000,
        extrudedHeight: 1000,
        material: new Cesium.RadarScanMaterialProperty(
          new Cesium.Color(.1, 1, 0, 0.4),
          10000,// 循环时长
          2.0,//速度
          4,//圈数
          .1,//环高
        ),
      },
    }));

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

    entities.push(viewer.entities.add({
      id: "satellite3",
      position: Cesium.Cartesian3.fromDegrees(115.0, 30.0, 400000),
      model: {
        uri: `/model/satellite.glb`,
        scale: 300000,
        minimumPixelSize: 50,
      },
      viewFrom: new Cesium.Cartesian3(-170.0, 0.0, 0.0),
    }))

    var center = Cesium.Cartesian3.fromDegrees(115, 30, 200000)
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    let instance = new Cesium.GeometryInstance({
      geometry: new Cesium.CylinderGeometry({
        length: 400000,
        topRadius: 0.0,
        bottomRadius: 100000.0,
        vertexFormat: Cesium.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
      }),
      modelMatrix: modelMatrix, // 提供位置参数
    });
    var center2 = Cesium.Cartesian3.fromDegrees(118, 30, 200000)
    var modelMatrix2 = Cesium.Transforms.eastNorthUpToFixedFrame(center2);
    let instance2 = new Cesium.GeometryInstance({
      geometry: new Cesium.CylinderGeometry({
        length: 400000,
        topRadius: 0.0,
        bottomRadius: 100000.0,
        vertexFormat: Cesium.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
      }),
      modelMatrix: modelMatrix2, // 提供位置参数
    });
    let primitive1 = new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.MaterialAppearance({
        material: radarMaterial.getMaterial(), faceForward: !1, closed: !0
      })
    });
    let primitive2 = new Cesium.Primitive({
      geometryInstances: instance2,
      appearance: new Cesium.MaterialAppearance({
        material: radarMaterial2.getMaterial(), faceForward: !1, closed: !0
      })
    });
    primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    primitives.add(primitive2)
    primitives.add(primitive1)

  } else {
    if (entities?.length) {
      entities.forEach((item) => {
        viewer.entities.remove(item)
      })
      radarMaterial.close()
      radarMaterial2.close()
      // radarMaterials.setPosition({close:true})
      primitives.removeAll()
      entities = null
    }
  }
}