# Vue 3 最佳实践

## 🚀 开发环境推荐

### 包管理器：Bun (强烈推荐)
**为什么选择 Bun？**
- ⚡ **极速性能**：比 npm/yarn/pnpm 快 10-100 倍
- 🔧 **一体化工具**：内置打包器、测试运行器、脚本执行器
- 📦 **完全兼容**：与 npm 生态系统 100% 兼容
- 🎯 **零配置**：开箱即用，无需复杂配置

**Bun 常用命令：**
```bash
# 安装依赖 (极速)
bun install

# 添加依赖
bun add vue vue-router pinia

# 开发服务器
bun run dev

# 构建
bun run build

# 运行测试
bun run test

# 运行类型检查
bun run type-check
```

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
<!-- ❌ 避免 - 单一组件过于庞大 (> 200 行) -->
<template>
  <div>
    <!-- 100+ 行的复杂模板 -->
    <!-- 包含过多逻辑和样式 -->
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

**组件拆分原则：**
- 单个组件文件应保持在 **200 行以内**
- 复杂逻辑提取到 **composables** 中
- 通用 UI 元素提取到 **公共组件**（如 Button, Input）
- 业务逻辑组件放在 **features** 目录
- 布局组件放在 **layout** 目录

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

### 性能优化检查清单

在优化前，先使用以下工具分析性能：
```bash
# 使用 Bun 运行性能分析
bun run build --profile

# 或使用 Vite 的分析插件
bun run build --report
```

**常见性能问题：**
1. ❌ 使用 methods 代替 computed（每次渲染都会执行）
2. ❌ 不必要的 v-if 使用（影响渲染性能）
3. ❌ v-for 缺少 key（Vue 无法正确复用 DOM）
4. ❌ 大型组件未拆分（增加初始加载时间）
5. ❌ 未使用懒加载（所有组件同时加载）
6. ❌ 大型列表未使用虚拟滚动（内存占用过高）

**优化方案：**
1. ✅ 使用 computed 处理衍生数据（缓存结果）
2. ✅ 使用 v-show 处理频繁切换（只是 CSS 隐藏）
3. ✅ v-for 中始终使用唯一的 key
4. ✅ 使用 defineAsyncComponent 懒加载大型组件
5. ✅ 对大型列表使用虚拟滚动（vue-virtual-scroller）
6. ✅ 使用 KeepAlive 缓存组件状态

### 1. 使用 computed 而非 method

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([1, 2, 3, 4, 5])

// ✅ 推荐 - computed 会缓存结果，依赖变化时才重新计算
const filteredItems = computed(() => {
  return items.value.filter(item => item > 2)
})

// ❌ 避免 - method 每次渲染都会重新执行
const getFilteredItems = () => {
  return items.value.filter(item => item > 2)
}
</script>

<template>
  <!-- ✅ 使用 computed (缓存结果) -->
  <div v-for="item in filteredItems" :key="item">{{ item }}</div>
  
  <!-- ❌ 每次渲染都会执行 (性能差) -->
  <div v-for="item in getFilteredItems()" :key="item">{{ item }}</div>
</template>
```

**性能对比：**
- `computed`: 依赖变化时才重新计算，结果被缓存
- `method`: 每次渲染都会执行，无缓存
- **建议**: 任何在模板中使用的计算逻辑都应使用 `computed`

### 2. 使用 v-show vs v-if

```vue
<template>
  <!-- ✅ 频繁切换使用 v-show (只是 CSS 隐藏，DOM 仍在) -->
  <div v-show="isVisible">Content</div>
  
  <!-- ✅ 初始渲染条件使用 v-if (DOM 会被销毁/创建) -->
  <div v-if="hasPermission">Admin Panel</div>
  
  <!-- ✅ 互斥条件使用 v-if/v-else-if/v-else -->
  <div v-if="type === 'A'">Type A</div>
  <div v-else-if="type === 'B'">Type B</div>
  <div v-else>Other</div>
</template>
```

**选择指南：**
- **v-show**: 频繁切换（如标签页、下拉菜单）- 性能更好
- **v-if**: 初始条件渲染（如权限控制、首次加载）- 减少初始 DOM 节点
- **v-else-if/v-else**: 互斥条件 - 代码更清晰

### 3. 正确使用 key

```vue
<template>
  <!-- ✅ v-for 必须使用唯一的 key (推荐使用 id) -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ❌ 避免使用 index 作为 key (除非列表是静态的) -->
  <!-- 原因：当列表顺序变化时，Vue 会错误地复用 DOM 节点 -->
  <div v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </div>
  
  <!-- ✅ 强制重新渲染时使用 key -->
  <UserProfile :key="userId" :user-id="userId" />
</template>
```

**Key 的作用：**
- Vue 使用 key 来识别和复用 DOM 节点
- 唯一的 key 确保正确的组件状态和性能
- **最佳实践**: 始终使用数据的唯一标识符（如 `id`）

### 4. 延迟加载大型组件

```javascript
// ✅ 使用 defineAsyncComponent
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

// ✅ 带加载和错误状态 (更好的用户体验)
const HeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,      // 延迟显示加载组件的时间
  timeout: 3000    // 超时时间
})
```

**懒加载优势：**
- 减少初始 bundle 大小
- 加快首屏加载速度
- 按需加载，提升用户体验
- **建议**: 对于非首屏组件、模态框、复杂图表等使用懒加载

### 5. 使用 KeepAlive 缓存组件

```vue
<template>
  <!-- ✅ 缓存动态组件 (保持组件状态) -->
  <KeepAlive :max="10">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- ✅ 缓存路由组件 (保持页面状态) -->
  <router-view v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </router-view>
  
  <!-- ✅ 条件缓存 (只缓存指定组件) -->
  <KeepAlive :include="['ComponentA', 'ComponentB']">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- ✅ 排除缓存 (不缓存指定组件) -->
  <KeepAlive :exclude="['ComponentC']">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

**KeepAlive 使用场景：**
- 标签页切换（保持每个标签页的状态）
- 表单填写（防止用户意外切换页面丢失数据）
- 路由导航（保持页面滚动位置和数据）
- **注意**: 使用 `max` 属性限制缓存数量，避免内存泄漏

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

**虚拟滚动优势：**
- 只渲染可视区域的 DOM 节点
- 大幅减少内存占用（10000+ 条数据）
- 提升滚动性能
- **建议**: 列表超过 1000 条数据时考虑使用虚拟滚动
- **替代方案**: `vue-virtual-scroller`, `vue3-virtual-scroll-list`, `vue-virtual-scroll-grid`

## 代码组织 (Code Organization)

### 1. 文件结构

```
src/
├── assets/          # 静态资源 (图片、字体、样式)
├── components/      # 通用组件
│   ├── common/      # 基础组件 (Button, Input, Card)
│   ├── layout/      # 布局组件 (Header, Footer, Sidebar)
│   └── features/    # 功能组件 (业务相关)
├── composables/     # 可重用逻辑 (useFetch, useAuth)
├── stores/          # Pinia stores (状态管理)
├── router/          # 路由配置
├── views/           # 页面组件 (路由级组件)
├── utils/           # 工具函数 (日期格式化、验证)
├── services/        # API 服务 (Axios 封装)
├── types/           # TypeScript 类型定义
└── constants/       # 常量定义 (API 端点、配置)
```

**使用 Bun 创建项目结构：**
```bash
# 创建 Vue 3 项目
bun create vue@latest my-project

# 项目结构会自动创建
cd my-project
bun install
bun run dev
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

### TypeScript 优势
- ✅ **类型安全**: 编译时发现错误
- ✅ **更好的 IDE 支持**: 自动补全、重构
- ✅ **文档化**: 类型即文档
- ✅ **团队协作**: 减少沟通成本

### 启用 TypeScript
```bash
# 使用 Bun 创建 TypeScript 项目
bun create vue@latest my-project --typescript

# 或手动添加
bun add -D typescript @types/node
bun run type-check
```

**tsconfig.json 推荐配置：**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "lib": ["ESNext", "DOM"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

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

### 测试工具推荐

**使用 Bun 运行测试：**
```bash
# 安装测试依赖
bun add -D vitest @vue/test-utils @vitest/ui

# 运行测试
bun run test

# 运行测试并查看 UI
bun run test:ui

# 运行单个测试文件
bun run test src/components/MyComponent.spec.ts

# 运行特定测试
bun run test -t "should handle error case"

# 生成覆盖率报告
bun run test:coverage
```

**package.json 配置：**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

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
