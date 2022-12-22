import Cesium from "@/utils/importCesium"
import river from '../../assets/arrow1.jpg'

const entities: Array<object> = []

export const addBillboard = async (viewer: any, active: boolean) => {
  if (active) {
      // 终点与飞行线
      const lineMaterial = new Cesium.PolylineMaterialProperty({
        color: new Cesium.Color(0.0, 1.0, 1.0, 1.0),
        speed: 2,
        repeat: 5,
        thickness: .5
      });
      const circleMaterial = new Cesium.CircleMaterialProperty({
        color: new Cesium.Color(0.0, 1.0, 1.0, 1.0),
        speed: 1.0,
        repeat: 4,
        thickness: .2,
        flash: false
      });
      const circleMaterial2 = new Cesium.CircleMaterialProperty({
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
        speed: 1.0,
        repeat: 1,
        thickness: .8,
        flash: true
      });
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.59777, 34.03883,1),
      billboard: {
        image: river, // default: undefined
        show: true, // default
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
        width: 30, // default: undefined
        height: 30, // default: undefined
      },
    })
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.59777, 34.03883),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 1000,
        // 椭圆长半轴长度
        semiMajorAxis: 1000,
        height: 1,
        material:circleMaterial,
      },
    }));
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.63777, 34.06883),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 1000,
        // 椭圆长半轴长度
        semiMajorAxis: 1000,
        height: 1,
        material:circleMaterial2,
      },
    }));
    const entity2 = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.69777, 34.05883,1),
      billboard: {
        image: river, // default: undefined
        show: true, // default
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
        width: 30, // default: undefined
        height: 30, // default: undefined
      },
      silhouetteSize:2,
    })
    const entity3 = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.63777, 34.06883,1),
      billboard: {
        image: river, // default: undefined
        show: true, // default
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
        width: 30, // default: undefined
        height: 30, // default: undefined
      },
      silhouetteSize:2,
    })
    entities.push(viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          115.59777,
          34.03883,
          1,
          115.69777,
          34.05883,
          1,
        ]), // 多个点坐标构成线条路径
        width: 4,
        material: lineMaterial,
      },
    }));
    entities.push(viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          115.59777,
          34.03883,
          1,
          115.63777,
          34.06883,
          1,
        ]), // 多个点坐标构成线条路径
        width: 4,
        material: Cesium.Color.RED,
      },
    }));
    console.log(entity);
    // entity.silhouetteSize = 2
    // entity.silhouetteColor = Cesium.Color.ORANGE
    entities.push(entity)
    entities.push(entity2)
    entities.push(entity3)
    viewer.flyTo(viewer.entities)
  } else {
    entities.length && entities.forEach((entity) => {
      viewer.entities.remove(entity)
    })
  }
}