<template>
  <div class="webgl-container">
    <el-tabs tab-position="left" class="demo-tabs">
      <el-tab-pane label="example1">
        <example4></example4>
      </el-tab-pane>
      <el-tab-pane label="example2">
        <example2></example2>
      </el-tab-pane>
      <el-tab-pane label="example3">
        <example3></example3>
      </el-tab-pane>
      <el-tab-pane label="example4">
        <example1></example1>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang='ts'>
import example1 from './components/example1.vue';
import example2 from './components/example2.vue';
import example3 from './components/example3.vue';
import example4 from './components/example4.vue';

</script>

<style scoped lang="scss">
.webgl-container {
  padding: 50px;
}
</style>
