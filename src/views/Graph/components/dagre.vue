<template>
  <div class="container-box">
    <div style="width: 100%;height: 100%;">
      <svg class="dagre" width="100%" height="100%">
        <g class="container"></g>
      </svg>
      <div ref="tooltip" class="tooltip">
        <div>节点ID：{{ currentNode.id }}</div>
        <div>节点名称：{{ currentNode.nodeName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import * as d3 from 'd3';
import dagreD3 from 'dagre-d3';
import { ref, onMounted } from "vue";
onMounted(() => {
  setTimeout(() => {
    draw()
  },200)
})
const currentNode = ref({
  id: '',
  nodeName: '',
})
const nodes = ref([
  {
    id: 'node0',
    nodeName: 'kali_0_99',
  },
  {
    id: 'node1',
    nodeName: 'vuln_08_067_path1',
  },
  {
    id: 'node2',
    nodeName: 'vuln_dsfndsfsdkfnsek_sdfdsc',
  },
  {
    id: 'node3',
    nodeName: 'vuln_jdsfnefnwefaaxas',
  },
  {
    id: 'node4',
    nodeName: 'kvm_0_130',
  },
  {
    id: 'node5',
    nodeName: 'privkdk_djfkks',
  },
  {
    id: 'node6',
    nodeName: 'softhdjjkd_getaskkasds',
  },
  {
    id: 'node7',
    nodeName: 'Bags_idjjmka',
  },
  {
    id: 'node8',
    nodeName: 'vuln_jskekw_JKDK_SD',
  },
  {
    id: 'node9',
    nodeName: 'UNS_JDKKDK_jdskkd',
  },
  {
    id: 'node10',
    nodeName: 'jdkk_dsdae',
  },
  {
    id: 'node11',
    nodeName: 'jdj_sfsdx',
  },
  {
    id: 'node12',
    nodeName: 'kvm_1_3',
  },
  {
    id: 'node13',
    nodeName: 'presddscd_adfe',
  },
])
const edges = ref([
  {
    id: 'path1',
    start: 'node0',
    end: 'node1',
  },
  {
    id: 'path2',
    start: 'node0',
    end: 'node2',
  },
  {
    id: 'path3',
    start: 'node0',
    end: 'node3',
  },
  {
    id: 'path4',
    start: 'node1',
    end: 'node4',
  },
  {
    id: 'path5',
    start: 'node2',
    end: 'node4',
  },
  {
    id: 'path6',
    start: 'node3',
    end: 'node4',
  },
  {
    id: 'path7',
    start: 'node4',
    end: 'node5',
  },
  {
    id: 'path8',
    start: 'node5',
    end: 'node6',
  },
  {
    id: 'path9',
    start: 'node6',
    end: 'node7',
  },
  {
    id: 'path10',
    start: 'node6',
    end: 'node8',
  },
  {
    id: 'path11',
    start: 'node7',
    end: 'node9',
  },
  {
    id: 'path12',
    start: 'node7',
    end: 'node10',
  },
  {
    id: 'path13',
    start: 'node8',
    end: 'node11',
  },
  {
    id: 'path14',
    start: 'node9',
    end: 'node12',
  },
  {
    id: 'path15',
    start: 'node10',
    end: 'node12',
  },
  {
    id: 'path16',
    start: 'node11',
    end: 'node12',
  },
  {
    id: 'path17',
    start: 'node12',
    end: 'node13',
  },
])
const tooltip = ref()
const path1 = [
  'node0', 'node1', 'node4', 'node5', 'node6', 'node7', 'node10', 'node12', 'node13'
]
const pathEdges = [
  'path1', 'path4', 'path7', 'path8', 'path9', 'path12', 'path15', 'path17'
]
const draw = () => {
  // 创建 Graph 对象
  const g = new dagreD3.graphlib.Graph().setGraph({
    rankdir: 'TB', // 流程图从下向上显示，默认'TB'，可取值'TB'、'BT'、'LR'、'RL'
    // align:'DL', //同层级对齐方式 DL，DR
    // nodesep: 100, //节点间距离
    // edgesep: 100, //边之间距离
    ranksep: 80, //d等级之间分离距离
    marginx: 50, //x边距
    marginy: 100 //y边距
  }).setDefaultEdgeLabel(function () { return {}; });
  // Graph添加节点
  nodes.value.forEach((node: any) => {
    g.setNode(node.id, {
      id: node.id,
      label: node.nodeName,
      shape: 'rect',  //节点形状，可以设置rect(长方形),circle,ellipse(椭圆),diamond(菱形) 四种形状，还可以使用render.shapes()自定义形状
      style: 'fill:#3b71c7;stroke:#3b71c7;stroke-width:2px;cursor:pointer',  //节点样式,可设置节点的颜色填充、节点边框
      labelStyle: 'fill: #fff;cursor:pointer',  //节点标签样式, 可设置节点标签的文本样式（颜色、粗细、大小）
      rx: 3,  // 设置圆角
      ry: 3,  // 设置圆角
      paddingBottom: 15,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 15,
    });
  });

  // Graph添加节点之间的连线
  if (nodes.value.length > 1) {
    edges.value.forEach((edge: any) => {
      g.setEdge(edge.start, edge.end, {
        id: edge.id,
        label: 'step' + edge.id,
        labelStyle: 'fill:#8b8b8b;cursor:pointer',
        style: 'stroke: #3b71c7; fill: none; stroke-width: 2px',  // 连线样式
        arrowheadStyle: 'fill: #3b71c7;',  //箭头样式，可以设置箭头颜色
        arrowhead: 'normal',  //箭头形状，可以设置 normal,vee,undirected 三种样式，默认为 normal
      })
    });
  }

  // 获取要绘制流程图的绘图容器
  const container = d3.select('svg.dagre').select('g.container');
  d3.select('svg.dagre').select('g.container').on('mouseover', e => {
    const res = nodes.value.filter(item => item.id === e.target.__data__);
    if (!res.length) {
      tooltip.value.style.display = 'none'
      return
    }
    currentNode.value = res[0]
    tooltip.value.style.display = 'block';
    tooltip.value.style.top = e.clientY + 20 + 'px';
    tooltip.value.style.left = e.clientX + 'px';
  }).on('mouseout', function () {
    tooltip.value.style.display = 'none';
  })

  // 创建渲染器
  const render = new dagreD3.render();
  // 在绘图容器上运行渲染器绘制流程图
  render(container, g);

  // // 建立拖拽缩放
  const svg = d3.select('svg.dagre')
  let zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", function (e) {
    container.attr("transform", e.transform);
  });
  //[0.5,2]缩放范围
  svg.call(zoom);

  const containerNodes = d3.select('svg.dagre').selectAll('.node');
  const nodes2 = containerNodes.filter((item: any) => {
    return path1.includes(item)
  })
  nodes2.selectAll('rect').attr('style', 'fill:#3b71c7;stroke:#00ff00;stroke-width:2px;cursor:pointer')
  //边id必须字母开头才能获取
  pathEdges.forEach((id) => {
    const edge = d3.select('svg.dagre').selectAll(`.edgePaths`).select(`#${id}`)
    edge.selectAll('path').attr('style', 'stroke: #00ff00; fill: none; stroke-width: 2px')
    edge.selectAll('marker').selectAll('path').attr('style', 'fill: #00ff00;') //箭头
  })
  // const drag = d3.drag()
  // .on("start", (d,i) => {
  // d.sourceEvent.stopPropagation()
  // const node = d3.select('svg.dagre').selectAll(`.nodes`).select(`#${i}`)
  // node.attr('transform',`translate(${d.x},${d.y})`)
  // d3.start()
  // })
  // .on("drag",(d,i) => {
  // const node = d3.select('svg.dagre').selectAll(`.nodes`).select(`#${i}`)
  // node.attr('transform',`translate(${d.x},${d.y})`)
  // })
  // .on("end",(d,i) => {
  // const node = d3.select('svg.dagre').selectAll(`.nodes`).select(`#${i}`)
  // node.attr('transform',`translate(${d.x},${d.y})`)
  // })
  // d3.selectAll(".node").call(drag)
}
</script>
 
<style scoped lang="scss">
.container-box {
  width: 100%;
  height: 100%;
  background-color: #1E0731;
}

.node-select {
  color: aqua;
}

.tooltip {
  position: absolute;
  font-size: 14px;
  background-color: rgb(209, 209, 209);
  border-radius: 2px;
  box-shadow: rgb(51, 51, 51) 0px 0px 5px;
  cursor: pointer;
  display: none;
  padding: 10px;
}

.tooltip>div {
  padding: 10px;
}
</style>
 