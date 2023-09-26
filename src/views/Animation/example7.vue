<template>
  <div id="container" @scroll="domScroll" class="list-box">
    <div class="scroll-box"></div>
    <div id="show-box">
      <div v-for="item, index in showList" :key="index" class="show-item">{{ item }}</div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { nextTick, onMounted, ref } from 'vue';

const list = ref([])
const showList = ref([])
const dom = ref()
const lenMax = 3000
const len = 16
onMounted(() => {
  list.value = new Array(lenMax).fill('').map((item, index) => {
    return `第${index + 1}条数据`
  })
  showList.value = list.value.slice(0, len)
  dom.value = document.getElementById('container')
})
const domScroll = (e) => {
  let x = ((lenMax - len) * e.target.scrollTop / (dom.value.scrollHeight - dom.value.clientHeight))
  nextTick(() => {
    showList.value = list.value.slice(x, x + len)
  })
  const box = document.getElementById('show-box')
  box.style.top = e.target.scrollTop + 'px'
}

</script>

<style scoped lang="scss">
.list-box {
  width: 600px;
  height: 588px;
  border: 1px solid #003b45;
  overflow-y: scroll;
  position: relative;

  .scroll-box {
    width: 100%;
    height: 84000px;
  }

  #show-box {
    top: 0px;
    position: absolute;
    .show-item {
      font-size: 28px;
    }
  }
}
</style>
