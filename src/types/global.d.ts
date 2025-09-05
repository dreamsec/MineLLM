import {
    ref,
    reactive,
    computed,
    watch,
    onMounted,
    onUnmounted,
    onUpdated,
    onBeforeMount,
    onBeforeUnmount,
    onBeforeUpdate,
    nextTick,
    getCurrentInstance,
    inject,
    provide,
    defineProps,
    defineEmits,
    defineExpose,
    withDefaults
} from 'vue'

declare global {
    const ref: typeof import('vue')['ref']
    const reactive: typeof import('vue')['reactive']
    const computed: typeof import('vue')['computed']
    const watch: typeof import('vue')['watch']
    const onMounted: typeof import('vue')['onMounted']
    const onUnmounted: typeof import('vue')['onUnmounted']
    const onUpdated: typeof import('vue')['onUpdated']
    const onBeforeMount: typeof import('vue')['onBeforeMount']
    const onBeforeUnmount: typeof import('vue')['onBeforeUnmount']
    const onBeforeUpdate: typeof import('vue')['onBeforeUpdate']
    const nextTick: typeof import('vue')['nextTick']
    const getCurrentInstance: typeof import('vue')['getCurrentInstance']
    const inject: typeof import('vue')['inject']
    const provide: typeof import('vue')['provide']
    const defineProps: typeof import('vue')['defineProps']
    const defineEmits: typeof import('vue')['defineEmits']
    const defineExpose: typeof import('vue')['defineExpose']
    const withDefaults: typeof import('vue')['withDefaults']
}

export { }
