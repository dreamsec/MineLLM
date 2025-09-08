<script lang="ts" setup>
import { computed, reactive, ref } from "vue"
import { type IWeightsData } from "@/api/detect/types/detect"
import { Refresh } from "@element-plus/icons-vue"
import { getAllEnableWeightsApi, getCurrentWeightsApi, switchWeightsApi } from "@/api/detect"
import { ElMessage } from "element-plus"
import UploadFile from "@/components/UploadFile/index.vue"

defineOptions({
  name: "model_detect"
})

const loading = ref<boolean>(false)
const weightsData = ref<IWeightsData[]>([])
const selectedOptions = ref([])
const options = ref<{ value: string; label: string; children: { value: string; label: string }[] }[]>([])
// 当前选择模型数据
const currentWeightsData = reactive({
  weightsDatetime: "",
  weightsName: "",
  weightsDataset: "",
  weightsID: ""
})
// 绑定下拉选项数据
const selectedWeightsData = reactive({
  weightsDatetime: "",
  weightsName: "",
  weightsDataset: "",
  weightsID: "",
  user_id: "",
  dataset_name: ""
})
// 检测结果图片
// base64解码
const detectImageData: any = reactive({
  originalBase64: "",
  resultBase64: "",
  originalImageUrl: computed(() => {
    if (detectImageData.originalBase64) {
      const blob = dataURItoBlob(detectImageData.originalBase64)
      return URL.createObjectURL(blob)
    } else {
      return ""
    }
  }),
  resultImageUrl: computed(() => {
    if (detectImageData.resultBase64) {
      const blob = dataURItoBlob(detectImageData.resultBase64)
      return URL.createObjectURL(blob)
    } else {
      return ""
    }
  }),
  detectResult: []
})
// 处理上传文件
const onHandleUpload = (res: any) => {
  // 如果后端的数据没有以 data:image/jpeg;base64 则需要判断加上
  const originalBase64 = res.data.originalBase64
  const resultBase64 = res.data.resultBase64
  detectImageData.detectResult = res.data.detectResult
  const base64Prefix = "data:image/jpeg;base64,"
  // 判断 originalBase64 是否以 base64Prefix 开头，如果没有则加上
  if (!originalBase64.startsWith(base64Prefix)) {
    detectImageData.originalBase64 = base64Prefix + originalBase64
  } else {
    detectImageData.originalBase64 = originalBase64
  }
  // 判断 resultBase64 是否以 base64Prefix 开头，如果没有则加上
  if (!resultBase64.startsWith(base64Prefix)) {
    detectImageData.resultBase64 = base64Prefix + resultBase64
  } else {
    detectImageData.resultBase64 = resultBase64
  }
}
// 图片base64解码
const dataURItoBlob = (dataURI: any) => {
  const byteString = atob(dataURI.split(",")[1])
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}
/** 获取所有可调用权重 */
const getAllEnableWeights = () => {
  loading.value = true
  getAllEnableWeightsApi()
    .then((res: any) => {
      weightsData.value = res.data.list
      options.value = generateCascaderOptions(res.data.list)
    })
    .catch(() => {
      weightsData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
/** 获取当前调用权重 */
const getCurrentWeights = (weightsID: any) => {
  getCurrentWeightsApi({
    switchWeightsID: weightsID
  }).then((res) => {
    currentWeightsData.weightsDatetime = res.data.weightsDatetime
    currentWeightsData.weightsName = res.data.weightsName
    currentWeightsData.weightsDataset = res.data.weightsDataset
    currentWeightsData.weightsID = res.data.weightsID
  })
}

// 生成下拉菜单的选项
const generateCascaderOptions = (list: IWeightsData[]) => {
  const options: {
    value: string
    label: string
    children: { value: string; label: string; date: string; dataset_name: string }[]
  }[] = []
  const map: {
    [key: string]: {
      value: string
      label: string
      children: { value: string; label: string; date: string; dataset_name: string }[]
    }
  } = {}
  list.forEach((item: any) => {
    const weightsName = item.weightsName
    const modelName = item.modelName
    const weightsDatetime = item.weightsDatetime
    const weightID = item.weightsID
    const user_id = item.user_id
    const dataset_name = item.dataset_name
    if (!map[modelName]) {
      map[modelName] = {
        value: user_id,
        label: modelName,
        children: []
      }
      options.push(map[modelName])
    }
    map[modelName].children.push({
      value: weightID,
      label: weightsName,
      date: weightsDatetime,
      dataset_name: dataset_name
    })
  })
  return options
}

const handleChange = (selectedOptions: any, options: any) => {
  // 遍历选项数组
  if (selectedOptions.length !== 2) return // 如果选中的项数不为2，则返回
  selectedWeightsData.weightsID = selectedOptions[1]
  selectedWeightsData.user_id = selectedOptions[0]
  options.forEach((option: any) => {
    console.log(option)
    option.children.forEach((child: any) => {
      if (child.value == selectedOptions[1]) {
        console.log("Weights Name:", child.value)
        console.log("Weights Dataset:", child.dataset_name)
        console.log("Weights Date:", child.date)
        selectedWeightsData.dataset_name = child.dataset_name
        selectedWeightsData.weightsDatetime = child.date
        selectedWeightsData.weightsName = child.value
      }
    })
  })
  const message = `已选择模型：${selectedOptions[0]}_${selectedOptions[1]}`
  ElMessage({
    message: message,
    type: "success"
  })
}

// 下拉菜单的展开方式
interface CascaderProps {
  expandTrigger?: "click" | "hover"
}

const props: CascaderProps = {
  expandTrigger: "hover" as const
}
// 切换模型
const handleSwitch = () => {
  console.log(selectedWeightsData)
  if (selectedWeightsData.weightsID === currentWeightsData.weightsID) {
    ElMessage({
      message: "当前调用的已经是该模型",
      type: "warning"
    })
    return
  } else if (selectedWeightsData.weightsID === "" || selectedWeightsData.user_id === "") {
    ElMessage({
      message: "请先选择模型",
      type: "warning"
    })
    return
  }
  console.log(selectedWeightsData)
  switchWeightsApi({
    switchWeightsID: selectedWeightsData.weightsID,
    user_id: selectedWeightsData.user_id
  }).then(() => {
    getCurrentWeights(selectedWeightsData.weightsID)
  })
}
getAllEnableWeights()
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-row>
        <el-col :span="7">
          <div class="grid-content">
            <div>
              <div class="SwitchModelCSS">
                当前调用模型：
                <el-text v-model="currentWeightsData.weightsName" type="success" size="large">
                  {{ currentWeightsData.weightsName }}
                </el-text>
              </div>
              <div class="SwitchModelCSS">
                当前数据集模型：
                <el-text v-model="currentWeightsData.weightsDataset" type="success" size="large">
                  {{ currentWeightsData.weightsDataset }}
                </el-text>
              </div>
              <div class="SwitchModelCSS">
                当前模型训练日期：
                <el-text v-model="currentWeightsData.weightsDatetime" type="success" size="large">
                  {{ currentWeightsData.weightsDatetime }}
                </el-text>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="10" class="SwitchModelCSS">
          <div class="grid-content">
            <div class="SwitchModelCSS">
              选择其他模型：
              <el-cascader
                v-model="selectedOptions"
                :options="options"
                :props="props"
                @change="handleChange(selectedOptions, options)"
                placeholder="请选择模型"
              />
              <el-button type="success" :icon="Refresh" @click="handleSwitch" style="margin-left: 10px">
                切换模型
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <UploadFile @handleUpload="onHandleUpload" />
    </el-card>
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="grid-content ep-bg-purple">
            <el-image
              v-if="detectImageData.originalBase64"
              :src="detectImageData.originalImageUrl"
              :fit="'scaleDown'"
              :preview-src-list="[detectImageData.originalImageUrl]"
            />
            <div v-else class="image-placeholder">原始图片</div>
          </div>
        </el-col>
        <el-col :span="10">
          <div class="grid-content ep-bg-purple">
            <el-image
              v-if="detectImageData.resultBase64"
              :src="detectImageData.resultImageUrl"
              :fit="'scaleDown'"
              :preview-src-list="[detectImageData.resultImageUrl]"
            />
            <div v-else class="image-placeholder">检测结果图片</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content ep-bg-purple">
            <el-table
              :data="detectImageData.detectResult"
              v-if="detectImageData.detectResult && detectImageData.detectResult.length > 0"
            >
              <el-table-column prop="className" label="检测类别" />
              <el-table-column prop="confidence" label="置信度" />
            </el-table>
            <div v-else class="image-placeholder">暂无结果</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 15px;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.SwitchModelCSS {
  display: flex;
  font-size: 15px;
  font-weight: 500;
  padding: 5px;
  justify-content: flex-start;
  align-items: center;
}

.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 15px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
