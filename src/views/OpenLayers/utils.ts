import Feature from "ol/Feature";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, XYZ } from "ol/source";
import { Stroke, Style, Circle, Fill, Text } from "ol/style";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";

import proj4 from "proj4";

export function convertT84(x, y) {
  proj4.defs("EPSG:4549", "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs");
  proj4.defs("EPSG:4547", "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs");
  proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs +type=crs");
  // 用4549计算出来的经度会偏差3度， 所以用4547
  const newCoordinates = proj4("EPSG:4547", "EPSG:4326", [x, y]);
  return newCoordinates;
}

// 获取线样式
const getLineStyle = () => {
  return new Style({
    stroke: new Stroke({
      color: '#FF0000',
      width: 1.5
    })
  })
}

// 获取点样式
const getPointStyle = () => {
  const pointStyle = new Style({
    image: new Circle({
      radius: 10,
      fill: new Fill({
        color: '#764ba2',
      }),
    }),
    // text: new Text({
    //   textAlign: 'center',     //对齐方式
    //   textBaseline: 'middle',    //文本基线
    //   font: 'normal 12px 微软雅黑',     //字体样式
    //   text: label,    //文本内容
    //   offsetY: -25,    // Y轴偏置
    //   fill: new Fill({        //填充样式
    //     color: '#00ff00'
    //   })
    // })
  })
  return pointStyle
}

export const addLayers = (map, data) => {
  const lineFeatures = []
  const pointFeatures = []
  data.map((item, index) => {
    switch (item.shapeType) {
      case 'line':
        addLine(lineFeatures, item, index)
        break;
      case 'point':
        addPoint(pointFeatures, item, index)
        break;
      default:
        break;
    }
  })
  const linesSource = new VectorSource({
    features: lineFeatures
  });
  const lineLayer = new VectorLayer({
    source: linesSource,
    declutter: true,//清理、裁剪（地图收缩时将重合要素清除，只展示部分要素）
    style: new Style({
      stroke: new Stroke({
        color: '#00FFFF',
        width: 2
      })
    }),//设置图层种线条的默认样式,为null时采用各自样式或者默认样式。
  });
  const pointSource = new VectorSource({
    features: pointFeatures
  });
  const pointLayer = new VectorLayer({
    source: pointSource,
    visible: true,
    declutter: true,
    // style: null,
    style: new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({
          color: '#00ffff',
        }),
      })
    }),//点图层默认样式
  });
  //这里先加载线图层，然后加载点图层，则线图层在点图层之上，所以图层重叠关系与加载顺序有关
  map.addLayer(lineLayer)
  map.addLayer(pointLayer)
}
const addLine = (lineFeatures, item, index) => {
  if (!item.startX || !item.startY || !item.endX || !item.endY) return
  const start = convertT84(item.startX,item.startY)
  const end = convertT84(item.endX,item.endY)
  const feature = new Feature({
    geometry: new LineString([start,end]),
  })
  feature.setId('line'+index)
  feature.setStyle(getLineStyle()) // 设置线样式,如不设置则采用图层样式或默认样式
  lineFeatures.push(feature)
}
const addPoint = (pointFeatures, item, index) => {
  if (!item.x || !item.y) return
  const point = convertT84(item.x,item.y)
  const feature = new Feature({
    geometry: new Point(point),
  })
  feature.setId('point'+index)
  feature.setStyle(getPointStyle()) // 设置线样式,如不设置则采用图层样式或默认样式
  pointFeatures.push(feature)
}