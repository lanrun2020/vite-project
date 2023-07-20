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
    const sxArr = [
      {
        radius: 500,
        color: new Cesium.Color(0.0, 1.0, 1.0, 0.5),
        angle:[0, 45],
      },
      {
        radius: 500,
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        angle:[45, 110],
      },
      {
        radius: 800,
        color: new Cesium.Color(0.0, 1.0, 0.0, 0.5),
        angle:[110, 145],
      },
      {
        radius: 1200,
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        angle:[120, 140],
      },
      {
        radius: 900,
        color: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
        angle:[145, 180],
      },
      {
        radius: 1000,
        color: new Cesium.Color(1.0, 1.0, 0.0, 0.5),
        angle:[180, 260],
      },
      {
        radius: 800,
        color: new Cesium.Color(1.0, 0.0, 1.0, 0.5),
        angle:[260, 340],
      }
    ]
    sxArr.forEach((item, index) => {
      entities.push(viewer.entities.add({
        id:'entitySx' + index,
        angle: item.angle,
        position: Cesium.Cartesian3.fromDegrees(point.lng + 0.006, point.lat + 0.008),
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
    // const sxArr = [[0, 45], [70, 120], [140, 200]]
    // sxArr.forEach((g,index) => {
    //    entities.push(viewer.entities.add({
    //     id: "sx"+index,
    //     polygon: {
    //       hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(calcPoints(point.lng + 0.006, point.lat + 0.008, 500,g[0],g[1]))),
    //       material: new Cesium.DiffuseMaterialProperty({
    //         color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
    //         speed: 1.0,
    //         thickness: 0.8,
    //         angle: Cesium.Cartesian3(point.lng + 0.006, point.lat + 0.008, 0),
    //       }),
    //     },
    //   }));
    // })
    // console.log(entities);
  //   primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
  //   sxArr.forEach((g, index) => {
  //     const instance2 = new Cesium.GeometryInstance({
  //       geometry: new Cesium.PolygonGeometry({
  //         polygonHierarchy: new Cesium.PolygonHierarchy(
  //           Cesium.Cartesian3.fromDegreesArray(calcPoints(point.lng + 0.006, point.lat + 0.008, 500, g[0], g[1]))
  //         )
  //       }),
  //     });
  //     const source = `
  //     czm_material czm_getMaterial(czm_materialInput materialInput)\n\
  //     {\n\
  //         czm_material material = czm_getDefaultMaterial(materialInput);\n\
  //         float x = materialInput.st.s;
  //         float y = materialInput.st.t;
  //         // float dis = distance(materialInput.st, vec2(0.0, 0.0));\n\
  //         // float dis = distance(v_positionEC, vec3(center));\n\
  //         material.alpha = color.a * x;\n\
  //         material.diffuse = color.rgb;\n\
  //         return material;\n\
  //     }`
  //     //这里采用GroundPrimitive可以在开启深度检测的情况下贴地,如果采用Primitive在开启深度检测时会与贴图交叉重合
  //     const primitive2 = new Cesium.GroundPrimitive({
  //       geometryInstances: instance2,
  //       appearance: new Cesium.MaterialAppearance({
  //         translucent: true,
  //         material: new Cesium.Material({
  //           fabric: {
  //             uniforms: {
  //               color: new Cesium.Color(0, 1, 0, 1),
  //               center: Cesium.Cartesian3.fromDegrees(point.lng + 0.006, point.lat + 0.008,0)
  //             },
  //             source: source
  //           },
  //           translucent: true,
  //         }),
  //       })
  // })
  // console.log(primitive2);
  // primitives.add(primitive2)
// })

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
    let pickEntity = [] //记录拾取的实体
    handler.setInputAction(function (event) {
      const pickedObjectArrays = viewer.scene.drillPick(event.endPosition);
      const cartesian = viewer.camera.pickEllipsoid(event.endPosition, viewer.scene.globe.ellipsoid);
      let angle = getHeading(Cesium.Cartesian3.fromDegrees(point.lng + 0.006, point.lat + 0.008), cartesian)
      if (angle < 0){
        angle += 360
      }
      //夹角从正北方向顺时针旋转 范围0-360
      if(pickedObjectArrays && pickedObjectArrays.length){
        pickedObjectArrays.forEach((item) => {
          if(item && item.id){
            if (!item.id._angle){
              return
            }
            pickEntity.push(item.id)
            const color = item.id.ellipse.material._color.clone()
            //判断哪个扇形角度符合在夹角范围内就修改哪个圆材质alpha为1.0,如果不符合材质透明度设置为默认值0.5
            if (angle > item.id._angle[0] && angle < item.id._angle[1]){
              color.alpha = 2.5
              //此时已经有一个扇形被选中
              //将其他变成默认
              pickEntity.forEach((entity) => {
                const color = entity.ellipse.material._color.clone()
                color.alpha = 0.6
                entity.ellipse.material._color = color
            })
            } else {
              color.alpha = 0.6
            }
            item.id.ellipse.material._color = color
          }
        })
      } else {
        if(pickEntity.length){
          pickEntity.forEach((entity) => {
              const color = entity.ellipse.material._color.clone()
              color.alpha = 0.6
              entity.ellipse.material._color = color
          })
          pickEntity = []
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
  if (primitives) {
    primitives.removeAll()
  }
}
};