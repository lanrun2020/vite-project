<template>
  <!-- v-size-ob 指令，可以在 dom 元素改变大小时获取 dom 元素的尺寸，并且返回尺寸 -->
  <div v-size-ob="handleChange" class="container">
    <div class="scroll">
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
const s = reactive({ // 声明一个响应式数据存储一下
  w: 0,
  h: 0,
});
function handleChange(size) { // 通过 v-size-ob 指令的返回值获取 container 的大小
  s.w = size.width;
  s.h = size.height;
}
</script>

<style lang="scss" scoped>
/* 为每一个盒子加上边框方便查看效果 */
.container {
  width: 100%;
  height: 100%;
}
.scroll {
  width: calc(v-bind("s.h") * 1px);
  height: calc(v-bind("s.w") * 1px);
  position: relative;
  overflow: auto;
  transform-origin: 0 0;
  transform: translateY(calc(v-bind("s.h") * 1px)) rotate(-90deg);
  &::-webkit-scrollbar {
    width: 0;
  }
}
.content {
  height: calc(v-bind("s.h") * 1px);
  position: absolute;
  left: 100%;
  transform-origin: 0 0;
  transform: rotate(90deg);
  display: flex;
}
</style>