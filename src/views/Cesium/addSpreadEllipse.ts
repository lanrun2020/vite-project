// 圆形扩散扫描效果
import Cesium from "@/utils/importCesium"
let entities: Array<typeof Cesium.viewer.entity> = []
let primitives, handler
const defaultPoint = { lng: 121.4861830727844, lat: 31.22723471021075 }
export const addSpreadEllipse = (viewer: any, active: boolean, point: { lng: number, lat: number } = defaultPoint) => {
  if (active) {
    if (entities.length) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(defaultPoint.lng, defaultPoint.lat, 5000.0),
        duration: 1.6
      });
      return
    }
    // entities.push(viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
    //   ellipse: {
    //     // 椭圆短半轴长度
    //     semiMinorAxis: 500,
    //     // 椭圆长半轴长度
    //     semiMajorAxis: 500,
    //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //     material: new Cesium.DiffuseMaterialProperty({
    //       color: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
    //       speed: 1.0,
    //       repeat: 5.0,
    //       thickness: 0.1,
    //       reverseColor: true,
    //     }),
    //   },
    // }))
    const sxArr = [
      {
        lng: 121.4861830727844,
        lat: 31.22723471021075,
        radius: 500,
        color: new Cesium.Color(0.0, 1.0, 1.0, 0.5),
        angle:[0, 45],
      },
      {
        lng: 121.4861830727844,
        lat: 31.22723471021075,
        radius: 500,
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        angle:[45, 110],
      },
      {
        lng: 121.4861830727844,
        lat: 31.22723471021075,
        radius: 800,
        color: new Cesium.Color(0.0, 1.0, 0.0, 0.5),
        angle:[110, 145],
      },
      {
        lng: 121.4861830727844,
        lat: 31.22723471021075,
        radius: 1200,
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        angle:[120, 140],
      },
      {
        lng: 121.4961830727844,
        lat: 31.22723471021075,
        radius: 900,
        color: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
        angle:[145, 180],
      },
      {
        lng: 121.4901830727844,
        lat: 31.22723471021075,
        radius: 1000,
        color: new Cesium.Color(1.0, 1.0, 0.0, 0.5),
        angle:[180, 260],
      },
      {
        lng: 121.5061830727844,
        lat: 31.22723471021075,
        radius: 800,
        color: new Cesium.Color(1.0, 0.0, 1.0, 0.5),
        angle:[260, 340],
      }
    ]
    sxArr.forEach((item, index) => {
      entities.push(viewer.entities.add({
        id:'entitySx' + index,
        angle: item.angle,
        radius: item.radius,
        position: Cesium.Cartesian3.fromDegrees(item.lng, item.lat),
        ellipse: {
          // 椭圆短半轴长度
          semiMinorAxis: item.radius,
          // stRotation:  0.0, //采用纹理旋转，使用rotation对纹理无效，所以采用纹理旋转达到扇形偏转
          // 椭圆长半轴长度
          semiMajorAxis: item.radius,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          // height: 0.0,
          // extrudedHeight: 0,
          material: new Cesium.DiffuseMaterialProperty({
            color: item.color,
            speed: 1.0, //圆环移动速度
            reverse: false, //圆环扩散方向是否反转
            reverseColor: false, //颜色渐变是否反转
            thickness: 0.8,//圆环显示环高（0-1.0）
            repeat: 8.0,//圆环重复次数
            angle: item.angle[0],//扇形起始角度
            angle2: item.angle[1],//终止角度
          }),
        },
      }))
    })
    // entities.push(viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(point.lng - 0.006, point.lat + 0.008),
    //   ellipse: {
    //     // 椭圆短半轴长度
    //     semiMinorAxis: 400,
    //     // 椭圆长半轴长度
    //     semiMajorAxis: 400,
    //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //     // height: 0.0,
    //     // extrudedHeight: 0,
    //     material: new Cesium.DiffuseMaterialProperty({
    //       color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
    //       speed: 1.0,
    //       reverse: true,
    //       thickness: 0.1,
    //     }),
    //   },
    // }))
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(defaultPoint.lng, defaultPoint.lat, 5000.0),
      duration: 1.6
    });

    // 根据中心点 起始偏移角度,终止角度，求扇形
    const calcPoints = (
      x1: number,
      y1: number,
      radius: number,
      angle1: number,
      angle2: number,
    ) => {
      const m = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(x1, y1)
      );
      const positionArr: Array<number> = [];
      positionArr.push(x1);
      positionArr.push(y1);
      for (let i = angle1; i <= angle2; i++) {
        const ry = radius * Math.cos(Cesium.Math.toRadians(i));
        const rx = radius * Math.sin(Cesium.Math.toRadians(i));
        const translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
        const d = Cesium.Matrix4.multiplyByPoint(
          m,
          translation,
          new Cesium.Cartesian3()
        );
        const c = Cesium.Cartographic.fromCartesian(d);
        const x2 = Cesium.Math.toDegrees(c.longitude);
        const y2 = Cesium.Math.toDegrees(c.latitude);
        positionArr.push(x2);
        positionArr.push(y2);
      }
      return positionArr
    };

    //primitive加载构造的扇形多边形
    const sxArr2 = [
      {
        angle:[0, 45],
        color: new Cesium.Color(1.0,0.0,0.0,1.0),
        lng: 121.4861830727844,
        lat: 31.23723471021075,
        radius: 500
      },
      {
        angle:[70, 120],
        color: new Cesium.Color(0.0,1.0,0.0,1.0),
        lng: 121.4861830727844,
        lat: 31.23723471021075,
        radius: 500
      },
      {
        angle:[140, 300],
        color: new Cesium.Color(0.0,0.0,1.0,1.0),
        lng: 121.4861830727844,
        lat: 31.23723471021075,
        radius: 500
      },
    ]
    primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    sxArr2.forEach((g, index) => {
      const instance2 = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(calcPoints(g.lng, g.lat, g.radius, g.angle[0], g.angle[1]))
          )
        }),
      });
      const v = `
      attribute vec3 position3DHigh;
      attribute vec3 position3DLow;
      attribute vec2 st;
      attribute float batchId;
      uniform vec3 v_center;
      varying float dis;
      varying vec2 v_st;
      varying vec2 f_dis;
      varying vec3 v_positionEC;
      uniform float uTime;
      void main()
      {
          vec4 p = czm_computePosition(); //使用czm_computePosition必须要使用---> position3DHigh,position3DLow,batchId;
          v_positionEC = (czm_modelViewRelativeToEye * p).xyz;
          gl_Position = czm_modelViewProjectionRelativeToEye * p;
      }`
      const f = `
      uniform vec3 v_center;
      varying vec3 v_positionEC;
      uniform float v_radius;
      uniform vec4 v_color;
      void main()
      {
          float time = fract(czm_frameNumber*0.005);
          vec4 color = v_color;
          vec4 pos = czm_inverseModelView * vec4(v_positionEC, 1.0);
          float dis = distance(vec4(v_center,1.0),pos);
          float sp = 1.0/5.0;
          float d = 1.0 - dis/v_radius;
          float m = mod(d + time, sp);
          float a = step(m, sp*0.5);
          gl_FragColor = vec4(color.xyz, a * d);
      }`
      const appearance = new Cesium.MaterialAppearance({
        translucent: true,
        vertexShaderSource: v,
        fragmentShaderSource: f,
      })
      appearance.uniforms = {
        v_radius: g.radius,
        v_color: g.color,
        v_center: Cesium.Cartesian3.fromDegrees(g.lng, g.lat)
      }
      //这里采用GroundPrimitive可以在开启深度检测的情况下贴地,如果采用Primitive在开启深度检测时会与贴图交叉重合
      //采用GroundPrimitive时自定义shader不生效
      const primitive2 = new Cesium.Primitive({
        geometryInstances: instance2,
        appearance
      })
      primitives.add(primitive2)
    })

    //以下代码是计算鼠标点击点与某点正北放向夹角的
    const getHeading = (fromPosition, toPosition) => {
      const finalPosition = new Cesium.Cartesian3()
      const matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
      Cesium.Matrix4.inverse(matrix4, matrix4)
      Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
      Cesium.Cartesian3.normalize(finalPosition, finalPosition)
      return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
    }
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let pickEntity = null //记录拾取的实体
    // 获取两点之间距离
    const getDistance = (start, end) => {
      const geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(start, end); //设置测地线起点终点
      return geodesic.surfaceDistance //返回距离
    }
    handler.setInputAction(function (event) {
      const pickedObjectArrays = viewer.scene.drillPick(event.endPosition);
      const cartesian = viewer.camera.pickEllipsoid(event.endPosition, viewer.scene.globe.ellipsoid);
      //夹角从正北方向顺时针旋转 范围0-360
      if(pickedObjectArrays && pickedObjectArrays.length){
        if(pickEntity){ //先将之前选中的恢复默认
          pickEntity.ellipse.material._color.alpha = 0.6
        }
        pickedObjectArrays.forEach((item) => {
          if(item && item.id){
            if (!item.id._angle){
              return
            }
            //求圆心位置
            const car3 = item.id.position._value
            let angle = getHeading(car3, cartesian)
            if (angle < 0){
              angle += 360
            }
            const distance = getDistance(Cesium.Cartographic.fromCartesian(car3,viewer.scene.globe.ellipsoid), Cesium.Cartographic.fromCartesian(cartesian,viewer.scene.globe.ellipsoid))
            const color = item.id.ellipse.material._color.clone()
            //判断哪个扇形角度符合在夹角范围内就修改哪个圆材质alpha为1.0,如果不符合材质透明度设置为默认值0.5
            if (angle > item.id._angle[0] && angle < item.id._angle[1]){
              if(distance < item.id._radius){
                color.alpha = 2.5
                if(pickEntity){ //先将之前选中的恢复默认,保证只选中一个扇形
                  pickEntity.ellipse.material._color.alpha = 0.6
                }
                pickEntity = item.id
              } else {
                color.alpha = 0.6
              }
            } else {
              color.alpha = 0.6
            }
            item.id.ellipse.material._color = color
          }
        })
      } else {
        if(pickEntity){
            pickEntity.ellipse.material._color.alpha = 0.6
            pickEntity = null
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  } else {
  handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)//移除事件
  if (entities.length) {
    entities.forEach((entity) => {
      viewer.entities.remove(entity)
    })
    entities = []
  }
}
};