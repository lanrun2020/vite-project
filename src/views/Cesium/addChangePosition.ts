import Cesium from "@/utils/importCesium"
import river from '../../assets/arrow1.jpg'
let handler
let entities = []
export const addChangePosition = async (viewer: any, active: boolean) => {
  if (active) {
    const height = 100
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.59777, 34.03883, height),
      billboard: {
        image: river, // default: undefined
        show: true, // default
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
        width: 30, // default: undefined
        height: 30, // default: undefined
      },
    })
    const dashedLine = viewer.entities.add({
      name: "Blue dashed line",
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          115.59777, 34.03883, 0,
          115.59777, 34.03883, height
        ]),
        width: 4,
        arcType: Cesium.ArcType.NONE,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.CYAN,
        }),
      },
    });
    entities.push(entity,dashedLine)
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((clickEvent: any) => {
      const pick = viewer.scene.pick(clickEvent.position);
      if (pick && pick.id) {
        handler.setInputAction(function (event) {
          //获取到的鼠标高度减去差值再转经纬度，设置给实体
          const movePosition = event.endPosition
          //1.获取此实体的高度，将线两端的位置转屏幕坐标计算差值
          const cartesianBottom2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, dashedLine.polyline.positions._value[1]);
          const cartesianTop2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, dashedLine.polyline.positions._value[0]);
          const disX2 = cartesianTop2.x - cartesianBottom2.x
          const disY2 = cartesianTop2.y - cartesianBottom2.y
          movePosition.x += disX2 //这一步换算的坐标会有一定偏差
          movePosition.y += disY2 //这一步换算的坐标会有一定偏差
          const cartesian2 = viewer.camera.pickEllipsoid(movePosition, viewer.scene.globe.ellipsoid);
          //cartesian此点为连线底部点,接着将这个点高度提升200，再换算出坐标
          const cartographic2 = Cesium.Cartographic.fromCartesian(cartesian2);
          const height2 = cartographic2.height
          const latitude2 = cartographic2.latitude
          const longitude2 = cartographic2.longitude
          const cartesian3Top = Cesium.Cartesian3.fromRadians(longitude2, latitude2, height2 + height)
          pick.id.position = cartesian3Top
          dashedLine.polyline.positions.setValue([cartesian2, cartesian3Top])
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(function () {
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)//移除事件
          handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)//移除事件
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    viewer.flyTo(viewer.entities)
  } else {
    handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
    handler = null
    if(entities.length){
      entities.forEach((entity) => viewer.entities.remove(entity))
      entities = []
    }
  }
}
