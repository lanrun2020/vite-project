import Cesium from "@/utils/importCesium"

export const addEcharts = (viewer: any, active: boolean) => {
  if (active) {
    // const convertData = function (data: any) {
    //   const res = [];
    //   for (let i = 0; i < data.length; i++) {
    //     // const geoCoord = geoCoordMap[data[i].name];
    //     // if (geoCoord) {
    //     //   res.push({
    //     //     name: data[i].name,
    //     //     value: geoCoord.concat(data[i].value)
    //     //   });
    //     // }
    //   }
    //   console.log(res);
    //   return res;
    // };

    var randomCount = 80000;
    var i = 0;
    // var data = new Float32Array(randomCount);
    // const data = new Float32Array(randomCount);
    // const geoCoordMap = new Float32Array(randomCount);
    const res = [];
    while (randomCount--) {
      const dd = [3];
      // data[i] = -125.8 + Math.random() * 50;
      // data[i+1] = 30.3 + Math.random() * 201;
      // data[i] = {name: 'test', value: 10};
      // geoCoordMap[i].push('test':[-125.8 + Math.random() * 50,31.89,30.3 + Math.random() * 201]);
      dd[0] = 0 + Math.random() * 20
      dd[1] = 0 + Math.random() * 20
      dd[2] = 100
      res.push({
        name: i,
        value: dd
      });
      i++;
    }
    const option = {
      animation: !1,
      GLMap: {},
      series: [
        {
          name: '城市',
          type: 'scatter',
          coordinateSystem: 'GLMap',
          data: res,
          symbolSize: function (val: any) {
            return val[2] / 20;
          },
          label: {
            normal: {
              formatter: '{b}',
              position: 'right',
              show: false
            },
            emphasis: {
              show: true
            }
          },
          itemStyle: {
            normal: {
              color: '#ddb926'
            }
          }
        }
      ]
    };
    Cesium.combineEcharts(option);
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(117.16, 32.71, 15000000.0)
    });
  }
}