
import Cesium from '@/utils/importCesium'
// 经纬度 转 屏幕坐标
const pointsTurnToScreen = (scene:any, lng: number, lat: number) => {
  let pos = Cesium.Cartesian3.fromDegrees(lng, lat); // 经纬度 转 笛卡尔世界坐标
  return Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, pos); // 笛卡尔世界坐标 转 屏幕坐标
};

export {pointsTurnToScreen}