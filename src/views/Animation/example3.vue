<template>
 <div class="container">
  <TabCard title="title" >
    <template #content>
      <div>slot content</div>
    </template>
  </TabCard>
  <xbutton>click me</xbutton>
  <button class="my-button">Button</button>
  <div style="display: flex;">
      <div class="div-box1"></div>
      <div class="div-box1 div-box2"></div>
      <div class="div-box1 div-box3"></div>
      <div class="div-box1 div-box4"></div>
  </div>
  <div class="img-container">
    <div class="img1">img1</div>
    <div class="img2">img2</div>
    <div class="img3">img3</div>
  </div>
  <div class="mask-box"></div>
 </div>
</template>

<script setup lang='ts'>
import TabCard from './components/tabCard.vue';
import xbutton from '../../components/xbutton.vue'
</script>

<style scoped lang="scss">
.container{
  width: 100%;
  height: 100%;
}
.div-box1{
  margin: 30px;
  width: 500px;
  height: 500px;
  background: linear-gradient(#000,#fff);
}
.div-box2{
  background: radial-gradient(#9c27b0  0%,#9c27b0 47%,#ffeb3b 47.3%,#ffeb3b 100%,);
}
.div-box3{
  background: repeating-conic-gradient(#fff, #000, #fff 0.4deg);
}
.div-box4{
  background: linear-gradient(45deg, #5fddcc, #ff004d);
  animation: hueRotate 10s infinite alternate;
}
@keyframes hueRotate {
    0% {
        filter: hue-rotate(0);
    }
    100% {
        filter: hue-rotate(360deg);
    }
}
.my-button{
  position: relative;
  border-radius: 30px;
  margin: 30px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #ccc;
  transition: all 0.2s;
  &:hover {
    color: #fff;
    background: #666;
  }
  &::before{
    content: '';
    position: absolute;
    border-radius: 30px;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #fff);
  }
}
.img-container{
  width: 500px;
  height: 500px;
  overflow-y: scroll;
  overflow-x: hidden;
  div{
    width: 500px;
    height: 500px;
    line-height: 500px;
    text-align: center;
  }
  .img1{
    background-image: url('../../assets/floorMarble.jpg');
    background-size: cover;
    background-attachment: fixed;
  }
  .img2{
    background-image: url('../../assets/floorMarble2.jpeg');
    background-size: cover;
    background-attachment: fixed;
  }
  .img3{
    background-image: url('../../assets/floorMarble3.jpeg');
    background-size: cover;
    background-attachment: fixed;
  }
}
.mask-box{
  width: 500px;
  height: 500px;
  position: relative;
  background: url('../../assets/user.png');
  background-size: cover;
  background-position: center;
  &::before{
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('../../assets/guoqi.png');
    background-size: cover;
    -webkit-mask: linear-gradient(110deg, #000 5%, transparent 70%);
    mask: linear-gradient(110deg, #000 5%, transparent 70%);
    z-index: 1;
    mask-size: 200% 100%;
    -webkit-mask-size: 200% 100%;
    animation: maskChange 5s infinite alternate linear;
  }
}
@keyframes maskChange {
    0% {
        mask-position: 100% 0;
        -webkit-mask-position: 100% 0;
    }
    100% {
        mask-position: 0 0;
        -webkit-mask-position: 0 0;
    }
}
</style>
