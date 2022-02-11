<template>
   <div class="tool-item" :class="{'tool-item-active':value===activeIndex}" @click="activeChange">
        {{label}}
      </div>
</template>

<script setup lang='ts'>
let active: boolean = false
const props = defineProps<{
    label:string,
    value:number,
    activeIndex:number
  }>()
const emit = defineEmits(['toolChecked'])
const activeChange = () => {
  active = props.value !== props.activeIndex
  emit('toolChecked', active, props.value)
}
</script>

<style scoped>
.tool-item{
  display: inline-block;
  border: 1px solid rgb(72, 155, 153);
  margin: 5px;
  padding: 6px 10px;
  color: rgb(189,189,189);
  cursor:pointer;
}
.tool-item-active{
  background-color: rgb(0, 132, 203);
  color: #fff;
}
</style>
