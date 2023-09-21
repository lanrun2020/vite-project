<template>
  <div class="tool-bar">
    <div class="tool-list" v-for="(list, index) in toolList" :key="index">
      <div class="tool-item" v-for="(item, index2) in list" :key="index2" @click="toolActive(item)" :title="item.title">
        <div class="iconfont" :class="[item.className, { 'icon-active': item.className === activeName }]"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, inject } from "vue";
import { mapToolEvent } from "./mapToolEvent";
const mapEvent = inject('mapEvent') as mapToolEvent
const activeName = ref('')
const toolList = [
  [
    {
      title: '选择',
      className: 'icon-yidong',
      type: 'move'
    },
    {
      title: '文本',
      className: 'icon-T',
      type: 'text'
    },
    {
      title: '删除',
      className: 'icon-shanchu',
      type: 'delete'
    },
    {
      title: '撤销上一步操作',
      className: 'icon-chexiao',
      type: 'last'
    },
    {
      title: '恢复上一步操作',
      className: 'icon-zhongzuo',
      type: 'next'
    }
  ],
  [
    {
      title: '测距离',
      className: 'icon-ceju',
      type: 'measureDis'
    },
    {
      title: '测角度',
      className: 'icon-cejiao',
      type: 'measureAngle'
    },
    {
      title: '测面积',
      className: 'icon-cemianji-moren',
      type: 'measureArea'
    }
  ],
  [
    {
      title: '画线',
      className: 'icon-line',
      type: 'drawLine'
    },
    {
      title: '画曲线',
      className: 'icon-quxian',
      type: 'drawCurve'
    },
    {
      title: '画圆',
      className: 'icon-tuoyuan1',
      type: 'drawCircle'
    },
    {
      title: '画椭圆',
      className: 'icon-tuoyuan',
      type: 'drawEllipse'
    },
    {
      title: '画扇形',
      className: 'icon-shanxing',
      type: 'drawFan'
    },
    {
      title: '画多边形',
      className: 'icon-tool_polygon',
      type: 'drawPolygon'
    }
  ],
]
const onceTool = ['delete','last','next']
const toolActive = (tool) => {
  if (activeName.value === tool.className) { //与上一次点击相同，关闭上次工具
    activeName.value = ''
    //todo这里还需要处理
    switch (tool.type) {
      case 'move':
        mapEvent.handleEelect(false)
        break;
      default:
        break;
    }
    return
  } else { //与上次不同，进行切换工具
    //如果是删除、返回上一步、下一步等按钮, 不需要切换, 直接调用即可,其他的工具则需要切换状态
    if (!onceTool.includes(tool.type)) {
      activeName.value = tool.className
    }
  }
  switch (tool.type) {
    case 'move':
      mapEvent.handleEelect()
      break;
    case 'delete':
      activeName.value === 'icon-yidong' && mapEvent.handleDelete()
      break;
    case 'last':
      mapEvent.handleLast()
      break;
    case 'next':
      mapEvent.handleNext()
      break;
    default:
      break;
  }
}

</script>

<style scoped lang="scss">
.tool-bar {
  position: absolute;
  top: 6px;
  right: 10px;
  z-index: 999;
  display: flex;
  flex-wrap: nowrap;

  .tool-list {
    width: 30px;
    height: auto;
    padding: 2px;

    .tool-item {
      background-color: #eaeaea;
      width: 30px;
      height: 30px;
      text-align: center;
      line-height: 30px;
      padding: 2px;
      cursor: pointer; // grab 抓手

      .iconfont {
        background-color: #fff;
      }

      .icon-active {
        background-color: #b2ffb2;
      }
    }
  }
}</style>
