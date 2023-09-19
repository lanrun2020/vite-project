<template>
  <h1>组件mymarker</h1>
  <h1>num1:{{ num1 }}</h1>
  <h1>num2:{{ num2 }}</h1>
  <h1>sum:{{ sum }}</h1>
  <div>{{props.data}}</div>
  <div>{{ myData }}</div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, watch, reactive } from "vue";

const num1 = inject('num1')
const num2 = inject('num2')
const sum = inject('sum')
const props = defineProps(['data'])
const myData = ref()
onMounted(() => {
  myData.value = props.data
})
watch(() => props.data, (val) => {
  myData.value = val
})
</script>