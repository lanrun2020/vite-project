<template>
  <div id="map" class="map"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Map from 'ol/Map';
// import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';

import View from 'ol/View';
import ZoomSlider from 'ol/control/ZoomSlider';
import { defaults as defaultControls } from 'ol/control';

import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, XYZ } from "ol/source";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import { Stroke, Style, Circle, Fill, Text } from "ol/style";
import GeoJSON from 'ol/format/GeoJSON.js';
const map = ref(null)
const view = new View({
  projection: "EPSG:4326", // 坐标系，有EPSG:4326和EPSG:3857
  center: [113.57, 22.2], // 中心点
  zoom: 14, // // 地图缩放级别(打开页面时默认级别)
  // extent: [113.4445, 22.0767, 113.7140, 22.4170], // 限制地图显示范围
  maxZoom: 20,
  // minZoom: 1,  // 地图缩放最小级别
});

// start点
const points = [
  [113.55, 22.21],
  [113.58, 22.20],
  [113.59, 22.20],
  [113.56, 22.21],
  [113.59, 22.21],
  [113.60, 22.20],
]

// 点样式
const getPointStyle = (color,index) => {
  const pointStyle = new Style({
    image: new Circle({
      radius: 10,
      fill: new Fill({
        color: color,
      }),
    }),
    text: new Text({
        textAlign: 'center',     //对齐方式
        textBaseline: 'middle',    //文本基线
        font: 'normal 12px 微软雅黑',     //字体样式
        text: 'point'+(index+1),    //文本内容
        offsetY: -25,    // Y轴偏置
        fill: new Fill({        //填充样式
        color: '#00ff00'
      })
    })
  })
  return pointStyle
}
const pointFeature = [];
let pointFeature2 = null;

points.forEach((point, index) => {
  // 添加点标记
  pointFeature2 = new Feature({
    geometry: new Point(point),
    name: 'My Polygon',
  })
  // if (index % 2) { //下标奇数点我们给它设置颜色，偶数点不设置样式采用默认样式
    pointFeature2.setStyle(
      getPointStyle('#0000ff', index)
    ) // 这种方式可以设置不同样式的点,不设置则采用默认样式
  // }
  pointFeature.push(pointFeature2)
})
const pointSource = new VectorSource({
  features: pointFeature
});
const pointLayer = new VectorLayer({
  source: pointSource,
  style: null,
  visible: true,
  // style: new Style({
  //   image: new Circle({
  //     radius: 10,
  //     fill: new Fill({
  //       color: '#00FF00',
  //     }),
  //   })
  // }),//点图层默认样式
});
// end点

// start线
const lines = [[ // 第一条线
  [113.55, 22.21],
  [113.58, 22.20],
  [113.59, 22.20],
], [            // 第二条线
  [113.56, 22.21],
  [113.59, 22.21],
  [113.60, 22.20],
], [            // 第三条线
  [113.55, 22.22],
  [113.58, 22.21],
  [113.59, 22.22],
  [113.60, 22.21],
]]

// 线样式
const getLineStyle = () => {
  const style = new Style({
    stroke: new Stroke({
      color: '#FF0000',
      width: 1.5
    })
  })
  return style
}

const lineFeature = [];
let lineFeature2 = null;
lines.map((line,index) => {
  lineFeature2 = new Feature({
    geometry: new LineString(line),
  })
  if(index%2){
    lineFeature2.setStyle(getLineStyle()) // 这种方式可以设置不同样式的线,不设置则采用默认样式
  }
  lineFeature.push(lineFeature2)
})
const linesSource = new VectorSource({
  features: lineFeature
});
const lineLayer = new VectorLayer({
  source: linesSource,
  style: new Style({
    stroke: new Stroke({
      color: '#0000FF',
      width: 2
    })
  }),//设置默认样式,为null时采用各自样式或者默认样式。
});
// end线

// start地图以及图层显示
const initMap = () => {
  const style = new Style({
    text: new Text({
      font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
      placement: 'line',
      overflow: true,
      fill: new Fill({
        color: 'white',
      }),
    }),
  });
  // 地图实例
  map.value = new Map({
    layers: [  // 图层
      new TileLayer({ // 使用瓦片渲染方法
        source: new XYZ({ // 图层数据源
          // url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',//高德街道地图
          // url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}',//中国暖色版地图
          url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',//中国蓝黑版地图
        })
      }),
      new VectorLayer({
        declutter: true,
        source: new VectorSource({
          format: new GeoJSON(),
          url: '../src/json/text.geojson',
        }),
        style: function (feature) {
          style.getText().setText(feature.get('name'));
          return style;
        },
      }),
    ],
    keyboardEventTarget: document,
    target: 'map', // 对应页面里 id 为 map 的元素
    view: view,  // 地图视图
    controls: defaultControls().extend([new ZoomSlider()]),
  })
  //这里先加载点图层，然后加载线图层，则线图层在点图层之上，所以图层重叠关系与加载顺序有关
  map.value.addLayer(pointLayer)
  map.value.addLayer(lineLayer)

  map.value.on('click', (e) => {
    // console.log(e);
    map.value.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
      const type = feature.getGeometry().getType()
      // const property = feature.getProperties()
      if (type === 'Point'){
        // feature.getStyle().getText().getFill().setColor('yellow')
        // feature.getStyle().getImage().getFill().setColor('yellow')
        // feature.changed()
        feature.setStyle(null) //设置隐藏元素(图层vector样式设置为null才行,否则是设置为默认样式)
        // feature.setStyle(getPointStyle('yellow'))
      }
      // const coordinate = Extent.getCenter(feature.getGeometry().getExtent())
    })
  })
}
// end地图以及图层显示
onMounted(() => {
  initMap()
})
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>