<template>
 <div class="container">
  <TabCard title="title" >
    <template #content>
      <div>slot content</div>
    </template>
  </TabCard>
 </div>
</template>

<script setup lang='ts'>
import TabCard from './components/tabCard.vue';

</script>

<style scoped lang="scss">
.container{
  width: 100%;
  height: 100%;
}
</style>
