<template>
  <input type="file" accept=".dxf" @change="changeFile" />
  <div id="dxfContainer"></div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import loadDxfFile from "./loadDxf"
import DxfParser from 'dxf-parser'
import DxfWriter from 'dxf-writer'
let scene: any
onMounted(() => {
  init();
});
onUnmounted(() => {
  scene.stop()
})
const init = () => {
  const dom = document.getElementById("dxfContainer") as HTMLElement;
  scene = new loadDxfFile(dom);
};
const changeFile = (event) => {
  console.log(event);
  console.log(event.target.files[0]);
  
  const reader = new FileReader()
  reader.onload = (e) => {
       console.log(e);
       var fileReader = e.target;
    if(fileReader.error) return console.log("error onloadend!?");
    var parser = new DxfParser();
    console.log(parser)
    const result = fileReader.result.toString()
    // console.log('fileReader.result', result);
    var dxf = parser.parseSync(result);
    console.log(dxf);
    // const res = parser.parse(dxf)
    // console.log('编译回去', res);
    // 使用 DxfWriter 类创建一个新的 DXFwriter
    const writer = new DxfWriter();
    console.log(writer);
    // dxf.blocks
    // writer.a
    dxf.entities.forEach((entity) => {
      if(entity.type === 'LINE'){
        const arr = []
        entity.vertices.forEach((ver) => {
          arr.push(ver.x,ver.y)
        })
        writer.drawLine(...arr)
      }
    })
    const s = writer.toDxfString()
    // console.log(s);
    var dxf2 = parser.parseSync(s);
    console.log(dxf2);
    // 将 DXF 对象写入到 DXFwriter 对象中
    // writer.writeHeaderVariable('variable', dxfObject.header.variable); // 写入头部变量
    // for (const entity of dxfObject.entities) {
    //   if (entity.type === 'CIRCLE') {
    //     writer.writeCircle(entity.center, entity.radius); // 写入圆
    //   } else if (entity.type === 'LINE') {
    //     writer.writeLine(entity.vertices[0], entity.vertices[1]); // 写入线段
    //   }
    //   // 根据需要写入其他类型（例如文本等）
    // }

    // 将 DXFwriter 对象序列化为 DXF 文件格式的字符串
    // const dxfString = writer.toString();

    // console.log(dxfString);
    if(dxf) {
        // console.log(JSON.stringify(dxf, null, 2));
    } else {
        console.log('No data.');
    }
  }
  reader.readAsBinaryString(event.target.files[0])
}
</script>
<style>
#dxfContainer {
  width: 100%;
  height: 100%;
}
</style>