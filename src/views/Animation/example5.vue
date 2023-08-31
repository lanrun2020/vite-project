<template>
  <div class="main-card">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script setup lang='ts'>
import { onMounted, onBeforeUnmount } from 'vue';
let canvas
let ctx
onMounted(() => {
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;
  onWindowResize()
  window.addEventListener('resize', onWindowResize);
  init()
})
const onWindowResize = (() => {
  const {width, height} = canvas.parentNode.getBoundingClientRect()
  canvas.width = width;
  canvas.height = height;
})
const getRandom = (min,max) => {
  return Math.floor(Math.random()*(max+1-min)+min)
}
class Point {
  constructor() {
    this.r = 4;
    this.x = getRandom(0, canvas.width - this.r/2)
    this.y = getRandom(0, canvas.height - this.r/2)
    this.xSpeed = getRandom(-100,100);
    this.ySpeed = getRandom(-100,100);
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
      if (x>canvas.width - this.r/2) {
        x = canvas.width - this.r / 2
        this.xSpeed = -this.xSpeed
      } else if (x<0){
        x = 0
        this.xSpeed = -this.xSpeed
      }
      if (y>canvas.height-this.r/2) {
        y = canvas.height - this.r/2
        this.ySpeed = -this.ySpeed
      } else if (y<0){
        y = 0;
        this.ySpeed = -this.ySpeed
      }
      this.x = x
      this.y = y
    }
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI)
    ctx.fillStyle = 'rgba(0,255,255,1.0)';
    ctx.fill()
    this.lastDrawTime = Date.now()
  }
}
class Graph {
  constructor(ponitNumber = 40,maxDis = 400) {
    this.points = new Array(ponitNumber).fill(0).map(() => new Point())
    this.maxDis = maxDis
  }
  draw() {
      requestAnimationFrame(() => {
        this.draw()
      })
      //清除上一帧数据
      ctx.clearRect(0,0,canvas.width,canvas.height)
      for(let i=0;i<this.points.length;i++){
        const p1 = this.points[i]
        p1.draw()
        for(let j = i+1;j<this.points.length;j++){
          const p2 = this.points[j]
          const d = Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
          if(d>this.maxDis) continue
          ctx.beginPath()
          ctx.moveTo(p1.x,p1.y)
          ctx.lineTo(p2.x,p2.y)
          ctx.closePath()
          ctx.strokeStyle = `rgba(0,200,200,${1-d/this.maxDis})`
          ctx.stroke()
        }
      }
    }
}
const init = () => {
  // ctx.beginPath()
  // ctx.moveTo(100,100)
  // ctx.lineTo(200,200)
  // ctx.strokeStyle = '#fff'
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.arc(100,100,6,0,2*Math.PI)
  // ctx.fillStyle = '#fff';
  // ctx.fill()

  // ctx.beginPath()
  // ctx.arc(200,200,6,0,2*Math.PI)
  // ctx.fillStyle = '#fff';
  // ctx.fill()

  // const point1 = new Point()
  // const point2 = new Point()
  // point1.draw()
  // point2.draw()
  const graph = new Graph()
  graph.draw()
}
onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
})
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
