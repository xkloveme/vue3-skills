# Vben Admin 迁移指南

本文档提供从 Vben Admin 2.x 迁移到 Vben Admin 5.x 的指南，以及从其他 Vue 3 后台框架迁移到 Vben Admin 的指南。

## 📋 目录

- [Vben Admin 2.x → 5.x 迁移](#vben-admin-2x--5x-迁移)
- [从其他框架迁移](#从其他框架迁移)
- [常见问题](#常见问题)

## Vben Admin 2.x → 5.x 迁移

### 重要说明

**Vben Admin 5.x 与 2.x 不兼容**，这是一个重大版本更新，需要重新搭建项目。

### 主要变化

#### 1. 技术栈升级

| 组件 | Vben Admin 2.x | Vben Admin 5.x |
|------|----------------|----------------|
| Vue | 3.2 | 3.4+ |
| Vite | 2.x | 5.x |
| TypeScript | 4.x | 5.x |
| UI 库 | Ant Design Vue 2.x | Ant Design Vue 4.x / Element Plus / Naive UI |
| 状态管理 | Vuex 4 | Pinia |
| 路由 | Vue Router 4 | Vue Router 4 |
| 测试 | Jest | Vitest |

#### 2. 项目结构变化

**Vben Admin 2.x:**
```
src/
├── api/
├── assets/
├── components/
├── layout/
├── router/
├── store/
├── utils/
├── views/
└── main.ts
```

**Vben Admin 5.x:**
```
apps/web-antd/src/
├── api/
├── assets/
├── components/
├── composables/
├── constants/
├── layouts/
├── router/
├── stores/
├── utils/
├── views/
└── main.ts
```

#### 3. 状态管理迁移 (Vuex → Pinia)

**Vben Admin 2.x (Vuex):**
```typescript
// store/modules/user.ts
import { Module } from 'vuex'

const userModule: Module<any, any> = {
  namespaced: true,
  state: () => ({
    userInfo: null,
    token: '',
  }),
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
  },
  actions: {
    async login({ commit }, payload) {
      const res = await api.login(payload)
      commit('SET_TOKEN', res.token)
      commit('SET_USER_INFO', res.user)
    },
  },
}

export default userModule
```

**Vben Admin 5.x (Pinia):**
```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import type { UserInfo, LoginParams } from '#/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: '',
  }),

  actions: {
    async login(params: LoginParams) {
      const res = await api.login(params)
      this.token = res.token
      this.userInfo = res.user
    },
  },
})
```

#### 4. 组件语法迁移

**Vben Admin 2.x:**
```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="handleClick">点击</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MyComponent',
  props: {
    title: {
      type: String,
      default: '标题',
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const count = ref(0)

    const handleClick = () => {
      count.value++
      emit('click', count.value)
    }

    return {
      count,
      handleClick,
    }
  },
})
</script>
```

**Vben Admin 5.x:**
```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="handleClick">点击</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '标题',
})

const emit = defineEmits<{
  click: [value: number]
}>()

const count = ref(0)

const handleClick = () => {
  count.value++
  emit('click', count.value)
}
</script>
```

#### 5. 路由配置迁移

**Vben Admin 2.x:**
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
})

export default router
```

**Vben Admin 5.x:**
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
]

export default routes
```

#### 6. API 请求迁移

**Vben Admin 2.x:**
```typescript
// api/user.ts
import request from '@/utils/request'

export function login(data: any) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data,
  })
}

export function getUserInfo() {
  return request({
    url: '/api/user/info',
    method: 'get',
  })
}
```

**Vben Admin 5.x:**
```typescript
// api/user.ts
import { request } from '@/utils/request'
import type { LoginParams, LoginResponse, UserInfo } from '#/auth'

export async function login(data: LoginParams): Promise<LoginResponse> {
  return request.post('/api/auth/login', data)
}

export async function getUserInfo(): Promise<UserInfo> {
  return request.get('/api/user/info')
}
```

#### 7. 配置文件迁移

**Vben Admin 2.x:**
```typescript
// src/settings/projectSetting.ts
import { ProjectConfig } from '#/config'

const projectSetting: ProjectConfig = {
  // 主题色
  themeColor: '#1890ff',
  // 模式
  mode: 'light',
  // 布局
  layout: 'default',
  // 其他配置...
}

export default projectSetting
```

**Vben Admin 5.x:**
```typescript
// src/config/project.ts
import type { ProjectConfig } from '#/config'

export const projectConfig: ProjectConfig = {
  // 主题色
  themeColor: '#1890ff',
  // 模式
  mode: 'light',
  // 布局
  layout: 'default',
  // 其他配置...
}
```

### 迁移步骤

#### 步骤 1: 备份旧项目

```bash
# 备份 Vben Admin 2.x 项目
cp -r vben-admin-2.x vben-admin-2.x-backup
```

#### 步骤 2: 创建新项目

```bash
# 克隆 Vben Admin 5.x
git clone https://github.com/vbenjs/vue-vben-admin.git vben-admin-5.x
cd vben-admin-5.x
pnpm install
```

#### 步骤 3: 迁移业务代码

1. **迁移组件**
   - 将旧项目的组件复制到新项目的 `src/components/`
   - 重构为 `<script setup>` 语法
   - 更新 Props 和 Emits 定义

2. **迁移页面**
   - 将旧项目的页面复制到新项目的 `src/views/`
   - 更新组件导入路径
   - 更新路由配置

3. **迁移状态管理**
   - 将 Vuex store 重构为 Pinia store
   - 更新组件中的 store 使用方式

4. **迁移 API**
   - 将旧项目的 API 文件复制到新项目的 `src/api/`
   - 更新请求库和类型定义

5. **迁移工具函数**
   - 将旧项目的工具函数复制到新项目的 `src/utils/`
   - 更新导入路径

#### 步骤 4: 更新配置

1. **更新环境变量**
   - 复制 `.env` 文件
   - 更新变量名和值

2. **更新路由配置**
   - 按照新格式重构路由
   - 更新权限配置

3. **更新主题配置**
   - 使用新的主题系统
   - 更新 CSS 变量

#### 步骤 5: 测试和调试

```bash
# 启动开发服务器
pnpm dev

# 运行类型检查
pnpm type-check

# 运行代码检查
pnpm lint

# 运行测试
pnpm test
```

### 常见问题

#### 1. 组件语法不兼容

**问题**: 旧组件使用 Options API，新项目使用 Composition API

**解决方案**:
- 使用 `<script setup>` 语法重构组件
- 参考 [Vue 3 Composition API](https://vuejs.org/guide/introduction.html#composition-api)

#### 2. 状态管理不兼容

**问题**: Vuex store 无法直接使用

**解决方案**:
- 按照 Pinia 语法重构 store
- 参考 [Pinia 官方文档](https://pinia.vuejs.org/)

#### 3. 路由配置不兼容

**问题**: 路由配置格式不同

**解决方案**:
- 按照新格式重构路由
- 参考 [Vue Router 官方文档](https://router.vuejs.org/)

#### 4. 样式不兼容

**问题**: 样式系统不同

**解决方案**:
- 更新样式类名
- 使用新的 CSS 变量系统

## 从其他框架迁移

### 从 Element Plus Admin 迁移

#### 主要变化

1. **UI 组件库**: Element Plus → Ant Design Vue / Element Plus / Naive UI
2. **路由系统**: 相同 (Vue Router 4)
3. **状态管理**: Pinia (相同)
4. **构建工具**: Vite (相同)

#### 迁移步骤

1. **选择 UI 库**
   ```bash
   # 如果继续使用 Element Plus
   # 无需更换 UI 库

   # 如果切换到 Ant Design Vue
   pnpm add ant-design-vue@4.x

   # 如果切换到 Naive UI
   pnpm add naive-ui
   ```

2. **更新组件导入**
   ```typescript
   // 旧代码
   import { ElButton, ElInput } from 'element-plus'

   // 新代码 (Ant Design Vue)
   import { Button, Input } from 'ant-design-vue'

   // 新代码 (Naive UI)
   import { NButton, NInput } from 'naive-ui'
   ```

3. **更新组件 API**
   ```vue
   <!-- 旧代码 (Element Plus) -->
   <el-button type="primary" @click="handleClick">按钮</el-button>

   <!-- 新代码 (Ant Design Vue) -->
   <a-button type="primary" @click="handleClick">按钮</a-button>

   <!-- 新代码 (Naive UI) -->
   <n-button type="primary" @click="handleClick">按钮</n-button>
   ```

4. **更新样式**
   - Element Plus 使用 `el-` 前缀
   - Ant Design Vue 使用 `a-` 前缀
   - Naive UI 使用 `n-` 前缀

### 从 Vue Element Admin 迁移

#### 主要变化

1. **Vue 版本**: Vue 2 → Vue 3
2. **UI 组件库**: Element UI → Element Plus / Ant Design Vue / Naive UI
3. **状态管理**: Vuex → Pinia
4. **路由系统**: Vue Router 3 → Vue Router 4
5. **构建工具**: Webpack → Vite

#### 迁移步骤

1. **升级 Vue 版本**
   - 重构组件为 Vue 3 语法
   - 更新生命周期钩子
   - 更新事件处理

2. **迁移状态管理**
   - 从 Vuex 迁移到 Pinia
   - 参考上面的 Pinia 迁移示例

3. **更新路由配置**
   - 从 Vue Router 3 迁移到 Vue Router 4
   - 更新路由守卫语法

4. **更新 UI 组件**
   - 从 Element UI 迁移到 Element Plus 或其他 UI 库
   - 更新组件 API

5. **更新构建工具**
   - 从 Webpack 迁移到 Vite
   - 更新配置文件

### 从 Ant Design Pro Vue 迁移

#### 主要变化

1. **Vue 版本**: Vue 2 → Vue 3
2. **UI 组件库**: Ant Design Vue 1.x → Ant Design Vue 4.x
3. **状态管理**: Vuex → Pinia
4. **路由系统**: Vue Router 3 → Vue Router 4
5. **构建工具**: Webpack → Vite

#### 迁移步骤

1. **升级 Vue 版本**
   - 重构组件为 Vue 3 语法
   - 更新 Composition API 使用

2. **升级 Ant Design Vue**
   - 从 1.x 升级到 4.x
   - 更新组件 API 和样式

3. **迁移状态管理**
   - 从 Vuex 迁移到 Pinia

4. **更新路由配置**
   - 从 Vue Router 3 迁移到 Vue Router 4

5. **更新构建工具**
   - 从 Webpack 迁移到 Vite

## 常见问题

### 1. 组件不兼容

**问题**: 旧组件无法在新项目中使用

**解决方案**:
- 逐步重构组件
- 使用 Composition API
- 更新 Props 和 Emits 定义

### 2. 样式不兼容

**问题**: 样式系统不同

**解决方案**:
- 更新样式类名
- 使用新的 CSS 变量系统
- 参考新项目的样式规范

### 3. 路由不兼容

**问题**: 路由配置格式不同

**解决方案**:
- 按照新格式重构路由
- 更新路由守卫
- 更新权限配置

### 4. 状态管理不兼容

**问题**: Vuex store 无法直接使用

**解决方案**:
- 按照 Pinia 语法重构 store
- 更新组件中的 store 使用方式

### 5. API 请求不兼容

**问题**: 请求库或 API 格式不同

**解决方案**:
- 更新请求库
- 更新 API 类型定义
- 更新错误处理

## 迁移检查清单

### 迁移前

- [ ] 备份旧项目
- [ ] 阅读 Vben Admin 5.x 文档
- [ ] 了解新项目结构
- [ ] 准备迁移计划

### 迁移中

- [ ] 创建新项目
- [ ] 迁移业务代码
- [ ] 重构组件语法
- [ ] 迁移状态管理
- [ ] 更新路由配置
- [ ] 更新 API 请求
- [ ] 更新配置文件
- [ ] 更新样式

### 迁移后

- [ ] 运行类型检查
- [ ] 运行代码检查
- [ ] 运行单元测试
- [ ] 手动测试功能
- [ ] 性能测试
- [ ] 部署测试

## 总结

从 Vben Admin 2.x 或其他框架迁移到 Vben Admin 5.x 需要：

1. **理解新架构**: 熟悉 Monorepo 结构和新项目结构
2. **重构代码**: 将旧代码重构为新语法
3. **更新依赖**: 更新 UI 组件库和工具库
4. **测试验证**: 确保所有功能正常工作

建议逐步迁移，先迁移核心功能，再迁移其他功能。如果项目较大，可以考虑分模块迁移。
