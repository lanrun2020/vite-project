<template>
 <div style="width: 100%;height: 100%;">
    <div ref="mapBar" class="map-bar" :class="{ 'map-move': mapFlag }">
        <div v-for="(item,index) in mapList" :key="index" @click="changeMap(item)" class="map-item" :style="{backgroundImage:`url(${item.url})`,opacity:(index+1)/mapList.length,right:`${(mapList.length-1-index)*10}px`}">
          <div class="map-label" :class="{'map-active':item.active}">{{ item.name }}</div>
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
  mapList.value.sort((a,b) => a.order - b.order)
  mapList.value.push(item)
  item.active = true
  mapFlag.value = false
}
const handleMousemove = () => {
  mapFlag.value = true
}
onMounted(() => {
  mapBar.value.addEventListener('mousemove', handleMousemove, false)
})
onBeforeUnmount(() => {
  mapBar.value.removeEventListener('mousemove', handleMousemove, false)
})
</script>

<style scoped lang="scss">
$dataLength : 4;//mapList长度
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
      border:2px solid #333333;
    }
    .map-label {
      position: absolute;
      bottom: 0px;
      right:0px;
      padding:6px 10px;
      background:rgba(4, 178, 236,0.1)
    }
    .map-active {
      background:rgb(4, 178, 236)
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
</style>
