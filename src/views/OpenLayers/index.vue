<template>
  <div id="map" class="map">
    <toolBar></toolBar>
  </div>
</template>

<script setup lang="ts">
import toolBar from './toolBar.vue'
import { ref, onMounted } from 'vue'
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
const map = ref(null)
const view = new View({
  projection: "EPSG:4326", // 坐标系，有EPSG:4326和EPSG:3857
  center: [113.0657269500363, 29.853459566356534], // 中心点
  zoom: 14, // // 地图缩放级别(打开页面时默认级别)
  // extent: [113.4445, 22.0767, 113.7140, 22.4170], // 限制地图显示范围
  maxZoom: 24,
  // minZoom: 1,  // 地图缩放最小级别
});


// start地图以及图层显示
const initMap = () => {
  // 地图实例
  map.value = new Map({
    layers: [  // 图层
      new TileLayer({ // 使用瓦片渲染方法
        source: new XYZ({ // 图层数据源
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',//高德街道地图
          // url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}',//中国暖色版地图
          // url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',//中国蓝黑版地图
          // url: 'http://t3.tianditu.com/DataServer?T=img_w&tk=5a257cd2df1b3311723bd77b0de14baf&x={x}&y={y}&l={z}'
        })
      }),
    ],
    // keyboardEventTarget: document,
    target: 'map', // 对应页面里 id 为 map 的元素
    view: view,  // 地图视图
  })

  // forEachFeatureAtPixel命中检测
  let lastFeature = null
  let lastStyle = null
  map.value.on('pointermove', (e) => {
    map.value.getTargetElement().style.cursor = ''
    if (lastFeature && lastStyle) {
      lastFeature.setStyle(lastStyle)
    }
    map.value.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
      const type = feature.getGeometry().getType()
      lastStyle = feature.getStyle()
      lastFeature = feature
      map.value.getTargetElement().style.cursor = 'pointer'
      // const property = feature.getProperties()
      if (type === 'Point') {
        feature.setStyle(new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({
              color: '#009688',
            }),
          })
        }))
        return true
        // feature.setStyle(null) //设置隐藏元素(图层vector样式设置为null才行,否则是设置为默认样式)
      }
      if (type === 'LineString') {
        feature.setStyle(new Style({
          stroke: new Stroke({
            color: '#009688',
            width: 1.5
          })
        }))
        return true
      }
      // const coordinate = Extent.getCenter(feature.getGeometry().getExtent())
    },
    {
      hitTolerance: 5//检测范围，在鼠标距离此范围内可被检测
    })
  })
  map.value.on('click', (e) => {
    // console.log(e);
    map.value.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
      const type = feature.getGeometry().getType()
      // const property = feature.getProperties()
      if (type === 'Point') {
        // feature.setStyle(null) //设置隐藏元素(图层vector样式设置为null才行,否则是设置为默认样式)
        feature.setStyle(new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({
              color: '#00ff00',
            }),
          })
        }))
      }
      // const coordinate = Extent.getCenter(feature.getGeometry().getExtent())
    })
  })
}
// end地图以及图层显示
onMounted(async () => {
  initMap()
  const res = await getLayerList()
  // console.log(res);
  const res2 = await getmetaData()
  // console.log(res2);
  addLayers(map.value, res2.data)
})

</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>