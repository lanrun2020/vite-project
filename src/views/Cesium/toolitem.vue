<template>
  <div class="tool-item" :class="{ 'tool-item-active': value === activeIndex }" @click="activeChange">
    {{ label }}
  </div>
</template>

<script setup lang='ts'>
import { ref, toRefs } from 'vue'
let active = false
const props = defineProps<{
  label: string,
  value: number,
  activeIndex: number
}>()
const { label, activeIndex, value } = toRefs(props)
const emit = defineEmits(['toolChecked'])
const activeChange = () => {
  active = props.value !== props.activeIndex
  emit('toolChecked', active, props.value)
}
</script>

<style lang="scss" scoped>
.tool-item {
  display: inline-block;
  border-bottom: 1px solid rgba(72, 155, 154, 0.524);
  // margin: 5px;
  padding: 12px 10px;
  color: rgb(189, 189, 189);
  cursor: pointer;
}

.tool-item-active {
  background-color: rgb(3, 96, 146);
  color: #fff;
}
</style>
