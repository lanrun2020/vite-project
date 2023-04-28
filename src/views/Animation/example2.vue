<template>
 <div class="container">
  <div class="wrapper">
    <div v-for="(item,index) in lineOptions" :key="index" class="line" :style="{'background':item.lineColor}">
      <span class="far-top" :style="{'background':item.farColor}"></span>
      <span class="top" :style="{'background':item.pointColor}"></span>
      <span class="mid-top" :style="{'background':item.midColor}"></span>
      <span class="mid-bottom" :style="{'background':item.midColor}"></span>
      <span class="bottom" :style="{'background':item.pointColor}"></span>
      <span class="far-bottom" :style="{'background':item.farColor}"></span>
    </div>
  </div>
 </div>
</template>

<script setup lang='ts'>
const colorList = [
  '#2410CB',
  '#852DF4',
  '#F42DF1',
  '#F91396',
  '#D4141E',
  '#FC7E48',
  '#EDEB29',
  '#ACED29',
  '#4EF02B',
  '#38E790',
  '#25EACC',
]
const length = colorList.length
const lineOptions = new Array(10).fill('').map((item,index)=>{
  return {
    lineColor:colorList[index%length],
    pointColor:colorList[(index + 2)%length],
    midColor:colorList[(index + 4)%length],
    farColor:colorList[(index + 1)%length]
  }
})
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  background-color: #1E0731;
  display: flex;
  justify-content: center;
  align-items: center;
}
.wrapper{
  width: 1000px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.line{
  width: 1px;
  height: 0%;
  margin-left: 30px;
  animation: line-move 3s infinite;
  position: relative;
  @for $i from 1 through 10 {
    &:nth-child(#{$i}n) {
      animation-delay: #{$i * 60}ms;
      .mid-top{
        animation-delay: #{$i * 60}ms;
      }
      .mid-bottom{
        animation-delay: #{$i * 60}ms;
      }
    }
  }
  .top{
    position: absolute;
    left: -4px;
    top: 0px;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    z-index: 3;
  }
  .bottom{
    content: '';
    position: absolute;
    bottom: -8px;
    left: -4px;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    z-index: 3;
  }
  .far-top{
    width: 4px;
    height: 4px;
    top: -20%;
    left: -2px;
    position: absolute;
    z-index: 2;
  }
  .far-bottom{
    width: 4px;
    height: 4px;
    bottom: calc(-20% - 4px);
    left: -2px;
    position: absolute;
    z-index: 2;
  }
  .mid-top{
    width: 4px;
    height: 4px;
    top: 0px;
    left: -2px;
    position: absolute;
    z-index: 2;
    animation: mid-top-move 3s cubic-bezier(0.250, 0, 0.705, 1) infinite;
  }
  .mid-bottom{
    width: 4px;
    height: 4px;
    bottom: -4px;
    left: -2px;
    position: absolute;
    z-index: 2;
    animation: mid-bottom-move 3s cubic-bezier(0.250, 0, 0.705, 1) infinite;
  }
}
@keyframes line-move {
  0% {
    height: 0;
    left: 0px;
    transform: rotate(-65deg)
  }

  10% {
    height: 80%;
    left: 15px;
  }

  45% {
    height: 70%;
    left: 25px;
  }

  65% {
    height: 0;
    left: 25px;
    transform: rotate(0deg);
  }

  100% {
    height: 0;
    left: 10px;
    transform: rotate(0deg);
  }
}
@keyframes mid-top-move{
  0%{}
  10%{}
  45%{
    top:80px;
  }
  70%{
    top:50px;
  }
  85%{
    top:0px;
  }
  100%{
    top:0px;
  }
}
@keyframes mid-bottom-move{
  0%{}
  10%{}
  45%{
    bottom:80px;
  }
  70%{
    bottom:50px;
  }
  85%{
    bottom:-4px;
  }
  100%{
    bottom:-4px;
  }
}
</style>
