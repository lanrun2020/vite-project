// 扇形扩散
import Cesium from "@/utils/importCesium"
import radarMaterialsProperty from "./RadarMaterial7"
import river from '../../assets/arrow1.jpg'

const defaultPoint = { lng: 121.5061830727844, lat: 31.22723471021075 }
let primitive: typeof Cesium.Primitive
let primitives: any
let handler:any
const materialList = []
export const addScanEllipse3 = (viewer: any, active: boolean, point: { lng: number, lat: number } = defaultPoint) => {
  if (active) {
    const sxArr2 = [
      {
        angle: [0, 45],
        color: new Cesium.Color(0.0, 1.0, 0.0, 0.7),
        lng: 121.4861830727844,
        lat: 31.23723471021075,
        radius: 500
      },
      {
        angle: [90, 145],
        color: new Cesium.Color(1.0, 1.0, 0.0, 0.7),
        lng: 121.4861830727844,
        lat: 31.23723471021075,
        radius: 800
      },
      {
        angle: [170, 245],
        color: new Cesium.Color(0.0, 0.0, 1.0, 0.7),
        lng: 121.4861830727844,
        lat: 31.23723471021075,
        radius: 1000
      },
      {
        angle: [245, 360],
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
        lng: 121.4861830727844,
        lat: 31.23723471021075,
        radius: 500
      },
    ]
    primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    sxArr2.forEach((item, index) => {
      const instance = addCylinderItem(item, index)
      const radarMaterial = new radarMaterialsProperty()
      materialList.push(radarMaterial)
      primitive = new Cesium.Primitive({
        geometryInstances: instance,
        appearance: radarMaterial.getAppearance({ color: item.color,reverseColor:false, angleStart:item.angle[0],angleEnd:item.angle[1] }),
      });
      primitives.add(primitive)
    })
    console.log(primitives);
    
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(121.4861830727844, 31.23523471021075,10),
      billboard: {
        image: river, // default: undefined
        show: true, // default
        pixelOffset: new Cesium.Cartesian2(0,10),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
        width: 30, // default: undefined
        height: 30, // default: undefined
      },
    })
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(121.4861830727844, 31.23723471021075,10),
      point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })
    console.log(entity);
    
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
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let pickPrimitive = null
    let curColor = null
    // handler.setInputAction(function (event) {
    //   const pickedObjectArrays = viewer.scene.drillPick(event.endPosition);
    //   //夹角从正北方向顺时针旋转 范围0-360
    //   if(pickedObjectArrays && pickedObjectArrays.length){
    //     if (pickPrimitive) {
    //       pickPrimitive.appearance.setOptions({
    //         color: curColor,
    //       })
    //     }
    //     //这里只对第一个拾取的目标进行处理
    //     const item = pickedObjectArrays[0]
    //     if(item && item.primitive) {
    //       if (pickPrimitive) {
    //         pickPrimitive.appearance.setOptions({
    //           color: curColor,
    //         })
    //       }
    //       pickPrimitive = item.primitive
    //       curColor = pickPrimitive.appearance.material.uniforms.color
    //       const highColor = curColor.clone()
    //       highColor.alpha = 1.0
    //       item.primitive.appearance.setOptions({
    //         color: highColor,
    //       })
    //     }
    //   } else {
    //     if (pickPrimitive) {
    //       pickPrimitive.appearance.setOptions({
    //         color: curColor,
    //       })
    //       pickPrimitive = null
    //     }
    //   }
    // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function (event) {
      const pickedObjectArrays = viewer.scene.drillPick(event.position);
      //夹角从正北方向顺时针旋转 范围0-360
      console.log(pickedObjectArrays);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  } else {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)//移除事件
    primitives.removeAll()
    if (materialList.length) {
      materialList.forEach((item) => {
        item.close() //关闭材质tick
      })
    }
  }
}
const addCylinderItem = (point: any, index) => {
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.EllipseGeometry({
      center: Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
      height: index*0.02,
      semiMajorAxis: point.radius,
      semiMinorAxis: point.radius,
    }),
  });
  return instance
}
