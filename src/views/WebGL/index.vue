<template>
  <div class="webgl-container">
    <el-tabs tab-position="left" class="demo-tabs">
      <el-tab-pane label="example1">
        <example1></example1>
      </el-tab-pane>
      <el-tab-pane label="example2">
        <example2></example2>
      </el-tab-pane>
      <el-tab-pane label="example3">
        <example3></example3>
      </el-tab-pane>
      <el-tab-pane label="example4">
       
      </el-tab-pane>
    </el-tabs>
    <div style="width: 300px;height: 60px;display: flex;justify-content: center;align-items: center;">
          <img style="height: 50px;" src="../../assets/ee.png" />
          <div style="height: 48px;display: flex;flex-direction: column; justify-content: center;">
            <div>25</div>
            <div>温度</div>
          </div>
        </div>
  </div>
</template>

<script setup lang='ts'>
import example1 from './components/example1.vue';
import example2 from './components/example2.vue';
import example3 from './components/example3.vue';

</script>

<style scoped lang="scss">
.webgl-container {
  padding: 50px;
}
</style>
