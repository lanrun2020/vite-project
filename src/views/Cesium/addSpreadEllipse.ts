// 圆形扩散扫描效果
import Cesium from "@/utils/importCesium"
import radarMaterialsProperty from "./RadarMaterial3"
const radarMaterial3 = new radarMaterialsProperty({ color: new Cesium.Color(.1, 1, 0, 1), repeat: 10, thickness: 0.2 })
let entities:Array<typeof Cesium.viewer.entity> = []
const defaultPoint = { lng: 121.4861830727844, lat:31.22723471021075 }
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
    // entities.push(viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(point.lng + 0.006, point.lat + 0.008),
    //   ellipse: {
    //     // 椭圆短半轴长度
    //     semiMinorAxis: 500,
    //     stRotation:  0.0, //采用纹理旋转，使用rotation对纹理无效，所以采用纹理旋转达到扇形偏转
    //     // 椭圆长半轴长度
    //     semiMajorAxis: 500,
    //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //     // height: 0.0,
    //     // extrudedHeight: 0,
    //     material: new Cesium.DiffuseMaterialProperty({
    //       color: new Cesium.Color(0.0, 1.0, 1.0, 0.5),
    //       speed: 1.0, //圆环移动速度
    //       reverse: false, //圆环扩散方向是否反转
    //       reverseColor: false, //颜色渐变是否反转
    //       thickness: 0.8,//圆环显示环高（0-1.0）
    //       repeat: 8.0,//圆环重复次数
    //       angle: 45,//扇形展示角度
    //     }),
    //   },
    // }))
    // entities.push(viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(point.lng + 0.006, point.lat + 0.008),
    //   ellipse: {
    //     // 椭圆短半轴长度
    //     semiMinorAxis: 500,
    //     stRotation:  -Math.PI/4.0, //采用纹理旋转，使用rotation对纹理无效，所以采用纹理旋转达到扇形偏转
    //     // 椭圆长半轴长度
    //     semiMajorAxis: 500,
    //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //     // height: 0.0,
    //     // extrudedHeight: 0,
    //     material: new Cesium.DiffuseMaterialProperty({
    //       color: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
    //       speed: 1.0, //圆环移动速度
    //       reverse: false, //圆环扩散方向是否反转
    //       reverseColor: false, //颜色渐变是否反转
    //       thickness: 0.8,//圆环显示环高（0-1.0）
    //       repeat: 8.0,//圆环重复次数
    //       angle: 45,//扇形展示角度
    //     }),
    //   },
    // }))
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
    const sxArr = [[0,45],[70,120],[140,200]]
    // sxArr.forEach((g,index) => {
    //    entities.push(viewer.entities.add({
    //     id: "sx"+index,
    //     polygon: {
    //       hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(calcPoints(point.lng + 0.006, point.lat + 0.008, 500,g[0],g[1]))),
    //       material: new Cesium.Diffuse2MaterialProperty({
    //         color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
    //         speed: 1.0,
    //         thickness: 0.8,
    //         angle: Cesium.Cartesian3(point.lng + 0.006, point.lat + 0.008, 0),
    //       }),
    //     },
    //   }));
    // })
    // console.log(entities);
    const primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    sxArr.forEach((g,index) => {
      const center2 = Cesium.Cartesian3.fromDegrees(118, 30, 200000)
      const modelMatrix2 = Cesium.Transforms.eastNorthUpToFixedFrame(center2);
      const instance2 = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy : new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(calcPoints(point.lng + 0.006, point.lat + 0.008, 500,g[0],g[1]))
          )
        }),
        // modelMatrix: modelMatrix2, // 提供位置参数
      });
      const primitive2 = new Cesium.Primitive({
        geometryInstances: instance2,
        appearance: new Cesium.MaterialAppearance({
          material: new Cesium.Material({
            fabric : {
                type : 'Color',
                uniforms : {
                    color : new Cesium.Color(1.0, 1.0, 0.0, 1.0)
                }
            }
          })
        })
      })
      primitives.add(primitive2)
    })
    
   

    //以下代码是计算鼠标点击点与某点正北放向夹角的
    // const getHeading = (fromPosition, toPosition) => {
    //   const finalPosition = new Cesium.Cartesian3()
    //   const matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
    //   Cesium.Matrix4.inverse(matrix4, matrix4)
    //   Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
    //   Cesium.Cartesian3.normalize(finalPosition, finalPosition)
    //   return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
    // }
    // const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // handler.setInputAction(function (event) {
    //   const pickedObjectArrays = viewer.scene.drillPick(event.position);   //最多获取前5个对象
    //   // console.log(pickedObjectArrays);
    //   const cartesian = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
    //   let angle = getHeading(Cesium.Cartesian3.fromDegrees(point.lng + 0.006, point.lat + 0.008), cartesian)
    //   if (angle < 0){
    //     angle += 360
    //   }
    //   console.log(angle);
    //   //夹角从正北方向顺时针旋转 范围0-360
    //   if(pickedObjectArrays && pickedObjectArrays.length){
    //     pickedObjectArrays.forEach((item) => {
    //       if(item && item.id){
    //         // console.log(item.id.ellipse.material);
    //         //判断哪个扇形角度符合在夹角范围内就修改哪个圆材质alpha为1.0,如果不符合材质透明度设置为默认值0.5
    //         const color = item.id.ellipse.material._color.clone()
    //         color.alpha = 1.0
    //         item.id.ellipse.material._color = color
    //       }
    //     })
    //   }
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  } else {
    if (entities.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
};