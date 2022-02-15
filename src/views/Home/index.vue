<template>
  <h1>num1:{{num1}}</h1>
  <h1>num2:{{num2}}</h1>
  <h1>sum:{{sum}}</h1>
  <el-button @click="num1++">num1++</el-button>
  <el-button @click="num2++">num2++</el-button>
  <my-marker></my-marker>
  <h1>count:{{count}}</h1>
  <h1>nested.count:{{nested.count.value}}</h1>
  <el-button @click="count++">count++</el-button>
  <el-button @click="$router.push('/login')">登录页</el-button>
  <el-button @click="test">测试</el-button>
  
</template>

<script setup lang="ts">
import { fetchTest } from "@/apis/an-system";
import { reactive, ref } from "@vue/reactivity";
import { computed, provide, watch } from "@vue/runtime-core";
import myMarker from './myMarker.vue'
// ref会返回一个可变的响应式对象,只包含一个名为 value 的 property
  const num1 = ref(0)
  const num2 = ref(0)
  const count = ref(0)

  const nested = {
    count
  }
  const nested2 =reactive({
    count
  })
  // console.log(nested.count.value);
  // console.log(nested2.count);
  
// reactive会返回一个响应式的对象状态
  const state = reactive({count:0})

  const sum = computed(()=>{
    return num1.value + num2.value
  })
  watch(sum,()=>{
    console.log('sum change')
  })
  provide('num1',num1)
  provide('num2',num2)
  provide('sum',sum)

  const test =async () => {
    const res = await fetchTest()
    console.log(res);
  }
</script>