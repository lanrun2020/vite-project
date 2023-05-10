<template>
 <div style="width: 100%;height: 100%;background-color: black;">
    <canvas id="canvasDom" width="500" height="500" style="background-color: blue"></canvas>
 </div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue';
onMounted(() => {
  draw()
})
const draw = () => {
  //通过getElementById()方法获取canvas画布
  const canvas = document.getElementById('canvasDom') as HTMLCanvasElement;
  //通过方法getContext()获取WebGL上下文
  const width=100, height=100;
  // const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#00ffff';
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
