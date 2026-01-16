<script setup>
import { ref, computed, onMounted } from 'vue'

/**
 * 基础组件模板
 * 包含 Props, Emits, State, Computed, Methods 和 Lifecycle 的基本结构
 */

// Props 定义
const props = defineProps({
  // 标题
  title: {
    type: String,
    default: ''
  }
})

// Emits 定义
const emit = defineEmits(['update', 'change'])

// 状态 (State)
const isActive = ref(false)

// 计算属性 (Computed)
const displayText = computed(() => {
  return props.title.toUpperCase()
})

// 方法 (Methods)
/**
 * 处理点击事件
 * 切换激活状态并触发 change 事件
 */
const handleClick = () => {
  isActive.value = !isActive.value
  emit('change', isActive.value)
}

// 生命周期 (Lifecycle)
onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <div class="component">
    <h2>{{ displayText }}</h2>
    <button @click="handleClick">
      {{ isActive ? '启用' : '停用' }}
    </button>
  </div>
</template>

<style scoped>
.component {
  /* 在这里添加你的样式 */
}
</style>