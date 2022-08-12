// 迁徙线材质
import Cesium from '@/utils/importCesium'
import wallMater from '../../assets/redLine.png'

const source1 = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
        {\n\
            czm_material material = czm_getDefaultMaterial(materialInput);\n\
            vec2 st = fract (repeat *materialInput.st);\n\
            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
            material.alpha = colorImage.a * color.a;\n\
            material.diffuse = (colorImage.rgb+color.rgb)/1.0;\n\
            return material;\n\
        }";
function addPrimitiveFlowAppear(pos: any) {
  const primitive = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: pos,
        width: 5,
        vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT//可以不设置，一般会根据 appearance的类型自动默认对应的类型
      }),
      attributes: {
        //color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 1.0))
      }
    }),
    appearance: new Cesium.PolylineMaterialAppearance({
      material:
        Cesium.Material.fromType(Cesium.Material.FadeType, {
          repeat: true,
          fadeInColor: Cesium.Color.BLUE.withAlpha(0),
          fadeOutColor: Cesium.Color.WHITE,
          time: 0,
          fadeDirection: {
            x: true,
            y: false,
          }
        })
    })
  });
  return primitive
}
function addPrimiFlowline(pos: any, fs: any) {
  const primitive = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: pos,
        width: 10
      }),
      attributes: {
        //color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 1.0))
      }
    }),
    appearance: new Cesium.PolylineMaterialAppearance({
      translucent: true
    })
  });
  primitive.appearance.material = new Cesium.Material({
    fabric: {
      uniforms://uniforms,
      {
        time: 0,
        image: wallMater,
        animationSpeed: 1000,
        color: Cesium.Color.GREEN.withAlpha(0.5),
        repeat: new Cesium.Cartesian2(15.0, 1.0)
      },
      source: fs
    },
  });
  return primitive
}

export const createLine = (viewer: any, active: boolean, positions: Array<any>) => {
  // 通过设置fadetype 实现流动的线
  const primi = addPrimitiveFlowAppear(positions)
  viewer.scene.primitives.add(primi);
  // 添加数字流动线


  const linePos = Cesium.Cartesian3.fromDegreesArrayHeights([110.21725, 23.63556, 10000, 120.21725, 23.63556, 100000.0])
  // let linePos1 = Cesium.Cartesian3.fromDegreesArrayHeights([110.32044, 23.63392, 10000, 120.32044, 23.63392, 100000.0])
  // let lineUniforms = { animationSpeed: 1000,time: new Cesium.Cartesian2(0.0, 0.0), color: Cesium.Color.BLUE.withAlpha(0.6), repeat: new Cesium.Cartesian2(10.0, 1.0) }
  const num_line = addPrimiFlowline(linePos, source1)
  // num_line.appearance.material.uniforms = lineUniforms
  // let num_line1 = addPrimiFlowline(linePos1, source1)
  // num_line1.appearance.material.uniforms.color = Cesium.Color.BLACK
  // num_line1.appearance.material.uniforms.repeat = new Cesium.Cartesian2(10.0, 1.0)
  viewer.scene.primitives.add(num_line);
  // viewer.scene.primitives.add(num_line1);
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(120.32044, 23.63392, 1000000.0),
    duration: 1.6
  });
  let timex = 0;
  function render() {
    timex += 0.01;
    if (timex >= 1.0) {
      timex = 0; // 控制在0.0到1.0之间
    }

    // primi.appearance.material.uniforms.time.x = timex;
    // num_line.appearance.material.uniforms.time.x = timex;
    // num_line1.appearance.material.uniforms.time.x = timex;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

