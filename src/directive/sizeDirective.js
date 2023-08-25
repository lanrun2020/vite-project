const map = new WeakMap()  //相对map 不会造成内存泄漏
const ob = new ResizeObserver((entries) => {
  for (const entry of entries) {
    //处理对应元素的回调
    const handler = map.get(entry.target)
    if (handler) {
      const box = entry.borderBoxSize[0]
      handler({
        width: box.inlineSize,
        height: box.blockSize
      })
    }
  }
})

export default {
  mounted (el, binding) {
    //监视尺寸变化
    ob.observe(el)
    map.set(el, binding.value)
  },
  unmounted (el) {
    //取消监听
    ob.unobserve(el)
  }
}