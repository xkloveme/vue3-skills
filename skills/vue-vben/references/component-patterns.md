# Vben Admin 组件模式

本文档提供 Vben Admin 中常见的组件开发模式和最佳实践，涵盖表单组件、表格组件、模态框组件、布局组件等。

## 📋 目录

- [表单组件](#表单组件)
- [表格组件](#表格组件)
- [模态框组件](#模态框组件)
- [布局组件](#布局组件)
- [通用组件](#通用组件)
- [组合式组件](#组合式组件)

## 表单组件

### 基础表单组件

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: Record<string, any>
  loading?: boolean
  submitText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  loading: false,
  submitText: '提交',
})

const emit = defineEmits<{
  submit: [values: Record<string, any>]
  'update:modelValue': [values: Record<string, any>]
}>()

const formRef = ref()

const handleSubmit = async () => {
  try {
    const values = await formRef.value.validate()
    emit('submit', values)
  } catch (error) {
    console.error('表单验证失败', error)
  }
}
</script>

<template>
  <VbenForm ref="formRef" :model="modelValue" @submit="handleSubmit">
    <slot />
    <VbenFormItem>
      <VbenButton type="primary" :loading="loading" @click="handleSubmit">
        {{ submitText }}
      </VbenButton>
    </VbenFormItem>
  </VbenForm>
</template>
```

### 动态表单组件

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

interface FormField {
  field: string
  label: string
  component: string
  rules?: any[]
  componentProps?: Record<string, any>
  hidden?: boolean
}

interface Props {
  schema: FormField[]
  modelValue?: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [values: Record<string, any>]
  submit: [values: Record<string, any>]
}>()

const formRef = ref()
const localModel = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    localModel.value = { ...val }
  }
)

const handleSubmit = async () => {
  try {
    const values = await formRef.value.validate()
    emit('submit', values)
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleUpdate = (field: string, value: any) => {
  localModel.value[field] = value
  emit('update:modelValue', localModel.value)
}
</script>

<template>
  <VbenForm ref="formRef" :model="localModel" @submit="handleSubmit">
    <template v-for="field in schema" :key="field.field">
      <VbenFormItem
        v-if="!field.hidden"
        :label="field.label"
        :prop="field.field"
        :rules="field.rules"
      >
        <component
          :is="field.component"
          :value="localModel[field.field]"
          @update:value="handleUpdate(field.field, $event)"
          v-bind="field.componentProps"
        />
      </VbenFormItem>
    </template>
    <VbenFormItem>
      <VbenButton type="primary" @click="handleSubmit">提交</VbenButton>
    </VbenFormItem>
  </VbenForm>
</template>
```

### 表单验证组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface ValidationRule {
  required?: boolean
  message?: string
  validator?: (value: any) => boolean | Promise<boolean>
  pattern?: RegExp
  min?: number
  max?: number
}

interface Props {
  rules?: ValidationRule[]
  value?: any
  label?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  validate: [isValid: boolean, message: string]
}>()

const errorMessage = ref('')
const isValid = ref(true)

const validate = async (): Promise<boolean> => {
  if (!props.rules || props.rules.length === 0) {
    return true
  }

  for (const rule of props.rules) {
    // 必填验证
    if (rule.required && (props.value === null || props.value === undefined || props.value === '')) {
      errorMessage.value = rule.message || `${props.label} 不能为空`
      isValid.value = false
      emit('validate', false, errorMessage.value)
      return false
    }

    // 自定义验证器
    if (rule.validator) {
      const result = await rule.validator(props.value)
      if (!result) {
        errorMessage.value = rule.message || `${props.label} 验证失败`
        isValid.value = false
        emit('validate', false, errorMessage.value)
        return false
      }
    }

    // 正则验证
    if (rule.pattern && props.value) {
      if (!rule.pattern.test(props.value)) {
        errorMessage.value = rule.message || `${props.label} 格式不正确`
        isValid.value = false
        emit('validate', false, errorMessage.value)
        return false
      }
    }

    // 长度验证
    if (rule.min !== undefined && props.value?.length < rule.min) {
      errorMessage.value = rule.message || `${props.label} 至少 ${rule.min} 个字符`
      isValid.value = false
      emit('validate', false, errorMessage.value)
      return false
    }

    if (rule.max !== undefined && props.value?.length > rule.max) {
      errorMessage.value = rule.message || `${props.label} 最多 ${rule.max} 个字符`
      isValid.value = false
      emit('validate', false, errorMessage.value)
      return false
    }
  }

  errorMessage.value = ''
  isValid.value = true
  emit('validate', true, '')
  return true
}

defineExpose({
  validate,
})
</script>

<template>
  <div class="validation-wrapper">
    <slot />
    <div v-if="!isValid" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: #f5222d;
  font-size: 12px;
  margin-top: 4px;
}
</style>
```

## 表格组件

### 基础表格组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Column {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: any) => any
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc']
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]
    
    if (aVal === bVal) return 0
    
    const comparison = aVal > bVal ? 1 : -1
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', key, sortOrder.value)
}
</script>

<template>
  <div class="vben-table">
    <div class="table-container" :class="{ loading }">
      <table>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{ width: column.width + 'px', textAlign: column.align }"
              :class="{ sortable: column.sortable }"
              @click="column.sortable && handleSort(column.key)"
            >
              {{ column.title }}
              <span v-if="column.sortable && sortKey === column.key" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in sortedData" :key="index">
            <td
              v-for="column in columns"
              :key="column.key"
              :style="{ textAlign: column.align }"
            >
              <slot :name="column.key" :row="row" :value="row[column.key]">
                {{ column.render ? column.render(row[column.key], row) : row[column.key] }}
              </slot>
            </td>
          </tr>
          <tr v-if="sortedData.length === 0">
            <td :colspan="columns.length" class="empty-data">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="pagination" class="pagination">
      <VbenPagination
        v-model:page="pagination.page"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        @change="emit('pageChange', $event)"
        @change-size="emit('pageSizeChange', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.vben-table {
  width: 100%;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.table-container.loading {
  opacity: 0.5;
  pointer-events: none;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}

th {
  background: #fafafa;
  font-weight: 600;
  text-align: left;
}

th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  background: #f0f0f0;
}

.sort-icon {
  margin-left: 4px;
  font-size: 12px;
}

.empty-data {
  text-align: center;
  color: #999;
  padding: 32px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

### 可搜索表格组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  data: any[]
  columns: any[]
  searchFields?: string[]
}

const props = defineProps<Props>()
const searchKeyword = ref('')

const filteredData = computed(() => {
  if (!searchKeyword.value) return props.data
  
  const keyword = searchKeyword.value.toLowerCase()
  return props.data.filter(row => {
    if (props.searchFields && props.searchFields.length > 0) {
      return props.searchFields.some(field => {
        const value = row[field]
        return value && value.toString().toLowerCase().includes(keyword)
      })
    }
    
    // 搜索所有字段
    return Object.values(row).some(value => 
      value && value.toString().toLowerCase().includes(keyword)
    )
  })
})
</script>

<template>
  <div class="searchable-table">
    <div class="search-bar">
      <VbenInput
        v-model="searchKeyword"
        placeholder="搜索..."
        clearable
      />
    </div>
    
    <VbenTable :data="filteredData" :columns="columns">
      <template #default="{ row, column }">
        <slot :name="column.key" :row="row" :value="row[column.key]" />
      </template>
    </VbenTable>
  </div>
</template>

<style scoped>
.searchable-table {
  width: 100%;
}

.search-bar {
  margin-bottom: 16px;
  max-width: 300px;
}
</style>
```

### 虚拟滚动表格组件

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  data: any[]
  columns: any[]
  itemHeight?: number
  overscan?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 50,
  overscan: 10,
})

const containerRef = ref()
const scrollTop = ref(0)
const containerHeight = ref(0)

const visibleRange = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan)
  const end = Math.min(
    props.data.length,
    Math.ceil((scrollTop.value + containerHeight.value) / props.itemHeight) + props.overscan
  )
  return { start, end }
})

const visibleData = computed(() => {
  const { start, end } = visibleRange.value
  return props.data.slice(start, end)
})

const totalHeight = computed(() => props.data.length * props.itemHeight)

const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}

onMounted(() => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
    containerRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div ref="containerRef" class="virtual-table-container">
    <div class="virtual-table" :style="{ height: totalHeight + 'px' }">
      <div
        class="virtual-table-content"
        :style="{ transform: `translateY(${visibleRange.start * itemHeight}px)` }"
      >
        <div
          v-for="row in visibleData"
          :key="row.id"
          class="virtual-table-row"
          :style="{ height: itemHeight + 'px' }"
        >
          <div
            v-for="column in columns"
            :key="column.key"
            class="virtual-table-cell"
            :style="{ width: column.width + 'px' }"
          >
            {{ row[column.key] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-table-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.virtual-table {
  position: relative;
}

.virtual-table-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-table-row {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  align-items: center;
  padding: 0 16px;
}

.virtual-table-cell {
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

## 模态框组件

### 基础模态框组件

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: number | string
  loading?: boolean
  confirmText?: string
  cancelText?: string
  showConfirm?: boolean
  showCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  width: 520,
  loading: false,
  confirmText: '确定',
  cancelText: '取消',
  showConfirm: true,
  showCancel: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  close: []
}>()

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

watch(visible, (val) => {
  if (!val) {
    emit('close')
  }
  emit('update:modelValue', val)
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleClose = () => {
  visible.value = false
  emit('close')
}
</script>

<template>
  <VbenModal
    v-model:show="visible"
    :title="title"
    :width="width"
    @close="handleClose"
  >
    <template #default>
      <slot />
    </template>
    
    <template #footer>
      <div class="modal-footer">
        <VbenButton v-if="showCancel" @click="handleCancel">
          {{ cancelText }}
        </VbenButton>
        <VbenButton
          v-if="showConfirm"
          type="primary"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </VbenButton>
      </div>
    </template>
  </VbenModal>
</template>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
```

### 表单模态框组件

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: number | string
  loading?: boolean
  formSchema?: any[]
  formData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  title: '表单',
  width: 600,
  loading: false,
  formSchema: () => [],
  formData: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: Record<string, any>]
  close: []
}>()

const visible = ref(props.modelValue)
const formRef = ref()
const localData = ref({ ...props.formData })

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      localData.value = { ...props.formData }
    }
  }
)

watch(visible, (val) => {
  if (!val) {
    emit('close')
  }
  emit('update:modelValue', val)
})

const handleSubmit = async () => {
  try {
    const values = await formRef.value.validate()
    emit('submit', values)
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleCancel = () => {
  visible.value = false
}
</script>

<template>
  <VbenModal
    v-model:show="visible"
    :title="title"
    :width="width"
    @close="emit('close')"
  >
    <template #default>
      <VbenForm ref="formRef" :model="localData">
        <template v-for="field in formSchema" :key="field.field">
          <VbenFormItem :label="field.label" :prop="field.field" :rules="field.rules">
            <component
              :is="field.component"
              v-model="localData[field.field]"
              v-bind="field.componentProps"
            />
          </VbenFormItem>
        </template>
      </VbenForm>
    </template>
    
    <template #footer>
      <div class="modal-footer">
        <VbenButton @click="handleCancel">取消</VbenButton>
        <VbenButton type="primary" :loading="loading" @click="handleSubmit">
          提交
        </VbenButton>
      </div>
    </template>
  </VbenModal>
</template>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
```

### 确认模态框组件

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  content?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认',
  content: '确定要执行此操作吗？',
  type: 'info',
  confirmText: '确定',
  cancelText: '取消',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const typeColors = {
  info: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
}
</script>

<template>
  <VbenModal
    v-model:show="visible"
    :title="title"
    :width="400"
    :show-footer="false"
  >
    <template #default>
      <div class="confirm-content">
        <div class="icon-wrapper" :style="{ color: typeColors[type] }">
          <span class="icon">!</span>
        </div>
        <div class="text">{{ content }}</div>
      </div>
      <div class="confirm-actions">
        <VbenButton @click="handleCancel">{{ cancelText }}</VbenButton>
        <VbenButton
          type="primary"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </VbenButton>
      </div>
    </template>
  </VbenModal>
</template>

<style scoped>
.confirm-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.text {
  flex: 1;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
```

## 布局组件

### 基础布局组件

```vue
<script setup lang="ts">
interface Props {
  collapsed?: boolean
  fixedHeader?: boolean
  showTagsView?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  fixedHeader: true,
  showTagsView: true,
})
</script>

<template>
  <div class="layout-container" :class="{ collapsed: props.collapsed }">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <slot name="sidebar" />
    </div>
    
    <!-- 主内容区 -->
    <div class="main">
      <!-- 头部 -->
      <div class="header" :class="{ fixed: props.fixedHeader }">
        <slot name="header" />
      </div>
      
      <!-- 标签视图 -->
      <div v-if="props.showTagsView" class="tags-view">
        <slot name="tags-view" />
      </div>
      
      <!-- 内容区 -->
      <div class="content">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #001529;
  color: white;
  transition: width 0.3s;
}

.layout-container.collapsed .sidebar {
  width: 64px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.header.fixed {
  position: sticky;
  top: 0;
  z-index: 10;
}

.tags-view {
  height: 40px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: #f0f2f5;
}
</style>
```

### 侧边栏组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface MenuItem {
  path: string
  title: string
  icon?: string
  children?: MenuItem[]
}

interface Props {
  menus: MenuItem[]
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const router = useRouter()
const activeKey = ref('')

const handleClick = (item: MenuItem) => {
  if (item.children && item.children.length > 0) {
    // 展开子菜单
    return
  }
  
  router.push(item.path)
  activeKey.value = item.path
}
</script>

<template>
  <div class="sidebar-menu" :class="{ collapsed: props.collapsed }">
    <div class="logo">
      <span v-if="!props.collapsed">Vben Admin</span>
      <span v-else>VA</span>
    </div>
    
    <div class="menu-items">
      <template v-for="item in props.menus" :key="item.path">
        <div
          v-if="!item.children || item.children.length === 0"
          class="menu-item"
          :class="{ active: activeKey === item.path }"
          @click="handleClick(item)"
        >
          <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
          <span v-if="!props.collapsed" class="menu-title">{{ item.title }}</span>
        </div>
        
        <div v-else class="menu-submenu">
          <div class="menu-submenu-title">
            <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
            <span v-if="!props.collapsed" class="menu-title">{{ item.title }}</span>
          </div>
          
          <div v-if="!props.collapsed" class="menu-submenu-items">
            <div
              v-for="child in item.children"
              :key="child.path"
              class="menu-submenu-item"
              :class="{ active: activeKey === child.path }"
              @click="handleClick(child)"
            >
              <span class="menu-title">{{ child.title }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sidebar-menu {
  width: 200px;
  height: 100%;
  background: #001529;
  color: white;
  transition: width 0.3s;
}

.sidebar-menu.collapsed {
  width: 64px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-items {
  padding: 16px 0;
}

.menu-item,
.menu-submenu-title {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover,
.menu-submenu-title:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background: #1890ff;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

.menu-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-submenu-items {
  padding-left: 48px;
}

.menu-submenu-item {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-submenu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-submenu-item.active {
  background: #1890ff;
}
</style>
```

### 头部组件

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'

const themeStore = useThemeStore()
const userStore = useUserStore()

const emit = defineEmits<{
  toggleSidebar: []
  logout: []
}>()

const handleToggleSidebar = () => {
  emit('toggleSidebar')
}

const handleLogout = () => {
  emit('logout')
}

const handleToggleDarkMode = () => {
  themeStore.toggleDarkMode()
}
</script>

<template>
  <div class="header-container">
    <div class="left">
      <VbenButton @click="handleToggleSidebar">☰</VbenButton>
      <span class="title">Vben Admin</span>
    </div>
    
    <div class="right">
      <VbenButton @click="handleToggleDarkMode">
        {{ themeStore.darkMode ? '☀️' : '🌙' }}
      </VbenButton>
      
      <div class="user-info">
        <span>{{ userStore.userInfo?.name || '用户' }}</span>
        <VbenButton @click="handleLogout">退出</VbenButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

## 通用组件

### 按钮组件

```vue
<script setup lang="ts">
interface Props {
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click')
  }
}
</script>

<template>
  <button
    class="vben-button"
    :class="[`type-${props.type}`, `size-${props.size}`]"
    :disabled="props.disabled || props.loading"
    @click="handleClick"
  >
    <span v-if="props.loading" class="loading-icon">⟳</span>
    <span v-if="props.icon" class="icon">{{ props.icon }}</span>
    <span class="content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.vben-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

/* 类型 */
.type-primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.type-primary:hover:not(:disabled) {
  background: #40a9ff;
  border-color: #40a9ff;
}

.type-default {
  background: white;
  color: rgba(0, 0, 0, 0.85);
  border-color: #d9d9d9;
}

.type-default:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.type-dashed {
  background: white;
  color: rgba(0, 0, 0, 0.85);
  border-color: #d9d9d9;
  border-style: dashed;
}

.type-text {
  background: transparent;
  color: rgba(0, 0, 0, 0.85);
  border: none;
}

.type-link {
  background: transparent;
  color: #1890ff;
  border: none;
}

/* 尺寸 */
.size-small {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
}

.size-medium {
  height: 32px;
  padding: 0 12px;
}

.size-large {
  height: 40px;
  padding: 0 16px;
  font-size: 16px;
}

/* 禁用状态 */
.vben-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载状态 */
.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

### 卡片组件

```vue
<script setup lang="ts">
interface Props {
  title?: string
  bordered?: boolean
  shadow?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  shadow: false,
  loading: false,
})
</script>

<template>
  <div class="vben-card" :class="{ bordered: props.bordered, shadow: props.shadow }">
    <div v-if="props.title" class="card-header">
      <span class="title">{{ props.title }}</span>
      <div class="extra">
        <slot name="extra" />
      </div>
    </div>
    
    <div class="card-body" :class="{ loading: props.loading }">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.vben-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.vben-card.bordered {
  border: 1px solid #e8e8e8;
}

.vben-card.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.extra {
  display: flex;
  align-items: center;
}

.card-body {
  padding: 24px;
}

.card-body.loading {
  opacity: 0.5;
  pointer-events: none;
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
}
</style>
```

### 标签页组件

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

interface Tab {
  key: string
  title: string
  disabled?: boolean
}

interface Props {
  tabs: Tab[]
  activeKey?: string
  type?: 'line' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  activeKey: '',
  type: 'line',
})

const emit = defineEmits<{
  'update:activeKey': [key: string]
  change: [key: string]
}>()

const activeKey = ref(props.activeKey || (props.tabs[0]?.key || ''))

watch(
  () => props.activeKey,
  (val) => {
    if (val) {
      activeKey.value = val
    }
  }
)

watch(activeKey, (val) => {
  emit('update:activeKey', val)
  emit('change', val)
})

const handleClick = (tab: Tab) => {
  if (!tab.disabled) {
    activeKey.value = tab.key
  }
}
</script>

<template>
  <div class="vben-tabs" :class="`type-${props.type}`">
    <div class="tabs-nav">
      <div
        v-for="tab in props.tabs"
        :key="tab.key"
        class="tab-item"
        :class="{
          active: activeKey === tab.key,
          disabled: tab.disabled,
        }"
        @click="handleClick(tab)"
      >
        {{ tab.title }}
      </div>
    </div>
    
    <div class="tabs-content">
      <slot :name="activeKey" />
    </div>
  </div>
</template>

<style scoped>
.vben-tabs {
  width: 100%;
}

.tabs-nav {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 16px;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover:not(.disabled) {
  color: #1890ff;
}

.tab-item.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.tab-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-card .tabs-nav {
  border-bottom: none;
  background: #fafafa;
  padding: 4px;
  gap: 4px;
}

.type-card .tab-item {
  border-radius: 4px;
  border-bottom: none;
  background: transparent;
}

.type-card .tab-item.active {
  background: white;
  border-bottom: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tabs-content {
  min-height: 200px;
}
</style>
```

## 组合式组件

### 表单组合式组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface FormField {
  field: string
  label: string
  component: string
  rules?: any[]
  componentProps?: Record<string, any>
  value?: any
}

interface Props {
  fields: FormField[]
  modelValue?: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [values: Record<string, any>]
  submit: [values: Record<string, any>]
}>()

const formRef = ref()
const localModel = ref({ ...props.modelValue })

const handleSubmit = async () => {
  try {
    const values = await formRef.value.validate()
    emit('submit', values)
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleUpdate = (field: string, value: any) => {
  localModel.value[field] = value
  emit('update:modelValue', localModel.value)
}

defineExpose({
  validate: () => formRef.value?.validate(),
  reset: () => {
    localModel.value = {}
    formRef.value?.resetFields()
  },
  setValues: (values: Record<string, any>) => {
    localModel.value = { ...values }
  },
})
</script>

<template>
  <VbenForm ref="formRef" :model="localModel" @submit="handleSubmit">
    <template v-for="field in fields" :key="field.field">
      <VbenFormItem :label="field.label" :prop="field.field" :rules="field.rules">
        <component
          :is="field.component"
          :value="localModel[field.field]"
          @update:value="handleUpdate(field.field, $event)"
          v-bind="field.componentProps"
        />
      </VbenFormItem>
    </template>
    <VbenFormItem>
      <slot name="actions" :submit="handleSubmit" />
    </VbenFormItem>
  </VbenForm>
</template>
```

### 表格组合式组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Column {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: any) => any
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc']
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]
    
    if (aVal === bVal) return 0
    
    const comparison = aVal > bVal ? 1 : -1
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', key, sortOrder.value)
}

defineExpose({
  sort: (key: string, order: 'asc' | 'desc') => {
    sortKey.value = key
    sortOrder.value = order
  },
  getSortedData: () => sortedData.value,
})
</script>

<template>
  <div class="vben-table">
    <div class="table-container" :class="{ loading }">
      <table>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{ width: column.width + 'px', textAlign: column.align }"
              :class="{ sortable: column.sortable }"
              @click="column.sortable && handleSort(column.key)"
            >
              {{ column.title }}
              <span v-if="column.sortable && sortKey === column.key" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in sortedData" :key="index">
            <td
              v-for="column in columns"
              :key="column.key"
              :style="{ textAlign: column.align }"
            >
              <slot :name="column.key" :row="row" :value="row[column.key]">
                {{ column.render ? column.render(row[column.key], row) : row[column.key] }}
              </slot>
            </td>
          </tr>
          <tr v-if="sortedData.length === 0">
            <td :colspan="columns.length" class="empty-data">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="pagination" class="pagination">
      <VbenPagination
        v-model:page="pagination.page"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        @change="emit('pageChange', $event)"
        @change-size="emit('pageSizeChange', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.vben-table {
  width: 100%;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.table-container.loading {
  opacity: 0.5;
  pointer-events: none;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}

th {
  background: #fafafa;
  font-weight: 600;
  text-align: left;
}

th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  background: #f0f0f0;
}

.sort-icon {
  margin-left: 4px;
  font-size: 12px;
}

.empty-data {
  text-align: center;
  color: #999;
  padding: 32px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

## 总结

### 组件开发原则

1. **单一职责**：每个组件只做一件事
2. **可复用性**：提取公共逻辑到 composables
3. **类型安全**：使用 TypeScript 定义类型
4. **性能优化**：使用计算属性、懒加载等
5. **可访问性**：支持键盘导航和屏幕阅读器
6. **测试友好**：易于单元测试

### 组件模式总结

1. **表单组件**：支持动态表单、表单验证、表单联动
2. **表格组件**：支持排序、搜索、虚拟滚动
3. **模态框组件**：支持基础模态框、表单模态框、确认模态框
4. **布局组件**：支持侧边栏、头部、内容区
5. **通用组件**：按钮、卡片、标签页等
6. **组合式组件**：使用组合式 API 构建复杂组件

### 最佳实践

1. **Props 验证**：始终定义完整的 Props 类型和验证
2. **事件通信**：使用 emit 进行组件通信
3. **插槽使用**：合理使用插槽提高灵活性
4. **样式隔离**：使用 scoped CSS 避免样式冲突
5. **文档完善**：为组件编写清晰的文档
6. **示例代码**：提供使用示例

### 检查清单

在创建新组件时，确保：

- [ ] 使用 `<script setup>` 语法
- [ ] 定义完整的 Props 类型
- [ ] 使用 emit 进行事件通信
- [ ] 添加必要的验证规则
- [ ] 编写单元测试
- [ ] 提供使用示例
- [ ] 样式隔离
- [ ] 文档完善
