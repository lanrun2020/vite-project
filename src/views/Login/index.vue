<template>
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
</template>

<script setup lang='ts'>
import { fetchLogin } from "../../apis/an-system";
import { reactive, ref } from "vue";
const paramsForm = ref(null)
const params = reactive({
  username: "",
  password: "",
});


const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}
const validateUserName = (rule: any, value: any, callback: any) => {
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

const login = (form:any) => {
  form.validate(async (valid:any)=>{
    if(valid){
      const res = await fetchLogin(params)
      console.log(res);
      
    }
  })
}

</script>

<style lang="scss">
  .login-box{
    border: 1px solid rgb(58, 133, 146);
    border-radius: 5px;
    padding: 20px;
    width:500px;
    position: absolute;
    top:50%;
    right: 50%;
    transform: translateX(50%);
  }
</style>