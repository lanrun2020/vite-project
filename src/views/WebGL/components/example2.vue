<template>
  <div>
    <canvas id="webgl2"></canvas>
  </div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue';

onMounted(() => {
  init()
})
const init = () => {
  //通过getElementById()方法获取canvas画布
  const canvas = document.getElementById('webgl2') as HTMLCanvasElement;
  //通过方法getContext()获取WebGL上下文
  const width=100, height=100;
  // const canvas = document.createElement('canvas');
  canvas.width = width;
  // canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, width, height);
  ctx.font = 24+'px " bold';
  ctx.fillStyle = '#2891FF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('sdfsdf', width/2,height/2); 
}

</script>

<style scoped lang="scss">

</style>
