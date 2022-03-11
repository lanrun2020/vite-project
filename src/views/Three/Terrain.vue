<template>
  <el-button @click="submit">提交</el-button>
  <el-row v-for="(item, index) in list" :key="index">
    <el-form>
      <el-checkbox v-model="item.checked"></el-checkbox>
      <el-form-item label="name:">{{ item.name }}</el-form-item>
      <el-form-item label="age:">{{ item.age }}</el-form-item>
    </el-form>
  </el-row>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
const checked = ref(true);
const list: Array<{name:string,checked:boolean,age:number}> = reactive([]);
for (let i = 0; i < 100; i++) {
  list.push({
    checked: false,
    name: "jack" + String(i),
    age: i,
  });
}
const submit = () => {
  const checked:Array<{name:string,checked:boolean,age:number}> =reactive([])
  list.forEach((item)=>{
    if(item.checked){
      checked.push(item)
    }
  })
  console.log(checked);
}
</script>