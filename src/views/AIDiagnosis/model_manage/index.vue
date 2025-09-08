<script lang="ts" setup>
import {reactive, ref, computed, watch} from "vue"
import {createModelDataApi, deleteModelDataApi, getModelDataApi, updateModelDataApi} from "@/api/model"
import {type IGetModelData} from "@/api/model/types/data"
import {ElMessage, ElMessageBox, ElTable, ElTableColumn} from "element-plus"
import {
  CirclePlus,
  Delete,
  EditPen,
  Plus,
  Coin,
  Tools,
  Finished,
  Files,
  More,
  ArrowDown,
  ArrowRight,
  Clock,
  Promotion,
  Histogram,
  DeleteFilled,
  CirclePlusFilled
} from "@element-plus/icons-vue"
import {usePagination} from "@/hooks/usePagination"
import {
  getAllEnableallApi,
  getCurrentDatasetsApi,
  switchWeightsApi,
  deleteWeightDataApi,
  listlocationDataApi,
  listcameraDataApi,
  startPublishTaskApi,
  getPublishProgressApi
} from "@/api/train"
import {type IWeightsData, type IModelsData, type IDatasetsData, IlistareaRequestData} from "@/api/train/types/train"
import router from "@/router"
import SvgIcon from "@/components/SvgIcon/index.vue"
import {useRoute} from "vue-router"

const loading = ref<boolean>(false)
const modelsData = ref<IModelsData[]>([])
const weightsData = ref<IWeightsData[]>([])
const datasetsData = ref<IDatasetsData[]>([])
const Models_options = ref<{ value: string; label: string; id: number }[]>([])
const Datasets_options = ref<any>([])
const Weights_options = ref<{ value: string; label: string }[]>([])
const statusDialogVisible = ref<boolean>(false)
const {paginationData, handleCurrentChange, handleSizeChange} = usePagination()
let timer: string | number | NodeJS.Timeout | undefined

// 第一次训练加步骤条
// 步骤条
const activeStep = ref<any>(0)
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

  if (createModelForm.from_data == 1) {
    Datasets_options.value.forEach((item: any) => {
      if (item.value == createModelForm.datatypeID) createVersionForm.datasetName = item.label
      item.children.forEach((child: any) => {
        if (child.value == createModelForm.datasetID)
          createVersionForm.datasetName = createVersionForm.datasetName + "-" + child.label
      })
    })
    console.log("createVersionForm.datasetName", createVersionForm.datasetName, createModelForm.datasetID)
    form2.value.Dataset_value2 = [Number(createModelForm.datatypeID), Number(createModelForm.datasetID)]
    if (form2.value.Dataset_value2) {
      isDefault.value = true
      createModelForm.is_train = 1
    }
    getCurrentDatasetsApi({
      DatasetID: createModelForm.datasetID
    }).then((res: any) => {
    })
  }
}
const prevStep1 = () => {
  if (activeStep.value == 2) activeStep.value--
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

// 计算属性来判断步骤 1 是否完成,未完成不可以点击下一步
const isStep1Completed = computed(() => {
  return createModelForm.model_name !== "" // 确保用户已选择一个选项
})

// 计算属性来判断步骤 2 是否完成,未完成不可以点击下一步
const isStep2Completed = computed(() => {
  return form2.value.Weight_value1 !== "" && form2.value.Dataset_value2 !== "" && form2.value.Epoch_value3 !== ""
})

// 计算属性来判断步骤 2 是否完成,未完成不可以点击下一步
const isSecondCompleted = computed(() => {
  return form2.value.Dataset_value2 !== "" && form2.value.Epoch_value3 !== ""
})

// 计算属性来判断步骤 2 是否完成,未完成不可以点击下一步
const isFirstCompleted = computed(() => {
  return (
    (form1.value.Model_value !== "" &&
      form2.value.Dataset_value2 !== "" &&
      form2.value.Epoch_value3 !== "" &&
      createVersionForm.create_way === "extend_old") ||
    (form2.value.Weight_value1 !== "" &&
      form2.value.Dataset_value2 !== "" &&
      form2.value.Epoch_value3 !== "" &&
      createVersionForm.create_way === "create_new")
  )
})

const isTraining = ref(false)

const finish = () => {
  isTraining.value = true
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
      createModelForm.is_next = 1
      ElMessage({
        message: res.message,
        type: "success"
      })
      isTraining.value = false
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
//#region 查
const tableData = ref<IGetModelData[]>([])

const searchData = reactive({
  model_name: "",
  model_datetime: ""
})

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

//按页获取表中数据
const getTableData = () => {
  loading.value = true
  getModelDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    model_name: searchData.model_name || undefined,
    model_datetime: searchData.model_datetime || undefined
  })
    .then((res) => {
      paginationData.total = res.data.total

      tableData.value = res.data.list
      console.log("getTableData", tableData.value.length)
      createModelForm.flag = 1
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

// 创建模型对话框是否可见

const modelDialogVisible = ref<boolean>(false)
// 修改模型对话框是否可见
const alterModelDialogVisible = ref<boolean>(false)
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
  from_data: 0,
  is_next: 0
})

// 重置表单
const resetModelForm = () => {
  // createVersionForm.create_way = '';
  createModelForm.model_name = ""
  createModelForm.model_type = ""
  createModelForm.version_remark = ""
}

// 创建模型
const createModel = () => {
  resetModelForm()
  // 对话框显示
  modelDialogVisible.value = true
}

// 创建新版本
const createType = (row: any) => {
  createModelForm.model_id = row.id
  createModelForm.user_id = row.user_id
  createModelForm.model_name = row.model_name
  // 根据id判断是哪个数据集要创建新版本
  // 清空表单
  resetForm()
  Resetform2()

  // 进度条重置
  progressData.value = 0
  progressStatus.value = ""
  clearInterval(timer)
  getAllEnableallApi({
    model_id: row.id
  })
    .then((res: any) => {
      modelsData.value = res.data.list.model
      Models_options.value = generateModelsOptions(res.data.list.model)

      datasetsData.value = res.data.list.dataset
      Datasets_options.value = generateDatasetsOptions(res.data.list.dataset)

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
  // 对话框可见
  dialogVisible.value = !dialogVisible.value
}

const first_create = () => {
  console.log("first_create")
  // 进度条重置
  progressData.value = 0
  progressStatus.value = ""
  clearInterval(timer)
  getAllEnableallApi({
    model_id: createModelForm.model_id
  })
    .then((res: any) => {
      modelsData.value = res.data.list.model
      Models_options.value = generateModelsOptions(res.data.list.model)

      datasetsData.value = res.data.list.dataset
      Datasets_options.value = generateDatasetsOptions(res.data.list.dataset)
      console.log("Datasets_options.value", Datasets_options.value)
      weightsData.value = res.data.list.weight
      Weights_options.value = generateWeightsOptions(res.data.list.weight)
      nextStep1()
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

// 修改新版本
const changeType = (row: any) => {
  // 根据id判断是哪个数据集要创建新版本
  // 清空表单
  resetForm()
  createModelForm.model_type = row.model_type
  createModelForm.model_name = row.model_name
  createModelForm.version_remark = row.version_remark
  createModelForm.user_id = row.user_id
  createModelForm.model_id = row.id
  // 对话框可见
  alterModelDialogVisible.value = true
}

// 创建新版本
const deleteType = (row: { model_name: string; id: string }) => {
  ElMessageBox.confirm(`正在删除模型：${row.model_name}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteModelDataApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}

// 路由信息
const route = useRoute()
const datasetID = route.query?.datasetID

// 创建新版本对话框是否可见
const dialogVisible = ref<boolean>(Boolean(datasetID))
// 对话框表单
const createVersionForm = reactive<any>({
  create_way: "extend_old", // 创建方式  默认第一个
  resource: "", // 继承来源
  weight_id: "",
  model_id: "",
  user_id: "",
  datasetName: ""
})

const selectcameraForm = reactive({
  weight_id: ""
})

// 重置表单
const resetForm = () => {
  createVersionForm.create_way = "extend_old" //默认选中第一个
  createVersionForm.resource = ""
}
const createVersionFormRef = ref(null)
// 创建的规则
const createRules = {
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
const handleClose = (done: () => void) => {
  dialogVisible.value = false
  // ElMessageBox.confirm("确定要关闭吗？")
  //   .then(() => {
  //     dialogVisible.value = false
  //   })
  //   .catch(() => {
  //     // catch error
  //   })
}

// 创建的规则
const createModelRules = {
  model_name: [
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
  model_type: [
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
  ]
}

const createModelFormRef = ref<any>()
const alterModelFormRef = ref<any>()

const confirmCreateModel = () => {
  Resetform2()
  console.log(createModelForm)
  createModelFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 验证通过
      modelDialogVisible.value = false
      // 这里进行后续逻辑处理
    } else {
      ElMessage.error("请检查输入项是否符合要求")
    }
  })
  console.log(Datasets_options.value)
  createModelDataApi({
    model_type: createModelForm.model_type,
    model_name: createModelForm.model_name,
    model_tips: createModelForm.version_remark
  }).then((res: any) => {
    createModelForm.model_id = res.data.ID
    createModelForm.user_id = res.data.user_id
    if (res.code === 0) {
      ElMessage.success("新增模型成功")
      dialogVisible.value = false
      first_create()
      if (activeStep.value < 3) activeStep.value++
      if (tableData.value.length != 0) {
        getTableData()
      }
    } else {
      ElMessage.error(res.message)
    }
  })
  console.log(Datasets_options.value)
}

const confirmUpdateModel = () => {
  alterModelFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 验证通过
      alterModelDialogVisible.value = false
      // 这里进行后续逻辑处理
    } else {
      ElMessage.error("请检查输入项是否符合要求")
    }
  })
  updateModelDataApi({
    user_id: createModelForm.user_id,
    model_id: createModelForm.model_id,
    model_type: createModelForm.model_type,
    model_name: createModelForm.model_name,
    model_tips: createModelForm.version_remark
  }).then((res: any) => {
    if (res.code === 0) {
      ElMessage.success(res.message)
      getTableData()
    } else {
      ElMessage.error(res.message)
    }
  })
}

const handleModelClose = () => {
  modelDialogVisible.value = false
  // ElMessageBox.confirm("确定要关闭吗？")
  //   .then(() => {
  //     modelDialogVisible.value = false
  //     // alterModelDialogVisible = false
  //   })
  //   .catch(() => {
  //     // catch error
  //   })
}

const handleAlterModelClose = () => {
  alterModelDialogVisible.value = false
  // ElMessageBox.confirm("确定要关闭吗？")
  //   .then(() => {
  //     alterModelDialogVisible.value = false
  //   })
  //   .catch(() => {
  //     // catch error
  //   })
}

let weight_id
// 点击确定提交对话框里的数据 进行训练
const confirmTrain = () => {
  // 清空进度条数据以防再次点训练时出问题
  progressData.value = 0
  progressStatus.value = ""
  //控制进度条
  timer = setInterval(function () {
    if (progressData.value < 98) {
      progressData.value += 1
    }
  }, 1000)
  isTraining.value = true
  if (createVersionForm.create_way == "extend_old") {
    weight_id = form1.value.Model_value.value
  } else {
    weight_id = 0
  }

  switchWeightsApi({
    WeightID: weight_id,
    ModelID: createModelForm.model_id,
    DatasetID: form2.value.Dataset_value2[1],
    YamlName: form2.value.Yaml_value4,
    WeightName: form2.value.Weight_value1,
    Epoch: form2.value.Epoch_value3,
    user_id: createModelForm.user_id,
    create_way: createVersionForm.create_way
  })
    .then((res) => {
      // 进度条值为100
      progressData.value = 100
      if (progressData.value == 100) {
        progressStatus.value = "success"
        clearInterval(timer)
      }
      isTraining.value = false
      ElMessage({
        message: res.message,
        type: "success"
      })
      dialogVisible.value = false
      getTableData()
    })
    .catch(() => {
      clearInterval(timer)
      progressStatus.value = "exception"
      ElMessage({
        message: `训练失败！`,
        type: "warning"
      })
    })
  // // 改不可训练版本
  // ElMessage({
  //     message: `我们部署的服务器没有GPU，先禁用训练功能`,
  //     type: "warning"
  // })
}

// 训练
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
    } else {
      map[DatasetsName].disabled = true // 设置一级选项不可点击
    }
    options.push(map[DatasetsName])
  })
  return options
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

// 下拉菜单的展开方式
interface CascaderProps {
  expandTrigger?: "click" | "hover"
}

const prop: CascaderProps = {
  expandTrigger: "hover" as const
}

const choise_model = (model: any) => {
  const message = `已选择模型： ${model.label}`
  ElMessage({
    message: message,
    type: "success"
  })
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
// 表单
// 步骤1中的表单
// const Model_value = ref('')
const form1 = ref({
  Model_value: ""
})

// 步骤2中的表单
const form2 = ref<any>({
  Weight_value1: "", // 权重的选择
  Dataset_value2: "", // 数据集的选择
  Epoch_value3: "" // 参数配置的选择
})

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

// 设置先后关系，必须先选数据集才可选参数配置
const isParamConfigEnabled = computed(() => {
  console.log(form2.value.Dataset_value2)
  console.log(createModelForm.is_train)
  return form2.value.Dataset_value2 === "" // 当数据集被选择时返回 true
})

// 设置先后关系，只有选完模型才可以选表单2中的内容
const isModelChosed = computed(() => {
  return form1.value.Model_value.value !== ""
})

const progressData = ref(0)
const progressStatus = ref("")

// 二级训练相关代码
// 二级训练对话框是否可见
const secondTrainDialogVisible = ref<boolean>(false)

// 点击训练
const handleTrain = (row: any) => {
  console.log(row)
  if (row.dataset_status_train != "已达到训练要求") {
    statusDialogVisible.value = true
  } else {
    // 清空表单数据
    form2.value.Dataset_value2 = ""
    form2.value.Yaml_value4 = ""
    form2.value.Epoch_value3 = ""
    // 清空进度条
    progressData.value = 0
    progressStatus.value = ""
    createModelForm.weight_id = row.id
    createModelForm.user_id = row.user_id

    // 对话框显示
    secondTrainDialogVisible.value = true
    getAllEnableallApi({
      model_id: row.id
    })
      .then((res: any) => {
        modelsData.value = res.data.list.model
        Models_options.value = generateModelsOptions(res.data.list.model)
        datasetsData.value = res.data.list.dataset
        Datasets_options.value = generateDatasetsOptions(res.data.list.dataset)
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
}

// 二级对话框关闭
const handleSecondTrainClose = () => {
  secondTrainDialogVisible.value = false
  // ElMessageBox.confirm("确定要关闭吗？")
  //   .then(() => {
  //     secondTrainDialogVisible.value = false
  //   })
  //   .catch(() => {
  //     // catch error
  //   })
}

// 二级对话框 确定训练
const SecondConfirmTrain = () => {
  // 原来完整代码
  // 清空进度条数据以防再次点训练时出问题
  isTraining.value = true
  progressData.value = 0
  progressStatus.value = ""
  // 都不为空可以训练
  if (form2.value.Dataset_value2 !== "" && form2.value.Epoch_value3 !== "") {
    //控制进度条
    timer = setInterval(function () {
      if (progressData.value < 98) {
        progressData.value += 1
      }
    }, 1000)

    switchWeightsApi({
      WeightID: createModelForm.weight_id,
      ModelID: createModelForm.model_id,
      DatasetID: form2.value.Dataset_value2[1],
      YamlName: form2.value.Yaml_value4,
      WeightName: "second",
      Epoch: form2.value.Epoch_value3,
      user_id: createModelForm.user_id,
      create_way: "1"
    })
      .then((res: any) => {
        //进度条值为100
        progressData.value = 100
        if (progressData.value == 100) {
          progressStatus.value = "success"
          clearInterval(timer)
        }
        ElMessage({
          message: res.message,
          type: "success"
        })
        isTraining.value = false
        secondTrainDialogVisible.value = false
        getTableData()
      })
      .catch(() => {
        clearInterval(timer)
        progressStatus.value = "exception"
        ElMessage({
          message: `训练失败！`,
          type: "warning"
        })
      })
  } else {
    ElMessage.error("请将表单填写完整")
  }
  // // 改不可训练版本
  //   ElMessage({
  //     message: `我们部署的服务器没有GPU，先禁用训练功能`,
  //     type: "warning"
  //   })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`正在删除训练：${row.weight_name}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteWeightDataApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}
const statusColor = (tagged: number, size: number) => {
  const percentage = tagged / size
  if (percentage > 0.8) return "success"
  else if (percentage >= 0.5) return "warning"
  else return "exception"
}
const trainStatus = (tagged: number, size: number) => {
  if (size === 0) {
    return 0 // 避免除以0错误
  }
  return parseFloat(((tagged / size) * 100).toFixed(2))
}
// 发布
const handlePublish = (row: any) => {
  selectcameraForm.weight_id = row.id
  publishDialogVisible.value = true
  // 重置发布进度状态
  publishTaskId.value = ""
  publishProgress.value = 0
  publishMessage.value = ""
  publishDetail.value = ""
  publishStatus.value = ""
  if (publishTimer) {
    clearInterval(publishTimer)
    publishTimer = undefined
  }
  listlocationDataApi({
    WeightID: row.id
  }).then((res: any) => {
    location_options.value = generateAreasOptions(res.data.list)
  })
}

const handleDetect = () => {
  router.push({path: "/models/model_detect"})
}

const backmain = () => {
  window.location.reload()
}

// 发布对话框
const publishDialogVisible = ref(false)
const handlePublishClose = () => {
  publishDialogVisible.value = false
  // 清理发布轮询
  if (publishTimer) {
    clearInterval(publishTimer)
    publishTimer = undefined
  }
  // ElMessageBox.confirm("确定要关闭吗？")
  //   .then(() => {
  //     publishDialogVisible.value = false
  //   })
  //   .catch(() => {
  //     // catch error
  //   })
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

// 确认发布
let publishTimer: any
const publishTaskId = ref<string>("")
const publishProgress = ref<number>(0)
const publishMessage = ref<string>("")
const publishDetail = ref<string>("")
const publishStatus = ref<string>("")
const publishProgressStatus = computed(() => {
  return publishStatus.value === 'success'
    ? 'success'
    : publishStatus.value === 'error'
      ? 'exception'
      : ''
})

const startPollingPublish = (taskId: string) => {
  publishTaskId.value = taskId
  if (publishTimer) clearInterval(publishTimer)
  publishTimer = setInterval(async () => {
    try {
      const res: any = await getPublishProgressApi(taskId)
      if (res && res.code === 0 && res.data) {
        const data = res.data
        publishProgress.value = Number(data.progress) || 0
        publishMessage.value = data.message || ""
        publishDetail.value = data.detail || ""
        publishStatus.value = data.status || ""
        if (data.status === "success" || data.status === "error") {
          clearInterval(publishTimer)
          publishTimer = undefined
          ElMessage({
            message: data.message || (data.status === "success" ? "发布完成" : "发布失败"),
            type: data.status === "success" ? "success" : "error"
          })
        }
      }
    } catch (e) {
      // 失败也停止轮询，避免刷屏
      if (publishTimer) {
        clearInterval(publishTimer)
        publishTimer = undefined
      }
    }
  }, 2000)
}

const confirmPublish = async () => {
  if (!checkedCameras.value || checkedCameras.value.length === 0) {
    ElMessage({ message: "请先选择摄像机", type: "warning" })
    return
  }
  try {
    // 启动异步发布任务
    const res: any = await startPublishTaskApi({
      WeightID: selectcameraForm.weight_id,
      selectcamera: checkedCameras.value
    })
    if (res && res.code === 0 && res.data?.task_id) {
      // 不立即关闭弹窗，展示实时进度
      publishProgress.value = 1
      publishMessage.value = "任务已启动"
      publishStatus.value = "running"
      startPollingPublish(res.data.task_id)
    } else {
      ElMessage.error(res?.message || "发布任务启动失败")
    }
  } catch (e: any) {
    ElMessage.error("发布任务启动失败")
  }
}
// 确认发布
const confirmPublishfirst = async () => {
  if (!checkedCameras.value || checkedCameras.value.length === 0) {
    ElMessage({ message: "请先选择摄像机", type: "warning" })
    return
  }
  try {
    const res: any = await startPublishTaskApi({
      WeightID: createModelForm.weight_id,
      selectcamera: checkedCameras.value
    })
    if (res && res.code === 0 && res.data?.task_id) {
      publishProgress.value = 1
      publishMessage.value = "任务已启动"
      publishStatus.value = "running"
      startPollingPublish(res.data.task_id)
    } else {
      ElMessage.error(res?.message || "发布任务启动失败")
    }
  } catch (e: any) {
    ElMessage.error("发布任务启动失败")
  }
}
// 多选框
const checkAll = ref(false)
const isIndeterminate = ref(true)
const checkedCameras = ref()
const cameras = ref<any>()

const handleCheckAllChange = (val: boolean) => {
  checkedCameras.value = val ? cameras : []
  isIndeterminate.value = false
}
const handleCheckedCamerasChange = (value: string[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === cameras.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < cameras.value.length
}

const isTrained = ref(false)
// 模型列表展示
const isExpand = ref<boolean>(false)
const currentModelIdx = ref<number>()
const toggleExpand = (idx: number) => {
  isExpand.value = !isExpand.value
  currentModelIdx.value = idx
}

const chooseweight = () => {
  nextStep1()
}
/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, {immediate: true})
</script>

defineOptions({ name: "DataManage" })

<template>
  <div id="data_manage">
    <div class="not_first" v-if="tableData.length !== 0">
      <!-- 表格 -->
      <el-card>
        <h3 style="margin-top: 0">我的模型</h3>
        <div class="actions">
          <el-form ref="searchFormRef" :inline="true" :model="searchData" class="search-form">
            <el-form-item prop="model_name">
              <div class="input-with-icon" style="margin-right: 15px">
                <el-input
                  v-model="searchData.model_name"
                  placeholder="请输入模型名称搜索"
                  @keyup.enter="handleSearch"
                />
                <el-icon class="search_icon" style="color: #bfbfbf" @click="handleSearch">
                  <Search/>
                </el-icon>
              </div>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="createModel" style="margin-bottom: 15px" :icon="CirclePlus">
            创建模型
          </el-button>
          <!-- 创建模型的对话框 -->
          <el-dialog v-model="modelDialogVisible" title="创建模型" width="500" :before-close="handleModelClose">
            <el-form
              ref="createModelFormRef"
              style="max-width: 600px"
              :model="createModelForm"
              :rules="createModelRules"
              label-width="auto"
              class="demo-ruleForm"
              status-icon
            >
              <el-form-item label="模型名称" prop="model_name">
                <el-input v-model="createModelForm.model_name" placeholder="请输入20字符以内的中英文、数字或下划线"/>
              </el-form-item>
              <el-form-item label="模型类型" prop="model_type">
                <el-input v-model="createModelForm.model_type" placeholder="请输入20字符以内的中英文、数字或下划线"/>
              </el-form-item>
              <el-form-item label="版本备注" prop="version_remark">
                <el-input v-model="createModelForm.version_remark" type="textarea" :rows="4"/>
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="handleModelClose">取消</el-button>
                <el-button type="primary" @click="confirmCreateModel">确定</el-button>
              </div>
            </template>
          </el-dialog>
          <!-- 修改模型对话框 -->
          <el-dialog
            v-model="alterModelDialogVisible"
            title="修改模型"
            width="500"
            :before-close="handleAlterModelClose"
          >
            <el-form
              ref="alterModelFormRef"
              style="max-width: 600px"
              :model="createModelForm"
              :rules="createModelRules"
              label-width="auto"
              class="demo-ruleForm"
              status-icon
            >
              <el-form-item label="模型名称" prop="model_name">
                <el-input v-model="createModelForm.model_name" placeholder="请输入20字符以内的中英文、数字或下划线"/>
              </el-form-item>
              <el-form-item label="模型类型" prop="model_type">
                <el-input v-model="createModelForm.model_type" placeholder="请输入20字符以内的中英文、数字或下划线"/>
              </el-form-item>
              <el-form-item label="版本备注" prop="version_remark">
                <el-input v-model="createModelForm.version_remark" type="textarea" :rows="4"/>
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="handleAlterModelClose">取消</el-button>
                <el-button type="primary" @click="confirmUpdateModel">确定</el-button>
              </div>
            </template>
          </el-dialog>
        </div>
        <!--模型表单-->
        <div class="data_card" v-for="(item, index) in tableData" :key="index">
          <div class="data_table">
            <div class="form_header">
              <div class="form_left">
                <el-icon style="margin-right: 20px" @click="toggleExpand(index)">
                  <ArrowDown v-if="isExpand && currentModelIdx == index"/>
                  <ArrowRight v-else/>
                </el-icon>
                <div class="form_left">
                  <svg-icon prefix="icon" name="dataset" style="font-size: 24px"/>
                  <span style="margin: 0 10px 0 10px">
                    {{ item.model_name }}
                  </span>
                </div>
              </div>
              <div class="form_right">
                <el-text style="margin: 10px"> 创建时间：{{ item.model_datetime }}</el-text>
                <el-text style="margin: 10px"> 用户名：{{ item.user_id }}</el-text>
                <el-button text @click="createType(item)" :icon="Plus"> 训练新版本</el-button>
                <el-button text :icon="Files" @click="toggleExpand(index)"> 全部版本({{ item.children.length }})</el-button>
                <el-button text :icon="Clock"> 测试记录</el-button>
                <el-dropdown>
                  <el-button text :icon="More"> 更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <el-button text @click="changeType(item)" :icon="EditPen"> 修改模型</el-button>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <el-button text @click="deleteType(item)" :icon="Delete"> 删除模型</el-button>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <el-table :data="item.children" row-key="id" border v-show="isExpand && currentModelIdx == index">
              <el-table-column prop="weight_name" label="模型版本" align="center"/>
              <el-table-column prop="weight_datetime" label="训练时间" align="center"/>
              <el-table-column prop="dataset_name" label="数据集名称" align="center"/>
              <el-table-column fixed="right" label="操作" align="center" width="320">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    plain
                    bg
                    @click="handleTrain(scope.row)"
                    :icon="CirclePlusFilled"
                  >训练
                  </el-button>
                  <el-button type="success" size="small" plain bg @click="handlePublish(scope.row)" :icon="Promotion">
                    发布
                  </el-button>
                  <el-button type="warning" size="small" plain bg @click="handleDetect()" :icon="Histogram"
                  >测试
                  </el-button>
                  <el-button type="danger" size="small" plain bg @click="handleDelete(scope.row)" :icon="DeleteFilled">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <!-- 点二级训练弹出对话框 -->
        <el-dialog
          v-model="secondTrainDialogVisible"
          title="继承当前版本训练"
          width="700"
          :before-close="handleSecondTrainClose"
        >
          <div class="dialog-content">
            <div class="form-container" style="margin: 20px">
              <el-form ref="form" :model="form2" label-width="100px" style="margin-right: 95px">
                <el-form-item label="数据集：">
                  <el-cascader
                    v-model="form2.Dataset_value2"
                    :options="Datasets_options"
                    placeholder="请选择"
                    size="large"
                    :props="prop"
                    style="width: 240px"
                    @change="handleChange"
                  />
                </el-form-item>
                <el-form-item label="训练轮数：">
                  <el-input
                    v-model="form2.Epoch_value3"
                    style="width: 240px"
                    placeholder="请输入"
                    :disabled="isParamConfigEnabled || createModelForm.is_train === 0"
                  />
                </el-form-item>
              </el-form>
            </div>
<!--            <div class="demo-progress">-->
<!--              <el-progress type="circle" :percentage="progressData" :status="progressStatus" />-->
<!--            </div>-->
            <div class="tag-icon" v-show="!isTraining" />
            <div class="sk-cube-grid" v-show="isTraining">
              <div class="sk-cube sk-cube-1"></div>
              <div class="sk-cube sk-cube-2"></div>
              <div class="sk-cube sk-cube-3"></div>
              <div class="sk-cube sk-cube-4"></div>
              <div class="sk-cube sk-cube-5"></div>
              <div class="sk-cube sk-cube-6"></div>
              <div class="sk-cube sk-cube-7"></div>
              <div class="sk-cube sk-cube-8"></div>
              <div class="sk-cube sk-cube-9"></div>
              <div style="text-align: center;color: #409EFF">模型训练中...</div>
            </div>
          </div>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handleSecondTrainClose">取消</el-button>
              <el-button type="primary" @click="SecondConfirmTrain" :disabled="!isSecondCompleted">训练</el-button>
            </div>
          </template>
        </el-dialog>
        <!-- 点发布的对话框 -->
        <el-dialog v-model="publishDialogVisible" title="发布" width="700" :before-close="handlePublishClose">
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
            <div class="choose" style="margin: 20px 15px 0" v-if="locationForm.location !== ''">
              <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange"
              >全选
              </el-checkbox
              >
              <el-checkbox-group v-model="checkedCameras" @change="handleCheckedCamerasChange">
                <el-checkbox
                  v-for="camera in cameras"
                  :key="camera.cameraID"
                  :label="camera.cameraName"
                  :value="camera.cameraID"
                >{{ camera.cameraName }}
                </el-checkbox
                >
              </el-checkbox-group>
            </div>
            <!-- 发布进度展示（发布弹窗内） -->
            <div v-if="publishStatus !== ''" style="margin: 12px 15px 0">
              <el-progress :percentage="publishProgress" :status="publishProgressStatus" />
              <div style="margin-top: 6px; font-size: 12px; color: #606266; text-align: left">
                <div>状态：{{ publishStatus }}，{{ publishMessage }}</div>
                <div v-if="publishDetail">详情：{{ publishDetail }}</div>
              </div>
            </div>
          </div>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handlePublishClose">取消</el-button>
              <el-button type="primary" @click="confirmPublish">确定</el-button>
            </div>
          </template>
        </el-dialog>
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
      <!-- 创建新版本的对话框 -->
      <el-dialog v-model="dialogVisible" title="训练新版本" width="700" :before-close="handleClose">
        <el-form
          ref="createVersionFormRef"
          style="max-width: 600px"
          :model="createVersionForm"
          :rules="createRules"
          label-width="auto"
          class="demo-ruleForm"
          status-icon
        >
          <el-form-item label="创建方式" prop="create_way">
            <el-radio-group v-model="createVersionForm.create_way">
              <el-radio label="extend_old">继承已有版本</el-radio>
              <el-radio label="create_new">创建全新版本</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div class="dialog-content">
          <div class="form-container" style="margin: 20px">
            <el-form
              :model="form1"
              label-width="100px"
              style="margin-right: 95px"
              v-if="createVersionForm.create_way === 'extend_old'"
            >
              <el-form-item label="模型：">
                <el-select
                  v-model="form1.Model_value"
                  placeholder="请选择"
                  size="large"
                  style="width: 240px"
                  @change="choise_model"
                >
                  <el-option v-for="item in Models_options" :key="item.value" :label="item.label" :value="item"/>
                </el-select>
              </el-form-item>
            </el-form>
            <el-form ref="form" :model="form2" label-width="100px" style="margin-right: 95px">
              <el-form-item label="训练方法：" v-if="createVersionForm.create_way === 'create_new'">
                <el-select
                  v-model="form2.Weight_value1"
                  placeholder="请选择"
                  size="large"
                  style="width: 240px"
                  :disabled="!isModelChosed && createVersionForm.create_way === 'extend_old'"
                >
                  <el-option
                    v-for="item in Weights_options"
                    :key="item.value"
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
                  :disabled="!isModelChosed && createVersionForm.create_way === 'extend_old'"
                />
              </el-form-item>
              <el-form-item label="训练轮数：">
                <el-input
                  v-model="form2.Epoch_value3"
                  style="width: 240px"
                  placeholder="请输入"
                  :disabled="
                    isParamConfigEnabled ||
                    createModelForm.is_train === 0 ||
                    (!isModelChosed && createVersionForm.create_way === 'extend_old')
                  "
                />
              </el-form-item>
            </el-form>
          </div>
<!--          <div class="demo-progress">-->
<!--            <el-progress type="circle" :percentage="progressData" :status="progressStatus"/>-->
<!--          </div>-->
          <div class="tag-icon" v-show="!isTraining" />
          <div class="sk-cube-grid" v-show="isTraining">
            <div class="sk-cube sk-cube-1"></div>
            <div class="sk-cube sk-cube-2"></div>
            <div class="sk-cube sk-cube-3"></div>
            <div class="sk-cube sk-cube-4"></div>
            <div class="sk-cube sk-cube-5"></div>
            <div class="sk-cube sk-cube-6"></div>
            <div class="sk-cube sk-cube-7"></div>
            <div class="sk-cube sk-cube-8"></div>
            <div class="sk-cube sk-cube-9"></div>
            <div style="text-align: center;color: #409EFF">模型训练中...</div>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="confirmTrain" :disabled="!isFirstCompleted">训练
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
    <div class="first" v-if="tableData.length === 0 && createModelForm.flag === 1">
      <el-card style="min-height: 80vh">
        <span style="font-size: 20px; margin: 10px; font-weight: 700">YOLOv5 train</span>训练用户自定义数据
        <!-- 步骤条 -->
        <el-steps
          :active="activeStep"
          finish-status="success"
          style="width: 80%; margin-left: 10%; margin-bottom: 40px; margin-top: 40px"
        >
          <el-step title="创建模型" :icon="Coin"/>
          <el-step title="设置训练参数" :icon="EditPen"/>
          <el-step title="开始训练" :icon="Tools"/>
          <el-step title="发布" :icon="Finished"/>
        </el-steps>
        <!-- 步骤内容 -->
        <div class="content">
          <div v-if="activeStep === 0">
            <!-- 步骤一的内容 -->
            <p>请创建要训练的模型</p>
            <!-- 创建模型 -->
            <el-button type="primary" size="large" @click="createModel" style="margin-bottom: 15px" :icon="CirclePlus">
              创建模型
            </el-button>
            <!-- 表单 -->
            <div style="margin: 20px">
              <el-form :model="form1" label-width="100px" style="margin-right: 95px">
                <!-- 创建模型的对话框 -->
                <el-dialog v-model="modelDialogVisible" title="创建模型" width="500" :before-close="handleModelClose">
                  <el-form
                    ref="createModelFormRef"
                    style="max-width: 600px"
                    :model="createModelForm"
                    :rules="createModelRules"
                    label-width="auto"
                    class="demo-ruleForm"
                    status-icon
                  >
                    <el-form-item label="模型名称" prop="model_name">
                      <el-input
                        v-model="createModelForm.model_name"
                        placeholder="请输入20字符以内的中英文、数字或下划线"
                      />
                    </el-form-item>
                    <el-form-item label="模型类型" prop="model_type">
                      <el-input
                        v-model="createModelForm.model_type"
                        placeholder="请输入20字符以内的中英文、数字或下划线"
                      />
                    </el-form-item>
                    <el-form-item label="版本备注" prop="version_remark">
                      <el-input v-model="createModelForm.version_remark" type="textarea" :rows="4"/>
                    </el-form-item>
                  </el-form>
                  <template #footer>
                    <div class="dialog-footer">
                      <el-button @click="handleModelClose">取消</el-button>
                      <el-button type="primary" @click="confirmCreateModel">确定</el-button>
                    </div>
                  </template>
                </el-dialog>
              </el-form>
            </div>
            <el-button
              type="primary"
              style="width: 240px; height: 35px; border-radius: 15px"
              @click="nextStep1"
              :disabled="!isStep1Completed"
            >下一步
            </el-button
            >
          </div>
          <div v-if="activeStep === 1">
            <!-- 步骤二的内容 -->
            <p>设置训练参数</p>
            <div>
              <el-form ref="form" :model="form2" label-width="100px" style="margin-right: 95px">
                <el-form-item label="训练方法：" v-if="createVersionForm.create_way === 'create_new'">
                  <el-select v-model="form2.Weight_value1" placeholder="请选择" size="large" style="width: 240px">
                    <el-option
                      v-for="item in Weights_options"
                      :key="item.label"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="训练方法：" v-if="createVersionForm.create_way === 'extend_old'">
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
                  <el-input
                    v-model="form2.Epoch_value3"
                    style="width: 240px"
                    placeholder="请输入"
                    :disabled="isParamConfigEnabled || createModelForm.is_train === 0"
                  />
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
                  <el-progress type="circle" :percentage="progressData" :status="progressStatus"/>
                </div>
<!--                <div class="tag-icon" v-show="!isTraining" />-->
<!--                <div class="sk-cube-grid" v-show="isTraining">-->
<!--                  <div class="sk-cube sk-cube-1"></div>-->
<!--                  <div class="sk-cube sk-cube-2"></div>-->
<!--                  <div class="sk-cube sk-cube-3"></div>-->
<!--                  <div class="sk-cube sk-cube-4"></div>-->
<!--                  <div class="sk-cube sk-cube-5"></div>-->
<!--                  <div class="sk-cube sk-cube-6"></div>-->
<!--                  <div class="sk-cube sk-cube-7"></div>-->
<!--                  <div class="sk-cube sk-cube-8"></div>-->
<!--                  <div class="sk-cube sk-cube-9"></div>-->
<!--                  <div style="text-align: center;color: #409EFF">模型训练中...</div>-->
<!--                </div>-->
              </div>
            </div>
            <el-button type="primary" @click="prevStep1">上一步</el-button>
            <el-button type="primary" @click="finish">训练</el-button>
            <el-button type="primary" @click="nextStep" :disabled="createModelForm.is_next === 0">下一步</el-button>
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
                >全选
                </el-checkbox
                >
                <el-checkbox-group v-model="checkedCameras" @change="handleCheckedCamerasChange">
                  <el-checkbox
                    v-for="camera in cameras"
                    :key="camera.cameraID"
                    :label="camera.cameraName"
                    :value="camera.cameraID"
                  >{{ camera.cameraName }}
                  </el-checkbox
                  >
                </el-checkbox-group>
              </div>
              <!-- 发布进度展示（发布弹窗共用状态） -->
              <div v-if="publishStatus !== ''" style="margin-top: 12px;">
                <el-progress :percentage="publishProgress" :status="publishProgressStatus" />
                <div style="margin-top: 6px; font-size: 12px; color: #606266; text-align: left;">
                  <div>状态：{{ publishStatus }}，{{ publishMessage }}</div>
                  <div v-if="publishDetail">详情：{{ publishDetail }}</div>
                </div>
              </div>
            </div>
            <el-button type="primary" @click="prevStep">上一步</el-button>
            <el-button type="primary" @click="backmain">暂不发布</el-button>
            <el-button type="primary" @click="confirmPublishfirst">发布</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

#data_manage {
  margin: 20px;
  background-color: #fff;
}

.el-card__body {
  padding: var(--el-card-padding);
}

.dialog-content {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 将子元素对齐到容器的开始位置 */
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
    padding-top: 10px;
  }
}

.form-container {
  width: 60%; /* 或者您可以根据需要调整 */
  margin-right: 20px; /* 这会在表单和进度条之间添加20px的间距 */
}

.progress-container {
  width: 30%; /* 或者您可以根据需要调整 */
  display: flex;
  justify-content: center; /* 水平居中进度条 */
}
</style>
<style scoped>
.train {
  margin: 20px;
}

.dialog-content {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 将子元素对齐到容器的开始位置 */
}

.form-container {
  width: 60%; /* 或者您可以根据需要调整 */
  margin-right: 20px; /* 这会在表单和进度条之间添加20px的间距 */
}

.progress-container {
  width: 30%; /* 或者您可以根据需要调整 */
  display: flex;
  justify-content: center; /* 水平居中进度条 */
}

.pager-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/*进度条*/
.demo-progress {
  margin: 50px;
}

.tag-icon {
  width: 180px; /* 设置图标的宽度 */
  height: 180px; /* 设置图标的高度 */
  transform: rotateY(180deg);
  background-image: url("@/assets/manage_sprite.png"); /* 设置精灵图的路径 */
  background-position: -330px -610px; /* 设置截取图标的位置，根据实际需要调整 */
}

.sk-cube-grid {
  width: 10em;
  height: 10em;
  align-self: start;
  margin: 20px;
}

.sk-cube {
  width: 33%;
  height: 33%;
  background-color: #409EFF;
  float: left;
  animation: sk-cube-grid-scale-delay 1.3s infinite ease-in-out;
}

.sk-cube-1 {
  animation-delay: 0.2s;
}

.sk-cube-2 {
  animation-delay: 0.3s;
}

.sk-cube-3 {
  animation-delay: 0.4s;
}

.sk-cube-4 {
  animation-delay: 0.1s;
}

.sk-cube-5 {
  animation-delay: 0.2s;
}

.sk-cube-6 {
  animation-delay: 0.3s;
}

.sk-cube-7 {
  animation-delay: 0s;
}

.sk-cube-8 {
  animation-delay: 0.1s;
}

.sk-cube-9 {
  animation-delay: 0.2s;
  margin-bottom: 5px;
}

@keyframes sk-cube-grid-scale-delay {
  0%, 70%, 100% {
    transform: scale3D(1, 1, 1);
  }
  35% {
    transform: scale3D(0, 0, 1);
  }
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

.choose2 {
  display: block;
  width: 100%;
  margin-bottom: 10px;
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

.search_icon {
  background-color: #fff;
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
</style>
