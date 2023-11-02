<template>
  <div class="upload-box">
    {{ fileList }}
    <hr />
    {{ name }}
    {{ _fileList }}
    {{ ":" + file  }}
    <el-button @click="handleClick">改变常量值</el-button>
    <el-upload
      v-model:file-list="_fileList"
      action="#"
      :multiple="true"
      :disabled="self_disabled"
      :limit="limit"
      :http-request="handleHttpUpload"
      :before-upload="beforeUpload"
      :on-exceed="handleExceed"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :accept="fileType.join(',')"
    >
      <el-button type="primary">请上传文件</el-button>
    </el-upload>
    <div class="el-upload__tip">
      <slot name="tip"></slot>
    </div>
  </div>
</template>

<script setup name="UploadFile">
import { ref, computed, inject, watch, toRaw, onMounted } from "vue";
import { Plus } from "@element-plus/icons-vue";
import  {cloneDeep} from "lodash";
import { ElNotification, formContextKey, formItemContextKey } from "element-plus";
const _fileList = ref([]);
const name = ref(123)

let file='kjlhkjh'
// 接受父组件参数
const props = defineProps({
  fileList: {
    type: Array,
    default: () => []
  },
  fileType: {
    type: Array,
    default: () => ["image/jpeg", "image/png", "image/jpg"]
  },
  limit: {
    type: Number,
    default: () => 1
  },
  fileSize: {
    type: Number,
    default: () => 50
  },
});
onMounted(() => {
  // setInterval(() => {
  //   console.log(toRaw(_fileList.value));
  // }, 2000);
})
const handleClick = () => {
  file = '兰兰'
  name.value = 456
}
// 获取 el-form 组件上下文
const formContext = inject(formContextKey, void 0);
// 获取 el-form-item 组件上下文
const formItemContext = inject(formItemContextKey, void 0);
// 判断是否禁用上传和删除
const self_disabled = computed(() => {
  return props.disabled || formContext?.disabled;
});

// 监听 props.fileList 列表默认值改变
watch(
  () => props.fileList,
  n => {
    // _fileList.value = toRaw(n)
  },
  {deep:true}
);
const emit = defineEmits(['updateFileList']);

const handleHttpUpload = async options => {
  let formData = new FormData();
  formData.append("multipartFile", options.file);
  file = 456
  name.value = 'lankan'

  try {
    const fileList = cloneDeep(toRaw(_fileList.value))
    emit("updateFileList", fileList);
    // 调用 el-form 内部的校验方法（可自动校验）
    formItemContext?.prop && formContext?.validateField([formItemContext.prop]);
  } catch (error) {
    options.onError(error);
  }
};

/**
 * @description 文件上传之前判断
 * @param rawFile 选择的文件
 * */
const beforeUpload = rawFile => {
  const imgSize = rawFile.size / 1024 / 1024 < props.fileSize;
  const imgType = props.fileType.includes(rawFile.type) || rawFile.name.endsWith(props.fileType);
  if (!imgType)
    ElNotification({
      title: "温馨提示",
      message: "上传文件不符合所需的格式！",
      type: "warning"
    });
  if (!imgSize)
    setTimeout(() => {
      ElNotification({
        title: "温馨提示",
        message: `上传文件不能超过 ${props.fileSize}M！`,
        type: "warning"
      });
    }, 0);
  return imgType && imgSize;
};

/**
 * @description 图片上传成功
 * */
const uploadSuccess = (response, uploadFile) => {
  if (!response) return;
  uploadFile.url = response.data;
  debugger
  emit("updateFileList", _fileList.value);
  // 调用 el-form 内部的校验方法（可自动校验）
  formItemContext?.prop && formContext?.validateField([formItemContext.prop]);
  ElNotification({
    title: "温馨提示",
    message: "图片上传成功！",
    type: "success"
  });
};

/**
 * @description 图片上传错误
 * */
const uploadError = () => {
  ElNotification({
    title: "温馨提示",
    message: "文件上传失败，请您重新上传！",
    type: "error"
  });
};

/**
 * @description 文件数超出
 * */
const handleExceed = () => {
  ElNotification({
    title: "温馨提示",
    message: `当前最多只能上传 ${props.limit} 张图片，请移除后上传！`,
    type: "warning"
  });
};
</script>

<style scoped lang="scss"></style>
