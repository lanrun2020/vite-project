<template>
  <div class="graph-container">
    <el-tabs v-model="activeName" tab-position="left" class="demo-tabs">
      <el-tab-pane label="visNetwork" name="visNetwork">
        <div class="tab-content-box">
          <visNetwork></visNetwork>
        </div>
      </el-tab-pane>
      <el-tab-pane label="dagre" name="dagre">
        <div class="tab-content-box">
          <dagre></dagre>
        </div>
      </el-tab-pane>
      <el-tab-pane label="example3">8w</el-tab-pane>
      <el-tab-pane label="example4">4</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang='ts'>
import visNetwork from './components/visNetwork.vue';
import dagre from './components/dagre.vue'
import { ref, watch } from 'vue'
const activeName = ref('dagre')
watch(activeName, (val) => {
  console.log(val);
})
</script>

<style scoped lang="scss">
.graph-container {
  background-color: #1E0731;

  .el-tabs__item {
    color: #fff;

    &.is-active {
      color: #409eff
    }
  }

  .el-tab-pane {
    width: 100%;
    height: calc(100vh - 60px);
  }
}

.tab-content-box {
  width: 100%;
  height: 100%;
}
</style>
