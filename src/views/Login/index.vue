<template>
  <div class="login-page">
    <div class="color"></div>
    <div class="color"></div>
    <div class="color"></div>
    <div class="login-box">
      <el-form :model="params" :rules="rules" ref="paramsForm" label-width="80px">
        <el-form-item prop="username" label="用户名">
          <el-input placeholder="用户名" v-model="params.username"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input placeholder="密码" type="password" v-model="params.password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login(paramsForm)">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { fetchLogin } from "@/apis/an-system";
import { reactive, ref } from "vue";
import router from "@/router/index";
import { ElMessage } from "element-plus";
import store from "@/store";
const paramsForm = ref(null)
const params = reactive({
  username: "",
  password: "",
});

// eslint-disable-next-line @typescript-eslint/ban-types
const validatePass = (rule: object, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}
// eslint-disable-next-line @typescript-eslint/ban-types
const validateUserName = (rule: object, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入用户名'))
  } else {
    callback()
  }
}

const rules = reactive({
  password: [{ required: true, validator: validatePass, trigger: 'blur' }],
  username: [{ required: true, validator: validateUserName, trigger: 'blur' }],
})

const login = (formEl: any) => {
  formEl.validate(async (valid: boolean) => {
    if (valid) {
      const res: any = await fetchLogin(params)
      store.commit('SET_TOKEN', res.token)
      localStorage.setItem('token', res.token)
      ElMessage.success('登录成功')
      router.push('/home')
    }
  })
}

</script>

<style lang="scss">
.color {
  position: absolute;
  filter: blur(250px);
}

.color:nth-child(1) {
  top: 0px;
  width: 80vw;
  height: 600px;
  background: #ffc4e2;
}

.color:nth-child(2) {
  bottom: 0px;
  right: 100px;
  width: 60vw;
  height: 500px;
  background: #fffd87;
}

.color:nth-child(3) {
  bottom: 200px;
  right: 200px;
  width: 40vw;
  height: 300px;
  background: #00d2ff;
}

.login-page {
  width: 100vw;
  height: 100vh;
  // background: url('@/assets/login-bgimg.jpg') no-repeat fixed center;
  background-size: 100%;
}

.login-box {
  background-color: #fff0;
  border: 1px solid rgb(58, 133, 146, 0.5);
  border-radius: 5px;
  padding: 20px;
  width: 400px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%);
}

.el-input__wrapper {
  background-color: #fff0;
  border: 1px solid #75757556
}
</style>