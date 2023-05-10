<template>
 <div class="tabCard">
  <div class="card_title">{{ title }}</div>
  <slot name="header">defalut header</slot>
  <slot name="content">defalut content</slot>
 </div>
</template>

<script setup lang='ts'>
defineProps<{ title:string }>()
</script>

<style scoped lang="scss">

</style>
