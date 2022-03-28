import Cesium from "@/utils/importCesium"
import river from '../../assets/river.png'
let entity: any = null
export const addRiverFlood = (viewer, active) => {
  if (active) {
    let waterH = 50
    let x = 1
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110.43934237419626, 31.01, 2000),
      duration: 1.6,
      orientation: {
        // 指向
          heading: Cesium.Math.toRadians(-30),
          // 视角
          pitch: Cesium.Math.toRadians(-35),
          roll: 0
        }
    });
    
    if (entity) return
    // entity = viewer.entities.add({
    //   polygon: {
    //     hierarchy: Cesium.Cartesian3.fromDegreesArray([
    //       110, 30.8,
    //       110, 32,
    //       110.8, 32,
    //       110.8, 30.8
    //     ]),
    //     height: 0,
    //     extrudedHeight: new Cesium.CallbackProperty(() => {
    //       waterH += 0.15 * x
    //       if (waterH > 230) {
    //         x = -1
    //       }
    //       if (waterH < 200) {
    //         x = 1
    //       }
    //       return waterH
    //     }),
    //     material: Cesium.Color.BLUE.withAlpha(0.5),
    //   },
    // });
    entity = viewer.entities.add({
      corridor: {
        positions: Cesium.Cartesian3.fromDegreesArray([110.32749851112206, 31.050083305294777, 110.33443269485927, 31.05168289430274, 110.34302449350467, 31.053406583515418, 110.35302961866132, 31.054373213987894, 110.36240104345136, 31.055003995006942, 110.37058790134958, 31.053317329419947, 110.37948058666436, 31.051251701835987, 110.38754410068489, 31.04912347646169, 110.39171966136183, 31.04663261074175, 110.39706186188253, 31.042504046386387, 110.40304805865807, 31.037776699076684, 110.40845019452587, 31.033867963119242, 110.41932411317056, 31.031156614259974, 110.4303818944795, 31.02910443925205, 110.43658082468635, 31.028055770666686, 110.43934237419626, 31.026320671530236, 110.44622725314518, 31.026759308015603, 110.45343958069229, 31.026431337346093, 110.45899472444229, 31.025980243013326, 110.46215794017324, 31.028585440677347, 110.46906817250337, 31.032976681244627, 110.47636835543207, 31.036821681668034, 110.48253265394646, 31.03950460823616, 110.48865458181271, 31.04009995953405, 110.49580053567782, 31.040482923740317, 110.50065317405996, 31.040409078501064, 110.50423554122094, 31.039666539449737]),
        height: 0,
        extrudedHeight: new Cesium.CallbackProperty(() => {
          waterH += 0.1 * x
          if (waterH > 60) {
            x = -1
          }
          if (waterH < 40) {
            x = 1
          }
          return waterH
        }),
        width: 800.0,
        cornerType: Cesium.CornerType.MITERED,
        material: new Cesium.PolylineTrailLinkMaterialProperty(
          Cesium.Color.BLUE.withAlpha(0.4),
          15000,
          river,
          0.3,
        ),
        outline: false, // height required for outlines to display
      }
    });

  } else {
    if (entity) {
      viewer.entities.remove(entity)
      entity = null
    }
  }

}