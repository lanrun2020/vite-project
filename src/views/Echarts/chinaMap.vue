<template>
  <div id="contain"></div>
</template>
<script setup lang="ts">
import axios from 'axios';
import * as echarts from 'echarts';
// import { beihai } from '@/jslibs/china';
import { onMounted } from 'vue';
import { option } from './echartsData'
onMounted(async () => {
  await axios.get('/chinaMap/china.json').then((res) => {
    let data = res.data
    echarts.registerMap('chinaMap', data)
  })
  console.log(echarts);

  let myChart = echarts.init(document.getElementById('contain')!)
  myChart.setOption(option)
})

</script>
<style>
#contain {
  width: 100%;
  height: 90vh;
}
</style>