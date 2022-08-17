<template>
  <div id="contain"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { onMounted } from 'vue';
import axios from "axios";

onMounted(() => {
  init()
})
const getTime = (time: number) => {
  const t = new Date(time)
  const h = t.getHours() > 9 ? t.getHours() : ('0' + t.getHours())
  const m = t.getMinutes() > 9 ? t.getMinutes() : ('0' + t.getMinutes())
  const s = t.getSeconds() > 9 ? t.getSeconds() : ('0' + t.getSeconds())
  return t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate() + ' ' + h + ':' + m + ':' + s
}
const init = async () => {
  let chartDom = document.getElementById('contain') as HTMLElement;
  let myChart = echarts.init(chartDom);
  let option;
  const alt: any = []
  const gs: any = []
  const time: any = []
  await axios.get('/flydata.json').then((res) => {
    const track = res.data['CCA4516'].track;
    track.forEach((item: any) => {
      alt.push(item.alt * 30)
      gs.push(item.gs)
      const t = getTime(item.timestamp * 1000)
      time.push(t)
    })
  })
  console.log(alt.length);
  


  option = {
    xAxis: {
      type: 'category',
      data: time
    },
    yAxis: [{
      type: 'value'
    },
    {
      type: 'value',
      name: '速度',
      position: 'right',
      alignTicks: true,
      offset: 0,
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 0, 180, 0.4)'
        }
      },
      axisLabel: {
        formatter: '{value} km/h'
      }
    },],
    tooltip: {
      trigger: 'axis'
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    visualMap: {
      type: 'piecewise',
      show: false,
      dimension: 0,
      seriesIndex: 0,
      splitNumber: 5,
      pieces: [
        {
          min: 0,
          max: 5,
          color: 'rgba(0, 0, 180, 0.4)'
        },
      ]
    },
    series: [
      {
        data: alt,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#5470C6',
          width: 4
        },
        areaStyle: {},
        markLine: {
          symbol: ['none', 'none'],
          label: { show: false },
          data: [{ xAxis: 5 }]
        },
      },
      {
        data: gs,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: {
          color: '#5470C6',
          width: 4
        },
        markLine: {
          symbol: ['none', 'none'],
          label: { show: false },
          data: [{ xAxis: 5 }]
        },
      }
    ]
  };

  option && myChart.setOption(option);
}

</script>
<style>
#contain {
  width: 1000px;
  height: 400px;
}
</style>