<template>
  <div>
    <div id="cesiumContainer">
      <toolbox :toolList="toolList" @toolChecked="toolChecked" @finishPolygon="reset"></toolbox>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { initPolylineTrailLinkMaterialProperty } from './flowLine'
import "./flowLineMaterial";
import bluePng from "@/assets/blue.png";
import greenPng from "@/assets/green.png";
import Toolbox from "./toolbox.vue";
import { onMounted, reactive } from "@vue/runtime-core";
import { fetchCesium } from "@/apis/an-system";
import { addPolygon2, reset } from "./polygon";
import { log } from "console";
import Cesium from '@/utils/importCesium'
let viewer: any;
let toolList: Array<{ title: string; value: number }> = [
  {
    title: "迁徙线",
    value: 0,
  },
  {
    title: "扩散扫描",
    value: 1,
  },
  {
    title: "旋转扫描",
    value: 2,
  },
  {
    title: "凸多边形",
    value: 3,
  }
];
let points: Array<{ name: string; lat: number; lng: number }> = [
  {
    name: "point1（110,30）",
    lat: 30,
    lng: 110,
  },
  {
    name: "point2（118,30）",
    lat: 30,
    lng: 118,
  },
  {
    name: "point3（110,32）",
    lat: 32,
    lng: 110,
  },
];
let balls: Array<{ value: number; lat: number; lng: number }> = [
  {
    value: 0.5524,
    lat: 32,
    lng: 115,
  },
  {
    value: 0.1634,
    lat: 28,
    lng: 115,
  },
  {
    value: 0.8212,
    lat: 32,
    lng: 112,
  },
];
let ball: Array<any> = [];
let flyLine: object = {
  center: {
    lon: 110,
    lat: 32,
    size: 1,
    color: Cesium.Color.GREEN,
  },
  points: [
    {
      lon: 112,
      lat: 28,
      color: Cesium.Color.BLUE,
    },
    {
      lon: 145,
      lat: 26,
      color: Cesium.Color.BLUE,
    },
    {
      lon: 113,
      lat: 31,
      color: Cesium.Color.BLUE,
    },
    {
      lon: 118,
      lat: 30,
      color: Cesium.Color.GREEN,
    },
    {
      lon: 118,
      lat: 32,
      color: Cesium.Color.BLUE,
    },
  ],
  options: {
    polyline: {
      width: 2,
      material: [Cesium.Color.GREEN, 3000],
    },
  },
};
let arr2: Array<number> = reactive([]);
let polygonPoints: Array<{ lat: number, lng: number }> = reactive([]);
let active: boolean = false;
let value: number = 0;
let flyStatus: boolean = false;
let flyPoints: Array<any> = [];
let startPoint: any = {};
let endPoint: any = {};
let pointNum: number = 0;
// initPolylineTrailLinkMaterialProperty()
let primitiveArr: Array<object> = []
onMounted(async () => {
  let res = await fetchCesium();
  console.log(res);
  initCesium();
});
const toolChecked = (activeVal: any, valueVal: any) => {
  active = activeVal;
  value = valueVal;
};
const initCesium = () => {
  if (viewer) {
    viewer.destroy();
  }
  viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false, // 是否显示动画控件
    baseLayerPicker: false, // 是否显示图层选择控件
    geocoder: false, // 是否显示地名查找控件
    timeline: false, // 是否显示时间线控件
    sceneModePicker: true, // 是否显示投影方式控件
    navigationHelpButton: false, // 是否显示帮助信息控件
    infoBox: false, // 是否显示点击要素之后显示的信息
    fullscreenButton: false, // 是否显示全屏按钮
    selectionIndicator: false, // 是否显示选中指示器
    terrainProvider: Cesium.createWorldTerrain(),
    // imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
    //  url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
    // })
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;
  // var layer = new Cesium.UrlTemplateImageryProvider({
  //   url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  //   minimumLevel: 4,
  //   maximumLevel: 18
  // })
  // viewer.imageryLayers.addImageryProvider(layer);
  viewer.scene.screenSpaceCameraController.enableTit = false;
  // viewer.camera.setView({
  //   destination: Cesium.Cartesian3.fromDegrees(102, 34, 10000000)
  // })
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(110, 30, 10000),
    duration: 1.6,
  });

  let scene = viewer.scene;
  let ellipsoid = scene.globe.ellipsoid;
  let cartesian = null;
  let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
  handler.setInputAction((event: any) => {
    cartesian = viewer.camera.pickEllipsoid(event.position, ellipsoid);
    if (cartesian) {
      let cartographic = ellipsoid.cartesianToCartographic(cartesian);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      if (active) {
        switch (value) {
          case 0:
            addFlyLine(longitude, latitude);
            break; // 增加迁徙线
          case 1:
            addEllipses({ lng: longitude, lat: latitude }, 80000, 150, 3);
            break; // 扩散扫描效果
          case 2:
            addScanEllipse(longitude, latitude);
            break; //旋转扫描效果
          case 3:
            addPolygon2(viewer, longitude, latitude);
            break; //绘制多边形
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  drawCesium();
};

const addFlyLine = (longitude: number, latitude: number) => {
  if (pointNum === 0) {
    startPoint = {
      longitude,
      latitude,
    };
    pointNum = 1;
  } else if (pointNum === 1) {
    endPoint = {
      longitude,
      latitude,
    };
    createFlyLine(startPoint, endPoint);
    pointNum = 0;
  }
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
    point: {
      pixelSize: 2,
      color: Cesium.Color.BLUE,
    },
  });
};
const addScanEllipse = (lng: number, lat: number) => {
  let rotation = Cesium.Math.toRadians(0);
  // 旋转圆（扫描效果）
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lng, lat),
    ellipse: {
      // 椭圆短半轴长度
      semiMinorAxis: 80000,
      // 椭圆长半轴长度
      semiMajorAxis: 80000,
      height: 10,
      extrudedHeight: 10,
      material: new Cesium.ImageMaterialProperty({
        image: bluePng,
        transparent: true, // 透明
      }),
      stRotation: new Cesium.CallbackProperty(() => {
        // 设置旋转角度
        rotation += 0.08;
        return rotation;
      }),
    },
  });
};
// 绘制添加各种Cesium实体
const drawCesium = () => {
  //雷达模型
  const modelConf = {
    id: "model1",
    position: Cesium.Cartesian3.fromDegrees(104, 32, 0),
    model: {
      uri: `/model/radar_static.gltf`,
      // uri:`/model/radar_dynamic.glb`,
      scale: 10,
    },
  };
  viewer.entities.add(modelConf);
  // 点
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(118, 30),
    point: {
      pixelSize: 10,
      color: Cesium.Color.PINK,
    },
  });
  // 线
  viewer.entities.add({
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 1000), // 实体可见的高度区间
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        118, 30, 0, 110, 32, 0, 118, 34, 0, 118, 30, 0,
      ]),
      width: 8,
      material: new Cesium.PolylineTrailLinkMaterialProperty(
        Cesium.Color.BLUE,
        3000
      ),
    },
  });
  // 圆柱
  // viewer.entities.add({
  //   position: Cesium.Cartesian3.fromDegrees(110, 32, 50000), // 位置在圆柱高度的中间点
  //   cylinder: {
  //     length: 100000, // 高度
  //     topRadius: 4000, // 顶部半径
  //     bottomRadius: 4000, // 底部半径
  //     material: Cesium.Color.GREEN.withAlpha(0.4),
  //   },
  // });

  // viewer.entities.add({
  //   position: Cesium.Cartesian3.fromDegrees(110.1, 32),
  //   ellipse: {
  //     // 椭圆短半轴长度
  //     semiMinorAxis: 8000,
  //     // 椭圆长半轴长度
  //     semiMajorAxis: 8000,
  //     height: 0,
  //     extrudedHeight:new Cesium.CallbackProperty(()=>{
  //       waterH += 0.15* x
  //       if(waterH > 315){
  //         x = -1
  //       }
  //       if(waterH < 275){
  //         x = 1
  //       }
  //       return waterH
  //     }),//多边形凸出面高度
  //     material: Cesium.Color.BLUE.withAlpha(0.4),
  //   },
  // });
  let waterH = 200
  let x = 1
  viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        110, 30.8,
        110, 32,
        110.8, 32,
        110.8, 30.8
      ]),
      height: 0,
      extrudedHeight: new Cesium.CallbackProperty(() => {
        waterH += 0.15 * x
        if (waterH > 230) {
          x = -1
        }
        if (waterH < 200) {
          x = 1
        }
        return waterH
      }),
      // material: new Cesium.PolylineTrailLinkMaterialProperty(
      //   Cesium.Color.RED,
      //   1000
      // ),
      material: Cesium.Color.BLUE.withAlpha(0.5),
    },
  });
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(110.5, 31.05, 50000),
    duration: 1.6,
  });
  // 雷达扫描
  viewer.entities.add({
    id: "scan",
    name: "Scan",
    position: Cesium.Cartesian3.fromDegrees(114, 30),
    ellipsoid: {
      radii: new Cesium.Cartesian3(100000.0, 100000.0, 100000.0),
      maximumCone: Cesium.Math.toRadians(90),
      material: Cesium.Color.BLUE.withAlpha(0.1),
      outline: true,
      outlineColor: Cesium.Color.BLUE.withAlpha(0.2),
      outlineWidth: 1,
    },
  });
  let heading = 0;
  // let positionArr = this.calcPoints(114, 30, 100000, heading) // 经纬度、半径、起始角度
  // console.log(positionArr)
  viewer.entities.add({
    id: "wall",
    wall: {
      positions: new Cesium.CallbackProperty(() => {
        heading -= 1;
        return Cesium.Cartesian3.fromDegreesArrayHeights(
          calcPoints(114, 30, 100000, heading)
        );
      }),
      material: Cesium.Color.AQUAMARINE.withAlpha(0.5),
    },
  });
  // 执行动画效果
  // viewer.clock.onTick.addEventListener(() => {
  //   heading -= 1.5
  //   positionArr = this.calcPoints(114, 30, 100000, heading)
  // })
  // 粒子发射系统
  // this.fireadd(118, 30, 0, Cesium.Color.WHITE, new Cesium.ConeEmitter(160)) // 圆锥粒子发射系统
  // this.fireadd(110, 30, 0, Cesium.Color.GREEN, new Cesium.CircleEmitter(10000)) // 圆形粒子发射系统
};
// 创建迁徙线
const createFlyLine = (start: any, end: any) => {
  // const data = this.flyLine
  // const center = data.center
  // const cities = data.points
  const startPoint = Cesium.Cartesian3.fromDegrees(
    start.longitude,
    start.latitude,
    0
  ); // Cartesian3.fromDegrees经纬度转为笛卡尔坐标位置
  // 起点实体
  // viewer.entities.add({
  //   position: startPoint,
  //   point: {
  //     pixelSize: start.size || 5,
  //     color: start.color || Cesium.Color.BLUE
  //   }
  // })
  // 终点与飞行线
  // cities.forEach((city) => {
  let material = new Cesium.PolylineTrailLinkMaterialProperty(
    Cesium.Color.BLUE,
    3000
  );
  const endPoint = Cesium.Cartesian3.fromDegrees(
    end.longitude,
    end.latitude,
    0
  );
  // viewer.entities.add({
  //   position: endPoint,
  //   point: {
  //     pixelSize: end.size || 5,
  //     color: end.color || Cesium.Color.BLUE
  //   }
  // })
  viewer.entities.add({
    polyline: {
      positions: generateCurve(startPoint, endPoint), // 多个点坐标构成线条路径
      width: 8,
      material: material,
    },
  });
  // })
};
// 获取流动曲线上多个连续点
const generateCurve = (startPoint: any, endPoint: any) => {
  const addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
  const midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic =
    Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height =
    Cesium.Cartesian3.distance(startPoint, endPoint) / 5; // 将起始点、终点两个坐标点之间的距离除5,设置为此中间点的高度
  const midPoint = new Cesium.Cartesian3();
  Cesium.Ellipsoid.WGS84.cartographicToCartesian(
    midPointCartographic,
    midPoint
  ); // 初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转笛卡尔坐标（x,y,z）
  const spline = new Cesium.CatmullRomSpline({
    // 立方样条曲线
    times: [0.0, 0.5, 1], // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
    points: [startPoint, midPoint, endPoint], // 控制点,points.length必须 ≥ 2
  });
  let curvePoints: Array<any> = [];
  for (let i = 0, len = 200; i <= len; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  return curvePoints; // 返回曲线上的多个点坐标集合
};
// 创建粒子发射系统
const fireadd = (
  lng: number,
  lat: number,
  height: number,
  color: any,
  emitter: any
) => {
  // 获取事件触发所在的  html Canvas容器
  const firedata = new Cesium.ParticleSystem({
    startColor: color.withAlpha(1),
    endColor: Cesium.Color.WHITE.withAlpha(0.0),
    startScale: 2,
    endScale: 3,
    // 设定粒子寿命可能持续时间的最小限值(以秒为单位)，在此限值之上将随机选择粒子的实际寿命。
    // minimumParticleLife: 10,
    // maximumParticleLife: 14,
    particleLife: 14, // 粒子生命持续时间
    // minimumSpeed: 10000,
    // maximumSpeed: 50000,
    speed: 50000, // 粒子发射速度（米/秒）
    imageSize: new Cesium.Cartesian2(10, 10),
    emissionRate: 1000, // 每秒发射粒子数量
    lifetime: 1, // 粒子系统发射粒子的时间（秒）（粒子系统发射周期）
    loop: true, // 是否循环爆发
    mass: 1,
    emitter: emitter, // 发射器
    // emitter: new Cesium.CircleEmitter(10000), //圆形发射器，粒子具有沿Z向量移动的速度
    // emitter: new Cesium.ConeEmitter(170), //圆锥发射器，参数为圆锥角，以弧度为单位
    // emitter: new Cesium.BoxEmitter(Cesium.Cartesian3(100000, 100000, 1000)), //盒子发射器，参数盒子宽、高、深
    // emitter: new Cesium.SphereEmitter(1), //球形发射器，参数为球半径
    updateCallback: (particle: any) => {
      if (particle.age <= particle.life * 0.6) {
        // 生命前0.6
        let s = 0.994;
        particle.velocity = new Cesium.Cartesian3(
          particle.velocity.x * s,
          particle.velocity.y * s,
          particle.velocity.z * s
        ); // 让粒子速度衰减，可以自行定义衰减方法
      } else {
        // let { x, y, z } = Cesium.Cartesian3.fromDegrees(lng, lat, height)
        let { x, y, z } = particle.position;
        let n = 170;
        particle.velocity = new Cesium.Cartesian3(-x / n, -y / n, -z / n); // 速度向量改变（改变粒子运动方向），向原点（地球球心）运动
      }
    },
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(lng, lat, height)
    ), // 从模型转化成世界坐标
    // emitterModelMatrix: Cesium.Matrix4(),
  });
  viewer.scene.primitives.add(firedata);
  // setTimeout(() => {
  //   Cesium.scene.primitives.remove(firedata) //清除发射系统firedata
  // }, 3000)
};
// 创建扩散圆组
const addEllipses = (
  position: { lng: number; lat: number },
  maxr = 60000,
  speed = 200,
  n = 3
) => {
  for (let i = 0; i < n; i++) {
    addEllipse(position, (i / n) * maxr, maxr, speed);
  }
};
// 创建扩散圆
const addEllipse = (
  position: { lng: number; lat: number },
  startR: number,
  maxR: number,
  speed: number
) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(position.lng, position.lat),
    ellipse: {
      // 椭圆短半轴长度
      semiMinorAxis: new Cesium.CallbackProperty(() => {
        if (startR <= maxR) {
          startR += speed;
        } else {
          startR = 0;
        }
        return startR;
      }),
      // 椭圆长半轴长度
      semiMajorAxis: new Cesium.CallbackProperty(() => {
        if (startR <= maxR) {
          startR = startR + speed;
        } else {
          startR = 0;
        }
        return startR;
      }),
      height: 10,
      extrudedHeight: 10,
      material: new Cesium.ImageMaterialProperty({
        image: greenPng, // 材质贴图
        color: new Cesium.CallbackProperty(() => {
          return Cesium.Color.WHITE.withAlpha(1 - startR / maxR + 0.05);
        }),
        transparent: true, // 材质是否透明（贴图为png格式图片时适用）
        // repeat: new Cesium.Cartesian2(4, 4),//贴图重复参数
      }),
    },
  });
};
// 根据两个点 开始角度、夹角度 求取立面的扇形
const computeCirclularFlight = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  fx: number,
  angle: number
) => {
  const positionArr: Array<number> = [];
  positionArr.push(x1);
  positionArr.push(y1);
  positionArr.push(0);
  const radius = Cesium.Cartesian3.distance(
    Cesium.Cartesian3.fromDegrees(x1, y1),
    Cesium.Cartesian3.fromDegrees(x2, y2)
  );
  for (let i = fx; i <= fx + angle; i++) {
    const h = radius * Math.sin((i * Math.PI) / 180.0);
    const r = Math.cos((i * Math.PI) / 180.0);
    const x = (x2 - x1) * r + x1;
    const y = (y2 - y1) * r + y1;
    positionArr.push(x);
    positionArr.push(y);
    positionArr.push(h);
  }
  return positionArr;
};

// 根据第一个点 偏移距离 角度 求取第二个点的坐标
const calcPoints = (
  x1: number,
  y1: number,
  radius: number,
  heading: number
) => {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(x1, y1)
  );
  const rx = radius * Math.cos((heading * Math.PI) / 180.0);
  const ry = radius * Math.sin((heading * Math.PI) / 180.0);
  const translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
  const d = Cesium.Matrix4.multiplyByPoint(
    m,
    translation,
    new Cesium.Cartesian3()
  );
  const c = Cesium.Cartographic.fromCartesian(d);
  const x2 = Cesium.Math.toDegrees(c.longitude);
  const y2 = Cesium.Math.toDegrees(c.latitude);
  return computeCirclularFlight(x1, y1, x2, y2, 0, 90);
};
</script>

<style lang="scss">
#cesiumContainer {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: calc(100vh - 70px);
}
/* 隐藏Cesium地图图标 */
#cesiumContainer .cesium-widget-credits {
  display: none !important;
}
</style>
