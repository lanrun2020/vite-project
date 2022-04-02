import Cesium from "@/utils/importCesium"
import redimg from '../../assets/newredLine.png'
import greenPng from "@/assets/green.png";
import bluePng from "@/assets/blue12.png";
let entity: any = null
const computeCircle = (radius: number) => {
  const positions: Array<object> = [];
  for (let i = 0; i < 360; i++) {
    const radians = Cesium.Math.toRadians(i);
    positions.push(
      new Cesium.Cartesian2(
        radius * Math.cos(radians),
        radius * Math.sin(radians)
      )
    );
  }
  return positions;
}

export const addTude = (viewer: any, active: boolean) => {
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

    if (entity) return
    // entity = viewer.entities.add({
    //   name: "Red tube with rounded corners",
    //   polylineVolume: {
    //     positions: Cesium.Cartesian3.fromDegreesArrayHeights([
    //       108.0,
    //       31.0,
    //       5000,
    //       112.0,
    //       32.0,
    //       5000,
    //       112.0,
    //       34.0,
    //       3000,
    //     ]),
    //     // cornerType: Cesium.CornerType.MITERED, // 拐角样式 
    //     // cornerType: Cesium.CornerType.ROUNDED, // 拐角样式 
    //     shape: computeCircle(6000.0),
    //     material: new Cesium.PolylineTrailLinkMaterialProperty(
    //       Cesium.Color.BLUE,
    //       3000,
    //       redimg,
    //       1,
    //       12
    //     ),
    //   },
    // });
    //

    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(112.0, 32.0, 200000),
      cylinder: {
        length: 400000.0,
        topRadius: 0.0,
        bottomRadius: 200000.0,
        material: new Cesium.RadarScanMaterialProperty(
                Cesium.Color.GREEN,
                3000,
                1,
                1,
                12
              )
      },
    });
    // viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(105.0, 40.0, 200000),
    //   cylinder: {
    //     length: 400000.0,
    //     topRadius: 0.0,
    //     bottomRadius: 200000.0,
    //     material: new Cesium.RadarScanMaterialProperty(
    //             Cesium.Color.GREEN,
    //             3000,
    //             0.5,
    //             1,
    //             12
    //           )
    //   },
    // });
    // let h:number = 400000.0
    // let sh:number = 0
    let i = Cesium.Cartesian3.fromDegrees(112.39, 39.9)
    let r = Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(i), new Cesium.Cartesian3(0, 0, 2e5), new Cesium.Matrix4)
    let geometry = new Cesium.CylinderGeometry({
      length: 400000,
      topRadius: 0,
      bottomRadius: 200000.0,
      vertexFormat: Cesium.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
    })
    let s = new Cesium.GeometryInstance({ geometry: geometry, modelMatrix: r })
    viewer.scene.primitives.add(new Cesium.Primitive({
      geometryInstances: [s],
      appearance: new Cesium.MaterialAppearance({
        material: new Cesium.Material({
          fabric: {
            type: "VtxfShader1",
            uniforms: {
              color: new Cesium.Color(.2, 1, 0, 1),
              repeat: 10,
              image:bluePng,
              offset: 0.0,
              thickness: .5, //环高
              time:(new Date()).getTime()
            },
            source: // float mod(float x, float y)  此函数会返回x除以y的余数。 //float step(float edge, float x)此函数会根据两个数值生成阶梯函数，如果x<edge则返回0.0，否则返回1.0
            `\n
            uniform vec4 color;\n
            uniform float repeat;\n
            uniform float offset;\n
            uniform float thickness;\n
            uniform float time;\n
            czm_material czm_getMaterial(czm_materialInput materialInput)\n
            {\n
              czm_material material = czm_getDefaultMaterial(materialInput);\n
              float sp = 1.0/repeat;\n
              vec2 st = materialInput.st;\n
              float dis = distance(st, vec2(0.5, 0.5));\n //从上自下 0 到 0.5
              float m = mod(dis, sp);\n
              float a =step(sp*(thickness),m);\n //返回0或1交错的repeat个阶梯值
              material.diffuse = color.rgb;\n
              material.alpha = a * color.a * (0.5 - dis);\n
              return material;\n
            }\n`
          }, translucent: !1
        }), faceForward: !1, closed: !0
      })
    }))
  } else {
    if (entity) {
      viewer.entities.remove(entity)
      entity = null
    }
  }
}