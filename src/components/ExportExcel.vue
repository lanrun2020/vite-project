<template>
  <el-button
    type="primary"
    :loading="downloadLoading"
    @click="exportExcel"
    >导出excel<el-icon class="el-icon--right"><Download /></el-icon></el-button
  >
  
</template>

<script setup lang="ts">
import FileSaver from "file-saver";
import XLSX from "xlsx";
import { reactive, ref } from "vue";
import {Download} from '@element-plus/icons-vue'
const props = defineProps<{
  id: string;
  name: string;
}>();
let downloadLoading: boolean = false;
// 导出Excel表格
const exportExcel = () => {
  downloadLoading = true;
  const xlsxParam = { raw: true, sheetRows: 0 }; // 转换成excel时，使用原始的格式
  /* 从表生成工作簿对象 */
  const wb = XLSX.utils.table_to_book(
    document.querySelector("#" + props.id),
    xlsxParam
  );
  /* 获取二进制字符串作为输出 */
  const wbout = XLSX.write(wb, {
    bookType: "xlsx",
    bookSST: true,
    type: "array",
  });
  try {
    FileSaver.saveAs(
      // Blob 对象表示一个不可变、原始数据的类文件对象。
      // Blob 表示的不一定是JavaScript原生格式的数据。
      // File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
      // 返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
      new Blob([wbout], {
        type: "application/octet-stream",
      }),
      // 设置导出文件名称
      props.name + ".xlsx"
    );
  } catch (e) {
    if (typeof console !== "undefined") console.log(e, wbout);
  }
  downloadLoading = false;
  return wbout;
};
</script>
