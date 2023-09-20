<template>
 <div class="tool-bar">
   <div class="tool-list">
    <div class="tool-item iconfont icon-T"></div>
    <div class="tool-item"></div>
    <div class="tool-item iconfont icon-shanchu"></div>
    <div class="tool-item iconfont icon-chexiao"></div>
   </div>
   <div class="tool-list">
    <div class="tool-item iconfont icon-line"></div>
    <div class="tool-item iconfont icon-quxian"></div>
    <div class="tool-item iconfont icon-ceju"></div>
    <div class="tool-item iconfont icon-cejiao"></div>
    <div class="tool-item iconfont icon-cemianji-moren"></div>
    <div class="tool-item iconfont icon-cha"></div>
  </div>
   <div class="tool-list">
    <div class="tool-item iconfont icon-tuoyuan1"></div>
    <div class="tool-item iconfont icon-tuoyuan"></div>
    <div class="tool-item iconfont icon-shanxing"></div>
    <div class="tool-item iconfont icon-tool_polygon"></div>
    <div class="tool-item"></div>
    <div class="tool-item"></div>
   </div>

 </div>
</template>

<script setup lang='ts'>

</script>

<style scoped lang="scss">
.tool-bar {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 999;
  display: flex;
  flex-wrap: nowrap;
  .tool-list {
    width: 30px;
    height: auto;
    margin: 2px;
    .tool-item {
      width: 30px;
      height: 30px;
      background-color: aquamarine;
      margin: 2px;
      cursor: pointer;
    }
  }
}
</style>
