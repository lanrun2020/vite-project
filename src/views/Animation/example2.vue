<template>
 <div class="container">
  <div class="wrapper">
    <div v-for="(item,index) in lineOptions" :key="index" class="line" :style="{'background':item.lineColor}">
      <span class="top" :style="{'background':item.farColor}"></span>
      <span class="start" :style="{'background':item.pointColor}"></span>
      
      <span class="end" :style="{'background':item.pointColor}"></span>
      <span class="bottom" :style="{'background':item.farColor}"></span>
    </div>
  </div>
 </div>
</template>

<script setup lang='ts'>
const lineOptions = [{
  lineColor:'blue',
  pointColor:'red',
  midColor:'red',
  farColor:'green'
},{
  lineColor:'red',
  pointColor:'green',
  midColor:'green',
  farColor:'blue'
}]
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  background-color: #1E0731;
}
.wrapper{
  width: 500px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #925fbc;
  padding: 20px;
}
.line{
  width: 1px;
  height: 0%;
  margin-left: 30px;
  animation: line-move 3s infinite;
  position: relative;
  .start{
    position: absolute;
    left: -4px;
    top: 0px;
    width: 8px;
    height: 8px;
    border-radius: 8px;
  }
  .end{
    content: '';
    position: absolute;
    bottom: -8px;
    left: -4px;
    width: 8px;
    height: 8px;
    border-radius: 8px;
  }
  .top{
    width: 4px;
    height: 4px;
    top: -20%;
    left: -2px;
    position: absolute;
  }
  .bottom{
    width: 4px;
    height: 4px;
    bottom: calc(-20% - 4px);
    left: -2px;
    position: absolute;
  }
}
@keyframes line-move{
  0%{
    height: 0;
    transform: rotateZ(-80deg);
  }
  50%{
    height: 80%;
    transform: rotateZ(-30deg);
  }
  90%{
    height: 0%;
    transform: rotateZ(0deg);
  }
  100%{
    height: 0%;
    transform: rotateZ(0deg);
  }
}
</style>
