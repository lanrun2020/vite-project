<template>
  <div id="home">
    <!-- <div class='top-scroll'>{{ message }}</div> -->
    <h1>num1:{{ num1 }}</h1>
    <h1>num2:{{ num2 }}</h1>
    <h1>sum:{{ sum }}</h1>
    <el-button @click="num1++">num1++</el-button>
    <el-button @click="num2++">num2++</el-button>
    <my-marker :data="overlay"></my-marker>
    <div>{{ overlay }}</div>
    <h1>count:{{ count }}</h1>
    <h1>nested.count:{{ nested.count.value }}</h1>
    <el-button @click="count++">count++</el-button>
    <el-button @click="test">测试</el-button>
    <el-button @click="test2">测试2</el-button>
    <el-button @click="test3">测试3</el-button>
    <el-button @click="screenFull">全屏</el-button>
    <input type="file" @change="changeFile" />
    <input ref="input1" type="number" @click="changeNumber" />


    <el-table :data="tableData" border :span-method="objectSpanMethod" style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" width="180">
      </el-table-column>
      <el-table-column prop="name" label="姓名">
      </el-table-column>
      <el-table-column prop="amount1" label="数值 1（元）">
      </el-table-column>
      <el-table-column prop="amount2" label="数值 2（元）">
      </el-table-column>
      <el-table-column prop="amount3" label="数值 3（元）">
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { fetchTest, fetchHome } from "@/apis/an-system";
import { reactive, ref, toRef } from "vue";
import { computed, onMounted, provide, watch } from "vue";
import SparkMD5 from 'spark-md5'
import { toRefs } from "vue";
import myMarker from "./myMarker.vue";
// ref会返回一个可变的响应式对象,只包含一个名为 value 的 property
const num1 = ref(0);
const num2 = ref(0);
const count = ref(0);
const obj = { name: 'jack', age: 20 }
const input1 = ref();
const newObj = ref(obj.age)
const newObj2 = toRef(obj, 'age')
const newObj3 = toRefs(obj)
const message = ref('dsfsdfsfeeffcs')
const num3 = ref(num1.value) 
const nested = {
  count,
};
const nested2 = reactive({
  count,
});
const tableData = [{
  id: '12987122',
  name: '王小虎',
  amount1: '234',
  amount2: '3.2',
  amount3: 10
}, {
  id: '12987123',
  name: '王小虎',
  amount1: '165',
  amount2: '4.43',
  amount3: 12
}, {
  id: '12987124',
  name: '王小虎',
  amount1: '324',
  amount2: '1.9',
  amount3: 9
}, {
  id: '12987125',
  name: '王小虎',
  amount1: '621',
  amount2: '2.2',
  amount3: 17
}, {
  id: '12987126',
  name: '王小虎',
  amount1: '539',
  amount2: '4.1',
  amount3: 15
}]
// console.log(nested.count.value);
// console.log(nested2.count);

// reactive会返回一个响应式的对象状态
const state = reactive({ count: 0 });

const changeFile = async (e: Event) => {
  const files = e.target.files
  if (!files.length) {
    return
  }
  const file = files[0]
  const chunks = createChunks(file, 10 * 1024 * 1024)
  console.log(chunks);
  const res = await hash(chunks)
  console.log(res);
}
const changeNumber = (e) => {
  console.log(e);
  console.log(input1.value);
  
  const i = getCursortPosition(input1.value)
  console.log(i);
  
}
const getCursortPosition = (element) => {

var CaretPos = 0;

if (document.selection) {//支持IE

  element.focus();

  var Sel = document.selection.createRange();

  Sel.moveStart('character', -element.value.length);

  CaretPos = Sel.text.length;

}

else if (element.selectionStart || element.selectionStart == '0')//支持firefox

  CaretPos = element.selectionStart;

return (CaretPos);

}
//文件切片
const createChunks = (file: File, chunksSize: number) => {
  const result: Blob[] = []
  for (let i = 0; i < file.size; i += chunksSize) {
    result.push(file.slice(i, i + chunksSize))
  }
  return result
}

const hash = (chunks: Blob[]) => {
  return new Promise((reslove) => {
    const spark = new SparkMD5()
    function _read(i: number) {
      if (i >= chunks.length) {
        reslove(spark.end())
        return
      }
      const blob = chunks[i]
      const reader = new FileReader()
      reader.onload = (e) => {
        const bytes = e.target.result
        spark.append(bytes)
        _read(i + 1)
      }
      reader.readAsArrayBuffer(blob)
    }
    _read(0)
  })

}
const sum = computed(() => {
  return num1.value + num2.value;
});

watch(sum, () => {
  console.log("sum change");
});
//父组件provide传值 - 子、孙组件inject取值
provide("num1", num1);
provide("num2", num2);
provide("sum", sum);

let overlay = ref()
onMounted(async () => {
  // let res = await fetchHome()
  let newData = ref({})
  overlay.value = newData.value
  setInterval(() => {
    newData.value.age = Math.random()
    // overlay.value = 1
  },1000)
})
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: { row: object, column: object, rowIndex: number, columnIndex: number }) => {
  if (columnIndex === 0) {  // 第一列
    if (rowIndex % 2 === 0) { // 偶数行
      return { //占两行一列
        rowspan: 2,
        colspan: 1
      };
    } else {
      return { //占0行0列，不分配单元格
        rowspan: 0,
        colspan: 0
      };
    }
  }
  if (columnIndex === 1) { // 第二列
    if (rowIndex % 2 === 0) {
      return {
        rowspan: 2,
        colspan: 1
      }
    } else {
      return { //占0行0列，不分配单元格
        rowspan: 0,
        colspan: 0
      };
    }
  }
  if (columnIndex === 3) { // 第四列
    if (rowIndex % 2 === 0) {
      return {
        rowspan: 2,
        colspan: 1
      }
    } else {
      return { //占0行0列，不分配单元格
        rowspan: 0,
        colspan: 0
      };
    }
  }
}
const test = async () => {
  const res = await fetchTest();
  console.log(res);
};
const test2 = async () => {
  console.log(num3.value)
};
const test3 = async () => {
  // newObj.value = 25
  // newObj2.value = 25
  newObj3.age.value = 26
  console.log(obj);
};
const screenFull = () => {
  const element = document.getElementById('home')!
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullScreen()
  }
}
</script>
<style scoped lang="scss">
.top-scroll {
  transform: translate3d(100%, 0, 0);
  animation: 40s 2s move linear infinite;

  // &:hover{
  //   cursor: pointer;
  //   animation-play-state: paused;
  // }
  @keyframes move {
    0% {
      transform: translate3d(100%, 0, 0);
    }

    100% {
      transform: translate3d(-100%, 0, 0);
    }
  }
}

#home {
  height: 100%;
  padding: 10px;

  :deep(.el-table__row) {
    color: rgb(0, 0, 0);
  }
}
</style>