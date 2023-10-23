// 多页扇形旋转扫描效果
import Cesium from "@/utils/importCesium"
import radarMaterialsProperty from "./RadarMaterial4"
const radarMaterial = new radarMaterialsProperty()

const defaultPoint = { lng: 121.5061830727844, lat: 31.22723471021075 }
const entity: Array<object> = []
let primitive: typeof Cesium.Primitive
let primitives: any
const count = 1500
export const addScanEllipse = (viewer: any, active: boolean, point: { lng: number, lat: number } = defaultPoint) => {
  if (active) {
    if (entity?.length) return
    const points = Array(count).fill('').map(() => {
      return {
        lon: point.lng + Math.random()*5 - 2.5,
        lat: point.lat + Math.random()*5 - 2.5,
      }
    })
    const instances = []
    primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    points.forEach((item, index) => {
      const instance = addCylinderItem(item, index)
      instances.push(instance)
    })
    primitive = new Cesium.Primitive({
      geometryInstances: instances,
      appearance: new Cesium.MaterialAppearance({
        material: radarMaterial.getMaterial({ color: new Cesium.Color(.1, 1, 0, 0.8), gradual: true, radiusLine: true, percent: 0.3 }),
        faceForward: !1, closed: !0,
      })
    });
    primitives.add(primitive)
    // 监听 Primitive 的加载完成事件
    // 添加监听事件后返回移除事件函数，调用即可移除监听
    const removeListener = viewer.scene.postRender.addEventListener(() => {
      if (!primitive.ready) {
        //加载中
        return;
      }
      //加载完成
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(defaultPoint.lng, defaultPoint.lat, 150000.0),
        duration: 1.6
      });
      //移除监听
      removeListener();
    });
    setTimeout(() => {
      radarMaterial.setOptions({color: new Cesium.Color(0, 1, 1, 0.8), radiusLine:false, percent:0.2, outLineShow:true, outLineWidth:0.04})
    }, 5000)
  } else {
    if (primitives) {
      primitives.removeAll()
      radarMaterial.close()
    }
  }
}
const addCylinderItem = (point: { lon: number, lat: number }, index) => {
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.EllipseGeometry({
      center: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
      height: index / count,
      semiMajorAxis: 2000.0,
      semiMinorAxis: 2000.0,
    }),
  });
  return instance
}
