<template>
  <div id="map" class="map"></div>
</template>
 
<script>
import { defineComponent, ref, onMounted } from 'vue'
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';

import View from 'ol/View';
import ZoomSlider from 'ol/control/ZoomSlider';
import { defaults as defaultControls } from 'ol/control';

import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, XYZ } from "ol/source";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import { Stroke, Style, Circle, Fill } from "ol/style";

export default defineComponent({
  name: 'openlayers',
  components: {
  },
  setup () {
    // start地图以及图层显示
    const map = ref(null)
    const view = new View({
      projection: "EPSG:4326", // 坐标系，有EPSG:4326和EPSG:3857
      center: [113.5, 22.2], // 中心点
      zoom: 13, // // 地图缩放级别(打开页面时默认级别)
      extent: [113.4445, 22.0767, 113.7140, 22.4170], // 范围
      maxZoom: 20,
      // minZoom: 1,  // 地图缩放最小级别
    });

    const initMap = () => {
      // 地图实例
      map.value = new Map({
        layers: [  // 图层
          // new TileLayer({  // 使用瓦片渲染方法
          //   source: new OSM(),  // 图层数据源
          // }),
          new TileLayer({
           source: new XYZ({
               url:'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
           })
          })
        ],
        keyboardEventTarget: document,
        target: 'map', // 对应页面里 id 为 map 的元素
        view: view,  // 地图视图
        controls: defaultControls().extend([new ZoomSlider()]),
      })
      map.value.addLayer(pointLayer)
      map.value.addLayer(lineLayer);
    }
    // end地图以及图层显示

    // start点
    var points = [
      [113.55, 22.21],
      [113.58, 22.20],
      [113.59, 22.20],
      [113.56, 22.21],
      [113.59, 22.21],
      [113.60, 22.20],
    ]

    // 点样式
    const getPointStyle = (color) => {
      var pointStyle = new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: color,
          }),
        })
      })
      return pointStyle
    }
    var pointFeature = [];
    let pointFeature2 = null;

    points.forEach(v => {
      // 添加点标记
      pointFeature2 = new Feature({
        geometry: new Point(v),
      })
      pointFeature2.setStyle(getPointStyle("#000000")) // 这种方式可以设置不同样式的点
      pointFeature.push(pointFeature2)

    })
    var pointSource = new VectorSource({
      features: pointFeature
    });
    var pointLayer = new VectorLayer({
      source: pointSource,
      style: function (feature, resolution) {
        return feature.getStyle();
      },
    });
    // end点

    // start线
    var lines = [[ // 一条线
      [113.55, 22.21],
      [113.58, 22.20],
      [113.59, 22.20],
    ], [            // 两条线
      [113.56, 22.21],
      [113.59, 22.21],
      [113.60, 22.20],
    ]]

    // 线样式
    const getLineStyle = () => {
      var style = new Style({
        stroke: new Stroke({
          color: '#FF0000',
          width: 1.5
        })
      })
      return style
    }

    var lineFeature = [];
    let lineFeature2 = null;
    lines.map(v => {
      lineFeature2 = new Feature({
        geometry: new LineString(v),
      })
      lineFeature2.setStyle(getLineStyle()) // 这种方式可以设置不同样式的线
      lineFeature.push(lineFeature2)
    })
    var linesSource = new VectorSource({
      features: lineFeature
    });
    var lineLayer = new VectorLayer({
      source: linesSource,
      style: function (feature, resolution) {
        return feature.getStyle();
      },
    });
    // end线

    onMounted(() => {
      initMap()
    })
    return {
      map,
      initMap
    }
  }
})
</script>
 
<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>