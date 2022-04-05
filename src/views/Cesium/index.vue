<template>
  <div>
    <div id="cesiumContainer">
      <toolbox :toolList="toolList" @toolChecked="toolChecked" @finishPolygon="reset"></toolbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import Toolbox from "./toolbox.vue";
import { onMounted, reactive } from "@vue/runtime-core";
import { fetchCesium } from "@/apis/an-system";
import { addPolygon2, reset } from "./polygon";
import Cesium from '@/utils/importCesium'
import "./flowLineMaterial";
import "./RadarMaterial";
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
  },
  {
    title: "动态河流",
    value: 4,
  },
  {
    title: "静态雷达",
    value: 5,
  },
  {
    title: "雷达扫描",
    value: 6,
  },
  {
    title: "飞机航线",
    value: 7,
  },
  {
    title: "流动管道",
    value: 8,
  },
  {
    title: "人口统计",
    value: 9,
  },
  {
    title: "点聚合",
    value: 10,
  },
  {
    title: "卫星",
    value: 11,
  }
];
onMounted(async () => {
  let res = await fetchCesium();
  initCesium();
});
const toolChecked = (active: boolean, value: number) => {
  switch (value) {
    case 0:// 增加迁徙线
      addFlyLine(viewer, active);
      break; 
    case 1:// 扩散扫描效果
      addSpreadEllipse(viewer, active);
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
    case 7: //直飞
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
    case 11: //卫星
     addSatellite(viewer, active);
     break;
    default: break;
  }
};
const initCesium = () => {
  if (viewer) {
    viewer.destroy();
  }
  
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
    terrainProvider: Cesium.createWorldTerrain(),
    // imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
    //  url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
    // })
  });
  viewer.clock.shouldAnimate = true
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP

  viewer.scene.globe.depthTestAgainstTerrain = true;
  // var layer = new Cesium.UrlTemplateImageryProvider({
  //   url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  //   minimumLevel: 4,
  //   maximumLevel: 18
  // })
  // viewer.imageryLayers.addImageryProvider(layer);
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(110, 30, 10000000),
    duration: 1.6,
  });
  viewer.scene.screenSpaceCameraController.enableTit = false;
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

