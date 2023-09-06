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
    <div ref="mapBar" class="map-bar" :class="{ 'map-move': mapFlag }">
      <div v-for="(item, index) in mapList" :key="index" @click="changeMap(item)" class="map-item"
        :style="{ backgroundImage: `url(${item.url})`, opacity: (index + 1) / mapList.length, right: `${(mapList.length - 1 - index) * 10}px` }">
        <div class="map-label" :class="{ 'map-active': item.active }">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import png1 from '../../assets/guoqi.png'
import png2 from '../../assets/user.png'
import png3 from '../../assets/floorMarble.jpg'
import png4 from '../../assets/floorMarble3.jpeg'
import ScrollBar from '../../components/scrollBar.vue'
let mapFlag = ref(true)
const mapBar = ref()
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
  mapList.value = mapList.value.filter((map) => map.name !== item.name)
  mapList.value.forEach((map) => {
    map.active = false
  })
  mapList.value.sort((a, b) => a.order - b.order)
  mapList.value.push(item)
  item.active = true
  mapFlag.value = false
}
const handleMousemove = () => {
  mapFlag.value = true
}
const whiteClick = (event) => {
  var src = "/music/"+event.target.innerText.toLowerCase()+'.wav.mp3';
  //创建媒体对象
  var audio = new Audio(src);
  //调用play方法
	audio.play();
}
onMounted(() => {
  mapBar.value.addEventListener('mousemove', handleMousemove, false)
})
onBeforeUnmount(() => {
  mapBar.value.removeEventListener('mousemove', handleMousemove, false)
})
</script>

<style scoped lang="scss">
$dataLength : 4; //mapList长度

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

.map-bar {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  flex-wrap: nowrap;
  background: rgba($color: #666666, $alpha: 0.0);
  width: 180px;
  height: 100px;
  transition: all 0.4s;

  .map-item {
    position: absolute;
    bottom: 0px;
    width: 120px;
    height: 80px;
    background-size: cover;
    cursor: pointer;
    margin: 10px;
    border: 2px solid #ffffff;
    transition: all 0.4s;

    &:hover {
      border: 2px solid #333333;
    }

    .map-label {
      position: absolute;
      bottom: 0px;
      right: 0px;
      padding: 6px 10px;
      background: rgba(4, 178, 236, 0.1)
    }

    .map-active {
      background: rgb(4, 178, 236)
    }
  }

  &.map-move:hover {
    width: $dataLength*140px;
    background: rgba($color: #666666, $alpha: 0.3);

    @for $i from 1 through $dataLength {
      .map-item:nth-child(#{$i}) {
        right: #{($dataLength - $i) * 140}px !important;
        opacity: 1 !important;
      }
    }
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
