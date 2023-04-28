<template>
  <div id="network"></div>
</template>

<script setup lang='ts'>
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import { onMounted } from 'vue';
let nodes
let edges
onMounted(() => {
  draw()
})
const draw = () => {
  nodes = new DataSet([
  { id: 1, label: "Node 1" },
  { id: 2, label: "Node 2" },
  { id: 3, label: "Node 3" },
  { id: 4, label: "Node 4" }
  ])

  // create an array with edges
  edges = new DataSet([
    { id: 1, from: 1, to: 2 }
  ])

  // create a network
  let container = document.getElementById("network")!;
  let data = {
    nodes: nodes,
    edges: edges,
  };
  let options = {};
  let network = new Network(container, data, options);
  // setTimeout(() => {
  //   network.body.data.nodes.add([{ id: 5, label: "Node 5" }])
  // }, 2000)
}
</script>
<style scoped lang="scss">
#network {
  width: 100%;
  height: 100%;
}
</style>