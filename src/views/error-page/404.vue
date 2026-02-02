<script lang="ts" setup>
import ErrorPageLayout from "./components/ErrorPageLayout.vue"
import Svg404 from "@/assets/error-page/404.svg" // vite-svg-loader 插件的功能
</script>

<template>
  <ErrorPageLayout>
    <img :src="Svg404" alt="404" />
  </ErrorPageLayout>
</template>
