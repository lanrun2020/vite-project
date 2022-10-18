<template>
  <div class="header">
    <el-icon @click="iconClick">
      <Expand />
    </el-icon>
    <div class="header_right">
      <el-switch
        v-model="theme"
        class="header_right_switch"
        style="margin-right: 12px"
        inline-prompt
        :active-icon="Sunny"
        :inactive-icon="Moon"
      />
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
  Moon,
  Sunny,
  SwitchButton
} from "@element-plus/icons-vue";
import router from "@/router";
import { ref } from "vue";
const emit = defineEmits(['collapseChange'])
const theme = ref(true)
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
  .header_right{
    display: flex;
    align-items: center;
    .header_right_switch{
      --el-switch-on-color: rgb(206, 206, 206);
      --el-switch-off-color: rgb(126, 126, 126);
    }
  }
}

.el-icon {
  cursor: pointer;
}
</style>