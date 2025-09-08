<script setup lang="ts">
import { UploadFilled } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { ref } from "vue"

const emits = defineEmits(["handleUpload"])
const uploadProgress = ref<number>(0);
const handleUpload = (response: any) => {
  const code = response.code
  const message = response.message
  if (code === 0) {
    ElMessage.success(message)
  } else {
    ElMessage.error(message)
  }
  emits("handleUpload", response)
}
const beforeUpload = (file: File) => {
  const allowedExtensions = [".zip", ".tar", ".tar.gz", ".tar.bz2", ".tar.xz"]
  const isAllowed = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

  if (!isAllowed) {
    ElMessage.error("只能上传压缩文件，支持'.zip', '.tar', '.tar.gz', '.tar.bz2', '.tar.xz'格式")
    return false
  }
  return true
}
</script>

<template>
  <el-upload
    class="upload-dataset"
    drag
    action="/api/v1/data/upload"
    :on-success="handleUpload"
    :before-upload="beforeUpload"
    multiple
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">将数据集拖放到此处或<em>点击上传</em></div>
    <template #tip>
      <div class="el-upload__tip">压缩包格式仅支持'.zip', '.tar', '.tar.gz', '.tar.bz2', '.tar.xz'</div>
    </template>
    <el-progress v-if="uploadProgress > 0" :percentage="uploadProgress" status="active" />
  </el-upload>
</template>

<style lang="scss" scoped></style>
