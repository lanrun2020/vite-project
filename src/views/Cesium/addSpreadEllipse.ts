// 圆形扩散扫描效果
import Cesium from "@/utils/importCesium"
import greenPng from "@/assets/green.png";
let entities: Array<any> = []

const positionDefalut = { lng:120, lat:35 }
// 创建扩散圆组
export const addSpreadEllipse = (
  viewer: any,
  active: boolean,
  position: { lng: number; lat: number } = positionDefalut,
  maxr = 60000,
  speed = 200,
  n = 3
) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(position.lng,position.lat, 1000000),
      duration: 1.6
    });
    if(entities?.length) return
    for (let i = 0; i < n; i++) {
      addEllipse(viewer, position, (i / n) * maxr, maxr, speed);
    }
  } else {
    destroyEntities(viewer)
  }

};
// 创建扩散圆
const addEllipse = (
  viewer: any,
  position: { lng: number; lat: number },
  startR: number,
  maxR: number,
  speed: number
) => {
  entities.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(position.lng, position.lat),
    ellipse: {
      // 椭圆短半轴长度
      semiMinorAxis: new Cesium.CallbackProperty(() => {
        if (startR <= maxR) {
          startR += speed;
        } else {
          startR = 0;
        }
        return startR;
      },false),
      // 椭圆长半轴长度
      semiMajorAxis: new Cesium.CallbackProperty(() => {
        if (startR <= maxR) {
          startR = startR + speed;
        } else {
          startR = 0;
        }
        return startR + 200;
      },false),
      height: 10,
      extrudedHeight: 10,
      material: new Cesium.ImageMaterialProperty({
        image: greenPng, // 材质贴图
        color: new Cesium.CallbackProperty(() => {
          return Cesium.Color.WHITE.withAlpha(1 - startR / maxR + 0.05);
        },false),
        transparent: true, // 材质是否透明（贴图为png格式图片时适用）
        // repeat: new Cesium.Cartesian2(4, 4),//贴图重复参数
      }),
    },
  }));
};

const destroyEntities = (viewer: any) => {
  if (entities?.length) {
    entities.forEach((entity) => {
      viewer.entities.remove(entity)
    })
    entities = []
  }
}