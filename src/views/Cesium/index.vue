<template>
  <div id="cesiumContainer">
    <!-- <video id="myVideo" style="width: 400px;height: 400px;" autoplay loop controls >
     <source src="./video.mp4" type="video/mp4">
    </video> -->
    <toolbox :toolList="toolList" @toolChecked="toolChecked"></toolbox>
  </div>
</template>

<script setup lang="ts">
import Toolbox from "./toolbox.vue";
import { ref, Ref, onMounted, onBeforeUnmount } from "vue";
import { fetchCesium } from "@/apis/an-system";
import { addPolygon2 } from "./polygon";
import Cesium from '@/utils/importCesium'
import "@/jslibs/cesium-VideoShed3D.js"

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
import { addBillboard } from "./addBillboard";
import { addWedgeScan } from "./addWedgeScan";
import { addGeoJsonData } from "./addGeoJsonData";
import { addParticleSystem } from "./addParticleSystem";
import { addParticleSystem2 } from "./addParticleSystem2";
import { addCircleWall } from "./addCircleWall";
import { addWind } from "./addWind";
import { addBox } from "./addBox";
import test from "node:test";
import "./texture3D"
import { addPrimitive } from "./lxs_volumn"
type toolItemType = {
  title: string;
  value: number;
  active: boolean;
}
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
  // {
  //   title: "billboard",
  //   value: 25,
  //   active: false,
  // },
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
  }
])
onMounted(async () => {
  console.log('cesium page')
  let res = await fetchCesium();
  initCesium();
});
onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
  }
})
const toolChecked = (active: boolean, value: number) => {
  if (!active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110, 30, 10000000),
      duration: 1.6,
    });
  }
  const tool = toolList.value.find((item) => item.value === value)
  tool && (tool.active = active)
  switch (value) {
    case 0:// 增加迁徙线
      addFlyLine(viewer, active);
      break;
    case 1:// 扩散扫描效果
      viewer.scene.globe.depthTestAgainstTerrain = false;
      addSpreadEllipse(viewer, active);
      break;
    case 2://旋转扫描效果
      addScanEllipse(viewer, active);
      break;
    case 3://绘制多边形
      viewer.scene.globe.depthTestAgainstTerrain = true;
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
      viewer.scene.globe.depthTestAgainstTerrain = true;
      serveyDistance(viewer, active);
      break;
    case 15: //测量面积
     viewer.scene.globe.depthTestAgainstTerrain = true;
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
    case 23:// 增加航迹线
      addPlaneLine(viewer, active);
      break;
    case 24:// 增加实时航迹线
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
    default: break;
  }
};
const initCesium = () => {
  if (viewer) {
    viewer.destroy();
  }

  const overlay = new Cesium.TileMapServiceImageryProvider({
    url:'/map',
    fileExtension: 'png',
    // fileExtension:'png',
    maximumLevel:19,
  })
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
    },//Context和WebGL创建属性对应于Context#options
    // terrainProvider: Cesium.createWorldTerrain({
    //   requestVertexNormals: true,
    //   requestWaterMask: false
    // }),
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

  //深度检测
  viewer.scene.globe.depthTestAgainstTerrain = true; //几何图形是否有高程遮挡效果
  var pos = Cesium.Cartesian3.fromDegrees(61.296382224724795,35.628536117000692);
  // console.log(pos);
  //Cartesian3转经纬度坐标
  //Cartographic坐标
  var carto = viewer.scene.globe.ellipsoid.cartesianToCartographic(pos);
  // console.log(carto);
  //经纬度
  var lon = Cesium.Math.toDegrees(carto.longitude);
  var lat = Cesium.Math.toDegrees(carto.latitude);
  addPrimitive(viewer)
  // viewer.camera.lookAt(new Cesium.Cartesian3.fromDegrees(124.21936679679918,
  //   45.85136872098397, 80), new Cesium.Cartesian3(2, 2, 2));
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(124.21936679679918,
    45.85136872098397, 10),
        duration: 1.6
      })
  setTimeout(() => {
    viewer.render();
    let canvas = viewer.scene.canvas;
            let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            // console.log(image);
            // let link = document.createElement("a");
            // let blob = dataURLtoBlob(image);
            // console.log(blob);
            // let objurl = URL.createObjectURL(blob);
            // link.download = "scene.png";
            // link.href = objurl;
            // link.click();
  }, 4000)

  // console.log(lon,lat);
  // console.log(Cesium.JulianDate.fromDate(new Date('2023-06-05 13:39:56')));
  // var layer = new Cesium.UrlTemplateImageryProvider({
  //   url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  //   minimumLevel: 4,
  //   maximumLevel: 18
  // })
  // viewer.imageryLayers.addImageryProvider(layer);

  // const tiflayer = new Cesium.WebMapServiceImageryProvider({
  //   url: '/cesiumtif',
  //   layers: 'cesium:map9',
  //   parameters: {
  //     service: 'WMS',
  //     format: 'image/png',
  //     srs: 'EPSG:4326',
  //     crs: 'EPSG:4326',
  //     transparent: true,
  //   }
  // })
  // viewer.imageryLayers.addImageryProvider(tiflayer);
  // const overlay = new Cesium.UrlTemplateImageryProvider({
  //   url:'/map/{z}/{x}/{y}.png',
  //   fileExtension: 'png',
  //   // fileExtension:'png',
  //   maximumLevel:9,
  // })
  viewer.imageryLayers.addImageryProvider(overlay);

  // viewer.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(110, 30, 10000000),
  //   duration: 1.6,
  // });
  // viewer.scene.screenSpaceCameraController.enableTit = false;
  // addCity(viewer, true);
  testFuc()
};
const testFuc = () => {
  // const VoxelProvider = 
  // const primitive = new Cesium.VoxelPrimitive({
  //   provider:	VoxelProvider,
  //   modelMatrix: Matrix4,
  //   customShader:
  // })
}
function dataURLtoBlob(dataurl) {
            let arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {
                type: mime
            });
        }
// 创建相机
// const createLightCamera = () => {
//     this.lightCamera = new Cesium.Camera(this.viewer.scene)
//     this.lightCamera.position = this.viewPosition
//     this.lightCamera.frustum.near = this.viewDistance * 0.001
//     this.lightCamera.frustum.far = this.viewDistance
//     const hr = Cesium.Math.toRadians(this.horizontalViewAngle)
//     const vr = Cesium.Math.toRadians(this.verticalViewAngle)
//     const aspectRatio =
//         (this.viewDistance * Math.tan(hr / 2) * 2) /
//         (this.viewDistance * Math.tan(vr / 2) * 2)
//     this.lightCamera.frustum.aspectRatio = aspectRatio
//     if (hr > vr) {
//       this.lightCamera.frustum.fov = hr
//     } else {
//       this.lightCamera.frustum.fov = vr
//     }
//     this.lightCamera.setView({
//       destination: this.viewPosition,
//       orientation: {
//         heading: Cesium.Math.toRadians(this.viewHeading || 0),
//         pitch: Cesium.Math.toRadians(this.viewPitch || 0),
//         roll: 0
//       }
//     })
//   }
//投射视频到模型
const addVideo = () => {
  const dom = document.getElementById('myVideo')
//   const greenCylinder = viewer.entities.add({
//   name: "Green cylinder with black outline",
//   position: Cesium.Cartesian3.fromDegrees(111.0, 40.0, 200000.0),
//   cylinder: {
//     length: 400000.0,
//     topRadius: 200000.0,
//     bottomRadius: 200000.0,
//     material: Cesium.Color.GREEN.withAlpha(0.9),
//   },
// });
//   const redCone = viewer.entities.add({
//     name: "Red cone",
//     position: Cesium.Cartesian3.fromDegrees(110.0, 30.0, 200000.0),
//     cylinder: {
//       length: 400000.0,
//       topRadius: 0.0,
//       bottomRadius: 200000.0,
//       material: dom,
//     },
//   });
  // const primitive = new Cesium.Primitive({
  //     geometryInstances: new Cesium.GeometryInstance({
  //       geometry: new Cesium.PolygonGeometry({
  //         polygonHierarchy: new Cesium.PolygonHierarchy(
  //           Cesium.Cartesian3.fromDegreesArray([
  //             121.4591830727844, 31.20923471021075,
  //             121.4591830727844, 31.27923471021075,
  //             121.5599830727844, 31.27923471021075,
  //             121.5599830727844, 31.20923471021075])
  //         ),
  //         height: 0,
  //         extrudedHeight: 100,
  //       }),
  //     }),
  //     classificationType : Cesium.ClassificationType.BOTH,
  //     appearance: new Cesium.EllipsoidSurfaceAppearance({
  //       material: Cesium.Material.fromType("Stripe"),
  //     }),
  //   })
    // viewer.scene.primitives.add(
    //   primitive
    // );
  // 121.4991830727844, 31.236923471021075
  // viewer.zoomTo(viewer.entities);
  // const dom2 = document.getElementById('myImage')
  // 参数
  // let viewModel = { verticalAngle: 90, horizontalAngle: 120, distance: 10 };
  // let videoShed3DArr = [];
  //   // 创建
  //   let create = () => {
  //       let videoShed3D = new Cesium.VideoShed3D(viewer, {
  //         type: 'Video',
  //         url: "src/cs.mp4",
  //         alpha: 1,
  //         debugFrustum: true,
  //         horizontalAngle: Number(viewModel.horizontalAngle),
  //         verticalAngle: Number(viewModel.verticalAngle),
  //         distance: Number(viewModel.distance),
  //       });
  //       videoShed3DArr.push(videoShed3D)
  //   }
  //   create()
    // 销毁
    // let destroy = () => {
    //     videoShed3DArr.forEach(video => video.destroy())
    // }
  const e = viewer.entities.add({
    polygon:{
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        // height:0,
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
          121.5091830727844, 31.23923471021075,1215,
          121.5091830727844, 31.24123471021075,1215,
          121.5109830727844, 31.24123471021075,1215,
          121.5109830727844, 31.23923471021075,1215,
        ]),
        // extrudedHeight: 10,
        // material: Cesium.Color.GREEN,
        material: dom,
        clampToGround: true,
        classificationType: Cesium.ClassificationType.BOTH,
      },
    });
    setTimeout(() => {
      viewer.zoomTo(e);
    },100)

  // var videoElement = document.getElementById('myVideo');
  // var projectionImage = new Cesium.ProjectionImage(videoElement);
  // projectionImage.setImage({
  //                   video: videoElement
  //               });
  //   projectionImage.viewPosition = [110.0, 30.0, 210000.0];

  //   projectionImage.horizontalFov = 20000;
  //   projectionImage.verticalFov = 10000;

  //   projectionImage.setDistDirByPoint([110.0, 30.0, 200000.0]);
  //   projectionImage.distance = 10000;
}
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
    objDT = gregorianDT.year + '年' + gregorianDT.month + '月' + gregorianDT.day + '日'
    if (viewModel || gregorianDT.hour + gregorianDT.minute === 0) return objDT
    objDT += ''
  }
  // return objDT + Cesium.sprintf('%02d:%02d:%02d', gregorianDT.hour, gregorianDT.minute, gregorianDT.second)
  return objDT + gregorianDT.hour.toString().padStart(2, '0') + ':' + gregorianDT.minute.toString().padStart(2, '0') + ':' + gregorianDT.second.toString().padStart(2, '0')
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
#myVideo{
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 256px;
  z-index: 100;
}
</style>

