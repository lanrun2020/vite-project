<template>
  <div class="login-page">
    <div class="login-box">
      <el-form :model="params" :rules="rules" ref="paramsForm" label-width="80px">
        <el-form-item prop="username" label="用户名">
          <el-input placeholder="用户名" v-model="params.username"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input placeholder="密码" type="password" v-model="params.password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="login(paramsForm)">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { fetchLogin } from "@/apis/an-system";
import { reactive, ref } from "vue";
import router from "@/router/index";
const paramsForm = ref(null)
const params = reactive({
  username: "",
  password: "",
});


const validatePass = (rule: object, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}
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

const login = (formEl:any) => {
  formEl.validate(async (valid:boolean)=>{
    if(valid){
      const res = await fetchLogin(params)
      router.push('/home')
    }
  })
}

</script>

<style lang="scss">
  .login-page{
    width: 100vw;
    height: 100vh;
    background:url('@/assets/login-bgimg.jpg') no-repeat fixed center;
    background-size: 100%;
  }
  .login-box{
    background-color: #def5ff;
    border: 1px solid rgb(58, 133, 146);
    border-radius: 5px;
    padding: 20px;
    width:400px;
    position: absolute;
    top:50%;
    left: 50%;
    transform: translateY(-50%);
  }
</style>