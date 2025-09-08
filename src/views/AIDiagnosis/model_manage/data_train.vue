<template>
  <div class="app-container">
    <el-card style="min-height: 80vh">
      <span style="font-size: 20px; margin: 10px; font-weight: 700">YOLOv5 train</span>训练用户自定义数据
      <!-- 步骤条 -->
      <el-steps
        :active="activeStep"
        finish-status="success"
        style="width: 80%; margin-left: 10%; margin-bottom: 40px; margin-top: 40px"
      >
        <el-step title="创建模型" :icon="Coin" />
        <el-step title="设置训练参数" :icon="EditPen" />
        <el-step title="开始训练" :icon="Tools" />
        <el-step title="发布" :icon="Finished" />
      </el-steps>
      <!-- 步骤内容 -->
      <div class="content">
        <div v-if="activeStep === 0">
          <!-- 步骤一的内容 -->
          <p>选择要训练的模型</p>
          <!-- 表单 -->
          <div style="margin: 20px">
            <el-form :model="form1" label-width="100px" style="margin-right: 95px">
              <el-form-item label="模型：">
                <el-select
                  v-model="form1.Model_value"
                  placeholder="请选择"
                  size="large"
                  style="width: 240px"
                  @change="choise_model"
                >
                  <el-option v-for="item in Models_options" :key="item.value" :label="item.label" :value="item" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <el-button
            type="primary"
            style="width: 240px; height: 35px; border-radius: 15px"
            @click="nextStep1"
            :disabled="!isStep1Completed"
            >下一步</el-button
          >
        </div>
        <div v-if="activeStep === 1">
          <!-- 步骤二的内容 -->
          <p>设置训练参数</p>
          <div>
            <el-form ref="form" :model="form2" label-width="100px" style="margin-right: 95px">
              <el-form-item label="训练方法：">
                <el-select v-model="form2.Weight_value1" placeholder="请选择" size="large" style="width: 240px">
                  <el-option
                    v-for="item in Weights_options"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="数据集：">
                <el-cascader
                  v-model="form2.Dataset_value2"
                  :options="Datasets_options"
                  placeholder="请选择"
                  size="large"
                  :props="prop"
                  style="width: 240px"
                  @change="handleChange"
                  :disabled="isDefault"
                />
              </el-form-item>
              <el-form-item label="训练轮数：">
                <el-input v-model="form2.Epoch_value3" style="width: 240px" placeholder="请输入" />
              </el-form-item>
            </el-form>
          </div>
          <el-button type="primary" @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep" :disabled="!isStep2Completed">下一步</el-button>
        </div>
        <div v-if="activeStep === 2">
          <!-- 步骤三的内容 -->
          <p>开始训练</p>
          <div class="data-log-container">
            <div class="data">
              <!-- Data 的内容 -->
              <div class="model">
                <el-form :model="form1" label-width="100px">
                  <el-form-item label="模型：">
                    <el-text type="success" size="large">
                      {{ createModelForm.model_name }}
                    </el-text>
                  </el-form-item>
                </el-form>
              </div>
              <el-form ref="form" :model="form2" label-width="100px">
                <el-form-item label="训练方法：">
                  <el-text type="success" size="large">
                    {{ form2.Weight_value1 }}
                  </el-text>
                </el-form-item>
                <el-form-item label="数据集：">
                  <el-text type="success" size="large">
                    {{ createVersionForm.datasetName }}
                  </el-text>
                </el-form-item>
                <el-form-item label="训练轮数：">
                  <el-text type="success" size="large">
                    {{ form2.Epoch_value3 }}
                  </el-text>
                </el-form-item>
              </el-form>
            </div>
            <div class="log">
              <div class="demo-progress">
                <el-progress type="circle" :percentage="progressData" :status="progressStatus" />
              </div>
            </div>
          </div>
          <el-button type="primary" @click="prevStep1">上一步</el-button>
          <el-button type="primary" @click="finish">训练</el-button>
          <el-button type="primary" @click="nextStep" :disabled="createModelForm.is_train === 0">下一步</el-button>
        </div>
        <div v-if="activeStep === 3">
          <!--            步骤四-->
          <p>发布</p>
          <div>
            <div>
              <el-form ref="locationFormRef" :model="locationForm" label-width="100px" style="margin-right: 95px">
                <el-form-item label="区域筛选：">
                  <el-cascader
                    v-model="locationForm.location"
                    :options="location_options"
                    placeholder="请选择区域"
                    size="large"
                    :props="prop"
                    style="width: 240px"
                    @change="handleLocationChange"
                  />
                </el-form-item>
              </el-form>
            </div>
            <!--区域筛选多选框-->
            <div class="choose2" v-if="locationForm.location !== ''">
              <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange"
                >全选</el-checkbox
              >
              <el-checkbox-group v-model="checkedCameras" @change="handleCheckedCamerasChange">
                <el-checkbox
                  v-for="camera in cameras"
                  :key="camera.cameraID"
                  :label="camera.cameraName"
                  :value="camera.cameraID"
                  >{{ camera.cameraName }}</el-checkbox
                >
              </el-checkbox-group>
            </div>
          </div>
          <el-button type="primary" @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="backmain">暂不发布</el-button>
          <el-button type="primary" :loading="loading" @click="confirmPublishfirst">发布</el-button>
        </div>
      </div>
    </el-card>
    <!-- 发布进度对话框 -->
    <el-dialog
      v-model="publishDialogVisible"
      title="发布进度"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="publish-row">
        <el-progress type="circle" :percentage="publishProgress" :status="publishStatus" />
        <div class="publish-text">
          <div class="publish-title">{{ publishMessage }}</div>
          <div class="publish-detail">{{ publishDetail }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="closePublishDialog" :disabled="publishStatus === ''">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script script lang="ts" setup>
import { reactive, ref, computed } from "vue"
import { ElMessage } from "element-plus"
import { EditPen, Coin, Tools, Finished } from "@element-plus/icons-vue"
import {
  getAllEnableallApi,
  getCurrentDatasetsApi,
  switchWeightsApi,
  listlocationDataApi,
  listcameraDataApi,
  getAllEnableModelApi,
  startPublishTaskApi,
  getPublishProgressApi
} from "@/api/train"
import { type IWeightsData, type IModelsData, type IDatasetsData, IlistareaRequestData } from "@/api/train/types/train"
import router from "@/router"

// 步骤2中的表单
const form2 = ref<any>({
  Weight_value1: "", // 权重的选择
  Dataset_value2: {
    value: "",
    label: ""
  }, // 数据集的选择
  Epoch_value3: "", // 参数配置的选择
  Yaml_value4: "" // 训练轮数
})
// 步骤条
const activeStep = ref<any>(0)
let timer: string | number | NodeJS.Timeout | undefined
const nextStep = () => {
  if (activeStep.value < 3) activeStep.value++
}

const isDefault = ref<boolean>(false)
const nextStep1 = () => {
  createModelForm.from_data = localStorage.getItem("createModelForm.from_data")
  createModelForm.datasetID = localStorage.getItem("createModelForm.datasetID")
  createModelForm.datatypeID = localStorage.getItem("createModelForm.datatypeID")
  localStorage.removeItem("createModelForm.from_data")
  localStorage.removeItem("createModelForm.datasetID")
  localStorage.removeItem("createModelForm.datatypeID")
  console.log("createModelForm.from_data", createModelForm.from_data)
  console.log("createModelForm.datasetID", createModelForm.datasetID)
  console.log("createModelForm.datatypeID", createModelForm.datatypeID)
  if (createModelForm.from_data == 1) {
    Datasets_options.value.forEach((item: any) => {
      if (item.value == createModelForm.datatypeID) createVersionForm.datasetName = item.label
      item.children.forEach((child: any) => {
        if (child.value == createModelForm.datasetID)
          createVersionForm.datasetName = createVersionForm.datasetName + "-" + child.label
      })
    })
    form2.value.Dataset_value2 = [Number(createModelForm.datatypeID), Number(createModelForm.datasetID)]
    if (form2.value.Dataset_value2) {
      isDefault.value = true
    }
    getCurrentDatasetsApi({
      DatasetID: createModelForm.datasetID
    }).then((_res: any) => {})
  }
  if (activeStep.value < 3) activeStep.value++
}
const prevStep1 = () => {
  if (activeStep.value == 3) activeStep.value--
  else {
    activeStep.value -= 2
  }
  progressData.value = 0
  progressStatus.value = ""
  clearInterval(timer)
}

const prevStep = () => {
  if (activeStep.value > 0) activeStep.value--
}

const loading = ref<boolean>(false)
const modelsData = ref<IModelsData[]>([])
const weightsData = ref<IWeightsData[]>([])
const datasetsData = ref<IDatasetsData[]>([])
const Models_options = ref<{ value: string; label: string }[]>([])
const Datasets_options = ref<any>()
const Weights_options = ref<{ value: string; label: string }[]>([])
const createVersionForm = reactive({
  create_way: "extend_old", // 创建方式  默认第一个
  resource: "", // 继承来源
  weight_id: "",
  model_id: "",
  user_id: "",
  datasetName: ""
})

// 对话框表单
const createModelForm = reactive<any>({
  model_name: "", // 模型名称
  model_type: "", // 模型类型
  version_remark: "", // 版本备注
  model_id: "",
  weight_id: "",
  user_id: "",
  datasetID: "",
  datatypeID: "",
  table_flag: "",
  flag: 0,
  is_train: 0,
  from_data: 0
})

// 重置表单
const _resetModelForm = () => {
  // createVersionForm.create_way = '';
  createModelForm.model_name = ""
  createModelForm.model_type = ""
  createModelForm.version_remark = ""
  createModelForm.model_id = ""
  createModelForm.weight_id = ""
  createModelForm.user_id = ""
  createModelForm.datasetID = ""
  createModelForm.datatypeID = ""
  createModelForm.table_flag = ""
  createModelForm.flag = 0
  createModelForm.is_train = 0
  createModelForm.from_data = 0
  createModelForm.is_next = 0
}

// 步骤2中的表单
const Resetform2 = () => {
  form2.value.Weight_value1 = "" // 权重的选择
  form2.value.Dataset_value2 = "" // 数据集的选择
  form2.value.Epoch_value3 = "" // 参数配置的选择
  console.log(createModelForm)
  createModelForm.is_train = 0
  createModelForm.from_data = 0
  createModelForm.datasetID = ""
  createModelForm.datatypeID = ""
  isDefault.value = false
}

// 生成下拉菜单的选项
const generateModelsOptions = (list: IModelsData[]) => {
  const options = ref<{ value: string; label: string; id: number }[]>([])
  const map: { [key: string]: { value: string; label: string; id: number } } = {}
  list.forEach((item) => {
    const functions = item.ModelName
    const name = item.ModelID
    const id = item.user_id
    if (!map[functions]) {
      map[functions] = {
        value: name,
        label: functions,
        id: id
      }
      options.value.push(map[functions])
    }
  })
  return options.value
}
// 生成下拉菜单的选项
const generateWeightsOptions = (list: IWeightsData[]) => {
  const options: { value: string; label: string }[] = []
  const map: { [key: string]: { value: string; label: string } } = {}
  list.forEach((item) => {
    const name = item.WeightsName
    const functions = item.WeightsID
    if (!map[functions]) {
      map[functions] = {
        value: name,
        label: functions
      }
      options.push(map[functions])
    }
  })
  return options
}
// 生成下拉菜单的选项
const generateDatasetsOptions = (list: IDatasetsData[]) => {
  const options: { value: string; label: string; children: { value: string; label: string }[] }[] = []
  const map: { [key: string]: { value: string; label: string; children: { value: string; label: string }[] } } = {}
  list.forEach((item: any) => {
    const DatasetsName = item.DatasetsName
    const DatasetsID = item.DatasetsID
    if (!map[DatasetsName]) {
      map[DatasetsName] = {
        value: DatasetsID,
        label: DatasetsName,
        children: []
      }
    }
    if (item.children.length > 0) {
      item.children.forEach((child: any) => {
        map[DatasetsName].children.push({
          value: child.dataset_id,
          label: child.dataset_name
        })
      })
    }
    options.push(map[DatasetsName])
  })
  return options
}

// 下拉菜单的展开方式
interface CascaderProps {
  expandTrigger?: "click" | "hover"
}

const prop: CascaderProps = {
  expandTrigger: "hover" as const
}

const getModelEnableWeights = () => {
  Resetform2()
  getAllEnableModelApi().then((res: any) => {
    modelsData.value = res.data.list
    Models_options.value = generateModelsOptions(res.data.list)
  })
}

const choise_model = (model: any) => {
  createModelForm.model_name = model.label
  createModelForm.model_id = model.value
  createModelForm.user_id = model.id
  const message = `已选择模型： ${model.label}`
  ElMessage({
    message: message,
    type: "success"
  })
  handleold()
}

// 下拉菜单的选择事件
const handleChange = (dataset: any) => {
  Datasets_options.value.forEach((item: any) => {
    if (item.value == dataset[0]) createVersionForm.datasetName = item.label
    item.children.forEach((child: any) => {
      if (child.value == dataset[1]) createVersionForm.datasetName = createVersionForm.datasetName + "-" + child.label
    })
  })
  createModelForm.datasetID = dataset[1]
  getCurrentDatasetsApi({
    DatasetID: dataset[1]
  }).then((res: any) => {
    if (res.code == 0) {
      createModelForm.is_train = 1
      ElMessage({
        message: res.message,
        type: "success"
      })
    } else {
      createModelForm.is_train = 0
      ElMessage({
        message: res.message,
        type: "warning"
      })
    }
  })
}

getModelEnableWeights()

const handleold = () => {
  form2.value.Weight_value1 = ""
  getAllEnableallApi({
    model_id: form1.value.Model_value.value
  })
    .then((res: any) => {
      console.log("Models_options: ", Models_options)
      datasetsData.value = res.data.list.dataset
      Datasets_options.value = generateDatasetsOptions(res.data.list.dataset)
      console.log(Datasets_options.value)
      weightsData.value = res.data.list.weight
      Weights_options.value = generateWeightsOptions(res.data.list.weight)
    })
    .catch(() => {
      modelsData.value = []
      datasetsData.value = []
      weightsData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const backmain = () => {
  router.push({ path: "/models/model_manage" })
}

// 发布进度对话框与轮询
const publishDialogVisible = ref(false)
const publishProgress = ref(0)
const publishStatus = ref<"" | "success" | "warning" | "exception">("")
const publishMessage = ref("准备中...")
const publishDetail = ref("")
let publishTimer: string | number | NodeJS.Timeout | undefined
let currentTaskId: string | null = null

const closePublishDialog = () => {
  publishDialogVisible.value = false
}

// 确认发布（带进度显示）
const confirmPublishfirst = async () => {
  if (!createModelForm.weight_id) {
    ElMessage.error("请先完成训练，获取权重后再发布")
    return
  }
  if (!checkedCameras.value || checkedCameras.value.length === 0) {
    ElMessage.error("请先选择需要发布的摄像机")
    return
  }
  loading.value = true
  publishProgress.value = 1
  publishStatus.value = ""
  publishMessage.value = "任务启动中..."
  publishDetail.value = ""
  publishDialogVisible.value = true
  try {
    const res: any = await startPublishTaskApi({
      WeightID: createModelForm.weight_id,
      selectcamera: checkedCameras.value
    })
    if (res.code !== 0) {
      throw new Error(res.message || "发布任务启动失败")
    }
    currentTaskId = res.data.task_id
    publishTimer = setInterval(async () => {
      try {
        if (!currentTaskId) return
        const prog: any = await getPublishProgressApi(currentTaskId)
        if (prog.code !== 0) return
        const data = prog.data
        publishProgress.value = Math.min(100, Number(data.progress || 0))
        publishMessage.value = data.message || "执行中..."
        publishDetail.value = data.detail || ""
        if (data.status === "success") {
          clearInterval(publishTimer)
          publishStatus.value = "success"
          loading.value = false
          ElMessage.success(data.message || "发布成功")
        } else if (data.status === "error") {
          clearInterval(publishTimer)
          publishStatus.value = "exception"
          loading.value = false
          ElMessage.error(data.message || "发布失败")
        } else {
          publishStatus.value = ""
        }
      } catch (e: any) {
        clearInterval(publishTimer)
        publishStatus.value = "exception"
        loading.value = false
        ElMessage.error(e?.message || "发布进度查询失败")
      }
    }, 2000)
  } catch (err: any) {
    loading.value = false
    publishStatus.value = "exception"
    ElMessage.error(err?.message || "发布请求失败")
  }
}

// const confirmPublishfirst = () => {
//   publishWeightDataApi({
//     WeightID: createModelForm.weight_id,
//     selectcamera: checkedCameras.value
//   }).then((res: any) => {
//     if (res.code == 1) {
//       ElMessage({
//         message: res.message,
//         type: "success"
//       })
//     } else {
//       ElMessage({
//         message: res.message,
//         type: "error"
//       })
//     }
//   })
// }
// 多选框
const checkAll = ref(false)
const isIndeterminate = ref(true)
const checkedCameras = ref()
const cameras = ref<any>()

const handleCheckAllChange = (val: any) => {
  const checked = Boolean(val)
  checkedCameras.value = checked ? cameras : []
  isIndeterminate.value = false
}
const handleCheckedCamerasChange = (value: any[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === cameras.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < cameras.value.length
}

const isTrained = ref(false)
// 模型列表展示
const isExpand = ref<boolean>(false)
const currentModelIdx = ref<number>()

const _toggleExpand = (idx: number) => {
  isExpand.value = !isExpand.value
  currentModelIdx.value = idx
}

// 表单
const locationForm = ref({
  location: ""
})

const location_options = ref<any>()

// 区域筛选好，下方进行调整 对camera进行赋值
const handleLocationChange = (row: any) => {
  listcameraDataApi({
    location_id: row[0]
  }).then((res: any) => {
    cameras.value = res.data.list
    ElMessage({
      message: res.message,
      type: "success"
    })
  })
}

// 生成下拉菜单的选项
const generateAreasOptions = (list: IlistareaRequestData[]) => {
  const options: { value: string; label: string }[] = []
  const map: { [key: string]: { value: string; label: string } } = {}
  list.forEach((item) => {
    const functions = item.locationName
    const name = item.locationID
    if (!map[functions]) {
      map[functions] = {
        value: name,
        label: functions
      }
      options.push(map[functions])
    }
  })
  return options
}

const finish = () => {
  progressData.value = 0
  progressStatus.value = ""
  //控制进度条
  timer = setInterval(function () {
    if (progressData.value < 98) {
      progressData.value += 1
    }
  }, 1000)

  switchWeightsApi({
    WeightID: 0,
    ModelID: createModelForm.model_id,
    DatasetID: createModelForm.datasetID,
    YamlName: form2.value.Yaml_value4,
    WeightName: form2.value.Weight_value1,
    Epoch: form2.value.Epoch_value3,
    user_id: createModelForm.user_id,
    create_way: createVersionForm.create_way
  })
    .then((res: any) => {
      console.log(res)
      createModelForm.weight_id = res.data
      //进度条值为100
      progressData.value = 100
      createModelForm.is_train = 1
      ElMessage({
        message: res.message,
        type: "success"
      })
      listlocationDataApi({
        WeightID: createModelForm.weight_id
      }).then((res: any) => {
        location_options.value = generateAreasOptions(res.data.list)
      })
      if (progressData.value == 100) {
        progressStatus.value = "success"
        activeStep.value = 3
        isTrained.value = true
      }
    })
    .catch(() => {
      clearInterval(timer)
      progressStatus.value = "exception"
      ElMessage({
        message: `训练失败！`,
        type: "warning"
      })
    })
}
// 表单
// 步骤1中的表单
// const Model_value = ref('')
const form1 = ref({
  Model_value: {
    value: "",
    label: "",
    id: ""
  }
})
// 计算属性来判断步骤 1 是否完成,未完成不可以点击下一步
const isStep1Completed = computed(() => {
  return form1.value.Model_value.value !== "" // 确保用户已选择一个选项
})
// 计算属性来判断步骤 2 是否完成,未完成不可以点击下一步
const isStep2Completed = computed(() => {
  return form2.value.Weight_value1 !== "" && form2.value.Dataset_value2.value !== "" && form2.value.Epoch_value3 !== ""
})

const progressData = ref(0)
const progressStatus = ref<"" | "success" | "warning" | "exception">("")
</script>

<style scoped>
.publish-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.publish-text {
  flex: 1;
  text-align: left;
}
.publish-title {
  font-weight: 600;
  margin-bottom: 6px;
}
.publish-detail {
  color: #909399;
  white-space: pre-wrap;
}
.app-container {
  width: 100%; /* 或其他固定宽度 */
  margin: 0 auto; /* 水平居中 */
}

.el-steps {
  width: 80%;
  margin-left: 10%;
  margin-bottom: 40px;
  margin-top: 40px;
}

.content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中 */
  justify-content: center; /* 如果需要垂直居中也可以添加这一行 */
  min-width: 100%;
  text-align: center;
}

.el-button {
  width: 110px;
  height: 35px;
  border-radius: 15px;
}

/* 适用于并排显示的容器 */
.data-log-container {
  display: flex;
  width: 100%; /* 使其填满.content的宽度 */
  margin: 0 auto; /* 如果需要，确保居中 */
}

.data,
.log {
  flex: 1; /* 让这两个元素平分可用空间 */
  margin: 20px;
}

/* 如果 .app-container 或其他外层容器限制了宽度，确保它们也被设置为100%或适当的宽度 */
.app-container {
  max-width: 100%; /* 移除任何可能的最大宽度限制 */
}

.search-wrapper {
  margin-bottom: 20px;
  height: 84.2vh; /* 使用视口高度作为高度 */
  width: 100%; /* 使用百分比作为宽度 */
}

/* 使用 :deep 伪类时注意，不同浏览器的支持情况可能有所不同 */
/* 在最新版本的 Chrome 中，可以直接使用 ::v-deep */
/* 在老版本的 Vue 中，可以使用 /deep/ */
.search-wrapper ::v-deep .el-card__body {
  padding-bottom: 2px;
}

/*进度条*/
.demo-progress {
  margin: 50px;
}
</style>
