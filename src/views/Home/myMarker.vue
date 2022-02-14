<template>
  <h1>组件mymarker</h1>
  <h1>num1:{{num1}}</h1>
  <h1>num2:{{num2}}</h1>
  <h1>sum:{{sum}}</h1>
</template>

<script setup lang="ts">
import { inject } from "@vue/runtime-core";

 const num1 =  inject('num1')
 const num2 = inject('num2')
 const sum = inject('sum')
</script>