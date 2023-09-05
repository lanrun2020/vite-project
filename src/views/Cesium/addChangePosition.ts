import Cesium from "@/utils/importCesium"
import river from '../../assets/arrow1.jpg'
let handler
export const addChangePosition = async (viewer: any, active: boolean) => {
  if (active) {
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.59777, 34.03883,200),
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
          115.59777, 34.03883,0,
          115.59777, 34.03883,200
        ]),
        width: 4,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.CYAN,
        }),
      },
    });    
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((clickEvent: any) => {
      const mouseY = clickEvent.position.y
      const mouseX = clickEvent.position.x
      const pick = viewer.scene.pick(clickEvent.position);
      console.log(clickEvent.position);
      
      if (pick && pick.id) {
        //1.获取此实体的高度，将线两端的位置转屏幕坐标计算差值
        const cartographic = Cesium.Cartographic.fromCartesian(pick.id.position._value);
        const height = cartographic.height //获取实体高度，后续好添加上去
        const latitude = cartographic.latitude
        const longitude = cartographic.longitude
        //将高度置0后转连线底部的笛卡尔坐标
        const cartesian3Bottom = Cesium.Cartesian3.fromRadians(longitude,latitude,0)
        //转屏幕坐标
        const cartesianBottom = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian3Bottom);
        //2.通过差值换算后通过屏幕坐标推出连线线底部经纬度坐标
        //计算此时点击的位置转屏幕坐标与上面的屏幕坐标的高度差值
        const disY = cartesianBottom.y - mouseY
        const disX = cartesianBottom.x - mouseX
        //3.再添加高度设置实体位置
        handler.setInputAction(function (event) {
          //获取到的鼠标高度减去差值再转经纬度，设置给实体
          const movePosition = event.endPosition
          movePosition.y += disY
          movePosition.x += disX //这一步换算的坐标会有一定偏差
          const d = ((movePosition.x - mouseX)/mouseX)*85
          // console.log(d);
          
          movePosition.x = movePosition.x-d
          const cartesian2 = viewer.camera.pickEllipsoid(movePosition, viewer.scene.globe.ellipsoid);
          //cartesian此点为连线底部点,接着将这个点高度提升200，再换算出坐标
          const cartographic2 = Cesium.Cartographic.fromCartesian(cartesian2);
          const height2 = cartographic2.height
          const latitude2 = cartographic2.latitude
          const longitude2 = cartographic2.longitude
          const cartesian3Top = Cesium.Cartesian3.fromRadians(longitude2,latitude2,height2+height)
          pick.id.position = cartesian3Top
          dashedLine.polyline.positions.setValue([cartesian2, cartesian3Top])
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