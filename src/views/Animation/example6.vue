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
const angle = 10
onMounted(() => {
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;
  onWindowResize()
  window.addEventListener('resize', onWindowResize);
  init()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(requestId)
  window.removeEventListener('resize', onWindowResize);
})
const onWindowResize = () => {
  const { width, height } = canvas.parentNode.getBoundingClientRect()
  canvas.width = width;
  canvas.height = height;
}
const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min) + min)
}
class Point {
  r: number;
  x: number;
  y: number;
  dis: number;
  speed: number;
  lastTime: number;
  constructor() {
    this.r = 4;
    this.x = getRandom(0, canvas.width - this.r / 2)
    this.y = getRandom(0, canvas.height - this.r / 2)
    this.dis = getRandom(30, 60)
    this.speed = getRandom(800, 1200);
    this.lastTime = Date.now();
  }
  draw() {
    //更新坐标
    const duration = Math.min((Date.now() - this.lastTime)/1000, 0.016)
    const dis = this.speed * duration
    let y = this.y + dis*Math.cos(angle*2*Math.PI/360)
    let x = this.x - dis*Math.sin(angle*2*Math.PI/360)
    if (y > canvas.height - this.r / 2) {
      y = -100
      this.dis = getRandom(30, 60)
    }
    if (x < 0) {
      x = canvas.width - this.r / 2
    } else if (x > canvas.width - this.r / 2) {
      x = 0
    }
    this.y = y
    this.x = x
    this.lastTime = Date.now();
  }
}
class Graph {
  points: Point[];
  constructor(ponitNumber = 300) {
    this.points = new Array(ponitNumber).fill(0).map(() => new Point())
  }
  draw() {
    //界面隐藏或切换至其他标签页时requestAnimationFrame会暂停
    requestId = requestAnimationFrame(() => {
      this.draw()
    })
    //清除上一帧数据
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i]
      p1.draw()
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p1.x - p1.dis*Math.sin(angle*2*Math.PI/360), p1.y + p1.dis*Math.cos(angle*2*Math.PI/360))
      ctx.closePath()
      ctx.strokeStyle = `rgba(100,100,100,${p1.dis / 100})`
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
.main-card {
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
