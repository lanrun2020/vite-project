<template>
  <div class="main-card">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script setup lang='ts'>
import { onMounted, onBeforeUnmount } from 'vue';
let canvas
let ctx
let requestId
let mouseX = 0, mouseY = 0, offsetX = 0, offsetY = 0
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
  const { width, height, x, y } = canvas.parentNode.getBoundingClientRect()
  offsetX = x
  offsetY = y
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
  xSpeed: number;
  ySpeed: number;
  lastTime: number;
  constructor() {
    this.r = 4;
    this.x = getRandom(0, canvas.width - this.r / 2)
    this.y = getRandom(0, canvas.height - this.r / 2)
    this.xSpeed = getRandom(-100, 100);
    this.ySpeed = getRandom(-100, 100);
    this.lastTime = Date.now()
  }
  draw() {
    //更新坐标, 计算新的坐标
    //离开标签页长时间再返回时duration值过大, 导致点的位置移动到了边缘, 所以这里限制下最大值
    const duration = Math.min((Date.now() - this.lastTime)/1000, 0.016)
    const xDis = this.xSpeed * duration
    const yDis = this.ySpeed * duration
    let x = this.x + xDis
    let y = this.y + yDis
    if (x > canvas.width - this.r / 2) {
      x = canvas.width - this.r / 2
      this.xSpeed = -this.xSpeed
    } else if (x < 0) {
      x = 0
      this.xSpeed = -this.xSpeed
    }
    if (y > canvas.height - this.r / 2) {
      y = canvas.height - this.r / 2
      this.ySpeed = -this.ySpeed
    } else if (y < 0) {
      y = 0;
      this.ySpeed = -this.ySpeed
    }
    this.x = x
    this.y = y
    this.lastTime = Date.now()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(0,255,255,0.5)';
    ctx.fill()
  }
}
class Graph {
  points: Point[];
  maxDis: number;
  constructor(ponitNumber = 80, maxDis = 300) {
    this.points = new Array(ponitNumber).fill(0).map(() => new Point())
    this.maxDis = maxDis
  }
  draw() {
    requestId = requestAnimationFrame(() => {
      this.draw()
    })
    //清除上一帧数据
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i]
      p1.draw()
      const d2 = Math.sqrt((p1.x - mouseX) ** 2 + (p1.y - mouseY) ** 2)
      if (d2 < this.maxDis) {
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(mouseX, mouseY)
        ctx.closePath()
        ctx.strokeStyle = `rgba(0,200,200,${1 - d2 / this.maxDis})`
        ctx.stroke()
      }
      for (let j = i + 1; j < this.points.length; j++) {
        const p2 = this.points[j]
        const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
        if (d > this.maxDis) continue
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.closePath()
        ctx.strokeStyle = `rgba(0,200,200,${1 - d / this.maxDis})`
        ctx.stroke()
      }
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
