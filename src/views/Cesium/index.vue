<template>
  <div id="cesiumContainer">
    <toolbox :toolList="toolList" @toolChecked="toolChecked"></toolbox>
  </div>
</template>

<script setup lang="ts">
import Toolbox from "./toolbox.vue";
import { ref, onMounted } from "vue";
import { fetchCesium } from "@/apis/an-system";
import { addPolygon2 } from "./polygon";
import Cesium from '@/utils/importCesium'
import "./flowLineMaterial";
import "./RadarMaterial";
import "./LineMaterial";
import "./wallMaterial";
import "./planeLineMaterial";
import { addFlyLine } from '@/views/Cesium/addFlyLine'
import { addSpreadEllipse } from '@/views/Cesium/addSpreadEllipse'
import { addScanEllipse } from '@/views/Cesium/addScanEllipse'
import { addRiverFlood } from '@/views/Cesium/addRiverFlood'
import { addStaticRadar } from '@/views/Cesium/addStaticRadar'
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
import { addShader } from "./addShader";
import { addMoveCar } from "./addMoveCar";
import { addPlaneLine } from "./addPlaneLine";
import { addPlaneLineByTime } from "./addPlaneLineByTime";

let viewer: any;
let toolList: any = ref([
  {
    title: "航迹线",
    value: 0,
    active: false,
  },
  {
    title: "实时航线",
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
    title: "动态河流",
    value: 4,
    active: false,
  },
  {
    title: "静态雷达",
    value: 5,
    active: false,
  },
  {
    title: "雷达扫描",
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
    title: "人口统计",
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
    title: "echarts",
    value: 17,
    active: false,
  },
  {
    title: "白膜建筑",
    value: 18,
    active: false,
  },
  {
    title: "城市道路",
    value: 19,
    active: false,
  },
  {
    title: "飞机航线2",
    value: 20,
    active: false,
  },
  {
    title: "着色器",
    value: 21,
    active: false,
  },
  {
    title: "驾驶汽车",
    value: 22,
    active: false,
  },
  {
    title: "航迹线",
    value: 23,
    active: false,
  },
])
onMounted(async () => {
  console.log('cesium page')
  let res = await fetchCesium();
  initCesium();
});
const toolChecked = (active: boolean, value: number) => {
  if (!active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110, 30, 10000000),
      duration: 1.6,
    });
  }
  toolList.value[value].active = active
  switch (value) {
    case 0:// 增加迁徙线
      addPlaneLine(viewer, active);
      break;
    case 1:// 扩散扫描效果
      // addSpreadEllipse(viewer, active);
      addPlaneLineByTime(viewer, active);
      break;
    case 2://旋转扫描效果
      addScanEllipse(viewer, active);
      break;
    case 3://绘制多边形
      addPolygon2(viewer, active);
      break;
    case 4://动态河流淹没
      viewer.scene.globe.depthTestAgainstTerrain = true;
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
    case 19: //城市道路
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
    case 23:// 增加航迹线
      addPlaneLine(viewer, active);
      break;
    default: break;
  }
};
const initCesium = () => {
  if (viewer) {
    viewer.destroy();
  }

  // const overlay = new Cesium.UrlTemplateImageryProvider({
  //   url:'/map/{z}/{x}/{y}.png',
  //   fileExtension:'png',
  //   maximumLevel:8,
  // })
  viewer = new Cesium.Viewer("cesiumContainer", {
    animation: true, // 是否显示时钟clock动画控件
    baseLayerPicker: false, // 是否显示图层选择控件
    geocoder: false, // 是否显示地名查找控件
    timeline: true, // 是否显示时间线控件
    sceneModePicker: true, // 是否显示投影方式控件
    navigationHelpButton: false, // 是否显示帮助信息控件
    infoBox: false, // 是否显示点击要素之后显示的信息
    fullscreenButton: false, // 是否显示全屏按钮
    selectionIndicator: false, // 是否显示选中指示器
    terrainProvider: Cesium.createWorldTerrain({
      // requestVertexNormals: true,
      // requestWaterMask: true
    }),
    // imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
    //  url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
    // })
  });
  //时间轴设置成中文
  viewer.animation.viewModel.dateFormatter = DateTimeFormatter
  viewer.animation.viewModel.timeFormatter = TimeFormatter
  viewer.timeline.makeLabel = DateTimeFormatter
  viewer.scene.debugShowFramesPerSecond = true;
  // viewer.scene.globe.enableLighting = true;
  viewer.clock.shouldAnimate = true
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP

  viewer.scene.globe.depthTestAgainstTerrain = true; //几何图形是否有高程遮挡效果
  // var layer = new Cesium.UrlTemplateImageryProvider({
  //   url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  //   minimumLevel: 4,
  //   maximumLevel: 18
  // })
  // viewer.imageryLayers.addImageryProvider(layer);
  // viewer.imageryLayers.addImageryProvider(overlay);

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(110, 30, 10000000),
    duration: 1.6,
  });
  viewer.scene.screenSpaceCameraController.enableTit = false;
};
const TimeFormatter = (time: any, viewModel: any) => {
  return DateTimeFormatter(time, viewModel, true)
}
const DateTimeFormatter = (datetime: any, viewModel: any, ignoredate: any) => {
  let julianDate = new Cesium.JulianDate()
  Cesium.JulianDate.addHours(datetime, 8, julianDate)
  let gregorianDT = Cesium.JulianDate.toGregorianDate(julianDate)
  let objDT
  if (ignoredate) objDT = ''
  else {
    objDT = new Date(gregorianDT.year, gregorianDT.month, gregorianDT.day)
    objDT = gregorianDT.year + '年' + objDT.toLocaleDateString('zh-cn', { month: 'short' }) + gregorianDT.day + '日'
    if (viewModel || gregorianDT.hour + gregorianDT.minute === 0) return objDT
    objDT += ''
  }
  // return objDT + Cesium.sprintf('%02d:%02d:%02d', gregorianDT.hour, gregorianDT.minute, gregorianDT.second)
  return objDT + gregorianDT.hour + ':' + gregorianDT.minute + ':' + gregorianDT.second 
}




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
</style>

