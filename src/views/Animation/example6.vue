<template>
  <div class="main-card">
    <canvas id="canvas"></canvas>
  </div>
</template>
<!-- 模拟下雨 -->
<script setup lang='ts'>
import { onMounted, onBeforeUnmount } from 'vue';
let canvas
let ctx
let requestId
let mouseX = 0,mouseY = 0,offsetX = 0,offsetY = 0
onMounted(() => {
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;
  onWindowResize()
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', handlerMouseMove)
  init()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(requestId)
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('mousemove', handlerMouseMove);
})
const handlerMouseMove = (event) => {
  mouseX = event.clientX - offsetX
  mouseY = event.clientY - offsetY
}
const onWindowResize = () => {
  const {width, height, x, y} = canvas.parentNode.getBoundingClientRect()
  offsetX = x
  offsetY = y
  canvas.width = width;
  canvas.height = height;
}
const getRandom = (min,max) => {
  return Math.floor(Math.random()*(max+1-min)+min)
}
class Point {
  constructor() {
    this.r = 4;
    this.x = getRandom(0, canvas.width - this.r/2)
    this.y = getRandom(0, 1200)
    this.dis = getRandom(50, 100)
    this.xSpeed = 0;
    this.ySpeed = 500;
    this.lastDrawTime = null;
  }
  draw() {
    //更新坐标
    if(this.lastDrawTime){
      //计算新的坐标
      const duration = (Date.now() - this.lastDrawTime) /1000
      const xDis = this.xSpeed * duration
      const yDis = this.ySpeed * duration
      let x = this.x + xDis
      let y = this.y + yDis
      if (y>1200) {
        y = -100
        this.dis = getRandom(50,100)
      }
      this.y = y
    }
    // ctx.beginPath()
    // ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI)
    // ctx.fillStyle = 'rgba(0,255,255,0.5)';
    // ctx.fill()
    this.lastDrawTime = Date.now()
  }
}
class Graph {
  constructor(ponitNumber = 150,maxDis = 300) {
    this.points = new Array(ponitNumber).fill(0).map(() => new Point())
    this.maxDis = maxDis
  }
  draw() {
      requestId = requestAnimationFrame(() => {
        this.draw()
      })
      //清除上一帧数据
      ctx.clearRect(0,0,canvas.width,canvas.height)
      for(let i=0;i<this.points.length;i++){
        const p1 = this.points[i]
        p1.draw()
        ctx.beginPath()
        ctx.moveTo(p1.x,p1.y)
        ctx.lineTo(p1.x,p1.y+p1.dis)
        ctx.closePath()
        ctx.strokeStyle = `rgba(0,200,200,${p1.dis/150})`
        ctx.stroke()
      }
    }
}
const init = () => {
  const graph = new Graph()
  graph.draw()
}
</script>

<style scoped lang="scss">
.main-card{
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#canvas {
  width: 100%;
  height: 100%;
  background: #000;
}
</style>
