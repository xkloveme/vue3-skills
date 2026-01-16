<script setup>
import { ref, computed, onMounted } from 'vue'

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
  padding: 1rem;
  border-radius: 8px;
  background-color: #f9fafb;
}

.component h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.component button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #3b82f6;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.component button:hover {
  background-color: #2563eb;
}

.component button:active {
  transform: scale(0.98);
}
</style>