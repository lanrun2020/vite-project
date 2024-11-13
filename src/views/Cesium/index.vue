<template>
  <div id="cesiumContainer" ref="mapContainer">
    <toolbox :toolList="toolList" @toolChecked="toolChecked"></toolbox>
    <div class="top-bar">
      <div
        class="tool-bar-icon iconfont icon-shendu"
        :class="{ 'active-icon': depthFlag }"
        title="深度检测"
        @click="depthChange"
      ></div>
      <div
        class="tool-bar-icon iconfont icon-dixing"
        :class="{ 'active-icon': terrainFlag }"
        title="地形"
        @click="terrainChange"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Toolbox from "./toolbox.vue";
import { ref, Ref, onMounted, onBeforeUnmount } from "vue";
import { fetchCesium } from "@/apis/an-system";
import { addPolygon2 } from "./polygon";
import Cesium from "@/utils/importCesium";
import "@/jslibs/cesium-VideoShed3D.js";
import img1 from "../../assets/woodFloor.jpg";
import img2 from "../../assets/woodFloor2.jpg";
import "./flowLineMaterial";
import "./RadarMaterial";
import "./LineMaterial";
import "./wallMaterial";
import "./planeLineMaterial";
import "./circleMaterial";
import "./circleRotateMaterial";
import "./rotationMaterial";
import "./diffuseMaterial";
import "./diffuseMaterial2";
import "./cylinderMaterial";
import "./CustomLineMaterial";
import "./contourLineMaterial";
import TerrainClipPlan from "@/jslibs/terrainClipPlane";
import { addFlyLine } from "@/views/Cesium/addFlyLine";
import { addSpreadEllipse } from "@/views/Cesium/addSpreadEllipse";
import { addScanEllipse } from "@/views/Cesium/addScanEllipse";
import { addRiverFlood } from "@/views/Cesium/addRiverFlood";
import { addStaticRadar } from "@/views/Cesium/addStaticRadar";
import { addScanWall } from "@/views/Cesium/addScanWall";
import { addPlaneModel } from "@/views/Cesium/addPlaneModel";
import { addTude } from "./addTube";
import { addCylinder } from "./addCylinder";
import { addClustering } from "./addClustering";
import { addSatellite } from "./addSatellite";
import { addTrackPlane } from "./addTrackPlane";
import { addWall } from "./addWall";
import { serveyDistance } from "./serveyDistance";
import { serveyArea } from "./serveyArea";
import { addSatellite2 } from "./addSatellite2";
import { addEcharts } from "./addEcharts";
import { addCity } from "./addCity";
import { addLoad } from "./addLoad";
import { addAirLine } from "./addAirLine";
import { addShader } from "./addShader copy 2";
import { addMoveCar } from "./addMoveCar";
import { addPlaneLine } from "./addPlaneLine";
import { addPlaneLineByTime } from "./addPlaneLineByTime";
import { addBillboard } from "./addBillboard";
import { addWedgeScan } from "./addWedgeScan";
import { addGeoJsonData } from "./addGeoJsonData";
import { addParticleSystem } from "./addParticleSystem";
import { addParticleSystem2 } from "./addParticleSystem2";
import { addCircleWall } from "./addCircleWall";
import { addWind } from "./addWind";
import { addBox } from "./addBox";
import "./texture3D";
import { addPrimitive } from "./lxs_volumn";
import { addChangePosition } from "./addChangePosition";
import { addArrowLoad } from "./addArrowLoad";
import { addContourLine } from "./addContourLine";
import { addScanEllipse3 } from "./addScanEllipse3";
import TerrainCutting from "./clippingPlaneCollection";
import bottom from "../../assets/bottom.jpg";
import wall from "../../assets/wall.jpg";
import "./addSnow";
import "./addRain";
import "./addFog";
import Weather from "./weather";
import { createRain, removeRain } from "./likeRain";
import { lineFlowInit, removeRainEntity } from "./lineMaterailFlyLine"
let weatherObj = null;
type toolItemType = {
  title: string;
  value: number;
  active: boolean;
};
let viewer: any;
let toolList: Ref<toolItemType[]> = ref([
  {
    title: "迁徙线",
    value: 0,
    active: false,
  },
  {
    title: "扩散扫描",
    value: 1,
    active: false,
  },
  {
    title: "旋转扫描",
    value: 2,
    active: false,
  },
  {
    title: "凸多边形",
    value: 3,
    active: false,
  },
  {
    title: "河流淹没",
    value: 4,
    active: false,
  },
  {
    title: "静态雷达模型",
    value: 5,
    active: false,
  },
  {
    title: "雷达扫描动画",
    value: 6,
    active: false,
  },
  {
    title: "飞机航线",
    value: 7,
    active: false,
  },
  {
    title: "流动管道",
    value: 8,
    active: false,
  },
  {
    title: "大量柱体",
    value: 9,
    active: false,
  },
  {
    title: "点聚合",
    value: 10,
    active: false,
  },
  {
    title: "卫星扫描",
    value: 11,
    active: false,
  },
  {
    title: "追踪扫描",
    value: 12,
    active: false,
  },
  {
    title: "动态墙",
    value: 13,
    active: false,
  },
  {
    title: "测量距离",
    value: 14,
    active: false,
  },
  {
    title: "测量面积",
    value: 15,
    active: false,
  },
  {
    title: "环绕卫星",
    value: 16,
    active: false,
  },
  {
    title: "结合echarts",
    value: 17,
    active: false,
  },
  {
    title: "白膜建筑",
    value: 18,
    active: false,
  },
  {
    title: "北京交通线路",
    value: 19,
    active: false,
  },
  {
    title: "飞机视角",
    value: 20,
    active: false,
  },
  {
    title: "着色器",
    value: 21,
    active: false,
  },
  // {
  //   title: "驾驶汽车",
  //   value: 22,
  //   active: false,
  // },
  {
    title: "航迹回放",
    value: 23,
    active: false,
  },
  {
    title: "实时航迹",
    value: 24,
    active: false,
  },
  {
    title: "billboard",
    value: 25,
    active: false,
  },
  {
    title: "视锥扫描",
    value: 26,
    active: false,
  },
  {
    title: "中国地图geojson",
    value: 27,
    active: false,
  },
  // {
  //   title: "粒子系统",
  //   value: 28,
  //   active: false,
  // },
  {
    title: "圆形墙",
    value: 29,
    active: false,
  },
  {
    title: "风场模拟",
    value: 30,
    active: false,
  },
  {
    title: "云雾粒子",
    value: 31,
    active: false,
  },
  {
    title: "Box",
    value: 32,
    active: false,
  },
  {
    title: "addChangePosition",
    value: 33,
    active: false,
  },
  // {
  //   title: '体渲染',
  //   value: 34,
  //   active: false,
  // },
  {
    title: "addArrowLoad",
    value: 35,
    active: false,
  },
  {
    title: "addContourLine",
    value: 36,
    active: false,
  },
  {
    title: "地形开挖",
    value: 37,
    active: false,
  },
  {
    title: "全宇宙下雪",
    value: 38,
    active: false,
  },
  {
    title: "全宇宙下雨",
    value: 39,
    active: false,
  },
  {
    title: "全宇宙起雾",
    value: 40,
    active: false,
  },
  {
    title: "模仿下雨",
    value: 41,
    active: false,
  },
  {
    title: "模仿下雪",
    value: 42,
    active: false,
  },
]);
const depthFlag = ref(false);
const terrainFlag = ref(false);
let TerrainCuttingObj = ref(null);
let mapContainer = ref(null);
let isCut = ref(false);
let snow = ref(null);
let rain = ref(null);
let fog = ref(null);
onMounted(async () => {
  console.log("cesium page");
  let res = await fetchCesium();
  initCesium();
  TerrainCuttingObj.value = new TerrainCutting({
    viewer,
    dom: mapContainer.value, //初始化地球的节点
    deep: 10000, //挖掘深度
    bottom, //底部图片
    wall, //墙的图片
  });
  weatherObj = new Weather(viewer);
});
onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
  }
});
const depthChange = () => {
  depthFlag.value = !depthFlag.value;
  viewer.scene.globe.depthTestAgainstTerrain = depthFlag.value;
};
const terrainChange = () => {
  terrainFlag.value = !terrainFlag.value;
  if (terrainFlag.value) {
    //cesium最新版本请使用Cesium.Terrain.fromWorldTerrain()
    viewer.terrainProvider = Cesium.createWorldTerrain({
      requestVertexNormals: true,
      requestWaterMask: false,
    });
  } else {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
  }
};
const toolChecked = (active: boolean, value: number) => {
  if (!active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110, 30, 10000000),
      duration: 1.6,
    });
  }
  const tool = toolList.value.find((item) => item.value === value);
  tool && (tool.active = active);
  switch (value) {
    case 0: // 增加迁徙线
      addFlyLine(viewer, active);
      break;
    case 1: // 扩散扫描效果
      // addSpreadEllipse(viewer, active);
      addScanEllipse3(viewer, active);
      break;
    case 2: //旋转扫描效果
      addScanEllipse(viewer, active);
      break;
    case 3: //绘制多边形
      addPolygon2(viewer, active);
      break;
    case 4: //动态河流淹没
      addRiverFlood(viewer, active);
      break;
    case 5: //雷达模型
      addStaticRadar(viewer, active);
      break;
    case 6: //扇形雷达扫描
      addScanWall(viewer, active);
      break;
    case 7: //飞机航线
      addPlaneModel(viewer, active);
      break;
    case 8: //流动管道
      addTude(viewer, active);
      break;
    case 9: //人口统计
      addCylinder(viewer, active);
      break;
    case 10: //点聚合
      addClustering(viewer, active);
      break;
    case 11: //卫星扫描
      addSatellite(viewer, active);
      break;
    case 12: //追踪扫描
      addTrackPlane(viewer, active);
      break;
    case 13: //动态墙
      addWall(viewer, active);
      break;
    case 14: //测量距离
      serveyDistance(viewer, active);
      break;
    case 15: //测量面积
      serveyArea(viewer, active);
      break;
    case 16: //环绕卫星
      addSatellite2(viewer, active);
      break;
    case 17: //echarts
      addEcharts(viewer, active);
      break;
    case 18: //白膜建筑
      addCity(viewer, active);
      break;
    case 19: //北京交通线路
      addLoad(viewer, active);
      break;
    case 20: //飞机航线2
      addAirLine(viewer, active);
      break;
    case 21: //着色器
      addShader(viewer, active);
      break;
    case 22:
      addMoveCar(viewer, active);
      break;
    case 23: // 增加航迹线
      addPlaneLine(viewer, active);
      break;
    case 24: // 增加实时航迹线
      addPlaneLineByTime(viewer, active);
      break;
    case 25:
      addBillboard(viewer, active);
      break;
    case 26:
      addWedgeScan(viewer, active);
      break;
    case 27:
      addGeoJsonData(viewer, active);
      break;
    case 28:
      addParticleSystem(viewer, active);
      break;
    case 29:
      addCircleWall(viewer, active);
      break;
    case 30:
      addWind(viewer, active);
      break;
    case 31:
      addParticleSystem2(viewer, active);
      break;
    case 32:
      addBox(viewer, active);
      break;
    case 33:
      addChangePosition(viewer, active);
      break;
    case 34:
      addPrimitive(viewer);
      break;
    case 35:
      addArrowLoad(viewer, active);
      break;
    case 36:
      addContourLine(viewer, active);
      break;
    case 37:
      handleCutTerrian(active);
      break;
    case 38:
      addSnowEffect(viewer, active);
      break;
    case 39:
      addRainEffect(viewer, active);
      break;
    case 40:
      addFogEffect(viewer, active);
      break;
    case 41:
      addRains(viewer, active, 1);
      break;
      case 42:
      addRains(viewer, active, 2);
      break;
    default:
      break;
  }
};
let addRains = (viewer, active, flag) => {
  if (active) {
    lineFlowInit(viewer, [120, 27.025], 200, flag)
    // createRain(viewer, { longitude: 120, latitude: 27.025 });
  } else {
    // removeRain(viewer)
    removeRainEntity(viewer);
  }
};
//消除天气效果
let destoryWeather = () => {
  if (snow.value) {
    snow.value.destroy();
    snow.value = null;
  }
  if (rain.value) {
    rain.value.destroy();
    rain.value = null;
  }
  if (fog.value) {
    fog.value.destroy();
    fog.value = null;
  }
};
// 渲染下雨天气，可通过传参改变渲染效果
// weather.rain();
// 渲染雾霾天气，可通过传参改变渲染效果
// weather.fog(0.2);
//添加雪(下面两种方式是一样的效果)
let addSnowEffect = async (viewer, active) => {
  if (active) {
    weatherObj.snow();
    // snow.value = new Cesium.SnowEffect(viewer, {
    //   snowSize: 0.02, //雪大小 ，默认可不写
    //   snowSpeed: 60.0, //雪速，默认可不写
    // });
  } else {
    weatherObj.remove();
    // destoryWeather();
  }
};
//添加雨
let addRainEffect = (viewer, active) => {
  if (active) {
    rain.value = new Cesium.RainEffect(viewer, {
      tiltAngle: -0.6, //倾斜角度
      rainSize: 0.6, //雨大小
      rainSpeed: 120.0, //雨速
    });
  } else {
    destoryWeather();
  }
};
//添加雾
let addFogEffect = (viewer, active) => {
  if (active) {
    fog.value = new Cesium.FogEffect(viewer, {
      visibility: 0.2,
      color: new Cesium.Color(0.8, 0.8, 0.8, 0.3),
    });
  } else {
    destoryWeather();
  }
};
let handleCutTerrian = (active) => {
  if (active) TerrainCuttingObj.value.create();
  if (!active) TerrainCuttingObj.value.stop();
};
const initCesium = () => {
  if (viewer) {
    viewer.destroy();
  }

  viewer = new Cesium.Viewer("cesiumContainer", {
    animation: true, // 是否显示时钟clock动画控件
    baseLayerPicker: true, // 是否显示图层选择控件
    geocoder: false, // 是否显示地名查找控件
    timeline: true, // 是否显示时间线控件
    sceneModePicker: true, // 是否显示投影方式控件
    navigationHelpButton: false, // 是否显示帮助信息控件
    infoBox: false, // 是否显示点击要素之后显示的信息
    fullscreenButton: false, // 是否显示全屏按钮
    selectionIndicator: false, // 是否显示选中指示器
    //Cesium默认使用 WebGL1
    contextOptions: {
      requestWebgl2: true, // 开启webgl2
    }, //Context和WebGL创建属性对应于Context#options
    // terrainProvider: Cesium.createWorldTerrain({
    //   requestVertexNormals: true,
    //   requestWaterMask: false
    // }),
    // imageryProvider:[],
  });
  // const overlay = new Cesium.TileMapServiceImageryProvider({
  //   url:'/map',
  //   fileExtension: 'png',
  //   // fileExtension:'png',
  //   //maximumLevel:7,
  // })
  //
  // const overlay = new Cesium.UrlTemplateImageryProvider({
  //       url:'/map/{z}/{x}/{y}.png',
  //       fileExtension: 'png',
  //       alpha:0.2
  //   // fileExtension:'png',
  //   // maximumLevel:7,
  // })
  // viewer.imageryLayers.addImageryProvider(overlay);
  // viewer.imageryLayers._layers[1].alpha = 0.6
  // console.log(viewer.imageryLayers);

  //时间轴设置成中文
  viewer.animation.viewModel.dateFormatter = DateTimeFormatter;
  viewer.animation.viewModel.timeFormatter = TimeFormatter;
  viewer.timeline.makeLabel = DateTimeFormatter;
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.scene.enableOcclude = true;
  // viewer.scene.globe.enableLighting = true;
  viewer.clock.shouldAnimate = true;
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  // 修改homeButton的默认返回位置
  viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (
    e
  ) {
    e.cancel = true;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(116.404269, 39.922793, 800000),
    });
  });
  //深度检测
  // viewer.scene.globe.depthTestAgainstTerrain = true; //几何图形是否有高程遮挡效果
  // addArrowLoad(viewer, true)
  const earthPositionList = Cesium.Cartesian3.fromDegreesArrayHeights([
    114, 30, -2000, 114.1, 30, -2000, 114.1, 30.1, -2000,
  ]);
  let terrainClipPlan = new TerrainClipPlan(viewer, {
    height: 200,
    splitNum: 1000,
    bottomImg: img1,
    wallImg: img2,
    positions: earthPositionList,
  });
  // addContourLine(viewer, true);
  // test()
};
const test = () => {
  const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
  const stop = Cesium.JulianDate.addSeconds(start, 10000, new Cesium.JulianDate());

  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
  viewer.clock.multiplier = 10;

  viewer.timeline.zoomTo(start, stop);
  const getDistance = (start, end) => {
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(Cesium.Cartographic.fromDegrees(start.lon, start.lat, start.height), Cesium.Cartographic.fromDegrees(end.lon, end.lat, end.height)); //设置测地线起点终点
    return geodesic.surfaceDistance //返回距离
  }
  function computeCirclularFlight (points) {
    const property = new Cesium.SampledPositionProperty();
    points.forEach((point, index) => {
      let position = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.height)
      if (index > 0) {
        const dis = getDistance(points[index - 1], point)
        const time = Cesium.JulianDate.addSeconds(start, dis / 100, new Cesium.JulianDate());
        property.addSample(time, position);
      } else {
        const time = Cesium.JulianDate.addSeconds(start, 0, new Cesium.JulianDate());
        property.addSample(time, position);
      }
      viewer.entities.add({
        position: position,
        point: {
          pixelSize: 8,
          color: Cesium.Color.TRANSPARENT,
          outlineColor: Cesium.Color.YELLOW,
          outlineWidth: 3,
        },
      });
    })
    return property;
  }
  const points = [
    { lon: 104.07735550699856, lat: 30.681381755749552, height: 3000 },
    { lon: 104.05360325836732, lat: 30.66708857602095, height: 2000 },
    { lon: 103.97245225169141, lat: 30.64964550586335, height: 3000 },
  ]
  const position = computeCirclularFlight(points);
  const entity = viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: start,
        stop: stop,
      }),
    ]),
    position: position,
    path: {
      resolution: 1,
      material: Cesium.Color.YELLOW,
      width: 6,
    },
  });
  entity.position.setInterpolationOptions({
    // interpolationDegree: 2, //二次多项式插值
    // interpolationAlgorithm: Cesium.HermitePolynomialApproximation, //埃尔米特多项式插值算法
    interpolationDegree: 5, //五次拉格朗日多项式插值
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation, //拉格朗日多项式插值算法
  });
}
const TimeFormatter = (time: any, viewModel: any) => {
  return DateTimeFormatter(time, viewModel, true);
};
const DateTimeFormatter = (datetime: any, viewModel: any, ignoredate: any) => {
  let julianDate = new Cesium.JulianDate();
  Cesium.JulianDate.addHours(datetime, 8, julianDate);
  let gregorianDT = Cesium.JulianDate.toGregorianDate(julianDate);
  let objDT;
  if (ignoredate) objDT = "";
  else {
    objDT = new Date(gregorianDT.year, gregorianDT.month, gregorianDT.day);
    objDT =
      gregorianDT.year +
      "年" +
      gregorianDT.month +
      "月" +
      gregorianDT.day +
      "日";
    if (viewModel || gregorianDT.hour + gregorianDT.minute === 0) return objDT;
    objDT += "";
  }
  // return objDT + Cesium.sprintf('%02d:%02d:%02d', gregorianDT.hour, gregorianDT.minute, gregorianDT.second)
  return (
    objDT +
    gregorianDT.hour.toString().padStart(2, "0") +
    ":" +
    gregorianDT.minute.toString().padStart(2, "0") +
    ":" +
    gregorianDT.second.toString().padStart(2, "0")
  );
};
</script>

<style lang="scss">
#cesiumContainer {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
}

/* 隐藏Cesium地图图标 */
#cesiumContainer .cesium-widget-credits {
  display: none !important;
}

// .cesium-viewer-animationContainer,
// .cesium-viewer-timelineContainer,
.cesium-viewer-bottom,
.cesium-viewer-fullscreenContainer {
  display: none !important;
}
#myVideo {
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 256px;
  z-index: 100;
}
.top-bar {
  position: absolute;
  display: flex;
  flex-wrap: nowrap;
  top: 4px;
  right: 120px;
  z-index: 999;
  color: #ddd;
  .tool-bar-icon {
    background-color: rgb(59, 59, 59);
    border-radius: 4px;
    margin: 4px;
    padding: 4px;
    cursor: pointer;
    font-size: 24px;
    border: 1px solid transparent;
    &:hover {
      color: #fff;
      background: #48b;
      border-color: #aef;
      box-shadow: 0 0 8px #fff;
    }
  }
  .active-icon {
    color: #00ffff;
    &:hover {
      color: #00ffff;
    }
  }
}
</style>

