<template>
  <div class="header">
    <el-icon @click="iconClick">
      <Expand />
    </el-icon>
    <div>
      <el-icon @click="iconClick" style="padding-right: 10px;">
        <UserFilled />
      </el-icon>
      <el-tooltip class="box-item" effect="dark" content="退出登录" placement="bottom">
        <el-icon @click="loginOut">
          <SwitchButton />
        </el-icon>
      </el-tooltip>

    </div>
  </div>
</template>
<script setup lang="ts">
import {
  Expand,
  UserFilled,
  SwitchButton
} from "@element-plus/icons-vue";
import router from "@/router";
const emit = defineEmits(['collapseChange'])
const iconClick = () => {
  emit('collapseChange')
}
const loginOut = () => {
  router.push('/login')
}
</script>
<style lang="scss">
.header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-icon {
  cursor: pointer;
}
</style>