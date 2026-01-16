# Vben Admin 最佳实践

本文档提供 Vben Admin 开发的最佳实践指南，涵盖组件设计、状态管理、性能优化、代码组织、错误处理和 TypeScript 集成等方面。

## 📋 目录

- [组件设计](#组件设计)
- [状态管理](#状态管理)
- [性能优化](#性能优化)
- [代码组织](#代码组织)
- [错误处理](#错误处理)
- [TypeScript 集成](#typescript-集成)
- [路由与权限](#路由与权限)
- [主题与样式](#主题与样式)
- [测试策略](#测试策略)
- [构建与部署](#构建与部署)

## 组件设计

### 使用 `<script setup>` 语法

始终使用 `<script setup>` 语法，它更简洁且性能更好：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// Props with TypeScript
interface Props {
  title: string
  loading?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  size: 'medium',
})

// Emits with TypeScript
const emit = defineEmits<{
  click: [value: number]
  update: [value: string]
}>()

// State
const isActive = ref(false)

// Computed
const displayText = computed(() => {
  return props.title.toUpperCase()
})

// Methods
const handleClick = () => {
  isActive.value = !isActive.value
  emit('click', 1)
}
</script>
```

### Props 验证

始终为 Props 定义完整的验证：

```typescript
interface Props {
  // Required prop
  title: string
  
  // Optional prop with default value
  count?: number
  
  // Prop with validation
  status: 'active' | 'inactive' | 'pending'
  
  // Complex prop type
  items: Array<{
    id: number
    name: string
    value: string
  }>
  
  // Prop with validator
  priority: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => [],
  priority: 1,
})
```

### 组件拆分原则

1. **保持组件小巧**：单个组件不超过 200 行代码
2. **单一职责**：每个组件只做一件事
3. **可复用性**：提取公共逻辑到 composables
4. **关注点分离**：逻辑、样式、模板分离

```vue
<!-- Good: 组件拆分 -->
<template>
  <VbenCard>
    <UserHeader :user="user" />
    <UserActions @edit="handleEdit" @delete="handleDelete" />
    <UserDetails :details="details" />
  </VbenCard>
</template>

<!-- Bad: 单个巨型组件 -->
<template>
  <VbenCard>
    <!-- 所有逻辑都在这里 -->
  </VbenCard>
</template>
```

### 使用 Composables

提取可重用逻辑到 composables：

```typescript
// composables/useUser.ts
export function useUser() {
  const userStore = useUserStore()
  
  const fetchUser = async (id: number) => {
    try {
      const user = await api.getUser(id)
      userStore.setUserInfo(user)
      return user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      throw error
    }
  }
  
  const updateUser = async (data: Partial<User>) => {
    const updated = await api.updateUser(data)
    userStore.updateUserInfo(updated)
    return updated
  }
  
  return {
    fetchUser,
    updateUser,
  }
}
```

## 状态管理

### Store 模块化

每个功能模块创建独立的 Store：

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import type { UserInfo, LoginParams } from '#/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: '',
    roles: [] as string[],
    permissions: [] as string[],
    loading: false,
  }),

  getters: {
    isAdmin: (state) => state.roles.includes('admin'),
    hasPermission: (state) => (code: string) => state.permissions.includes(code),
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(params: LoginParams) {
      this.loading = true
      try {
        const res = await api.login(params)
        this.token = res.token
        this.userInfo = res.user
        this.roles = res.roles
        this.permissions = res.permissions
        return res
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      await api.logout()
      this.$reset()
    },
    
    async fetchUserInfo() {
      if (!this.token) return
      const userInfo = await api.getUserInfo()
      this.userInfo = userInfo
    },
  },
})
```

### Store 通信

Store 之间通过导入使用：

```typescript
// stores/modules/permission.ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const usePermissionStore = defineStore('permission', {
  getters: {
    accessibleRoutes: (state) => {
      const userStore = useUserStore()
      // 基于用户角色过滤路由
      return state.routes.filter(route => 
        !route.meta?.authority || 
        route.meta.authority.some(role => userStore.roles.includes(role))
      )
    },
  },
})
```

### 避免 Store 过大

如果 Store 超过 500 行，考虑拆分：

```typescript
// 不好的做法：单个巨型 Store
export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    permission: null,
    theme: null,
    menu: [],
    // ... 更多状态
  }),
})

// 好的做法：按功能拆分
export const useUserStore = defineStore('user', { /* ... */ })
export const usePermissionStore = defineStore('permission', { /* ... */ })
export const useThemeStore = defineStore('theme', { /* ... */ })
export const useMenuStore = defineStore('menu', { /* ... */ })
```

## 性能优化

### 计算属性 vs 方法

使用 `computed` 处理衍生数据，避免在模板中调用方法：

```vue
<script setup>
import { ref, computed } from 'vue'

const list = ref([])

// ✅ Good: 使用 computed
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})

// ❌ Bad: 在模板中调用方法
const filterList = () => {
  return list.value.filter(item => item.active)
}
</script>

<template>
  <!-- ✅ Good -->
  <div v-for="item in filteredList" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ❌ Bad: 每次渲染都会调用 -->
  <div v-for="item in filterList()" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

### v-show vs v-if

- **v-show**：频繁切换的元素
- **v-if**：初始渲染条件

```vue
<template>
  <!-- ✅ Good: 频繁切换使用 v-show -->
  <div v-show="isVisible">内容</div>
  
  <!-- ✅ Good: 初始条件使用 v-if -->
  <div v-if="hasData">内容</div>
  
  <!-- ❌ Bad: 频繁切换使用 v-if -->
  <div v-if="isVisible">内容</div>
</template>
```

### v-for 中的 key

始终使用唯一的 key：

```vue
<template>
  <!-- ✅ Good: 使用唯一标识 -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ❌ Bad: 使用索引作为 key -->
  <div v-for="(item, index) in list" :key="index">
    {{ item.name }}
  </div>
</template>
```

### 懒加载组件

使用 `defineAsyncComponent` 懒加载大型组件：

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() => 
  import('./components/HeavyComponent.vue')
)
</script>

<template>
  <Suspense>
    <HeavyComponent />
  </Suspense>
</template>
```

### 虚拟滚动

对于大型列表，使用虚拟滚动：

```vue
<template>
  <VbenVirtualList :data="list" :item-height="50">
    <template #default="{ item }">
      <div class="list-item">
        {{ item.name }}
      </div>
    </template>
  </VbenVirtualList>
</template>
```

### 避免不必要的响应式

```typescript
// ❌ Bad: 不必要的响应式
const data = ref({
  config: {
    // 静态配置，不需要响应式
    apiUrl: 'https://api.example.com',
  }
})

// ✅ Good: 静态数据使用普通对象
const config = {
  apiUrl: 'https://api.example.com',
}

// ✅ Good: 需要响应式的部分使用 ref
const dynamicData = ref({
  count: 0,
})
```

## 代码组织

### 目录结构

```
src/
├── api/                    # API 接口
│   ├── auth.ts
│   ├── user.ts
│   └── types.ts           # 类型定义
├── assets/                 # 静态资源
├── components/             # 业务组件
│   ├── common/            # 公共组件
│   ├── layout/            # 布局组件
│   └── features/          # 功能组件
├── composables/           # 组合式函数
│   ├── useAuth.ts
│   ├── useFetch.ts
│   └── usePermission.ts
├── constants/             # 常量定义
│   ├── enum.ts
│   └── config.ts
├── layouts/               # 页面布局
│   ├── default.vue
│   └── blank.vue
├── router/                # 路由配置
│   ├── routes/
│   │   ├── core/         # 核心路由
│   │   ├── modules/      # 动态路由模块
│   │   └── index.ts      # 静态路由
│   └── index.ts
├── stores/                # Pinia 状态管理
│   ├── modules/
│   │   ├── user.ts
│   │   ├── permission.ts
│   │   └── theme.ts
│   └── index.ts
├── utils/                 # 工具函数
│   ├── auth.ts
│   ├── storage.ts
│   └── request.ts
├── views/                 # 页面组件
│   ├── dashboard/
│   ├── user/
│   └── system/
└── main.ts
```

### 命名约定

- **组件**：PascalCase（`UserTable.vue`）
- **文件**：kebab-case（`user-table.ts`）
- **目录**：kebab-case（`user-management`）
- **常量**：UPPER_SNAKE_CASE（`API_TIMEOUT`）
- **类型**：PascalCase（`UserInfo`）
- **Store**：kebab-case（`user`）

### 导入顺序

```typescript
// 1. Vue 核心导入
import { ref, computed, watch, onMounted } from 'vue'

// 2. 外部库导入
import { useAuth } from '@/composables/useAuth'
import { storeToRefs } from 'pinia'

// 3. 内部 composables
import { useFetch } from '@/composables/useFetch'

// 4. 组件
import UserCard from '@/components/UserCard.vue'

// 5. 工具/服务
import { formatDate } from '@/utils/date'
```

## 错误处理

### API 错误处理

```typescript
// utils/request.ts
import { useMessage } from '@/hooks/useMessage'

const { message } = useMessage()

export async function request(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Request failed:', error)
    message.error('请求失败，请稍后重试')
    throw error
  }
}
```

### 组件错误处理

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = err.message
  console.error('Captured error:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
  
  // 发送到错误监控
  sendToErrorTracking(err, { component: instance, info })
  
  // 停止错误传播
  return false
})
</script>

<template>
  <div v-if="error" class="error">
    <p>组件加载失败: {{ error }}</p>
    <button @click="retry">重试</button>
  </div>
  <slot v-else />
</template>
```

### 全局错误处理

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
  
  // 发送到错误监控服务
  if (window.Sentry) {
    window.Sentry.captureException(err, {
      extra: { component: instance, info },
    })
  }
}

app.mount('#app')
```

### 异步错误处理

```typescript
// ✅ Good: 使用 try-catch
async function fetchData() {
  try {
    const data = await api.getData()
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error
  }
}

// ✅ Good: 使用 Promise.catch
api.getData()
  .then(data => {
    // 处理数据
  })
  .catch(error => {
    console.error('Failed to fetch data:', error)
  })

// ❌ Bad: 忽略错误
async function fetchData() {
  const data = await api.getData() // 如果失败会抛出未处理的错误
  return data
}
```

## TypeScript 集成

### Props 类型定义

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'editor'
}

interface Props {
  user: User
  editable?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = defineProps<Props>()
</script>
```

### Emits 类型定义

```vue
<script setup lang="ts">
interface Emits {
  (e: 'update', id: number, value: string): void
  (e: 'delete', id: number): void
  (e: 'select', item: any): void
}

const emit = defineEmits<Emits>()
</script>
```

### Composable 类型定义

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
    error.value = null
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
      console.error('Fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, fetchData }
}
```

### Store 类型定义

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import type { UserInfo, LoginParams } from '#/auth'

interface UserState {
  userInfo: UserInfo | null
  token: string
  roles: string[]
  permissions: string[]
  loading: boolean
}

interface UserGetters {
  isAdmin: boolean
  hasPermission: (code: string) => boolean
  isAuthenticated: boolean
}

interface UserActions {
  login: (params: LoginParams) => Promise<void>
  logout: () => Promise<void>
  fetchUserInfo: () => Promise<void>
}

export const useUserStore = defineStore<'user', UserState, UserGetters, UserActions>('user', {
  state: () => ({
    userInfo: null,
    token: '',
    roles: [],
    permissions: [],
    loading: false,
  }),

  getters: {
    isAdmin: (state) => state.roles.includes('admin'),
    hasPermission: (state) => (code: string) => state.permissions.includes(code),
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(params: LoginParams) {
      this.loading = true
      try {
        const res = await api.login(params)
        this.token = res.token
        this.userInfo = res.user
        this.roles = res.roles
        this.permissions = res.permissions
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      await api.logout()
      this.$reset()
    },
    
    async fetchUserInfo() {
      if (!this.token) return
      const userInfo = await api.getUserInfo()
      this.userInfo = userInfo
    },
  },
})
```

### API 类型定义

```typescript
// api/types.ts
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  roles: string[]
  permissions: string[]
}
```

## 路由与权限

### 路由配置最佳实践

```typescript
// router/routes/modules/user.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/layouts/default.vue'),
    meta: {
      title: '用户管理',
      icon: 'mdi:account-group',
      order: 10,
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/list/index.vue'),
        meta: {
          title: '用户列表',
          icon: 'mdi:format-list-bulleted',
          authority: ['admin', 'editor'],
        },
      },
      {
        path: 'detail/:id',
        name: 'UserDetail',
        component: () => import('@/views/user/detail/index.vue'),
        meta: {
          title: '用户详情',
          hideMenu: true,
          authority: ['admin'],
        },
      },
    ],
  },
]

export default routes
```

### 权限控制最佳实践

```typescript
// utils/auth.ts
import { useUserStore } from '@/stores/modules/user'

export function hasAccessByCode(code: string): boolean {
  const userStore = useUserStore()
  return userStore.hasPermission(code)
}

export function hasAccessByRoles(roles: string[]): boolean {
  const userStore = useUserStore()
  return roles.some(role => userStore.roles.includes(role))
}

export function checkRouteAccess(route: RouteRecordRaw): boolean {
  const userStore = useUserStore()
  
  // 忽略权限检查
  if (route.meta?.ignoreAccess) {
    return true
  }
  
  // 检查权限
  const authority = route.meta?.authority
  if (!authority || authority.length === 0) {
    return true
  }
  
  return authority.some(role => userStore.roles.includes(role))
}
```

### 路由守卫最佳实践

```typescript
// router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'

export function createRouteGuard(router: Router) {
  router.beforeEach(async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    
    // 1. 检查是否需要登录
    if (to.meta?.requiresAuth && !userStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    
    // 2. 检查权限
    if (to.meta?.authority) {
      const hasAccess = to.meta.authority.some(role => userStore.roles.includes(role))
      if (!hasAccess) {
        next({ name: '403' })
        return
      }
    }
    
    // 3. 动态路由加载
    if (userStore.isAuthenticated && permissionStore.routes.length === 0) {
      await permissionStore.fetchRoutes()
      permissionStore.routes.forEach(route => {
        router.addRoute(route)
      })
      next({ ...to, replace: true })
      return
    }
    
    next()
  })
}
```

## 主题与样式

### CSS 变量最佳实践

```css
/* src/styles/theme.css */
:root {
  /* 背景色 */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* 主色 */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  /* 次要色 */
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  /* 边框色 */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  
  /* 卡片色 */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  /* 阴影 */
  --shadow: 220 40% 2%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  
  --shadow: 220 40% 2%;
}
```

### Tailwind 配置最佳实践

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.dark'],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './packages/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'shadow': 'var(--shadow)',
      },
    },
  },
  plugins: [],
}
```

## 测试策略

### 测试原则

1. **测试行为，不测试实现**
2. **测试用户交互，不测试内部状态**
3. **测试边界情况和错误处理**
4. **保持测试简单、快速、可靠**

### 组件测试

```typescript
// tests/components/VbenButton.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VbenButton from '@/components/common/VbenButton.vue'

describe('VbenButton', () => {
  it('renders with default props', () => {
    const wrapper = mount(VbenButton)
    expect(wrapper.text()).toBe('按钮')
    expect(wrapper.classes()).toContain('vben-button')
  })

  it('renders with custom label', () => {
    const wrapper = mount(VbenButton, {
      props: { label: 'Click me' },
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('emits click event on click', async () => {
    const wrapper = mount(VbenButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([])
  })

  it('disables button when loading', () => {
    const wrapper = mount(VbenButton, {
      props: { loading: true },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('applies correct size class', () => {
    const wrapper = mount(VbenButton, {
      props: { size: 'large' },
    })
    expect(wrapper.classes()).toContain('vben-button--large')
  })
})
```

### Store 测试

```typescript
// tests/stores/user.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/modules/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty state', () => {
    const store = useUserStore()
    expect(store.userInfo).toBeNull()
    expect(store.token).toBe('')
    expect(store.roles).toEqual([])
  })

  it('computes isAdmin correctly', () => {
    const store = useUserStore()
    store.roles = ['admin']
    expect(store.isAdmin).toBe(true)
    
    store.roles = ['user']
    expect(store.isAdmin).toBe(false)
  })

  it('computes hasPermission correctly', () => {
    const store = useUserStore()
    store.permissions = ['user:add', 'user:edit']
    expect(store.hasPermission('user:add')).toBe(true)
    expect(store.hasPermission('user:delete')).toBe(false)
  })

  it('resets state on logout', async () => {
    const store = useUserStore()
    store.token = 'test-token'
    store.userInfo = { id: 1, name: 'Test' }
    
    await store.logout()
    
    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
  })
})
```

### Composable 测试

```typescript
// tests/composables/useFetch.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { useFetch } from '@/composables/useFetch'

describe('useFetch', () => {
  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const { data, error, loading, fetchData } = useFetch('/api/test')
    
    expect(loading.value).toBe(false)
    
    await fetchData()
    
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(data.value).toEqual(mockData)
  })

  it('handles fetch error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })

    const { data, error, loading, fetchData } = useFetch('/api/test')
    
    await fetchData()
    
    expect(loading.value).toBe(false)
    expect(error.value).not.toBeNull()
    expect(data.value).toBeNull()
  })

  it('sets loading state during fetch', async () => {
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }), 100))
    )

    const { loading, fetchData } = useFetch('/api/test')
    
    const promise = fetchData()
    expect(loading.value).toBe(true)
    
    await promise
    expect(loading.value).toBe(false)
  })
})
```

## 构建与部署

### 构建优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: false,
      filename: 'dist/stats.html',
    }),
  ],
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router', 'pinia'],
          'ui': ['ant-design-vue', '@vben/components'],
          'utils': ['lodash-es', 'dayjs'],
        },
      },
    },
    // 压缩
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
      },
    },
  },
})
```

### 环境变量配置

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_GLOB_API_URL=http://localhost:3000/api
VITE_MOCK_ENABLED=true

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_GLOB_API_URL=https://api.example.com/api
VITE_MOCK_ENABLED=false
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 静态资源
    location / {
        root /var/www/vben-admin;
        try_files $uri $uri/ /index.html;
        
        # 缓存策略
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

## 总结

### 核心原则

1. **保持简单**：不要过度设计，遵循 Vben Admin 的约定
2. **类型安全**：始终使用 TypeScript，保持类型完整
3. **测试驱动**：编写测试后再实现功能
4. **性能优先**：关注构建大小和运行时性能
5. **安全第一**：注意权限控制和数据验证
6. **代码质量**：使用 ESLint、Prettier 保证代码规范

### 检查清单

在提交代码前，确保：

- [ ] 组件使用 `<script setup>` 语法
- [ ] Props 有完整的类型定义和验证
- [ ] 使用 composables 提取可重用逻辑
- [ ] Store 按功能模块拆分
- [ ] 路由有正确的权限配置
- [ ] 错误处理完整
- [ ] 单元测试通过
- [ ] TypeScript 类型检查通过
- [ ] ESLint 无错误
- [ ] 代码格式化正确
- [ ] 性能优化到位

### 持续改进

- 定期审查代码质量
- 关注 Vben Admin 更新
- 学习新的最佳实践
- 参与社区贡献
