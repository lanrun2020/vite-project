import Cesium from "@/utils/importCesium"
import river from '../../assets/arrow1.jpg'
// import * as LeaderLine from 'leader-line'
const entities: object[] = []
let arr:{x:number,y:number, position:typeof Cesium.Cartesian3}[] = []
let boxArr:{box:HTMLElement,point:HTMLElement,leaderLine:typeof LeaderLine}[] = []
let renderFuc:Function
const styleOption = {
  // 连线颜色 coral （默认） , 取值参考颜色值
  color: "coral",
  // 连线尺寸 4（默认）
  size: 4,
  // 连线类型 straight 直线 , arc 曲线 , fluid 流体线（默认） , magnet 磁铁线 , grid 折线
  path: "straight",
  // 连线边框显示 false （默认）
  outline: true,
  // 连线边框颜色 indianred （默认） , 取值参考颜色值
  outlineColor: "rgba(0,255,255,1)",
  // 连线使用虚线 true 开启 ， false 不开启（默认）
  dash: {
    // 绘制线的长度 'auto'=size*2
    len: "auto",
    // 绘制线之间的间隙 'auto'=size
    gap: "auto",
    // 线条滚动 true 是(或者{duration: 1000, timing: 'linear'}，详见动画选项)， false 否（默认）
    animation: {
      duration: 1000,
      timing: "linear",
    },
  },
  // 连线使用渐变色 true 开启 ， false 不开启（默认）
  // 渐变色开始色为startPlugColor，渐变色结束色为endPlugColor
  gradient: true,
  // 连线开始元素
  start: "",
  // 连线结束元素
  end: "",
  // 连线从元素某侧开始 top 上 , right 右 , bottom 下 , left 左 , auto 自适应（默认）
  startSocket: "auto",
  // 连线从元素某侧结束
  endSocket: "auto",
  // 连线开始点样式
  // disc 圆形 , square 方形 , arrow1 箭头1 , arrow2 箭头2 , arrow3 箭头3 ,
  // hand 手指 , crosshair 十字准线 , behind 无（默认）
  startPlug: "behind",
  // 连线结束点样式 arrow1 箭头1（默认）
  endPlug: "arrow1",
  // 连线开始点颜色 auto 自适应（默认） , 取值参考颜色值
  startPlugColor: "#ff3792",
  // 连线结束点颜色
  endPlugColor: "#fff386",
  // 连线开始点尺寸 1 （默认）
  startPlugSize: 1,
  // 连线结束点尺寸 1 （默认）
  endPlugSize: 1,
  // 连线开始文字 默认为空
  startLabel: "",
  // 连线中间文字 默认为空
  middleLabel: "",
  // 连线结束文字 默认为空
  endLabel: "",
};
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
      const circleMaterial3 = new Cesium.CircleRotateMaterialProperty({
        color: new Cesium.Color(0.0, 1.0, 1.0, 1.0),
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
        // height: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
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
        // height: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        material:circleMaterial2,
      },
    }));
    let rotation = 0
    entities.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(115.69777, 34.05883),
      ellipse: {
        // 椭圆短半轴长度
        semiMinorAxis: 1000,
        // 椭圆长半轴长度
        semiMajorAxis: 1000,
        // height: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        material:circleMaterial3,
        stRotation: new Cesium.CallbackProperty(() => {
              // 设置旋转角度
              rotation -= 0.08
              return rotation
            }, false)
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
        positions: Cesium.Cartesian3.fromDegreesArray([
          115.59777,
          34.03883,
          115.69777,
          34.05883,
        ]), // 多个点坐标构成线条路径
        width: 4,
        clampToGround: true,
        material: lineMaterial,
      },
    }));
    entities.push(viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          115.59777,
          34.03883,
          115.63777,
          34.06883,
        ]), // 多个点坐标构成线条路径
        width: 4,
        clampToGround: true,
        material: Cesium.Color.RED,
      },
    }));
    entity.silhouetteSize = 2
    entity.silhouetteColor = Cesium.Color.ORANGE
    entities.push(entity)
    entities.push(entity2)
    entities.push(entity3)
    viewer.flyTo(viewer.entities)
    const dom = document.getElementById('cesiumContainer')
    const infoCard = document.createElement('div')
    infoCard.id = 'infoCard'
    infoCard.style.position = 'absolute'
    infoCard.style.bottom = '0'
    infoCard.style.height = '100%'
    infoCard.style.width = '100%'
    infoCard.style.pointerEvents = 'none'
    dom?.appendChild(infoCard)
    arr = [entity,entity2,entity3].map((item) => {
      return {
        x: 200,
        y: 100,
        position:item.position,
      }
      // return item.position
    })
    const positionArr = arr.map((item) => {
      return Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, item.position._value)
    })
    let moveIng = false
    boxArr = positionArr.map((item, index) => {
      const box = document.createElement('div')
      box.style.position = 'absolute'
      box.style.width = '200px'
      box.style.height = '200px'
      box.style.padding = '10px'
      box.style.color = '#00ffff'
      box.innerText = 'xxxxxxxxxxxxxxxx'
      box.style.backgroundColor = 'rgba(0,0,0,0.3)'
      box.style.top = (item.y - 200) + 'px'
      box.style.left = item.x + 'px'
      box.style.border = '1px solid #00ffff'
      box.style.zIndex = '1'
      box.style.cursor = 'pointer'
      box.style.pointerEvents = 'auto'
      infoCard.appendChild(box)
      const point = document.createElement('div')
      point.style.position = 'absolute'
      point.style.width = '0px'
      point.style.height = '0px'
      point.style.top = item.y + 'px'
      point.style.left = item.x + 'px'
      infoCard.appendChild(point)
      const leaderLine = new LeaderLine(box,point,styleOption)
      const downFuc = (eventDown: MouseEvent) => {
        // box.style.cursor = 'move'
        moveIng = true
        const clientX = eventDown.clientX //记录起始位置
        const clientY = eventDown.clientY
        const offsetTop = (infoCard.offsetParent! as HTMLElement).offsetTop
        const offsetLeft = (infoCard.offsetParent! as HTMLElement).offsetLeft
        const offsetX = eventDown.offsetX
        const offsetY = eventDown.offsetY
        const moveFuc = (event:MouseEvent) => {
          if (event && event.target) {
            box.style.left = (event.clientX - offsetX - offsetLeft) + 'px'
            box.style.top = (event.clientY - offsetY - offsetTop) + 'px'
            leaderLine.position()
          }
        }
        const upFuc = (event:MouseEvent) => {
          // box.style.cursor = 'pointer'
          moveIng = false
            //计算移动后的位置
            const disX = clientX - event.clientX
            const disY = clientY - event.clientY
            arr[index].x += disX
            arr[index].y += disY
            //移除mousemove和mouseup监听
            box.removeEventListener('mousemove', moveFuc)
            infoCard.removeEventListener('mouseup', upFuc)
            box.removeEventListener('mouseleave', upFuc)
        }
        box.addEventListener('mousemove', moveFuc)
        infoCard.addEventListener('mouseup', upFuc)
        box.addEventListener('mouseleave', upFuc)
      }
      box.addEventListener('mousedown', downFuc)
      return {
        box: box,
        point: point,
        leaderLine: leaderLine,
      }
    })
    console.log(viewer.scene);
    viewer.scene.postRender.addEventListener(renderFuc = () => {
      const positionArrNew = arr.map((item) => {
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, item.position._value)
      })
      if (!moveIng) {
        boxArr.forEach((item, index) => {
          item.box.style.top = (positionArrNew[index].y - 200 - arr[index].y) + 'px'
          item.box.style.left = positionArrNew[index].x - arr[index].x + 'px'
          item.point.style.top = positionArrNew[index].y + 'px'
          item.point.style.left = positionArrNew[index].x + 'px'
          const pointA = arr[index].position._value // 需要判断的当前点位置
          const pointB = viewer.camera.position // 相机位置
          const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA); // 已点A为坐标原点建立坐标系，此坐标系相切于地球表面
          const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
          const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
          const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
          if (viewer.scene.mode === 3) { //三维展示时
            if (direction.z < 0) {//地球背侧
              item.box.style.display = 'none'
              item.leaderLine.hide()
            } else {
              item.box.style.display = 'block'
              item.leaderLine.position()
              item.leaderLine.show()
            }
          } else {
            item.box.style.display = 'block'
            item.leaderLine.position()
            item.leaderLine.show()
          }
        })
      }
    })
  } else {
    boxArr.forEach((item) => {
      item.leaderLine.remove()
    })
    boxArr = []
    document.getElementById('infoCard')?.remove()
    arr = []
    viewer.scene.postRender.removeEventListener(renderFuc)
    entities.length && entities.forEach((entity) => {
      viewer.entities.remove(entity)
    })
  }
}