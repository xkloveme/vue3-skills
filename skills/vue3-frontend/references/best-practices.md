# Vue 3 最佳实践

## 组件设计 (Component Design)

### 1. 使用 `<script setup>` 语法
更简洁、性能更好、更好的 TypeScript 支持。

```vue
<!-- ✅ 推荐 -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- ❌ 避免 (除非必要) -->
<script>
export default {
  setup() {
    const count = ref(0)
    return { count }
  }
}
</script>
```

### 2. Props 定义要明确且严格

```vue
<script setup>
// ✅ 推荐 - 明确类型和验证
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived']
  }
})

// ❌ 避免 - 过于宽松
const props = defineProps(['title', 'likes', 'status'])
</script>
```

### 3. 使用 Composables 封装可重用逻辑

```javascript
// ✅ 推荐 - 建立可重用的 composable
// composables/useFetch.js
import { ref } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, fetchData }
}

// 在组件中使用
<script setup>
import { useFetch } from '@/composables/useFetch'
const { data, error, loading, fetchData } = useFetch('/api/users')
</script>
```

### 4. 适当的组件拆分

```vue
<!-- ❌ 避免 - 单一组件过于庞大 -->
<template>
  <div>
    <!-- 100+ 行的复杂模板 -->
  </div>
</template>

<!-- ✅ 推荐 - 拆分成更小的组件 -->
<template>
  <div>
    <UserHeader :user="user" />
    <UserProfile :user="user" />
    <UserActions :user="user" @update="handleUpdate" />
  </div>
</template>
```

## 响应式最佳实践 (Reactivity Best Practices)

### 1. 选择正确的响应式 API

```javascript
// ✅ 基本类型使用 ref
const count = ref(0)
const message = ref('Hello')
const isActive = ref(true)

// ✅ 复杂对象使用 reactive
const user = reactive({
  name: 'EVA',
  role: 'Frontend Engineer',
  settings: {
    theme: 'dark',
    notifications: true
  }
})

// ❌ 避免 - 基本类型使用 reactive
const state = reactive({
  count: 0  // 应该用 ref(0)
})

// ❌ 避免 - 需要重新赋值的对象使用 reactive
let state = reactive({ data: [] })
state = { data: newData }  // 失去响应性!

// ✅ 应该用 ref
const state = ref({ data: [] })
state.value = { data: newData }  // OK
```

### 2. 避免直接解构响应式对象

```javascript
const user = reactive({
  name: 'EVA',
  age: 25
})

// ❌ 避免 - 失去响应性
const { name, age } = user

// ✅ 使用 toRefs
import { toRefs } from 'vue'
const { name, age } = toRefs(user)

// ✅ 或使用 computed
import { computed } from 'vue'
const userName = computed(() => user.name)
```

### 3. 正确使用 watch

```javascript
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)

// ✅ 需要旧值时使用 watch
watch(count, (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`)
})

// ✅ 不需要旧值,自动追踪依赖时使用 watchEffect
watchEffect(() => {
  console.log(`Count is ${count.value}`)
})

// ✅ 观察对象的特定属性
const user = reactive({ name: 'EVA', age: 25 })
watch(
  () => user.name,
  (newName) => {
    console.log(`Name changed to ${newName}`)
  }
)

// ❌ 避免 - 在 watch 中执行副作用但没有清理
watch(source, () => {
  const timer = setInterval(() => {}, 1000)
  // 缺少清理逻辑!
})

// ✅ 正确清理副作用
watch(source, (newVal, oldVal, onCleanup) => {
  const timer = setInterval(() => {}, 1000)
  onCleanup(() => {
    clearInterval(timer)
  })
})
```

## 性能优化 (Performance Optimization)

### 1. 使用 computed 而非 method

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([1, 2, 3, 4, 5])

// ✅ 推荐 - computed 会缓存结果
const filteredItems = computed(() => {
  return items.value.filter(item => item > 2)
})

// ❌ 避免 - method 每次都会重新执行
const getFilteredItems = () => {
  return items.value.filter(item => item > 2)
}
</script>

<template>
  <!-- ✅ 使用 computed -->
  <div v-for="item in filteredItems" :key="item">{{ item }}</div>
  
  <!-- ❌ 每次渲染都会执行 -->
  <div v-for="item in getFilteredItems()" :key="item">{{ item }}</div>
</template>
```

### 2. 使用 v-show vs v-if

```vue
<template>
  <!-- ✅ 频繁切换使用 v-show -->
  <div v-show="isVisible">Content</div>
  
  <!-- ✅ 初始渲染条件使用 v-if -->
  <div v-if="hasPermission">Admin Panel</div>
  
  <!-- ✅ 互斥条件使用 v-if/v-else-if/v-else -->
  <div v-if="type === 'A'">Type A</div>
  <div v-else-if="type === 'B'">Type B</div>
  <div v-else>Other</div>
</template>
```

### 3. 正确使用 key

```vue
<template>
  <!-- ✅ v-for 必须使用唯一的 key -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ❌ 避免使用 index 作为 key (除非列表是静态的) -->
  <div v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </div>
  
  <!-- ✅ 强制重新渲染时使用 key -->
  <UserProfile :key="userId" :user-id="userId" />
</template>
```

### 4. 延迟加载大型组件

```javascript
// ✅ 使用 defineAsyncComponent
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

// ✅ 带加载和错误状态
const HeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 5. 使用 KeepAlive 缓存组件

```vue
<template>
  <!-- ✅ 缓存动态组件 -->
  <KeepAlive :max="10">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- ✅ 缓存路由组件 -->
  <router-view v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </router-view>
  
  <!-- ✅ 条件缓存 -->
  <KeepAlive :include="['ComponentA', 'ComponentB']">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

### 6. 虚拟滚动处理大列表

```vue
<script setup>
// 使用 vue-virtual-scroller 或类似库
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const items = ref([/* 10000+ items */])
</script>

<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
  >
    <template #default="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </RecycleScroller>
</template>
```

## 代码组织 (Code Organization)

### 1. 文件结构

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件
│   ├── common/      # 基础组件 (Button, Input)
│   ├── layout/      # 布局组件 (Header, Footer)
│   └── features/    # 功能组件
├── composables/     # 可重用逻辑
├── stores/          # Pinia stores
├── router/          # 路由设置
├── views/           # 页面组件
├── utils/           # 工具函数
├── services/        # API 服务
├── types/           # TypeScript 类型定义
└── constants/       # 常量定义
```

### 2. 组件命名规范

```vue
<!-- ✅ 使用 PascalCase -->
<script setup>
import UserProfile from '@/components/UserProfile.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
</script>

<template>
  <TheHeader />
  <UserProfile />
</template>

<!-- 文件命名 -->
<!-- ✅ 推荐 -->
UserProfile.vue
TheHeader.vue
BaseButton.vue

<!-- ❌ 避免 -->
userprofile.vue
header.vue
button.vue
```

### 3. Composables 命名规范

```javascript
// ✅ 使用 use 前缀
export function useAuth() { }
export function useFetch() { }
export function useLocalStorage() { }

// ❌ 避免
export function auth() { }
export function fetch() { }
```

## 错误处理 (Error Handling)

### 1. 全局错误处理

```javascript
// main.js
const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
  
  // 发送到错误追踪服务
  // trackError(err, { component: instance, info })
}
```

### 2. 组件内错误处理

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = err.message
  console.error('Captured error:', err)
  
  // 返回 false 停止错误传播
  return false
})
</script>

<template>
  <div v-if="error" class="error">
    {{ error }}
  </div>
  <slot v-else />
</template>
```

### 3. Async/Await 错误处理

```javascript
<script setup>
import { ref } from 'vue'

const data = ref(null)
const error = ref(null)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    data.value = await response.json()
  } catch (e) {
    error.value = e.message
    console.error('Fetch error:', e)
  } finally {
    loading.value = false
  }
}
</script>
```

## TypeScript 集成 (TypeScript Integration)

### 1. 为 Props 定义类型

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: Array<{
    id: number
    name: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
</script>
```

### 2. 为 Emits 定义类型

```vue
<script setup lang="ts">
interface Emits {
  (e: 'update', id: number, value: string): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()

emit('update', 1, 'new value')
</script>
```

### 3. 为 Composables 定义类型

```typescript
// composables/useFetch.ts
import { ref, Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  fetchData: () => Promise<void>
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, fetchData }
}
```

## 测试注意事项 (Testing Considerations)

### 1. 可测试的组件设计

```vue
<script setup>
import { ref, computed } from 'vue'

// ✅ 推荐 - 逻辑抽离到 composable
import { useCounter } from '@/composables/useCounter'
const { count, increment } = useCounter()

// ✅ Props 和 emits 明确定义
const props = defineProps({
  initialValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['change'])
</script>

<!-- ✅ 简单的模板逻辑 -->
<template>
  <div>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
  </div>
</template>
```

### 2. 使用依赖注入方便测试

```javascript
// ✅ 使用 provide/inject
// app.js
app.provide('api', apiService)

// component.vue
const api = inject('api')

// 测试时可以轻松 mock
```
