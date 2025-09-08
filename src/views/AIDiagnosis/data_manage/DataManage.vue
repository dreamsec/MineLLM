<script lang="ts" setup>
import {reactive, ref, watch} from "vue"
import {ElMessageBox, ElMessage} from "element-plus"
import {
  CirclePlus,
  Delete,
  Plus,
  Search,
  ArrowRight,
  ArrowDown,
  Files,
  More,
  EditPen,
  DeleteFilled,
  CirclePlusFilled,
  HelpFilled,
  Grid
} from "@element-plus/icons-vue"
import {IGetTableData, type ITableData} from "@/api/data/types/data"
import {
  deleteTableDataApi,
  getTableApi,
  getTableDatapathApi,
  deleteDataTypeApi,
  modifyDatasetApi
} from "@/api/data"
import {DataTrainDataApi} from "@/api/train"
import {usePagination} from "@/hooks/usePagination"
import {createDatasetTypeApi} from "@/api/data"
import {ElUpload} from "element-plus"
import {genFileId} from "element-plus"
import type {UploadInstance, UploadProps, UploadRawFile} from "element-plus"
import router from "@/router"
import SvgIcon from "@/components/SvgIcon/index.vue"

const upload = ref<UploadInstance>()
const isFolderUpload = ref(false)
// 在 Vue 组件中
const isSelecting = ref(false)
const selectedFiles = ref<File[]>([])
const loadingTips = "上传中..."

// 方法用于选择文件夹
const selectFolder = () => {
  isSelecting.value = true
  const uploadInput = document.createElement("input")
  uploadInput.type = "file"
  uploadInput.multiple = true
  uploadInput.webkitdirectory = true
  // 检测用户是否取消了选择
  uploadInput.onclick = () => {
    // 使用 setTimeout 来推迟检查，等待文件选择框关闭
    setTimeout(() => {
      if (uploadInput.value === "") {
        console.log("User cancelled the file selection.")
        isSelecting.value = false
      }
    }, 1000) // 短暂延时确保onchange有机会先触发
  }
  uploadInput.onchange = () => {
    const files = uploadInput.files
    if (files) {
      isFolderUpload.value = true
      selectedFiles.value = Array.from(files) // 存储选择的文件
    }
    isSelecting.value = false
  }

  uploadInput.click()
}

const isLoading = ref(false)
const confirmSubmit = async () => {
  createVersionFormRef.value?.validate(async (valid: any) => {
    if (!valid) {
      ElMessage.error("请检查输入项是否符合要求")
      return
    }
    // 生成唯一的批次号，这里使用时间戳作为例子
    const batchId = `batch-${Date.now()}`
    if (isFolderUpload.value) {
      if (selectedFiles.value.length) {
        const totalFiles = selectedFiles.value.length
        for (let i = 0; i < totalFiles; i++) {
          const file = selectedFiles.value[i]
          const isLast = i === totalFiles - 1 // 判断当前是否为最后一个文件
          isLoading.value = true
          await uploadFileToServer(file, batchId, isLast) // 上传文件
        }
        dialogVisible.value = false // 关闭对话框
        isLoading.value = false
        ElMessage.success("文件上传成功")
        selectedFiles.value = [] // 清除已选择的文件
        isFolderUpload.value = false // 重置上传类型状态
        getTableData() // 刷新数据
      } else {
        ElMessage.error("请上传文件")
      }
    } else {
      if (picorzip.value) {
        // console.log(upload.value)
        dialogVisible.value = false // 关闭对话框
        upload.value!.submit() // 执行上传操作
        selectedFiles.value = []
      } else {
        ElMessage.error("请上传文件")
      }
    }
  })
}
const confirminsertSubmit = async () => {
  inserteVersionFormRef.value?.validate(async (valid: any) => {
    if (!valid) {
      ElMessage.error("请检查输入项是否符合要求")
      return
    }
    isLoading.value = true
    if (isFolderUpload.value) {
      if (selectedFiles.value.length) {
        dialogVisible.value = false // 关闭对话框
        const totalFiles = selectedFiles.value.length
        for (let i = 0; i < totalFiles; i++) {
          const file = selectedFiles.value[i]
          const isLast = i === totalFiles - 1 // 判断当前是否为最后一个文件
          await uploadFileToServer1(file, isLast) // 上传文件
        }
        isLoading.value = false
        ElMessage.success("文件上传成功")
        selectedFiles.value = [] // 清除已选择的文件
        isFolderUpload.value = false // 重置上传类型状态
        insertdialogVisible.value = false // 关闭对话框
        getTableData() // 刷新数据
      } else {
        ElMessage.error("请上传文件")
      }
    } else {
      if (picorzip.value) {
        insertdialogVisible.value = false // 关闭对话框
        // console.log(upload.value)
        upload.value!.submit() // 执行上传操作
        selectedFiles.value = []
      } else {
        ElMessage.error("请上传文件")
      }
    }
  })
}

const isVisible = ref(true) // 默认为true，页面加载时显示div
const toggleVisibility = () => {
  isVisible.value = !isVisible.value // 切换可见性状态
}
const {paginationData, handleCurrentChange, handleSizeChange} = usePagination()
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const searchData = reactive({
  dataset_type: ""
})
const loading = ref<boolean>(false)
const file = ref<boolean>(false)
const picorzip = ref<boolean>(false)
const TableData = ref<ITableData[]>([])
const list_all_data = ref<any>([])
const dataset_type = ref<any>([])
const datasets_path = reactive({
  dataset_path: "",
  dataset_filename: "",
  dataset_type: ""
})
const uploadSuccess = ref(false) // 响应式变量来跟踪上传是否成功
// 多次上传覆盖上一个文件
const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}
const onChange = (file: UploadRawFile) => {
  if (!uploadSuccess.value) {
    picorzip.value = true
    selectedFiles.value = [file]
  }
  uploadSuccess.value = false
}

const onSuccess = () => {
  getTableData()
  file.value = false
  isLoading.value = false
  uploadSuccess.value = true // 设置上传成功的标志
}
const uploadFileToServer = async (file: string | Blob, batchId: string | Blob, isLast: boolean) => {
  const formData = new FormData()
  formData.append("file", file)

  // 将表单数据也加入到上传的数据中
  formData.append("is_Last", isLast ? "true" : "false") // 添加是否为最后一个文件的标识
  formData.append("dataset_name", createVersionForm.dataset_name)
  formData.append("dataset_type", createVersionForm.dataset_type)
  formData.append("create_way", createVersionForm.create_way)
  formData.append("resource", createVersionForm.resource || "")
  formData.append("batch_id", batchId) // 添加批次号标识

  try {
    const response = await fetch("/api/v1/data/creat_dataset", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`)
    }

    // 处理服务器返回的响应
    const result = await response.json()
    console.log("Upload result:", result)
  } catch (error) {
    console.error("Upload error:", error)
    ElMessage.error(`文件上传失败: ${error}`)
  }
}
const uploadFileToServer1 = async (file: string | Blob, isLast: boolean) => {
  const formData = new FormData()
  formData.append("file", file)

  // 将表单数据也加入到上传的数据中
  formData.append("is_Last", isLast ? "true" : "false") // 添加是否为最后一个文件的标识
  formData.append("dataset_name", inserteVersionForm.dataset_name)
  formData.append("dataset_type", inserteVersionForm.dataset_type)
  formData.append("resource", inserteVersionForm.resource || "")

  try {
    const response = await fetch("/api/v1/data/insert", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`)
    }

    // 处理服务器返回的响应
    const result = await response.json()
    console.log("Upload result:", result)
  } catch (error) {
    console.error("Upload error:", error)
    ElMessage.error(`文件上传失败: ${error}`)
  }
}

// 点击确定提交对话框里的数据
// const confirmSubmit = () => {
//   if (file.value == false) {
//     ElMessage.error("请上传文件")
//     return
//   }
//   // 验证必填项
//   // if (createVersionForm.dataset_name == '') {
//   //   ElMessage.error('请将必填项填写完整')
//   //   dialogVisible.value = false;
//   //   return;
//   // }
//   // if (createVersionForm.create_way == '') {
//   //   ElMessage.error('请将必填项填写完整')
//   //   dialogVisible.value = false;
//   //   return;
//   // } else {
//   //   if (createVersionForm.create_way === 'extend_old' && createVersionForm.resource === '') {
//   //     ElMessage.error('请将必填项填写完整')
//   //     dialogVisible.value = false;
//   //     return;
//   //   }
//   // }
//   createVersionFormRef.value?.validate((valid: boolean) => {
//     if (valid) {
//       // 验证通过
//       dialogVisible.value = false
//       // 这里进行后续逻辑处理
//       // 都填好了，提交信息
//       upload.value!.submit()
//     } else {
//       ElMessage.error("请检查输入项是否符合要求")
//     }
//   })
// }

//获取TableData
const getTableData = () => {
  loading.value = true
  list_all_data.value = []
  dataset_type.value = []
  TableData.value = []
  getTableApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    dataset_type: searchData.dataset_type || undefined
  })
    .then((res: any) => {
      paginationData.total = res.data.total
      list_all_data.value = res.data.list
      dataset_type.value = Object.keys(list_all_data.value)
      // console.log(list_all_data.value)
      // console.log(dataset_type.value)
      handletabledata()
      // console.log(TableData.value)
    })
    .catch(() => {
      TableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const handletabledata = () => {
  for (const key in list_all_data.value) {
    const [user_name, dataset_type] = key.split("$$$$$")
    TableData.value.push({
      dataset_type: dataset_type,
      user_name: user_name,
      data: list_all_data.value[key]
    })
  }
}
// 创建新版本
const createDataset = (row: any) => {
  // 根据id判断是哪类数据集要创建新版本
  // 清空表单
  console.log(row)
  resetForm()
  extendOptions.value = []
  // extendOptions.value=row.data.map((item: { dataset_name: any }) => item.dataset_name)
  extendOptions.value = row.data.map((item: { dataset_name: any; id: any }) => ({
    dataset_name: item.dataset_name,
    id: item.id
  }))
  // console.log(extendOptions)
  // console.log(row)
  createVersionForm.dataset_type = row.dataset_type
  // 对话框可见
  dialogVisible.value = !dialogVisible.value
}
// 创建新版本对话框是否可见
const dialogVisible = ref(false)
// 对话框表单
const createVersionForm = reactive({
  create_way: "", // 创建方式
  resource: "", // 继承来源(传dataset的id)
  dataset_name: "", //数据集名称
  dataset_type: "" //数据集类别
})

// 创建新版本
const insertDataset = (scoperow: IGetTableData) => {
  // // 后加的
  // isLoading.value = false
  // 根据id判断是哪类数据集要创建新版本
  // 清空表单
  console.log(scoperow)
  resetForm1()
  // console.log(extendOptions)
  // console.log(row)
  inserteVersionForm.dataset_type = scoperow.dataset_type
  inserteVersionForm.dataset_name = scoperow.dataset_name
  inserteVersionForm.resource = scoperow.id
  // 对话框可见
  insertdialogVisible.value = !insertdialogVisible.value
}
// 创建新版本对话框是否可见
const insertdialogVisible = ref(false)
// 对话框表单
const inserteVersionForm = reactive({
  dataset_type: "",
  dataset_name: "",
  resource: ""
})

// 继承版本的选项  需要动态记录！！
const extendOptions = ref<any>([])
// 重置表单
const resetForm = () => {
  createVersionForm.create_way = ""
  createVersionForm.resource = ""
  createVersionForm.dataset_name = ""
  createVersionForm.dataset_type = ""
}
const resetForm1 = () => {
  inserteVersionForm.resource = ""
  inserteVersionForm.dataset_name = ""
  inserteVersionForm.dataset_type = ""
}
const createVersionFormRef = ref<any>()
const inserteVersionFormRef = ref<any>()
// 创建的规则
const createRules = {
  dataset_name: [
    {
      required: true,
      trigger: "blur",
      message: "请输入20字符以内的中英文、数字和下划线"
    },
    {
      min: 1,
      max: 20,
      message: "长度在 1 到 20 个字符",
      trigger: "blur"
    },
    {
      pattern: /^[A-Za-z0-9_\u4e00-\u9fa5]+$/,
      message: "请输入中英文、数字或下划线",
      trigger: "blur"
    }
  ],
  create_way: [
    {
      required: true,
      message: "请选择一个创建方式",
      trigger: "change"
    }
  ],
  resource: [
    {
      required: true,
      message: "请选择一个版本",
      trigger: "change"
    }
  ]
}
// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  typedialogVisible.value = false
  modifyDialogVisible.value = false
  insertdialogVisible.value = false
  selectedFiles.value = [] // 清空选中文件列表
  isFolderUpload.value = false
  file.value = false
}

const typedialogVisible = ref(false)
const createForm = ref({
  dataset_type: "",
  dataset_remark: ""
})

const createTypeRef = ref<any>()

const createTypeRules = {
  dataset_type: [
    {
      required: true,
      message: "请输入20字符以内的中英文、数字和下划线",
      trigger: "blur"
    },
    {
      min: 1,
      max: 20,
      message: "长度在 1 到 20 个字符",
      trigger: "blur"
    },
    {
      pattern: /^[A-Za-z0-9_\u4e00-\u9fa5]+$/,
      message: "请输入中英文、数字或下划线",
      trigger: "blur"
    }
  ],
  dataset_remark: [
    {
      message: "请输入备注信息",
      trigger: "change"
    }
  ]
}

const createType = () => {
  typedialogVisible.value = true
  createForm.value.dataset_type = ""
}

const confirmCreateType = () => {
  createTypeRef.value?.validate((valid: boolean) => {
    const flag = ref(false)
    if (valid) {
      // 验证通过
      typedialogVisible.value = false
      // 检查是否同名
      TableData.value.forEach((item) => {
        if (item.dataset_type == createForm.value.dataset_type) {
          flag.value = true
        }
      })
      if (!flag.value) {
        // 验证通过
        // modifyDialogVisible.value = false
        // 这里进行后续逻辑处理
        createDatasetTypeApi({
          dataset_type: createForm.value.dataset_type
        }).then(() => {
          console.log(1)
          getTableData()
        })
      } else {
        ElMessage.error("名称已存在，请更换名称！")
      }
    } else {
      ElMessage.error("请检查输入项是否符合要求")
    }
  })
  // typedialogVisible.value = false
  // if (createForm.value.dataset_type == "") {
  //   ElMessage.error('数据集类型不能为空')
  //   return;
  // }
  // createDatasetTypeApi({
  //   dataset_type: createForm.value.dataset_type
  // }).then(() => {
  //   console.log(1)
  //   getTableData()
  // })
}

const modifyDialogVisible = ref<boolean>(false)
const currentType = ref({
  dataset_type: ""
})
const newTypeRef = ref<any>()
const newType = ref({
  dataset_type: ""
})
const modifyDataset = (item: ITableData) => {
  modifyDialogVisible.value = true
  currentType.value.dataset_type = item.dataset_type
  newType.value.dataset_type = item.dataset_type
}

const flag = ref<boolean>(false)
const confirmModifyType = () => {
  newTypeRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 检查是否修改
      if (currentType.value.dataset_type != newType.value.dataset_type) {
        // 检查是否同名
        TableData.value.forEach((item) => {
          if (item.dataset_type == newType.value.dataset_type) {
            flag.value = true
          }
        })
        if (!flag.value) {
          // 验证通过
          modifyDialogVisible.value = false
          modifyDatasetApi({
            type: currentType.value.dataset_type,
            name: newType.value.dataset_type
          }).then(() => {
            getTableData()
            ElMessage.success("修改成功")
          })
        } else {
          ElMessage.error("名称已存在，请更换名称！")
        }
      } else {
        modifyDialogVisible.value = false
        ElMessage.warning("名称未改变")
      }
    } else {
      ElMessage.error("请检查输入项是否符合要求")
    }
  })
}

const handleDelete = (row: IGetTableData) => {
  ElMessageBox.confirm(`正在删除数据集：${row.dataset_name}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteTableDataApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}

const handleDeleteType = (dataset_type: string) => {
  ElMessageBox.confirm(`正在删除数据类型：${dataset_type}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteDataTypeApi(dataset_type).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}

const handletag = (row: IGetTableData) => {
  localStorage.setItem("dataset_id", row.id)
  getTableDatapathApi({
    dataset_name: row.dataset_name,
    dataset_datetime: row.upload_datetime,
    dataset_id: row.id,
    user_id: row.user_id
  }).then((res) => {
    datasets_path.dataset_path = res.data.list.dataset_path
    datasets_path.dataset_filename = res.data.list.dataset_filename
    localStorage.setItem("dataset_path", datasets_path.dataset_path)
    localStorage.setItem("dataset_filename", datasets_path.dataset_filename)
    localStorage.setItem("user_id", row.user_id)
    router.push("/label")
    // window.location.href = "/tag.html"
  })
}

const beforeUpload = (file: any) => {
  uploadSuccess.value = false
  const allowedTypes = [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-zip-compressed",
    "application/octet-stream",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp"
  ] // 允许上传的文件类型
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error("只允许上传支持的格式的图片文件")
    return false // 取消上传
  }
  return true // 允许上传
}

// 版本列表展示
const isExpand = ref<boolean>(false)
const currentDatasetIdx = ref<number>()
const toggleExpand = (idx: number) => {
  isExpand.value = !isExpand.value
  currentDatasetIdx.value = idx
}

// 进度条颜色变化
const statusColor = (tagged: number, size: number) => {
  if (tagged >= 10) return "success"
  else return "exception"
}

const statusDialogVisible = ref<boolean>(false)
const train = (data: any) => {
  // TODO:根据训练要求，判断进行弹出还是跳转
  console.log(data)
  if (data.dataset_tagged < 10 || data.is_trained == 0) {
    // 未达训练要求，弹出提示
    statusDialogVisible.value = true
  } else {
    DataTrainDataApi({
      dataset_id: data.id
    }).then((res: any) => {
      if (res.code == 1) {
        localStorage.setItem("createModelForm.from_data", "1")
        localStorage.setItem("createModelForm.datasetID", data.id)
        localStorage.setItem("createModelForm.datatypeID", data.datatype_id)
        router.push({path: "/models/model_manage"})
      } else if (res.code == 0) {
        localStorage.setItem("createModelForm.from_data", "1")
        localStorage.setItem("createModelForm.datasetID", data.id)
        localStorage.setItem("createModelForm.datatypeID", data.datatype_id)
        router.push({
          path: "/models/train"
        })
      }
    })
  }
}
// 上传方式
const upload_way = ref("图片上传")
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, {immediate: true})

defineOptions({
  name: "data_manage"
})
</script>

<template>
  <div id="data_manage">
    <!--      数据总览-->
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        margin-left: 20px;
        margin-right: 20px;
        width: 95%;
      "
    >
      <h3>数据总览</h3>
      <div>
        <img
          :src="isVisible ? '/eye-solid.svg' : '/eye-slash-solid.svg'"
          @click="toggleVisibility"
          style="cursor: pointer; width: 17px; height: 17px; margin-left: 10px; vertical-align: middle"
          alt="Toggle Visibility"
        />
        <div
          style="font-size: 12px; display: inline-block; margin-left: 10px; vertical-align: middle">
          隐藏功能说明
        </div>
      </div>
    </div>
    <el-card
      style="margin-bottom: 20px; width: 96%; margin-left: 2%; background-color: rgb(216, 230, 241)"
      v-if="isVisible"
    >
      <div style="font-size: 12px">
        &nbsp &nbsp &nbsp
        您可在数据总览查看所有创建的数据集，进行数据管理与操作。在完成素材采集后，可使用以下功能进行数据预处理、质检、标注、诊断、扩充等，保障数据质量和模型性能。
      </div>
      <div style="margin-top: 20px" class="image-gallery">
        <div style="margin-left: 5%; width: 28.3%" class="image-container">
          <div style="display: flex; align-items: center">
            <div>
              <!-- 根据实际图片大小设置宽高 -->
              <img src="@/assets/img/dataanalysis.png" alt="Image 1"
                   style="width: 120px; height: 120px"/>
            </div>
            <span class="image-name"
                  style="font-weight: bold; margin-left: 10px; white-space: nowrap">数据预处理</span>
          </div>
          <div style="margin-top: 10px"/>
          <div class="image-caption" style="text-align: left; font-size: 12px">
            支持对所采集的数据进行筛选和预处理，通过统计数据属性分布情况，筛选出高质量数据，来保障模型训练效果。
          </div>
        </div>

        <div style="margin-left: 5%; width: 28.3%" class="image-container">
          <div style="display: flex; align-items: center">
            <div>
              <!-- 根据实际图片大小设置宽高 -->
              <img src="@/assets/img/databiaozhu.png" alt="Image 1"
                   style="width: 120px; height: 120px"/>
            </div>
            <span class="image-name"
                  style="font-weight: bold; margin-left: 10px; white-space: nowrap">数据标注</span>
          </div>
          <div style="margin-top: 10px"/>
          <div class="image-caption" style="text-align: left; font-size: 12px">
            支持对图片进行标注，通过网页即可使用拖拉拽的方式简单轻松地实现在线标注数据集。同时可对子账号发起多人标注任务。
          </div>
        </div>

        <div class="image-container" style="margin-left: 5%; width: 28.3%">
          <div style="display: flex; align-items: center">
            <div>
              <!-- 根据实际图片大小设置宽高 -->
              <img src="@/assets/img/datakuochong.png" alt="Image 1"
                   style="width: 120px; height: 120px"/>
            </div>
            <span class="image-name"
                  style="font-weight: bold; margin-left: 10px; white-space: nowrap">数据添加 </span>
          </div>
          <div style="margin-top: 10px"/>
          <div class="image-caption" style="text-align: left; font-size: 12px">
            支持对已标注数据集图片或目标属性进行变换、修改、补充难以采的图片，漏误标诊断和丰富数据集素材的多样性。
          </div>
        </div>
      </div>
    </el-card>
    <el-card>
      <div class="actions">
        <el-form ref="searchFormRef" :inline="true" :model="searchData" class="search-form">
          <el-form-item prop="dataset_name">
            <div class="input-with-icon" style="margin-right: 15px">
              <el-input v-model="searchData.dataset_type" placeholder="搜索数据集名称"
                        @keyup.enter="handleSearch"/>
              <el-icon class="search_icon" style="color: #bfbfbf" @click="handleSearch">
                <Search/>
              </el-icon>
            </div>
          </el-form-item>
        </el-form>
        <el-button type="primary" bg size="default" @click="createType()" :icon="CirclePlus"
                   class="create-button">
          创建训练集
        </el-button>
        <el-dialog v-model="typedialogVisible" title="创建训练集" :before-close="handleClose"
                   style="width: 500px">
          <el-form ref="createTypeRef" :model="createForm" :rules="createTypeRules">
            <el-form-item label=" 训练集：" prop="dataset_type" style="margin-left: 5px">
              <el-input
                v-model="createForm.dataset_type"
                placeholder="请输入20字符以内的中英文、数字和下划线"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item label="版本备注：" prop="dataset_remark">
              <el-input
                v-model="createForm.dataset_remark"
                placeholder="请输入备注信息"
                style="width: 300px"
                type="textarea"
                :rows="4"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="typedialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmCreateType" style="margin-left: 15px">创建
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
      <!--数据集表单-->
      <div class="data_card" v-for="(item, index) in TableData" :key="index">
        <div class="data_table">
          <div class="form_header">
            <div class="form_left">
              <el-icon style="margin-right: 20px" @click="toggleExpand(index)">
                <ArrowDown v-if="isExpand && currentDatasetIdx == index"/>
                <ArrowRight v-else/>
              </el-icon>
              <div class="form_left">
                <svg-icon prefix="icon" name="dataset" style="font-size: 24px"/>
                <span style="margin: 0 10px 0 10px">
                  {{ item.dataset_type }}
                </span>
              </div>
            </div>
            <div class="form_right">
              <el-button text @click="createDataset(item)" :icon="Plus"> 创建新版本</el-button>
              <el-button text :icon="Files" @click="toggleExpand(index)">
                全部版本({{ item.data.length }})
              </el-button>
              <el-dropdown>
                <el-button text :icon="More"> 更多</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button text @click="modifyDataset(item)" :icon="EditPen"> 修改数据集名称
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button text @click="handleDeleteType(item.dataset_type)" :icon="Delete">
                        删除数据集
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <el-table :data="item.data" row-key="id" v-show="isExpand && currentDatasetIdx == index">
            <el-table-column prop="dataset_name" label="版本名称" align="center"/>
            <el-table-column prop="upload_datetime" label="上传日期" align="center"/>
            <el-table-column label="已标注图片数/总图片数" align="center">
              <template #default="scope">
                <div style="display: flex">
                  <el-progress
                    style="flex: 1; margin-right: 10px"
                    :status="statusColor(scope.row.dataset_tagged, scope.row.dataset_size)"
                    :text-inside="true"
                    :stroke-width="16"
                    :percentage="parseFloat(((scope.row.dataset_tagged / scope.row.dataset_size) * 100).toFixed(2))"
                  />
                  <span>{{ scope.row.dataset_tagged }} / {{ scope.row.dataset_size }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="tag" label="训练状态" align="center"/>
            <el-table-column prop="user_name" label="用户名" align="center"/>
            <el-table-column fixed="right" label="操作" width="300" align="center">
              <template #default="scope">
                <div class="button-container">
                  <!-- 按钮放在这里 -->
                  <el-button type="primary" size="small" plain @click="train(scope.row)"
                             :icon="HelpFilled"
                  >训练
                  </el-button>
                  <!--                  <el-upload-->
                  <!--                    class="upload-demo"-->
                  <!--                    action="/api/v1/data/insert"-->
                  <!--                    :on-success="getTableData"-->
                  <!--                    :data="{-->
                  <!--                      dataset_type: scope.row.dataset_type,-->
                  <!--                      dataset_name: scope.row.dataset_name,-->
                  <!--                      resource: scope.row.id-->
                  <!--                    }"-->
                  <!--                  >-->
                  <el-button
                    type="success"
                    size="small"
                    @click="insertDataset(scope.row)"
                    plain
                    :icon="CirclePlusFilled"
                  >
                    导入
                  </el-button>
                  <!--                    <el-button type="success" size="small" plain :icon="CirclePlusFilled">导入</el-button>-->
                  <!--                  </el-upload>-->
                  <el-button type="warning" size="small" plain @click="handletag(scope.row)"
                             :icon="Grid"
                  >标记
                  </el-button>
                  <el-button type="danger" size="small" plain @click="handleDelete(scope.row)"
                             :icon="DeleteFilled"
                  >删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 扩充新版本的对话框 -->
    <el-dialog v-model="insertdialogVisible" title="扩充数据集" width="600"
               :before-close="handleClose">
      <el-form
        ref="inserteVersionFormRef"
        style="max-width: 600px"
        :model="createVersionForm"
        :rules="createRules"
        label-width="auto"
        class="demo-ruleForm"
        v-loading="isLoading"
        :element-loading-text="loadingTips"
        status-icon
      >
        <el-form-item label="数据集上传">
          <div style="margin-bottom: 15px">
            <el-radio-group v-model="upload_way" size="medium">
              <el-radio-button label="图片上传" value="图片上传"/>
              <el-radio-button label="文件夹上传" value="文件夹上传"/>
              <el-radio-button label="压缩包上传" value="压缩包上传"/>
            </el-radio-group>
          </div>
          <el-upload
            ref="upload"
            action="/api/v1/data/insert"
            :data="{
              dataset_type: inserteVersionForm.dataset_type,
              dataset_name: inserteVersionForm.dataset_name,
              resource: inserteVersionForm.resource
            }"
            :limit="10"
            :on-exceed="handleExceed"
            :auto-upload="false"
            :on-change="onChange"
            :on-success="onSuccess"
            :before-upload="beforeUpload"
            :show-file-list="false"
          >
            <div
              v-if="upload_way == '文件夹上传' && selectedFiles.length > 0"
              style="display: flex; justify-content: left; align-items: center"
            >
              <el-icon color="#67C23A">
                <CircleCheckFilled/>
              </el-icon>
              <span style="padding-left: 5px">已选择：{{ selectedFiles[0].name }}等</span>
              <span style="color: red; padding: 0 5px 0 5px">{{ selectedFiles.length }}</span>
              <span>张图片</span>
            </div>
            <div v-if="upload_way === '图片上传' && selectedFiles.length > 0">
              <el-icon color="#67C23A">
                <CircleCheckFilled/>
              </el-icon>
              <span style="padding-left: 5px">已选择图片：{{ selectedFiles[0].name }}</span>
            </div>

            <!-- 压缩包上传显示 -->
            <div v-if="upload_way === '压缩包上传' && selectedFiles.length > 0">
              <el-icon color="#67C23A">
                <CircleCheckFilled/>
              </el-icon>
              <span style="padding-left: 5px">已选择压缩包：{{ selectedFiles[0].name }}</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span
                style="padding-left: 5px">上传格式支持：zip类型的压缩文件，压缩文件内容全部为图片</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span style="padding-left: 5px">支持图片格式：jpg、jpeg、png、bmp</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span
                style="padding-left: 5px">图片分辨率限制：64px*64px ≤ 图片分辨率 ≤ 7680px*5120px</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span style="padding-left: 5px">支持图片名称长度：1-100字符</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span style="padding-left: 5px">图片名称不可以包含特殊符号$、%、&</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span style="padding-left: 5px">单张图片大小 ≤ 20MB</span>
            </div>

            <template #trigger>
              <div>
                <el-button type="primary" v-if="upload_way == '图片上传'" :loading="isSelecting">
                  选择图片
                </el-button>
                <el-button
                  type="primary"
                  v-if="upload_way == '文件夹上传'"
                  :loading="isSelecting"
                  @click.stop="selectFolder"
                >选择文件夹
                </el-button>
                <el-button type="primary" v-if="upload_way == '压缩包上传'" :loading="isSelecting"
                >选择压缩包
                </el-button
                >
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button class="ml-3" type="primary" :loading="isLoading" @click="confirminsertSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!--  修改数据集名称对话框  -->
    <el-dialog v-model="modifyDialogVisible" title="修改数据集名称" :before-close="handleClose"
               style="width: 500px">
      <el-form ref="newTypeRef" :model="newType" :rules="createTypeRules">
        <el-form-item label=" 训练集：" prop="dataset_type" style="margin-left: 5px">
          <el-input
            v-model="newType.dataset_type"
            placeholder="请输入20字符以内的中英文、数字和下划线"
            style="width: 300px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="modifyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmModifyType" style="margin-left: 15px">修改
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 创建新版本的对话框 -->
    <el-dialog v-model="dialogVisible" title="创建数据集" width="600" :before-close="handleClose">
      <el-form
        ref="createVersionFormRef"
        style="max-width: 600px"
        :model="createVersionForm"
        :rules="createRules"
        label-width="auto"
        class="demo-ruleForm"
        v-loading="isLoading"
        :element-loading-text="loadingTips"
        status-icon
      >
        <el-form-item prop="dataset_name" label="数据集名称">
          <el-input
            v-model="createVersionForm.dataset_name"
            type="text"
            :rows="1"
            placeholder="请输入20字符以内的中英文、数字和下划线"
          />
        </el-form-item>
        <el-form-item label="创建方式" prop="create_way">
          <el-radio-group v-model="createVersionForm.create_way">
            <el-radio label="extend_old">继承已有版本</el-radio>
            <el-radio label="create_new">创建全新版本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="继承来源" prop="resource"
                      v-if="createVersionForm.create_way === 'extend_old'">
          <el-select v-model="createVersionForm.resource" placeholder="请选择一个版本来源">
            <el-option v-for="option in extendOptions" :key="option" :label="option.dataset_name"
                       :value="option.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="数据集上传">
          <div style="margin-bottom: 15px">
            <el-radio-group v-model="upload_way" size="medium">
              <el-radio-button label="图片上传" value="图片上传"/>
              <el-radio-button label="文件夹上传" value="文件夹上传"/>
              <el-radio-button label="压缩包上传" value="压缩包上传"/>
            </el-radio-group>
          </div>
          <el-upload
            ref="upload"
            action="/api/v1/data/creat_dataset"
            :data="{
              dataset_type: createVersionForm.dataset_type,
              dataset_name: createVersionForm.dataset_name,
              resource: createVersionForm.resource
            }"
            :limit="10"
            :on-exceed="handleExceed"
            :auto-upload="false"
            :on-change="onChange"
            :on-success="onSuccess"
            :before-upload="beforeUpload"
            :show-file-list="false"
          >
            <div
              v-if="upload_way == '文件夹上传' && selectedFiles.length > 0"
              style="display: flex; justify-content: left; align-items: center"
            >
              <el-icon color="#67C23A">
                <CircleCheckFilled/>
              </el-icon>
              <span style="padding-left: 5px">已选择：{{ selectedFiles[0].name }}等</span>
              <span style="color: red; padding: 0 5px 0 5px">{{ selectedFiles.length }}</span>
              <span>张图片</span>
            </div>
            <div v-if="upload_way === '图片上传' && selectedFiles.length > 0">
              <el-icon color="#67C23A">
                <CircleCheckFilled/>
              </el-icon>
              <span style="padding-left: 5px">已选择图片：{{ selectedFiles[0].name }}</span>
            </div>

            <!-- 压缩包上传显示 -->
            <div v-if="upload_way === '压缩包上传' && selectedFiles.length > 0">
              <el-icon color="#67C23A">
                <CircleCheckFilled/>
              </el-icon>
              <span style="padding-left: 5px">已选择压缩包：{{ selectedFiles[0].name }}</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span
                style="padding-left: 5px">上传格式支持：zip类型的压缩文件，压缩文件内容全部为图片</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span style="padding-left: 5px">支持图片格式：jpg、jpeg、png、bmp</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span
                style="padding-left: 5px">图片分辨率限制：64px*64px ≤ 图片分辨率 ≤ 7680px*5120px</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span style="padding-left: 5px">支持图片名称长度：1-100字符</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span style="padding-left: 5px">图片名称不可以包含特殊符号$、%、&</span>
            </div>
            <div style="display: flex; justify-content: left; align-items: center">
              <el-icon color="#E6A23C">
                <WarningFilled/>
              </el-icon>
              <span style="padding-left: 5px">单张图片大小 ≤ 20MB</span>
            </div>

            <template #trigger>
              <div>
                <el-button type="primary" v-if="upload_way == '图片上传'">选择图片</el-button>
                <el-button
                  type="primary"
                  v-if="upload_way == '文件夹上传'"
                  :loading="isSelecting"
                  @click.stop="selectFolder"
                >
                  选择文件夹
                </el-button>
                <el-button type="primary" v-if="upload_way == '压缩包上传'">选择压缩包</el-button>
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button class="ml-3" type="primary" :loading="isLoading" @click="confirmSubmit">确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!--  训练提示对话框  -->
    <el-dialog v-model="statusDialogVisible" :show-close="false" width="600px">
      <template #header="{ close, titleId, titleClass }">
        <div class="dialog-header">
          <div style="display: flex; justify-content: left; align-items: center">
            <el-icon color="#E6A23C" :size="22">
              <WarnTriangleFilled/>
            </el-icon>
            <span style="padding-left: 5px">未达到训练要求，训练发起失败</span>
          </div>
          <el-icon color="#909399" @click="close">
            <Close/>
          </el-icon>
        </div>
      </template>
      <div class="content-box">
        <div class="tips-box">
          <div>训练要求</div>
          <div style="display: flex; justify-content: left; align-items: center">
            <el-icon color="#F56C6C">
              <WarningFilled/>
            </el-icon>
            <span style="padding: 5px">至少有1个检测标签下的目标数≥10个</span>
          </div>
          <div style="display: flex; justify-content: left; align-items: center">
            <el-icon color="#F56C6C">
              <WarningFilled/>
            </el-icon>
            <span style="padding: 5px">目标数≥10个的所有检测标签下的图片总数≥10张</span>
          </div>
          <div style="display: flex; justify-content: left; align-items: center">
            <el-icon color="#F56C6C">
              <WarningFilled/>
            </el-icon>
            <span style="padding: 5px">在标记中保存标记信息</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
#data_manage {
  margin: 20px;
  background-color: #fff;
}

.data_card {
  margin: 15px 0 15px 0;
  padding: 15px 0 15px 0;
  border: 1px solid lightgray;
  border-radius: 8px;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #409eff;
  }

  .data_table {
    padding: 0 20px 0 20px;
  }

  .form_header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .form_left {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .el-table {
    margin-top: 10px;
  }
}

.el-card__body {
  padding: var(--el-card-padding);
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.actions {
  display: flex;
  align-items: center;
}

.actions .el-button {
  margin-left: auto; /* Adjust as needed */
}

.search-form {
  margin-bottom: 0;
  align-self: center;
  margin-right: auto; /* 将右侧空间填满 */
}

.create-button {
  margin-top: auto;
  margin-left: auto; /* 将左侧空间填满 */
  margin-bottom: 18px;
}

.createDialog {
  width: 200px;
}

.image-gallery {
  display: flex;
  justify-content: space-between; /* 维持原来的 space-between 以保持右侧对齐 */
  margin-left: 15px;
  max-width: calc(100% - 0px); /* 调整总宽度来考虑左边距，可能需要根据实际情况调整 */
}

.image-container {
  text-align: center;
  flex-grow: 1;
}

.image-caption {
  color: grey;
  font-size: 13px;
  line-height: 1.5;
  max-width: 180px; /* 限制最大宽度，根据需要调整数值 */
}

.image-name {
  font-weight: bold;
  font-family: Arial, sans-serif;
  margin-bottom: 5px;
}

.image-name {
  font-weight: bold;
  margin-left: 10px;
  white-space: nowrap;
  font-size: 13px; /* Adjust the font size as needed */
}

.input-with-icon {
  position: relative;
  display: inline-block; /* 或者其他合适的布局方式 */
}

.input-with-icon .search {
  width: 100%; /* 或根据需要调整 */
}

.input-with-icon .search_icon {
  position: absolute;
  right: 10px; /* 可以根据需要调整，来放置在输入框内合适的位置 */
  top: 50%;
  transform: translateY(-50%);
  color: #bfbfbf; /* 这里可以设置图标颜色 */
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-container .el-button {
  margin: 0 5px;
  //max-width: 80px;
}

.upload-demo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: -16px;
}

.content-box {
  margin-top: -20px;

  .tips-box {
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 5px;
    background-color: rgb(216, 230, 241);
    font-size: 14px;

    div:first-child {
      font-size: 16px;
      margin-bottom: 5px;
    }
  }
}

.upload_button_style {
  margin-bottom: 15px;
}

.upload_button_style .el-button {
  background-color: #fff;
  border: 1px solid #c8c8c8;
  width: 120px;
  height: 36px;
  border-radius: 8px;
}

.upload_button_style .button_click_style {
  border: 2px solid #98f5ff;
  color: black;
}
</style>
