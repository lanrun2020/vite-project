import Cesium from "@/utils/importCesium"
import river from '../../assets/arrow1.jpg'
let handler
export const addChangePosition = async (viewer: any, active: boolean) => {
  if (active) {
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.59777, 34.03883,5),
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
          115.59777, 34.03883,1,
          115.59777, 34.03883,5
        ]),
        width: 4,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.CYAN,
        }),
      },
    });
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((clickEvent: any) => {
      // console.log(clickEvent);
      const mouseY = clickEvent.position.y
      const mouseX = clickEvent.position.x
      const pick = viewer.scene.pick(clickEvent.position);
      if (pick && pick.id) {
        // console.log(pick.id.position);
        //1.获取此实体的高度，将线两端的位置转屏幕坐标计算差值
        const cartographic = Cesium.Cartographic.fromCartesian(pick.id.position._value);
        // console.log(cartographic);
        const height = cartographic.height
        const latitude = cartographic.latitude
        const longitude = cartographic.longitude

        //将高度置0后转连线底部的笛卡尔坐标
        const cartesian3Bottom = Cesium.Cartesian3.fromRadians(longitude,latitude,0)
        //转屏幕坐标
        const cartesianBottom = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian3Bottom);
        // console.log(cartesianBottom);
        //2.通过差值换算后通过屏幕坐标推出连线线底部经纬度坐标
        //计算此时点击的位置转屏幕坐标与上面的屏幕坐标的高度差值
        const disY = cartesianBottom.y - mouseY

        //3.再添加高度设置实体位置
        handler.setInputAction(function (event) {
          //获取到的鼠标高度减去差值再转经纬度，设置给实体
          const movePosition = event.endPosition
          movePosition.y -= disY
          const cartesian = viewer.camera.pickEllipsoid(movePosition, viewer.scene.globe.ellipsoid);
          pick.id.position = cartesian
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(function () {
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)//移除事件
          handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)//移除事件
        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    viewer.flyTo(viewer.entities)
  } else {
    handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
  }
}