<template>
 <div class="container">
  <TabCard title="title" >
    <template #content>
      <div>slot content</div>
    </template>
  </TabCard>
  <xbutton>click me</xbutton>
 </div>
</template>

<script setup lang='ts'>
import TabCard from './components/tabCard.vue';
import xbutton from '../../components/xbutton.vue'
</script>

<style scoped lang="scss">
.container{
  width: 100%;
  height: 100%;
}
</style>
