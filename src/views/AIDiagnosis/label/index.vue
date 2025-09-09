<template>
  <div id="label">
    <div class="ai-open-data">
      <div class="ai-data-main">
        <div class="online-calibrate-wrap">
          <!-- head -->
          <div class="album-header">
            <div class="left">
              <el-icon style="margin-left: 6px" @click="go_back"><Back /></el-icon>
              <span
                style="
                  margin-left: 8px;
                  opacity: 0.8;
                  font-size: 16px;
                  color: rgb(0, 0, 0);
                  letter-spacing: 0px;
                  line-height: 20px;
                "
              >
                {{ datasetFilename }}
              </span>
            </div>
            <div class="right">
              <span>自动保存：</span>
              <el-switch v-model="saveConfig" style="display: flex" />
              <!--              <el-button type="primary" @click="handleClickExportYaml">保存标注信息</el-button>-->
            </div>
          </div>
          <!-- content -->
          <div class="album-content">
            <!-- 左 图片区域 -->
            <div class="left">
              <div class="album-content-left">
                <div class="album-search-opt">
                  <div>
                    <span style="font-size: 16px; font-weight: bold; color: rgb(44, 49, 66)" data-v-b948e861="">
                      图片列表
                    </span>
                  </div>
                  <div>
                    <!-- <el-icon @click="handleRefeashImage"><Refresh /></el-icon> -->
                    <el-button type="primary" size="small" :icon="Refresh" @click="handleRefeashImage" />
                  </div>
                </div>
                <!-- 标签切换 -->
                <div class="album-tab">
                  <div class="ai-tabs_box ai-tabs_small">
                    <div
                      @click="handleImageTabClick('未标注')"
                      class="ai-tab-item left_item"
                      :class="{ 'ai-tab-item_selected': selectedTab === '未标注' }"
                    >
                      <div class="">
                        <span class="tab">未标注({{ unlabeledImageCount }})</span>
                      </div>
                    </div>
                    <div
                      @click="handleImageTabClick('已标注')"
                      class="ai-tab-item right_item"
                      :class="{ 'ai-tab-item_selected': selectedTab === '已标注' }"
                    >
                      <div class="">
                        <span class="tab">已标注({{ labeledImageCount }})</span>
                      </div>
                    </div>
                    <!-- <div
                      @click="handleImageTabClick('待确认')"
                      class="ai-tab-item right_item"
                      :class="{ 'ai-tab-item_selected': selectedTab === '待确认' }"
                    >
                      <div class=""><span class="tab"> 待确认 </span></div>
                    </div> -->
                  </div>
                </div>
                <!-- 图片缩略图 -->
                <div class="album-list">
                  <div class="ai-scroll-bar">
                    <div class="ai-scroll-body ai-scroll-body_scroll">
                      <div class="ai-scroll-content" style="padding: 0px">
                        <div class="img-card-wrap" style="padding: 0px">
                          <div style="margin: -4px">
                            <div
                              v-for="(item, index) in imageItems"
                              :key="index"
                              class="card-item"
                              style="width: 33.3333%; padding: 4px 4px 0px"
                            >
                              <div>
                                <div class="item-wrapper">
                                  <div
                                    @click="handleImageItemClick(index)"
                                    class="img"
                                    :class="{ 'choose-img': activeIndex === index }"
                                  >
                                    <div class="picture-status pic-status-wrapper">
                                      <div :title="item.image_name" :filename="item.image_name" class="normal hover">
                                        <div style="transform: rotate(0deg); height: 100%; width: 100%">
                                          <img :src="'/api/v1/' + item.image_path" class="image-items" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="item-footer" style="margin-top: 100%" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 图片分页 -->
                <div class="album-page">
                  <el-pagination
                    small
                    background
                    layout="prev, pager, next"
                    :total="totalImages"
                    :page-size="pageSize"
                    style="display: flex"
                    @current-change="handleCurrentChange"
                  />
                </div>
              </div>
            </div>
            <!-- 中 标注区域 -->
            <div class="center">
              <!-- 工具栏 -->
              <div class="tool_bar">
                <div class="icons-group">
                  <div
                    class="icon"
                    :class="{ 'icon-active': IconActive === 0 }"
                    @click="rectangleIconClick"
                  >
                    <el-tooltip content="矩形工具" placement="top" effect="light">
<!--                      <svg-icon prefix="icon" name="rectangle" />-->
                      <el-icon :size="18">
                        <Crop />
                      </el-icon>
                    </el-tooltip>
                  </div>
                  <!--                  <svg-icon prefix="icon" name="polygon"/>-->
                </div>
                <span class="divider" />
                <div class="icons-group">
                  <div class="icon" :class="{ 'icon-active': IconActive === 1 }" @click="editIconClick">
                    <el-tooltip content="编辑工具" placement="top" effect="light">
                      <el-icon :size="18">
                        <Edit />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </div>
                <span class="divider" />
                <div class="icons-group">
                  <!-- 保存 -->
                  <div class="icon group" :class="{ 'icon-active': IconActive === 2 }">
                    <el-tooltip placement="top" effect="light">
                      <template #content>
                        <span>保存</span><br />可保存当前页面的标注<br />避免标注中断后标注丢失
                      </template>
                      <el-icon :size="18" @click="saveLabel"><DocumentChecked /></el-icon>
                    </el-tooltip>
                  </div>
                  <!-- 撤销 -->
                  <!-- <span class="icon group" :class="{ 'icon-active': IconActive === 3 }" @click="undoIconClick">
                    <el-tooltip content="撤销" placement="top" effect="light">
                      <el-icon :size="18">
                        <RefreshLeft />
                      </el-icon>
                    </el-tooltip>
                  </span> -->
                  <!-- 重做 -->
                  <!-- <span class="icon group" :class="{ 'icon-active': IconActive === 4 }" @click="redoIconClick">
                    <el-tooltip content="重做" placement="top" effect="light">
                      <el-icon :size="18">
                        <RefreshRight />
                      </el-icon>
                    </el-tooltip>
                  </span> -->
                </div>
                <span class="divider" />
                <div class="icons-group">
                  <!-- 移动 -->
                  <!-- <span class="icon group" :class="{ 'icon-active': IconActive === 5 }" @click="moveIconClick">
                    <el-tooltip content="移动工具" placement="top" effect="light">
                      <el-icon :size="18">
                        <Pointer />
                      </el-icon>
                    </el-tooltip>
                  </span> -->
                  <span class="icon group" :class="{ 'icon-active': IconActive === 6 }" @click="zoomInIconClick">
                    <el-tooltip content="放大" placement="top" effect="light">
                      <el-icon :size="18">
                        <ZoomIn />
                      </el-icon>
                    </el-tooltip>
                  </span>
                  <span class="icon group" :class="{ 'icon-active': IconActive === 7 }" @click="zoomOutIconClick">
                    <el-tooltip content="缩小" placement="top" effect="light">
                      <el-icon :size="18">
                        <ZoomOut />
                      </el-icon>
                    </el-tooltip>
                  </span>
                  <span class="icon group" :class="{ 'icon-active': IconActive === 8 }" @click="resetIconClick">
                    <el-tooltip content="复位" placement="top" effect="light">
                      <el-icon :size="18">
                        <CirclePlus />
                      </el-icon>
                    </el-tooltip>
                  </span>
                </div>
                <!-- <span class="divider"></span>
                <div class="icons-group">
                  <span class="icon group">
                    <el-icon :size="18">
                      <Crop />
                    </el-icon>
                  </span>
                </div> -->
                <span class="divider" />
                <div class="icons-group">
                  <span class="icon group" :class="{ 'icon-active': IconActive === 9 }" @click="deleteIconClick">
                    <el-tooltip content="删除图片" placement="top" effect="light">
                      <el-icon :size="18">
                        <Delete />
                      </el-icon>
                    </el-tooltip>
                  </span>
                </div>
              </div>
              <div class="calibrate">
                <div class="overlay" v-show="!isLabeling"></div>
                <div ref="label_img" id="label_img" />
              </div>
              <!-- 标注区域切换图片 -->
              <div class="shift-opt">
                <div style="margin-left: 50px">
                  <el-button @click="handleImageItemClick(activeIndex - 1)" size="large">
                    <el-icon><Back /></el-icon><span>上一张</span>
                  </el-button>
                </div>
                <div>{{ imageName }}</div>
                <div style="margin-right: 50px">
                  <el-button @click="handleImageItemClick(activeIndex + 1)" size="large">
                    <span>下一张</span><el-icon><Right /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            <!-- 右 标签 标注管理 -->
            <div class="label-manage-right">
              <div class="label-manage">
                <div id="guide-choose-label" class="label">
                  <div class="label-tabs">
                    <div class="ai-tabs-warpper ai-tabs_bar ai-tabs_mid">
                      <div class="ai-tab-item ai-tab-item_selected left_item right_item">
                        <div class="">
                          <span style="font-size: 16px; font-weight: bold; color: rgb(44, 49, 66)"> 检测标签 </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="label-list">
                    <div class="label-manage-wrap">
                      <div class="tag-search">
                        <el-input
                          v-model="searchTag"
                          style="flex: 1; margin-right: 10px; border-radius: 4px"
                          size="small"
                          placeholder="搜索检测对象名"
                          :suffix-icon="Search"
                          @change="handleSearchTag(searchTag)"
                        />
                        <!-- 添加标签 -->
                        <el-icon @click="handleDialogValue()"><Plus /></el-icon>
                      </div>
                      <!-- 标签列表 -->
                      <el-scrollbar class="scrollbar-wrap">
                        <div
                          v-for="(item, index) in tags"
                          :key="index"
                          class="scrollbar-label-item"
                          :class="{ selected_tag_item: selectedTagIndex === index }"
                          @click="selectTag(index)"
                        >
                          <div class="tag-item-left">
                            <div :style="{ backgroundColor: item.tag_color }" style="width: 2px; height: 20px" />
                            <el-icon>
                              <component :is="selectedTagIndex === index ? 'CircleCheck' : ''" />
                            </el-icon>
                            <span> {{ item.tag_name }}</span>
                          </div>
                          <el-dropdown>
                            <el-icon><MoreFilled /></el-icon>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item @click="handleDialogValue(item)">编辑</el-dropdown-item>
                                <el-dropdown-item @click="delTag(item.tag_id)">删除</el-dropdown-item>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                        </div>
                      </el-scrollbar>
                    </div>
                  </div>
                </div>
                <div class="record">
                  <div class="mark-note-tabs">
                    <div class="ai-tabs-warpper ai-tabs_bar ai-tabs_mid">
                      <div class="ai-tab-item ai-tab-item_selected left_item right_item">
                        <div class=""><span style="font-size: 16px">标注记录</span></div>
                      </div>
                      <!-- 标题右侧 maybe 有按钮 -->
                      <!-- <div class="ai-tabs-slot"></div> -->
                    </div>
                  </div>
                  <div class="mark-notes">
                    <div class="label-list-wrap">
                      <div class="mark-note-wrap">
                        <el-scrollbar class="scrollbar-wrap">
                          <el-tree
                            style="max-width: 600px; background-color: #f5f7fa"
                            :data="treeData"
                            :props="defaultProps"
                            node-key="id"
                            :expand-on-click-node="false"
                            default-expand-all
                            @node-click="handleLabelNodeClick"
                          >
                            <template #default="{ node, data }">
                              <div class="tree-item" @mouseenter="handleLabelMouseEnter(data)">
                                <span>{{ node.label }}</span>
                                <div>
                                  <el-icon class="icon" @click="handleViewLabel(node)">
                                    <component :is="handleLableViewIcon(node)" />
                                  </el-icon>
                                  <el-icon class="icon" @click="handleDelLabel(node)"><Delete /></el-icon>
                                </div>
                              </div>
                            </template>
                          </el-tree>
                        </el-scrollbar>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Dialog 添加/更新tag -->
    <Dialog
      v-model="dialogVisible"
      :dialogTitle="dialogTitle"
      :dialogTableValue="dialogTableValue"
      v-if="dialogVisible"
      @initTagsList="initGetTagsList"
      @initLabelsList="initGetLabelsList(imageItems[activeIndex].image_id)"
      @exportYaml="exportTagApi(datasetId)"
    />
  </div>
</template>

<script setup>
import {
  Plus,
  Edit,
  Delete,
  Refresh,
  Search,
  ArrowLeftBold,
  ArrowRightBold,
  DocumentChecked,
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut,
  Crop,
  Pointer,
  CirclePlus
} from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox, ElLoading } from "element-plus"
import SimpleImageLabel from "simple-image-label"
import { ref, onMounted, watch, computed } from "vue"
import { onBeforeUnmount } from "vue"

import { deleteTagApi, listTagApi, exportTagApi, searchTagApi } from "@/api/tag/index.js"
import { addLabelApi, deleteLabelApi, updateLabelApi, listLabelApi, exportLabelApi } from "@/api/label/index.js"
import { listImageApi, updateImageApi, countImageApi, deleteImageApi } from "@/api/image/index.js"
import Dialog from "./components/dialog.vue"
import { isNull } from "@/utils/filters.js"
import router from "@/router/index.js"
import SvgIcon from "@/components/SvgIcon/index.vue"

// 配置
const saveConfig = ref(true)
const IconActive = ref(999)
const imageScale = ref(1)
const scale = 0.1
const isLabeling = ref(false)

const selectedTab = ref("未标注") // 选中的tab
const labeledImageCount = ref(0)
const unlabeledImageCount = ref(0)
const imageItems = ref([])
const totalImages = ref(100)
const currentPage = ref(1)
const pageSize = ref(100)
const activeIndex = ref(0) // 当前选中图片index
const imageName = ref("")

const simpleImageLabel = ref(null)
const labelsWithUuid = ref([])
const selectedLabelIndex = ref(0) // 当前选中的label

const searchTag = ref("")
const tags = ref([])
const selectedTagIndex = ref(0) // 当前选中tag
const dialogVisible = ref(false)
const dialogTitle = ref("") // 对话框标题
const dialogTableValue = ref({}) // 对话框table内容

const datasetId = localStorage.getItem("dataset_id")
const datasetFilename = localStorage.getItem("dataset_filename")

// 返回上一级
const go_back = () => {
  handleAddUpadteLabel()
  router.push("/ai-diagnosis/data_manage")
  handleClickExportYaml()
}

// 获取tags列表
const initGetTagsList = async () => {
  const res = await listTagApi(datasetId)
  tags.value = res.data
}

initGetTagsList()

// 添加/修改Tag 对话框传值title/value
const handleDialogValue = async (row) => {
  await handleAddUpadteLabel()
  if (isNull(row)) {
    dialogTitle.value = "添加Tag"
    dialogTableValue.value = {}
  } else {
    dialogTitle.value = "编辑Tag"
    dialogTableValue.value = JSON.parse(JSON.stringify(row))
  }
  dialogVisible.value = true
}

// 搜索tag
const handleSearchTag = async (value) => {
  const res = await searchTagApi(value)
  tags.value = res.data
}

// 删除Tag
const delTag = async (tag_id) => {
  ElMessageBox.confirm("注意: 删除Tag时将重新生成所有相关图片的标注文件!", "警告", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: "处理时间较长，请耐心等待...",
        background: "rgba(0, 0, 0, 0.7)"
      })
      await deleteTagApi(tag_id)
      await exportTagApi(datasetId)
      await initGetTagsList()
      loading.close()
      ElMessage({
        type: "success",
        message: "删除成功"
      })
      handleImageItemSwitch()
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除"
      })
    })
}

// 选择tag
const selectTag = (index) => {
  selectedTagIndex.value = index
}

// 根据tag_name获取tag_id tag_name在数据集中不要重名
const getTagIdByName = (tag_name) => {
  const tag = tags.value.find((item) => item.tag_name === tag_name)
  return tag.tag_id
}

// 导出yaml
const handleClickExportYaml = async () => {
  const res = await exportTagApi(datasetId)
  ElMessage({
    type: "success",
    message: res.message
  })
}

// 获取图片列表
const initGetImageList = async (page, page_size, is_train = 1, is_label = 0) => {
  const res = await listImageApi(datasetId, page, page_size, is_train, is_label)
  imageItems.value = res.data.images
  totalImages.value = res.data.total
  updateImageCount()
}

// 页面切换
const handleCurrentChange = (val) => {
  if (selectedTab.value == "未标注") initGetImageList(val, pageSize.value, 1, 0)
  else if (selectedTab.value == "已标注") initGetImageList(val, pageSize.value, 1, 1)
  else if (selectedTab.value == "待确认") initGetImageList(0, 0, 0, 0)
  currentPage.value = val
}

// 处理图片切换/点击事件
const handleImageItemClick = async (index) => {
  if (imageItems.value.length === 0) {
    imageName.value = ""
    simpleImageLabel.value.setImage()
    return
  }
  if (activeIndex.value !== index || index === 0) {
    await handleAddUpadteLabel()
    const imageUrl = "/api/v1/" + imageItems.value[index].image_path
    const imageId = imageItems.value[index].image_id
    labelsWithUuid.value = []
    imageName.value = imageItems.value[index].image_name
    simpleImageLabel.value.setImage(imageUrl)
    await initGetLabelsList(imageId)
    activeIndex.value = index
    updateImageCount()
  }
}

// 标签页切换时，处理图片切换事件
const handleImageItemSwitch = async () => {
  if (imageItems.value.length === 0) {
    imageName.value = ""
    simpleImageLabel.value.setImage()
    return
  }
  const imageUrl = "/api/v1/" + imageItems.value[0].image_path
  const imageId = imageItems.value[0].image_id
  labelsWithUuid.value = []
  imageName.value = imageItems.value[0].image_name
  simpleImageLabel.value.setImage(imageUrl)
  await initGetLabelsList(imageId)
  activeIndex.value = 0
  updateImageCount()
}

// 刷新图片
const handleRefeashImage = async () => {
  if (selectedTab.value === "未标注") {
    await initGetImageList(currentPage.value, pageSize.value, 1, 0)
  } else if (selectedTab.value === "已标注") {
    await initGetImageList(currentPage.value, pageSize.value, 1, 1)
  }
  handleImageItemClick(0)
}

// 处理标签切换事件
const handleImageTabClick = async (tabName) => {
  await handleAddUpadteLabel()
  selectedTab.value = tabName
  if (tabName === "未标注") {
    await initGetImageList(1, pageSize.value, 1, 0)
  } else if (tabName === "已标注") {
    await initGetImageList(1, pageSize.value, 1, 1)
  } else if (tabName === "待确认") {
    await initGetImageList(0, 0, 0, 0)
    console.log("切换到待确认")
  }
  handleImageItemSwitch()
}

// 更新图片数量
const updateImageCount = async () => {
  const res = await countImageApi(datasetId)
  labeledImageCount.value = res.data.num_labeled_images
  unlabeledImageCount.value = res.data.num_unlabeled_images
}

// 获取labels/uuid列表
const initGetLabelsList = async (imageId) => {
  const res = await listLabelApi(imageId)
  // console.log("获取labels列表: ", res.data)
  const labels = res.data.map((item) => {
    return {
      id: item.label_id,
      color: item.tag.tag_color,
      name: item.tag.tag_name,
      height: item.label_h,
      width: item.label_w,
      x: item.label_x,
      y: item.label_y
    }
  })
  simpleImageLabel.value.removeAllLabels()
  simpleImageLabel.value.setLabels(labels)
  labelsWithUuid.value = simpleImageLabel.value.getLabels()
}

const handleAddUpadteLabel = async () => {
  if (labelsWithUuid.value.length === 0 || imageItems.value.length === 0) {
    return
  }
  const imageId = imageItems.value[activeIndex.value].image_id
  await Promise.all(
    labelsWithUuid.value.map(async (item) => {
      if (!checkLabel(item) || !item.name) {
        return
      }
      const label = {
        image_id: imageId,
        tag_id: getTagIdByName(item.name),
        label_x: item.x,
        label_y: item.y,
        label_w: item.width,
        label_h: item.height
      }
      if (item.id) {
        await updateLabelApi(item.id, label)
      } else {
        await addLabelApi(label)
      }
      await updateImageApi(imageId, 1)
    })
  )
  await exportLabelApi(imageId)
}

// 根据uuid获取index
const getIndexByUuid = (uuid) => {
  return labelsWithUuid.value.findIndex((item) => item.uuid === uuid)
}

// label不可见列表
const uuidViewList = ref([])

// 是否显示label
const handleViewLabel = (node) => {
  // console.log("node: ", node)
  const uuid = node.data.id
  if (uuidViewList.value.includes(uuid)) {
    if (node.data.children) {
      node.data.children.forEach((item) => {
        uuidViewList.value.splice(uuidViewList.value.indexOf(item.id), 1)
      })
    }
    uuidViewList.value.splice(uuidViewList.value.indexOf(uuid), 1)
  } else {
    if (node.data.children) {
      node.data.children.forEach((item) => {
        uuidViewList.value.push(item.id)
      })
    }
    uuidViewList.value.push(uuid)
  }
  simpleImageLabel.value.removeAllLabels()
  const labels = labelsWithUuid.value.filter((item) => !uuidViewList.value.includes(item.uuid))
  simpleImageLabel.value.setLabels(labels)
}

// 切换label显示icon
const handleLableViewIcon = (node) => {
  // console.log("切换了icon", node)
  if (uuidViewList.value.includes(node.data.id)) {
    return "hide"
  } else {
    return "view"
  }
}

// 删除单个label
const handleDeleteLabel = async (uuid) => {
  const index = getIndexByUuid(uuid)
  simpleImageLabel.value.clearAllLabelActive()
  const label = labelsWithUuid.value[index]
  // 如果数据库里有label, 删除数据库里的
  if (label.id) {
    deleteLabelApi(label.id)
  }
  simpleImageLabel.value.removeLabelByUuid(label.uuid)
  labelsWithUuid.value.splice(index, 1)
}

// 删除树中label
const handleDelLabel = async (node) => {
  const uuidDeleteList = []
  if (node.data.children) {
    node.data.children.forEach((item) => {
      uuidDeleteList.push(item.id)
    })
  } else {
    uuidDeleteList.push(node.data.id)
  }
  await Promise.all(
    uuidDeleteList.map(async (uuid) => {
      await handleDeleteLabel(uuid)
    })
  )
  ElMessage({
    type: "success",
    message: `删除成功`
  })
}

// 点击label
const handleLabelClick = (index, uuid) => {
  IconActive.value = 1
  selectedLabelIndex.value = index
  simpleImageLabel.value.clearAllLabelActive()
  simpleImageLabel.value.setLabelActive(uuid)
  IconActive.value = 0
}

const defaultProps = {
  id: "id",
  children: "children",
  label: "label"
}

const treeData = computed(() => {
  const data = []
  let tag_id = 0
  let label_id = 0
  labelsWithUuid.value.forEach((item) => {
    if (!item.name) {
      return
    }
    const index = data.findIndex((d) => d.label === item.name)
    if (index === -1) {
      data.push({
        id: tag_id++,
        label: item.name,
        children: [
          {
            id: item.uuid,
            label: "目标id: " + label_id++
          }
        ]
      })
    } else {
      data[index].children.push({
        id: item.uuid,
        label: "目标id: " + label_id++
      })
    }
  })
  return data
})

const handleLabelMouseEnter = (data) => {
  if (!data.children) {
    handleLabelClick(getIndexByUuid(data.id), data.id)
  }
}

const handleLabelNodeClick = (data) => {
  // console.log("handleLabelNodeClick data: ", data)
  if (!data.children) {
    handleLabelClick(getIndexByUuid(data.id), data.id)
  }
}

// 标注相关操作
// 检验标注是否合法
const checkLabel = (label) => {
  if (label.width <= 0.008 || label.height <= 0.008) {
    return false
  }
  return true
}

// 工具栏
// 保存当前图片标注
const saveLabel = async () => {
  await handleAddUpadteLabel()
  ElMessage({
    type: "success",
    message: "保存成功"
  })
  initGetLabelsList(imageItems.value[activeIndex.value].image_id)
  updateImageCount()
  handleClickExportYaml()
}

// 矩形工具
const rectangleIconClick = () => {
  if(IconActive.value !== 0){
    IconActive.value = 0
    isLabeling.value = true
    simpleImageLabel.value.setReadOnly(!isLabeling)
  } else{
    IconActive.value = 999
    isLabeling.value = false
    simpleImageLabel.value.setReadOnly(!isLabeling)
  }
  // resetIconClick()
}

// 编辑工具
const editIconClick = () => {
  IconActive.value = 1
  isLabeling.value = true
  simpleImageLabel.value.setReadOnly(!isLabeling)
}

// 保存
const saveIconClick = () => {
  IconActive.value = 2
}

// 撤销
const undoIconClick = () => {
  IconActive.value = 3
  // 不会写
  IconActive.value = 0
}

// 重做
const redoIconClick = () => {
  IconActive.value = 4
  // 不会写
  IconActive.value = 0
}

// 移动
const moveIconClick = () => {
  IconActive.value = 5
}

const applyTransform = () => {
  const element = label_img
  const scaleValue = imageScale.value
  element.style.transform = `scale(${scaleValue}, ${scaleValue})`
  // element.style.zoom = imageScale.value
}

// 获取父容器和子容器的大小
const getParentSize = () => {
  const parent = label_img.parentElement
  const parentRect = parent.getBoundingClientRect()
  const childRect = label_img.getBoundingClientRect()
  return {
    parentWidth: parentRect.width,
    parentHeight: parentRect.height,
    childWidth: childRect.width,
    childHeight: childRect.height
  }
}

// 放大
const zoomInIconClick = () => {
  const { parentWidth, parentHeight, childWidth, childHeight } = getParentSize()

  // 计算放大后的子容器大小
  const scaledWidth = childWidth * (imageScale.value + 0.2)
  const scaledHeight = childHeight * (imageScale.value + 0.2)

  if (scaledWidth <= parentWidth && scaledHeight <= parentHeight) {
    simpleImageLabel.value.setReadOnly(true)
    IconActive.value = 6
    imageScale.value += scale
    applyTransform()
  } else {
    ElMessage({
      type: "error",
      message: "已经放大到最大"
    })
  }
}

// 缩小
const zoomOutIconClick = () => {
  simpleImageLabel.value.setReadOnly(true)
  IconActive.value = 7
  imageScale.value -= scale
  applyTransform()
}

// 复位
const resetIconClick = () => {
  IconActive.value = 8
  imageScale.value = 1
  applyTransform()
  IconActive.value = 0
  isLabeling.value = true
  simpleImageLabel.value.setReadOnly(!isLabeling)
}

// 删除图片
const deleteIconClick = async () => {
  IconActive.value = 9
  await deleteImageApi(imageItems.value[activeIndex.value].image_id)
  ElMessage({
    type: "success",
    message: "删除成功"
  })
  await handleRefeashImage()
  IconActive.value = 0
}

onMounted(() => {
  initGetImageList(1, pageSize.value, 1, 0).then(() => {
    handleImageTabClick("未标注")
  })
  simpleImageLabel.value = new SimpleImageLabel({
    el: "label_img",
    imageUrl: "",
    labels: [],
    contextmenu: (e) => {
      // emit("contextmenu", e)
    },
    labelClick: (label) => {
      if (typeof label !== "undefined" && label !== null && IconActive.value === 0) {
        // console.log("check前labelwithuuid: ", labelsWithUuid.value)
        const isLabelOk = checkLabel(label)
        if (isLabelOk && tags.value.length > 0) {
          // console.log("触发了点击事件 label: ", label)
          // console.log("tags: ", tags.value)
          simpleImageLabel.value.setLabelByUuid(label.uuid, {
            name: tags.value[selectedTagIndex.value].tag_name,
            color: tags.value[selectedTagIndex.value].tag_color
          })
          selectedLabelIndex.value = getIndexByUuid(label.uuid)
          labelsWithUuid.value = simpleImageLabel.value.getLabels()
        } else {
          // console.log("check false uuid: ", label.uuid)
          // console.log(getIndexByUuid(label.uuid))
          if (isLabelOk) {
            ElMessage({
              type: "error",
              message: "请先创建标签"
            })
          } else {
            ElMessage({
              type: "error",
              message: "标注区域不合法"
            })
          }
          labelsWithUuid.value.splice(getIndexByUuid(label.uuid), 1)
          simpleImageLabel.value.removeAllLabels()
          simpleImageLabel.value.setLabels(labelsWithUuid.value)
        }
      }
    },
    error: (e) => {
      // emit("error", e)
    }
  })
})

</script>
<style src="@/styles/tag_style/tag.css" scoped></style>
<style lang="scss" scoped>
#label {
  overflow: hidden; // 隐藏水平滚动条
  height: calc(100vh - 100px); // 减去header(60px)和main-content的padding(40px)
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

div {
  box-sizing: border-box;
  border: none;
  font-family: Microsoft YaHei UI, Segoe UI;
  font-size: 14px;
  display: block;
}
.ai-open-data {
  width: 100%;
  height: 100%;
  overflow: hidden; // 重要: 防止溢出导致滚动条出现
  display: flex;
  flex-direction: column;
}
.ai-data-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .online-calibrate-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
}
.album-header {
  height: 58px;
  padding-left: 12px;
  padding-right: 12px;
  display: flex;
  box-shadow: 0 20px 40px -10px rgba(215, 222, 243, 0.6);
  justify-content: space-between;
  align-items: center;
  .left {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    .el-icon {
      &:hover {
        background-color: lightgray;
        border-radius: 3px;
      }
    }
  }
  .right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
    min-width: 200px;
  }
}

.album-header .right {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  > span {
    white-space: nowrap;
    margin-right: 8px;
  }

  .el-button {
    margin-right: 0;
  }
}

.album-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  z-index: 0;
  min-width: 0; // 防止flex子元素溢出
  width: 100%; // 确保占满父容器宽度
  .left {
    flex: 0 0 25%; // 左侧占25%宽度
    min-width: 200px; // 最小宽度保证可用性
    max-width: 300px; // 最大宽度防止过宽
    height: 100%;
    z-index: 1;
    box-shadow: 0 0 25px -5px rgba(0, 0, 0, 0.1);
    .album-content-left {
      display: flex;
      padding: 0 16px;
      height: 100%;
      position: relative;
      flex-direction: column;
      .album-search-opt {
        display: flex;
        justify-content: space-between;
        height: 57px;
        padding: 17px 0;
      }
      .album-tab {
        margin-bottom: 18px;
        .tab {
          content: attr(title);
          margin: -1.5px;
          width: 62px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .album-list {
        flex: 1;
        position: relative;
      }
      .album-page {
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #d6d5d5;
      }
    }
  }
  .center {
    flex: 1; // 中间区域自适应剩余空间
    min-width: 300px; // 最小宽度保证标注区域可用性
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 0;

    .tool_bar {
      height: 36px;
      display: flex;
      justify-content: center;
      align-items: center;

      .divider {
        height: 16px;
        border-right: 1px solid darkgrey;
      }

      .el-icon {
        margin-left: 1px;
        margin-top: 1px;
      }

      .icon {
        width: 20px;
        height: 20px;
        margin-left: 8px;
        &:hover {
          background-color: lightgray;
          border-radius: 3px;
        }
      }

      .icons-group {
        padding: 0 16px;

        .group {
          display: inline-block;
        }
      }
    }

    .calibrate {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAOpQTFRF3uLr3+Lr4OLs4OLt4OPs4eTu4uXv4ubv4+Tv4+bw4+fw5Ofw5Ofx5efx5efy5ejx5ejy5ujy5unx5urx5+nx5+ny5+rx5+ry5+rz5+vy5+vz6Ony6Ory6Orz6Or06Ovz6er06evz6ev06ez06e306e316uz06uz16u306+z16+316+326+727O727O737O/27O/37e737e/37e/47fD47u/47vD47vD57vH57/H47/H57/L47/L57/L68PH48PL58PP68fL58fP68fT68fT78vP78vT68vT78vT88vX88/T78/T88/X78/X8OaXg6gAAAQ5JREFUOMvdk1tTwjAQhesVsaIoqcFLrG2VKFAsLQ2CFzBStl72//8dE5hxpqXVd/KSzcyXMydnNwb+s4w1BeA9oOdQBsDgzj7zuxv1tACAEWfEe1SX+YDVVoDYo3Y8WdbHAOZBHjD4r9Kk6hJvF7JA37yI9C5jp2mePMOM5RTcAK1ozC2LC7gRiGE7B1Tjh6vN/aFUZUrmiK1RFki2aVfOG0LXU/qNQCELpNe+xk5DXKq/uflnftkdTTR6iEypB73VoJi2lVgCyUwdXgqSdBYEub9VUVx+FPViQXzutRCf7MJmAdU+6JHATr+km8oHUEmHTVkCpMx/bUO4dVg6MODsVMwaH/8xUX6UrOHH+QG6PRrtQZgWogAAAABJRU5ErkJggg==");

      .overlay{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: transparent;
        z-index: 100;
      }
    }
    .shift-opt {
      height: 100px;
      display: flex;
      padding: 0 16px;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 0 25px -5px rgba(0, 0, 0, 0.1);
    }
  }
  .label-manage-right {
    flex: 0 0 25%; // 右侧占25%宽度
    min-width: 200px; // 最小宽度保证可用性
    max-width: 300px; // 最大宽度防止过宽
    height: 100%;
    position: relative;
    z-index: 1;
    box-shadow: 0 0 25px -5px rgba(0, 0, 0, 0.1);
  }
}
.ai-tabs_small .ai-tab-item {
  padding: 0 12px;
  height: 32px;
}
.ai-tabs_box {
  display: flex;
  flex-shrink: 0;
  position: relative;
  justify-content: flex-start;
  flex-direction: row;

  .ai-tab-item {
    border: 1px solid #d8dbe6;
    position: relative;
    width: auto;
    color: #1a1a1a;
    font-weight: 500;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    margin-right: -1px;
    box-sizing: border-box;
  }
  span {
    font-size: 12px;
  }
  .left_item {
    border-bottom-left-radius: 4px;
    border-top-left-radius: 4px;
  }
  .right_item {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .ai-tab-item_selected {
    border: 2px solid #3569f4;
    color: #3569f4;
  }
}
.ai-tab-item > div {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  flex-shrink: 0;
}

.scrollbar-label-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  margin: 3px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  span {
    text-align: center;
  }
  .tag-item-left {
    display: flex;
    align-items: center;
    .el-icon {
      margin: 0 5px;
    }
  }
  &:hover {
    background: rgb(239, 243, 254);
  }
}

.tag-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 10px;
  .el-icon {
    cursor: pointer;
    &:hover {
      background-color: lightgray;
      border-radius: 3px;
    }
  }
  .el-input {
    border-radius: 4px;
    .el-input__suffix {
      cursor: pointer;
    }
  }
}

.scrollbar-wrap {
  height: 35vh;
  width: 100%;
  overflow: auto;
}

.selected_tag_item {
  background: rgb(239, 243, 254);
}

.selected_label_item {
  border: 1.5px solid #3569f4;
  color: #3569f4;
}

.scrollbar-note-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  margin: 5px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  cursor: pointer;
  p {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  :nth-child(2) {
    margin-right: 5px;
  }
}

.icon-active {
  background-color: lightgray;
  border-radius: 3px;
}

.tree-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  // height: 38px;
  width: 100%;
  cursor: pointer;
  // margin: 10px 0;
  &:hover {
    background-color: #f9f9f9;
    color: #3569f4;
  }
  .icon {
    width: 1em;
    height: 1em;
    margin-right: 8px;
    &:hover {
      background-color: lightgray;
      border-radius: 3px;
    }
  }
}

:deep(.label-item) {
  border-width: 3px !important;
}

:deep(.label-text) {
  font-size: 16px !important;
  background: rgba(0, 0, 0, 0.8);
}

// 响应式设计
@media (max-width: 1400px) {
  #label {
    height: calc(100vh - 100px); // 保持一致的高度计算
  }
  .album-content {
    .left {
      flex: 0 0 22%;
      min-width: 180px;
      max-width: 250px;
    }
    .label-manage-right {
      flex: 0 0 22%;
      min-width: 180px;
      max-width: 250px;
    }
  }
}

@media (max-width: 1000px) {
  #label {
    height: calc(100vh - 100px); // 保持一致的高度计算
  }
  .album-content {
    .left {
      flex: 0 0 20%;
      min-width: 150px;
      max-width: 200px;
    }
    .label-manage-right {
      flex: 0 0 20%;
      min-width: 150px;
      max-width: 200px;
    }
  }
}

@media (max-width: 768px) {
  #label {
    height: calc(100vh - 100px); // 保持一致的高度计算
  }
  .album-content {
    flex-direction: column;
    .left {
      flex: 0 0 200px;
      min-width: 100%;
      max-width: 100%;
    }
    .center {
      flex: 1;
      min-width: 100%;
    }
    .label-manage-right {
      flex: 0 0 200px;
      min-width: 100%;
      max-width: 100%;
    }
  }
}
</style>
