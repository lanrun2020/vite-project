// import { option } from './echartsData' //散点图
// import option from '@/jslibs/echartData.js' //飞机航线
// import option from '@/jslibs/echartData2.js' //道路
import option from '@/jslibs/echartData3.js' //迁徙线
import Cesium from '@/utils/importCesium'
import EchartsLayer from '@/jslibs/cesium_echartslayer.js'

let layer:any
export const addEcharts = (viewer: any, active: boolean) => {
  if (active) {
    if (!layer) {
      layer = new EchartsLayer(viewer, option)
    }
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(117.16, 32.71, 10000000.0)
    });
  } else {
    if (layer) {
      layer.destroy()
      layer = null
    }
  }
}