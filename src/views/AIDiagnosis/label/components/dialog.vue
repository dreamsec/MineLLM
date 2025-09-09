<template>
  <!-- model-value单向数据绑定 -->
  <el-dialog model-value="dialogVisible" :title="dialogTitle" width="40%" @close="handleClose">
    <el-form ref="formRef" :rules="rules" :model="form" label-width="120px">
      <el-form-item label="标签名" prop="tag_name">
        <el-input v-model="form.tag_name" />
      </el-form-item>
      <!-- <el-form-item label="标签类别" prop="class_id">
        <el-input v-model="form.class_id" />
      </el-form-item> -->
      <el-form-item label="标签颜色" prop="tag_color">
        <el-color-picker v-model="form.tag_color" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, watch } from "vue"
import { addTagApi, updateTagApi } from "@/api/tag/index.js"
import { ElMessage } from "element-plus"

// 定义dialogTitle dialogTableValue属性 父组件可以直接使用属性
const props = defineProps({
  dialogTitle: {
    type: String,
    defalut: "",
    required: true
  },
  dialogTableValue: {
    type: Object,
    defalut: () => {},
    required: true
  }
})

const emits = defineEmits(["update:modelValue", "initTagsList", "initLabelsList", "exportYaml"])

// 关闭对话框
const handleClose = () => {
  emits("update:modelValue", false)
}

const formRef = ref(null)

// 添加标签
const handleConfirm = () => {
  formRef.value.validate(async (valid) => {
    // 表单验证
    if (valid) {
      if (props.dialogTitle === "添加Tag") {
        form.value.dataset_id = localStorage.getItem("dataset_id")
        console.log(form.value)
        await addTagApi(form.value)
      } else {
        await updateTagApi(form.value.tag_id, form.value)
      }
      ElMessage({
        message: "更新成功",
        type: "success"
      })
      emits("initTagsList") // 向父组件传递一个事件 更新用户列表
      emits("initLabelsList")
      emits("exportYaml")
      handleClose()
    }
  })
}

// 表单数据
const form = ref({
  tag_id: -1,
  tag_name: "",
  tag_color: ""
})

// 表单校验规则
const rules = ref({
  tag_name: [{ required: true, message: "标签名", trigger: "blur" }]
  // class_id: [{ required: true, message: "在数据集中的类id", trigger: "blur" }]
})

watch(
  () => props.dialogTableValue, // 监听dialogTableValue属性 不同行值不同
  () => {
    form.value = props.dialogTableValue
    console.log("form.value", form.value)
  },
  { deep: true, immediate: true }
)
</script>
<style lang="scss" scoped></style>
