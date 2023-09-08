<template>
  <div style="width: 100%;height: 100%;">
    <div class="scoll-bar">
      <ScrollBar>
        <div v-for="(item, index) in mapList" :key="index" class="item-bar"
          :style="{ backgroundImage: `url(${item.url})` }">
        </div>
      </ScrollBar>
    </div>
    <div class="test">
      <div class="img"></div>
    </div>
    <div class="piano-plane">
      <div class="white-plane" @click="whiteClick">
        <div class="piano-btn">C3</div>
        <div class="piano-btn">D3</div>
        <div class="piano-btn">F3</div>
        <div class="piano-btn">G3</div>
        <div class="piano-btn">A3</div>
        <div class="piano-btn">B3</div>
        <div class="piano-btn">C4</div>
        <div class="piano-btn">D4</div>
        <div class="piano-btn">E4</div>
        <div class="piano-btn">F4</div>
        <div class="piano-btn">G4</div>
        <div class="piano-btn">A4</div>
        <div class="piano-btn">B4</div>
        <div class="piano-btn">C5</div>
        <div class="piano-btn">D5</div>
        <div class="piano-btn">E5</div>
        <div class="piano-btn">F5</div>
        <div class="piano-btn">G5</div>
        <div class="piano-btn">A5</div>
      </div>
      <div class="black-plane" @click="whiteClick">
        <div class="piano-btn">CD4</div>
        <div class="piano-btn">DE4</div>
        <div class="piano-btn blank-btn"></div>
        <div class="piano-btn">FG4</div>
        <div class="piano-btn">GA4</div>
        <div class="piano-btn">AB4</div>
        <div class="piano-btn blank-btn"></div>
        <div class="piano-btn">CD5</div>
        <div class="piano-btn">DE5</div>
        <div class="piano-btn blank-btn"></div>
        <div class="piano-btn">FG5</div>
        <div class="piano-btn">GA5</div>
        <div class="piano-btn">AB5</div>
        <div class="piano-btn blank-btn"></div>
        <div class="piano-btn">CD6</div>
        <div class="piano-btn">DE6</div>
        <div class="piano-btn blank-btn"></div>
        <div class="piano-btn">FG6</div>
      </div>
    </div>
    <MapBox></MapBox>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import png1 from '../../assets/guoqi.png'
import png2 from '../../assets/user.png'
import png3 from '../../assets/floorMarble.jpg'
import png4 from '../../assets/floorMarble3.jpeg'
import ScrollBar from '../../components/scrollBar.vue'
import MapBox from '../../components/mapBox.vue'
const mapList = ref([
  {
    order: 1,
    name: '图1',
    url: png1,
    active: false,
  },
  {
    order: 2,
    name: '图2',
    url: png2,
    active: false,
  },
  {
    order: 3,
    name: '图3',
    url: png3,
    active: false,
  },
  {
    order: 4,
    name: '图4',
    url: png4,
    active: true,
  }
])
const changeMap = (item) => {
  console.log(item);
  
}
const whiteClick = (event) => {
  var src = "/music/"+event.target.innerText.toLowerCase()+'.wav.mp3';
  //创建媒体对象
  var audio = new Audio(src);
  //调用play方法
	audio.play();
}
</script>

<style scoped lang="scss">

.scoll-bar {
  width: 800px;
  height: 300px;

  // border: 1px solid #f00;
  .item-bar {
    width: 400px;
    height: 100%;
    // border: 1px solid #0fc;
    background-image: url('../../assets/dalishi.jpg');
    background-size: cover;
  }
}

.test {
  width: 300px;
  height: 300px;
  border: 1px solid #0f0;
  box-shadow: inset 0 0 20px #333333;
  background-color: #ccc;

  .img {
    width: 80%;
    height: 80%;
    background-image: url('../../assets/dalishi.jpg');
    background-size: cover;
    box-shadow: inset 0 0 20px #00e5ff, inset -2px -2px 20px #00e5ff;
  }
}

.piano-plane {
  padding: 40px;
  display: flex;
  background-color: #333333;
  justify-content: center;
  position: relative;
  .white-plane {
    display: flex;
    .piano-btn {
      box-sizing: border-box;
      width: 60px;
      height: 260px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      border-radius:4px 4px 6px 6px;
      border: 1px solid #ccc;
      background-color: #fff;
      padding-bottom: 20px;
      user-select: none;
      transition: all 0.1s;
      box-shadow:
        0px 6px 0px 1px rgba(255, 255, 255, .4);

      &:active {
        padding-bottom: 19px;
        background-color: #72fffffe;
        box-shadow:
          0px 5px 0px 1px rgba(255, 255, 255, .5),
          inset 0px 4px 12px rgba(0, 0, 0, .4);
      }
    }
  }
  .black-plane {
    position: absolute;
    height: 0;
    top: 40px;
    left: calc(50%);
    transform: translateX(-50%);
    display: flex;
    color: #ccc;
    .piano-btn {
      margin: 0 4px;
      box-sizing: border-box;
      width: 52px;
      height: 200px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      border-radius:0px 0px 6px 6px;
      border: 1px solid rgb(0, 0, 0);
      background-color: #000;
      padding-bottom: 20px;
      user-select: none;
      transition: all 0.1s;
      box-shadow:
        0px 5px 0px 0px rgba(0, 0, 0, 1.0);
      &:active {
        padding-bottom: 19px;
        box-shadow:
          0px 4px 0px 0px rgba(40, 40, 40, 0.8),
      }
    }
    .blank-btn {
      background-color: transparent;
      pointer-events: none;
      border: none;
      box-shadow: none;
      height: 0;
    }
  }
}
</style>
