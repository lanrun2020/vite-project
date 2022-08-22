// 圆形旋转扫描效果
import Cesium from "@/utils/importCesium"
import bluePng from "@/assets/blue.png";

let entities: Array<any> = []
const defaultPoint = { lng: 125, lat: 30 }
export const addScanEllipse = (viewer: any, active: boolean, point: { lng: number, lat: number } = defaultPoint) => {
  if (active) {
    let rotation = Cesium.Math.toRadians(0);
    if (entities?.length) {
      viewer.flyTo(entities)
      return
    }
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 80000,
        // 椭圆长半轴长度
        semiMajorAxis: 80000,
        height: 10,
        extrudedHeight: 10000,
        material: new Cesium.ImageMaterialProperty({
          image: bluePng,
          transparent: true, // 透明
        }),
        stRotation: new Cesium.CallbackProperty(() => {
          // 设置旋转角度
          rotation += 0.08;
          return rotation;
        }, false),
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
};