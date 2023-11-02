<template>
  <div id="map" class="map">
    <toolBar @toolChange="toolChange"></toolBar>
  </div>
</template>

<script setup lang="ts">
import toolBar from './toolBar.vue'
import { ref, onMounted, provide } from 'vue'
import Map from 'ol/Map';
// import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { getLayerList, getmetaData } from '@/apis/api-ol-map'
import View from 'ol/View';
import ZoomSlider from 'ol/control/ZoomSlider';
import { defaults as defaultControls, FullScreen, ScaleLine } from 'ol/control';

import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, XYZ } from "ol/source";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import { Stroke, Style, Circle, Fill, Text } from "ol/style";
import GeoJSON from 'ol/format/GeoJSON.js';
import { addLayers } from './utils';
import { mapToolEvent } from "./mapToolEvent";
let mapEvent
const view = new View({
  projection: "EPSG:4326", // 坐标系，有EPSG:4326和EPSG:3857
  center: [113.0657269500363, 29.853459566356534], // 中心点
  zoom: 20, // // 地图缩放级别(打开页面时默认级别)
  // extent: [113.4445, 22.0767, 113.7140, 22.4170], // 限制地图显示范围
  maxZoom: 24,
  // minZoom: 1,  // 地图缩放最小级别
});

// start地图以及图层显示
const initMap = () => {
  // 地图实例
  const map = new Map({
    layers: [  // 图层
      new TileLayer({ // 使用瓦片渲染方法
        source: new XYZ({ // 图层数据源
          //url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',//高德街道地图
          // url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}',//中国暖色版地图
          url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',//中国蓝黑版地图
          //  url: 'http://t0.tianditu.com/DataServer?T=vec_w&tk=5a257cd2df1b3311723bd77b0de14baf&x={x}&y={y}&l={z}'
          //  url: 'http://t0.tianditu.com/DataServer?T=cva_w&tk=5a257cd2df1b3311723bd77b0de14baf&x={x}&y={y}&l={z}'
        })
      })
    ],
    // keyboardEventTarget: document,
    target: 'map', // 对应页面里 id 为 map 的元素
    view: view,  // 地图视图
  })
  return map
}
// end地图以及图层显示
onMounted(async () => {
  const map = initMap()
  const res = await getLayerList()
  const res2 = await getmetaData()
  addLayers(map, res2.data)
  mapEvent = new mapToolEvent(map)
  mapEvent.init()
  mapEvent.handlePointerMove()
})

const toolChange = (type, activeName, cancel = false) => {
  if (cancel) {
     //todo这里还需要处理,取消选中的工具
     switch (type) {
      case 'move':
        mapEvent.handleEelect(false)
        break;
      default:
        break;
    }
    return
  }
  switch (type) {
    case 'move':
      mapEvent.handleEelect()
      break;
    case 'delete':
      activeName === 'icon-shou' && mapEvent.handleDelete()
      break;
    case 'last':
      mapEvent.handleLast()
      break;
    case 'next':
      mapEvent.handleNext()
      break;
    case 'drawLine':
      mapEvent.handleDraw('LineString')
      break;
    case 'drawPolygon':
      mapEvent.handleDraw('Polygon')
      break;
    case 'drawPoint':
      mapEvent.handleDraw('Point')
      break;
    default:
      break;
  }
}
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>