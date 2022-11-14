<template>
  <div class="tool-item" :class="{ 'tool-item-active': active }" @click="activeChange">
    {{ label }}
  </div>
</template>

<script setup lang='ts'>
import { ref, toRefs } from 'vue'
const props = defineProps<{
  label: string,
  value: number,
  active: boolean,
}>()
const emit = defineEmits(['toolChecked'])
const activeChange = () => {
  emit('toolChecked', props.active, props.value)
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
