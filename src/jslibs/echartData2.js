import axios from "axios";
import echarts from "@/utils/importEcharts"
let busLines
const routes = async () => {
  await axios.get('/lines-bus.json').then((res) => {
    let data = res.data
    let hStep = 300 / (data.length - 1);
    busLines = [].concat.apply(
      [],
      data.map(function (busLine, idx) {
        let prevPt = [];
        let points = [];
        for (let i = 0; i < busLine.length; i += 2) {
          let pt = [busLine[i], busLine[i + 1]];
          if (i > 0) {
            pt = [prevPt[0] + pt[0], prevPt[1] + pt[1]];
          }
          prevPt = pt;
          points.push([pt[0] / 1e4 - 0.0055, pt[1] / 1e4 - 0.002]); //与cesium地图有位置偏差
          // points.push([pt[0] / 1e4, pt[1] / 1e4]);
        }
        return {
          coords: points,
          lineStyle: {
            normal: {
              color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * idx))
            }
          }
        }
      }))
  })
}
await routes()
export default {
  animation: !1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  GLMap: {},
  series: [
    {
      type: 'lines',
      coordinateSystem: 'GLMap',
      polyline: true,
      data: busLines,
      silent: true,
      lineStyle: {
        // color: '#c23531',
        color: 'rgb(200, 35, 45)',
        opacity: 0.2,
        width: 3
      },
      progressiveThreshold: 500,
      progressive: 200,
      zlevel: 1
    },
    {
      type: 'lines',
      coordinateSystem: 'GLMap',
      polyline: true,
      data: busLines,
      lineStyle: {
        width: 0
      },
      effect: {
        constantSpeed: 20,
        show: true,
        trailLength: 5,
        symbolSize: 3
      },
      zlevel: 1
    }
  ]
}