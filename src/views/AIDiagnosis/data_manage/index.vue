<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { deleteTableDataApi, getTableDataApi, getTableDatapathApi } from "@/api/data"
import { type IGetTableData } from "@/api/data/types/data"
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, FormInstance } from "element-plus"
import { Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import UploadFile from "@/components/UploadFile/dataset.vue"
import { checkPermission } from "@/utils/permission"

defineOptions({
  name: "Menu2"
})

const router = useRouter()

const loading = ref<boolean>(false)
const datasets_path = reactive({
  dataset_path: "",
  dataset_filename: ""
})
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const multipleTableRef = ref<InstanceType<typeof ElTable>>()

//#region 删
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
//#endregion
const handletag = (row: IGetTableData) => {
  localStorage.setItem("dataset_id", row.id)
  getTableDatapathApi({
    dataset_name: row.dataset_name,
    dataset_datetime: row.upload_datetime,
    user_id: row.user_id,
    dataset_id: row.id
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
//#endregion

//#region 查
const tableData = ref<IGetTableData[]>([])
const searchData = reactive({
  dataset_name: "",
  upload_datetime: ""
})

const searchFormRef = ref<FormInstance | null>(null)

const getTableData = () => {
  loading.value = true
  getTableDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    dataset_name: searchData.dataset_name || undefined,
    upload_datetime: searchData.upload_datetime || undefined,
    role: ""
  })
    .then((res) => {
      paginationData.total = res.data.total
      tableData.value = res.data.list
      // console.log(res.data.list)
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const handleUpload = () => {
  getTableData()
}

const handleRefresh = () => {
  getTableData()
}
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div>
    <!--    <h2>我的模型</h2>-->
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="dataset_name" label="数据集名称">
          <el-input v-model="searchData.dataset_name" placeholder="请输入" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item prop="upload_datetime" label="创建日期">
          <el-input v-model="searchData.upload_datetime" placeholder="请输入" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 数据集上传按钮 -->
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <UploadFile @handleUpload="handleUpload" />
    </el-card>
    <div class="app-container">
      <el-card v-loading="loading" shadow="never">
        <div class="toolbar-wrapper">
          <div>
            <el-tooltip content="刷新表格">
              <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
            </el-tooltip>
          </div>
        </div>
        <div class="table-wrapper">
          <el-table ref="multipleTableRef" :data="tableData" stripe>
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="dataset_name" label="数据集名称" align="center" />
            <el-table-column prop="upload_datetime" label="上传日期" align="center" />
            <!--          <el-table-column prop="phone" label="手机号" align="center" />-->
            <el-table-column prop="dataset_size" label="数据集大小" align="center" />
            <el-table-column prop="dataset_tagged" label="已标注数量" align="center" />
            <el-table-column v-if="checkPermission(['admin'])" prop="user_name" label="用户名" align="center" />
            <el-table-column fixed="right" label="操作" width="150" align="center">
              <template #default="scope">
                <el-button type="primary" text bg size="small" @click="handletag(scope.row)">标注</el-button>
                <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
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
