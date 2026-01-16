# Vben Admin 常见模式

本文档提供 Vben Admin 开发中常见的模式和最佳实践，涵盖表单处理、数据获取、列表渲染、模态框、状态管理、路由、国际化等场景。

## 📋 目录

- [表单处理](#表单处理)
- [数据获取](#数据获取)
- [列表渲染](#列表渲染)
- [模态框](#模态框)
- [状态管理](#状态管理)
- [路由配置](#路由配置)
- [国际化](#国际化)
- [权限控制](#权限控制)
- [主题切换](#主题切换)
- [文件上传](#文件上传)

## 表单处理

### 基础表单模式

使用 Vben Form 组件创建表单：

```vue
<script setup lang="ts">
import { useVbenForm } from '@/components/form'
import { useMessage } from '@/hooks/useMessage'

const { message } = useMessage()

const [Form, formApi] = useVbenForm({
  schema: [
    {
      field: 'username',
      label: '用户名',
      component: 'Input',
      rules: [{ required: true, message: '请输入用户名' }],
      componentProps: {
        placeholder: '请输入用户名',
        maxLength: 20,
      },
    },
    {
      field: 'password',
      label: '密码',
      component: 'InputPassword',
      rules: [{ required: true, message: '请输入密码' }],
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'Input',
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
    {
      field: 'role',
      label: '角色',
      component: 'Select',
      rules: [{ required: true, message: '请选择角色' }],
      componentProps: {
        options: [
          { label: '管理员', value: 'admin' },
          { label: '用户', value: 'user' },
          { label: '编辑', value: 'editor' },
        ],
      },
    },
  ],
  onSubmit: async (values) => {
    try {
      await api.createUser(values)
      message.success('创建成功')
      // 重置表单
      formApi.resetForm()
    } catch (error) {
      message.error('创建失败')
    }
  },
})
</script>

<template>
  <VbenCard title="创建用户">
    <Form />
  </VbenCard>
</template>
```

### 表单验证模式

```typescript
// 自定义验证规则
const customRules = {
  // 强度密码验证
  strongPassword: {
    validator: (rule, value) => {
      if (!value) return Promise.reject('请输入密码')
      if (value.length < 8) return Promise.reject('密码至少8位')
      if (!/[A-Z]/.test(value)) return Promise.reject('需包含大写字母')
      if (!/[a-z]/.test(value)) return Promise.reject('需包含小写字母')
      if (!/[0-9]/.test(value)) return Promise.reject('需包含数字')
      return Promise.resolve()
    },
  },
  // 手机号验证
  phone: {
    validator: (rule, value) => {
      if (!value) return Promise.resolve()
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(value)) return Promise.reject('请输入有效的手机号')
      return Promise.resolve()
    },
  },
}

// 在表单中使用
const [Form] = useVbenForm({
  schema: [
    {
      field: 'password',
      label: '密码',
      component: 'InputPassword',
      rules: [customRules.strongPassword],
    },
    {
      field: 'phone',
      label: '手机号',
      component: 'Input',
      rules: [customRules.phone],
    },
  ],
})
```

### 动态表单模式

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useVbenForm } from '@/components/form'

const formType = ref<'basic' | 'advanced'>('basic')

const basicSchema = [
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    rules: [{ required: true }],
  },
]

const advancedSchema = [
  ...basicSchema,
  {
    field: 'description',
    label: '描述',
    component: 'Textarea',
  },
  {
    field: 'tags',
    label: '标签',
    component: 'Input',
  },
]

const [Form, formApi] = useVbenForm({
  schema: basicSchema,
})

watch(formType, (type) => {
  const schema = type === 'advanced' ? advancedSchema : basicSchema
  formApi.setSchema(schema)
})
</script>

<template>
  <VbenCard title="动态表单">
    <VbenSegmented v-model="formType" :options="[
      { label: '基础', value: 'basic' },
      { label: '高级', value: 'advanced' },
    ]" />
    <Form />
  </VbenCard>
</template>
```

### 表单联动模式

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useVbenForm } from '@/components/form'

const country = ref('')

const [Form, formApi] = useVbenForm({
  schema: [
    {
      field: 'country',
      label: '国家',
      component: 'Select',
      rules: [{ required: true }],
      componentProps: {
        options: [
          { label: '中国', value: 'china' },
          { label: '美国', value: 'usa' },
        ],
        onChange: (value) => {
          country.value = value
          // 动态更新表单字段
          formApi.updateSchema([
            {
              field: 'province',
              label: value === 'china' ? '省份' : '州',
              component: 'Select',
              rules: [{ required: true }],
              componentProps: {
                options: value === 'china'
                  ? [
                      { label: '北京', value: 'beijing' },
                      { label: '上海', value: 'shanghai' },
                    ]
                  : [
                      { label: 'California', value: 'ca' },
                      { label: 'New York', value: 'ny' },
                    ],
              },
            },
          ])
        },
      },
    },
    {
      field: 'province',
      label: '省份',
      component: 'Select',
      rules: [{ required: true }],
      componentProps: {
        options: [],
      },
    },
  ],
})
</script>
```

## 数据获取

### 基础数据获取模式

```typescript
// composables/useFetch.ts
import { ref, Ref } from 'vue'

interface UseFetchOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useFetch<T>(
  url: string | Ref<string>,
  options: UseFetchOptions<T> = {}
) {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(typeof url === 'string' ? url : url.value)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      data.value = result
      
      options.onSuccess?.(result)
    } catch (e) {
      error.value = e as Error
      options.onError?.(e as Error)
      console.error('Fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  // 立即执行
  if (options.immediate) {
    fetchData()
  }

  return {
    data,
    error,
    loading,
    fetchData,
  }
}
```

### 分页数据获取模式

```typescript
// composables/usePagination.ts
import { ref, Ref, computed } from 'vue'

interface PaginationOptions<T> {
  immediate?: boolean
  pageSize?: number
  onSuccess?: (data: T) => void
}

export function usePagination<T>(
  fetchFn: (params: { page: number; pageSize: number }) => Promise<T>,
  options: PaginationOptions<T> = {}
) {
  const page = ref(1)
  const pageSize = ref(options.pageSize || 10)
  const total = ref(0)
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFn({
        page: page.value,
        pageSize: pageSize.value,
      })
      
      data.value = result
      // 假设 result 包含 total 字段
      if (result && typeof result === 'object' && 'total' in result) {
        total.value = (result as any).total
      }
      
      options.onSuccess?.(result)
    } catch (e) {
      error.value = e as Error
      console.error('Pagination fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  const changePage = (newPage: number) => {
    page.value = newPage
    fetchData()
  }

  const changePageSize = (newSize: number) => {
    pageSize.value = newSize
    page.value = 1
    fetchData()
  }

  const refresh = () => {
    fetchData()
  }

  // 立即执行
  if (options.immediate) {
    fetchData()
  }

  return {
    page,
    pageSize,
    total,
    data,
    loading,
    error,
    fetchData,
    changePage,
    changePageSize,
    refresh,
  }
}
```

### 使用示例

```vue
<script setup lang="ts">
import { usePagination } from '@/composables/usePagination'
import { useMessage } from '@/hooks/useMessage'

const { message } = useMessage()

const { 
  page, 
  pageSize, 
  total, 
  data, 
  loading, 
  changePage, 
  changePageSize 
} = usePagination(
  async ({ page, pageSize }) => {
    const res = await api.getUsers({ page, pageSize })
    return res
  },
  {
    immediate: true,
    onSuccess: () => {
      message.success('数据加载成功')
    },
  }
)
</script>

<template>
  <VbenCard title="用户列表">
    <VbenTable 
      :data="data?.list || []" 
      :loading="loading"
      :columns="columns"
    />
    <VbenPagination 
      v-model:page="page" 
      v-model:pageSize="pageSize"
      :total="total"
      @change="changePage"
      @change-size="changePageSize"
    />
  </VbenCard>
</template>
```

### 错误处理模式

```typescript
// composables/useFetchWithErrorHandling.ts
import { ref, Ref } from 'vue'
import { useMessage } from '@/hooks/useMessage'

export function useFetchWithErrorHandling<T>(
  url: string,
  options: {
    immediate?: boolean
    errorMessage?: string
    successMessage?: string
  } = {}
) {
  const { message } = useMessage()
  const data = ref<T | null>(null) as Ref<T | null>
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
      
      const result = await response.json()
      data.value = result
      
      if (options.successMessage) {
        message.success(options.successMessage)
      }
    } catch (e) {
      error.value = e as Error
      console.error('Fetch error:', e)
      
      const errorMessage = options.errorMessage || '请求失败，请稍后重试'
      message.error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  if (options.immediate) {
    fetchData()
  }

  return {
    data,
    error,
    loading,
    fetchData,
  }
}
```

## 列表渲染

### 基础列表模式

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from '@/hooks/useMessage'

const { message } = useMessage()
const list = ref([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.getList()
    list.value = res
  } catch (error) {
    message.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <VbenCard title="列表">
    <VbenTable 
      :data="list" 
      :loading="loading"
      :columns="[
        { title: 'ID', key: 'id' },
        { title: '名称', key: 'name' },
        { title: '状态', key: 'status' },
      ]"
    />
  </VbenCard>
</template>
```

### 搜索列表模式

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const searchKeyword = ref('')
const list = ref([])
const loading = ref(false)

const fetchList = useDebounceFn(async () => {
  loading.value = true
  try {
    const res = await api.searchList({ keyword: searchKeyword.value })
    list.value = res
  } catch (error) {
    console.error('搜索失败', error)
  } finally {
    loading.value = false
  }
}, 300)

watch(searchKeyword, () => {
  fetchList()
}, { immediate: true })
</script>

<template>
  <VbenCard title="搜索列表">
    <VbenInput 
      v-model="searchKeyword" 
      placeholder="搜索关键词"
      clearable
    />
    <VbenTable 
      :data="list" 
      :loading="loading"
      :columns="columns"
    />
  </VbenCard>
</template>
```

### 虚拟滚动列表

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVirtualList } from '@vueuse/core'

const allData = ref([])
const loading = ref(false)

const { list, containerProps, wrapperProps } = useVirtualList(
  allData,
  {
    itemHeight: 50,
    overscan: 10,
  }
)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.getLargeList()
    allData.value = res
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <VbenCard title="虚拟滚动列表">
    <div v-bind="containerProps" style="height: 400px; overflow-y: auto;">
      <div v-bind="wrapperProps">
        <div 
          v-for="item in list" 
          :key="item.data.id"
          style="height: 50px; border-bottom: 1px solid #eee; padding: 10px;"
        >
          {{ item.data.name }}
        </div>
      </div>
    </div>
  </VbenCard>
</template>
```

## 模态框

### 基础模态框模式

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useVbenModal } from '@/components/modal'

const [Modal, modalApi] = useVbenModal({
  title: '编辑用户',
  width: 600,
  onConfirm: async () => {
    // 获取表单数据
    const values = await formApi.getValues()
    // 提交数据
    await api.updateUser(values)
    // 关闭模态框
    modalApi.close()
  },
})
</script>

<template>
  <Modal>
    <VbenForm :schema="schema" />
  </Modal>
</template>
```

### 模态框表单模式

```vue
<script setup lang="ts">
import { useVbenModal } from '@/components/modal'
import { useVbenForm } from '@/components/form'
import { useMessage } from '@/hooks/useMessage'

const { message } = useMessage()

const [Form, formApi] = useVbenForm({
  schema: [
    {
      field: 'name',
      label: '名称',
      component: 'Input',
      rules: [{ required: true }],
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'Input',
      rules: [{ required: true, type: 'email' }],
    },
  ],
})

const [Modal, modalApi] = useVbenModal({
  title: '新增用户',
  width: 600,
  onConfirm: async () => {
    try {
      const values = await formApi.getValues()
      await api.createUser(values)
      message.success('创建成功')
      modalApi.close()
      // 触发父组件刷新
      modalApi.emit?.('success')
    } catch (error) {
      message.error('创建失败')
    }
  },
})
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
```

### 模态框嵌套模式

```vue
<script setup lang="ts">
import { useVbenModal } from '@/components/modal'

// 外层模态框
const [OuterModal, outerModalApi] = useVbenModal({
  title: '外层模态框',
  width: 800,
})

// 内层模态框
const [InnerModal, innerModalApi] = useVbenModal({
  title: '内层模态框',
  width: 600,
  onConfirm: () => {
    innerModalApi.close()
  },
})

const openInnerModal = () => {
  innerModalApi.open()
}
</script>

<template>
  <OuterModal>
    <VbenButton @click="openInnerModal">打开内层模态框</VbenButton>
    
    <InnerModal>
      <p>这是内层模态框的内容</p>
    </InnerModal>
  </OuterModal>
</template>
```

## 状态管理

### 用户状态管理

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
        // 保存到 localStorage
        localStorage.setItem('token', this.token)
        return res
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      await api.logout()
      this.$reset()
      localStorage.removeItem('token')
    },
    
    async fetchUserInfo() {
      if (!this.token) return
      const userInfo = await api.getUserInfo()
      this.userInfo = userInfo
    },
    
    // 从 localStorage 恢复状态
    restoreFromStorage() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        this.fetchUserInfo()
      }
    },
  },
})
```

### 主题状态管理

```typescript
// stores/modules/theme.ts
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    darkMode: false,
    themeColor: '#1890ff',
    layout: 'default', // default, compact, top-menu
    fixedHeader: true,
    showTagsView: true,
  }),

  getters: {
    isDark: (state) => state.darkMode,
    currentTheme: (state) => state.themeColor,
  },

  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      this.applyTheme()
    },
    
    setThemeColor(color: string) {
      this.themeColor = color
      this.applyTheme()
    },
    
    setLayout(layout: string) {
      this.layout = layout
    },
    
    applyTheme() {
      // 应用暗黑模式
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      // 应用主题色
      document.documentElement.style.setProperty('--primary', this.themeColor)
    },
  },
})
```

### 权限状态管理

```typescript
// stores/modules/permission.ts
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    dynamicRoutes: [] as RouteRecordRaw[],
  }),

  getters: {
    accessibleRoutes: (state) => {
      const userStore = useUserStore()
      return state.routes.filter(route => 
        !route.meta?.authority || 
        route.meta.authority.some(role => userStore.roles.includes(role))
      )
    },
  },

  actions: {
    async fetchRoutes() {
      const res = await api.getRoutes()
      this.dynamicRoutes = this.convertToRoutes(res)
      this.routes = [...this.routes, ...this.dynamicRoutes]
    },
    
    convertToRoutes(data: any[]): RouteRecordRaw[] {
      return data.map(item => ({
        path: item.path,
        name: item.name,
        component: () => import(`@/views/${item.component}.vue`),
        meta: {
          title: item.title,
          icon: item.icon,
          authority: item.authority,
        },
        children: item.children ? this.convertToRoutes(item.children) : [],
      }))
    },
    
    resetRoutes() {
      this.routes = []
      this.dynamicRoutes = []
    },
  },
})
```

## 路由配置

### 基础路由模式

```typescript
// router/routes/index.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layouts/default.vue'),
    meta: {
      title: '仪表盘',
      icon: 'mdi:home',
    },
    children: [
      {
        path: '',
        name: 'DashboardIndex',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '概览',
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hideMenu: true,
      ignoreAccess: true,
    },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404',
      hideMenu: true,
    },
  },
]

export default routes
```

### 动态路由模式

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
      {
        path: 'create',
        name: 'UserCreate',
        component: () => import('@/views/user/create/index.vue'),
        meta: {
          title: '创建用户',
          authority: ['admin'],
        },
      },
    ],
  },
]

export default routes
```

### 外部链接模式

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/external',
    name: 'External',
    component: () => import('@/layouts/default.vue'),
    meta: {
      title: '外部链接',
      icon: 'mdi:link',
    },
    children: [
      {
        path: 'github',
        name: 'GitHub',
        component: () => import('@/views/external/iframe.vue'),
        meta: {
          title: 'GitHub',
          url: 'https://github.com',
          target: '_blank',
        },
      },
    ],
  },
]
```

## 国际化

### 基础国际化模式

```typescript
// locales/index.ts
import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    message: {
      hello: '你好',
      welcome: '欢迎',
      login: '登录',
      logout: '退出',
    },
  },
  en: {
    message: {
      hello: 'Hello',
      welcome: 'Welcome',
      login: 'Login',
      logout: 'Logout',
    },
  },
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages,
})
```

### 动态加载语言包

```typescript
// composables/useI18n.ts
import { useI18n as useVueI18n } from 'vue-i18n'

export function useI18n() {
  const { t, locale, messages } = useVueI18n()
  
  const loadLanguage = async (lang: string) => {
    if (messages.value[lang]) {
      locale.value = lang
      return
    }
    
    try {
      const module = await import(`../locales/${lang}.json`)
      messages.value[lang] = module.default
      locale.value = lang
    } catch (error) {
      console.error(`Failed to load language: ${lang}`, error)
    }
  }
  
  return {
    t,
    locale,
    loadLanguage,
  }
}
```

### 语言切换组件

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { locale, loadLanguage } = useI18n()

const languages = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
]

const handleChange = async (value: string) => {
  await loadLanguage(value)
  // 保存到 localStorage
  localStorage.setItem('language', value)
}
</script>

<template>
  <VbenSelect 
    v-model="locale" 
    :options="languages"
    @change="handleChange"
  />
</template>
```

## 权限控制

### 路由权限模式

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

### 按钮权限模式

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 检查权限
const hasPermission = (code: string) => {
  return userStore.hasPermission(code)
}
</script>

<template>
  <VbenButton 
    v-if="hasPermission('user:add')" 
    @click="handleAdd"
  >
    添加用户
  </VbenButton>
  
  <VbenButton 
    v-if="hasPermission('user:edit')" 
    @click="handleEdit"
  >
    编辑用户
  </VbenButton>
</template>
```

### 指令权限模式

```typescript
// directives/access.ts
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/modules/user'

export const vAccess: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userStore = useUserStore()
    const { value, arg } = binding
    
    // v-access:code="'user:add'"
    // v-access:roles="['admin']"
    
    if (arg === 'code') {
      if (!userStore.hasPermission(value)) {
        el.style.display = 'none'
      }
    } else if (arg === 'roles') {
      const hasRole = value.some((role: string) => userStore.roles.includes(role))
      if (!hasRole) {
        el.style.display = 'none'
      }
    }
  },
}
```

## 主题切换

### 暗黑模式切换

```vue
<script setup lang="ts">
import { useThemeStore } from '@/stores/modules/theme'

const themeStore = useThemeStore()

const toggleDarkMode = () => {
  themeStore.toggleDarkMode()
}
</script>

<template>
  <VbenButton @click="toggleDarkMode">
    {{ themeStore.darkMode ? '切换到亮色' : '切换到暗色' }}
  </VbenButton>
</template>
```

### 主题色切换

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/modules/theme'

const themeStore = useThemeStore()
const color = ref(themeStore.themeColor)

const colors = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#eb2f96',
]

const changeColor = (color: string) => {
  themeStore.setThemeColor(color)
}
</script>

<template>
  <div class="color-picker">
    <div 
      v-for="c in colors" 
      :key="c"
      :style="{ backgroundColor: c }"
      class="color-item"
      @click="changeColor(c)"
    />
  </div>
</template>

<style scoped>
.color-picker {
  display: flex;
  gap: 8px;
}
.color-item {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
}
.color-item:hover {
  border-color: #000;
}
</style>
```

## 文件上传

### 基础上传模式

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from '@/hooks/useMessage'

const { message } = useMessage()
const fileList = ref([])
const uploading = ref(false)

const handleUpload = async (file: File) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await api.uploadFile(formData)
    message.success('上传成功')
    fileList.value.push(res)
  } catch (error) {
    message.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2MB')
    return false
  }
  
  return true
}
</script>

<template>
  <VbenUpload
    v-model:file-list="fileList"
    :before-upload="beforeUpload"
    :custom-request="handleUpload"
    :uploading="uploading"
  >
    <VbenButton>点击上传</VbenButton>
  </VbenUpload>
</template>
```

### 分片上传模式

```typescript
// composables/useChunkUpload.ts
import { ref } from 'vue'

interface Chunk {
  file: Blob
  index: number
  total: number
  size: number
}

export function useChunkUpload() {
  const progress = ref(0)
  const uploading = ref(false)

  const uploadFile = async (file: File, chunkSize = 5 * 1024 * 1024) => {
    uploading.value = true
    progress.value = 0
    
    const chunks: Chunk[] = []
    const totalChunks = Math.ceil(file.size / chunkSize)
    
    // 分割文件
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      chunks.push({
        file: file.slice(start, end),
        index: i,
        total: totalChunks,
        size: end - start,
      })
    }
    
    // 上传分片
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const formData = new FormData()
      formData.append('file', chunk.file)
      formData.append('index', chunk.index.toString())
      formData.append('total', chunk.total.toString())
      formData.append('name', file.name)
      
      await api.uploadChunk(formData)
      
      progress.value = Math.round(((i + 1) / chunks.length) * 100)
    }
    
    // 合并分片
    await api.mergeChunks({
      name: file.name,
      total: totalChunks,
    })
    
    uploading.value = false
    progress.value = 100
    
    return {
      name: file.name,
      size: file.size,
    }
  }

  return {
    progress,
    uploading,
    uploadFile,
  }
}
```

## 总结

### 常见模式总结

1. **表单处理**：使用 Vben Form 组件，支持动态表单、表单联动、表单验证
2. **数据获取**：使用 composables 封装 fetch 逻辑，支持分页、错误处理
3. **列表渲染**：支持基础列表、搜索列表、虚拟滚动
4. **模态框**：支持基础模态框、表单模态框、嵌套模态框
5. **状态管理**：使用 Pinia 进行模块化状态管理
6. **路由配置**：支持静态路由、动态路由、外部链接
7. **国际化**：使用 vue-i18n，支持动态加载语言包
8. **权限控制**：支持路由权限、按钮权限、指令权限
9. **主题切换**：支持暗黑模式、主题色切换
10. **文件上传**：支持基础上传、分片上传

### 最佳实践

1. **组件化**：将逻辑封装到 composables 中
2. **类型安全**：使用 TypeScript 定义类型
3. **错误处理**：完善的错误处理机制
4. **性能优化**：使用计算属性、虚拟滚动等
5. **代码复用**：提取公共逻辑到 composables
6. **测试覆盖**：编写单元测试保证质量
7. **文档完善**：为组件和函数编写文档

### 检查清单

在实现功能时，确保：

- [ ] 使用 TypeScript 类型定义
- [ ] 使用 composables 封装逻辑
- [ ] 完善的错误处理
- [ ] 性能优化到位
- [ ] 编写单元测试
- [ ] 遵循 Vben Admin 约定
- [ ] 代码格式化正确
- [ ] 文档完善
