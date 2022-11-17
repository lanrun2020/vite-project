<template>
  <div class="webgl-container">
    <el-tabs tab-position="left" class="demo-tabs">
      <el-tab-pane label="example1">
        <example1></example1>
      </el-tab-pane>
      <el-tab-pane label="example2">2</el-tab-pane>
      <el-tab-pane label="example3">3</el-tab-pane>
      <el-tab-pane label="example4">4</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang='ts'>
import example1 from './components/example1.vue';
</script>

<style scoped lang="scss">
.webgl-container {
  padding: 50px;
}
</style>
