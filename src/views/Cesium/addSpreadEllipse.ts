// 圆形扩散扫描效果
import Cesium from "@/utils/importCesium"

let entities:Array<typeof Cesium.viewer.entity> = []
const defaultPoint = { lng: 121.4861830727844, lat:31.22723471021075 }
export const addSpreadEllipse = (viewer: any, active: boolean, point: { lng: number, lat: number } = defaultPoint) => {
  if (active) {
    if (entities.length) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(defaultPoint.lng, defaultPoint.lat, 5000.0),
        duration: 1.6
      });
      return
    }
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 500,
        // 椭圆长半轴长度
        semiMajorAxis: 500,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        material: new Cesium.DiffuseMaterialProperty({
          color: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
          speed: 1.0,
          repeat: 5.0,
          thickness: 0.1,
          reverseColor: true,
        }),
      },
    }))
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lng + 0.006, point.lat + 0.008),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 500,
        stRotation:  -Math.PI/6.0, //采用纹理旋转，使用rotation对纹理无效，所以采用纹理旋转达到扇形偏转
        // 椭圆长半轴长度
        semiMajorAxis: 500,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // height: 0.0,
        // extrudedHeight: 0,
        material: new Cesium.DiffuseMaterialProperty({
          color: new Cesium.Color(0.0, 1.0, 1.0, 1.0),
          speed: 1.0, //圆环移动速度
          reverse: false, //圆环扩散方向是否反转
          reverseColor: false, //颜色渐变是否反转
          thickness: 0.8,//圆环显示环高（0-1.0）
          repeat: 8.0,//圆环重复次数
          angle: 60,//扇形展示角度
        }),
      },
    }))
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lng - 0.006, point.lat + 0.008),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 400,
        // 椭圆长半轴长度
        semiMajorAxis: 400,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // height: 0.0,
        // extrudedHeight: 0,
        material: new Cesium.DiffuseMaterialProperty({
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          speed: 1.0,
          reverse: true,
          thickness: 0.1,
        }),
      },
    }))
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(defaultPoint.lng, defaultPoint.lat, 5000.0),
      duration: 1.6
    });
  } else {
    if (entities.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
};