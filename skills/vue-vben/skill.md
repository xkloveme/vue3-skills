---
name: vue-vben
description: Vben Admin 企业级中后台解决方案开发技能。适用于基于 Vben Admin 框架开发 Vue 3 中后台管理系统。涵盖：(1) Vben Admin 项目结构与配置，(2) 组件开发与二次封装，(3) 状态管理 (Pinia)，(4) 路由与权限系统，(5) 主题与样式定制，(6) 构建与部署，(7) 测试与代码质量，(8) Monorepo 工程化。包含最佳实践、常见模式和开发工作流。
---

# Vben Admin 企业级开发技能

全面的 Vben Admin 开发技能，提供企业级中后台解决方案的最佳实践、常见模式和开发指南。

## 🚀 Vben Admin 简介

**Vben Admin** 是一个基于 [Vue3](https://github.com/vuejs/core)、[Vite](https://github.com/vitejs/vite)、[TypeScript](https://www.typescriptlang.org/) 的中后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。

### 核心特点

- **最新技术栈**：使用 `Vue3`、`Vite`、`TypeScript` 等前端前沿技术开发
- **国际化**：内置完善的国际化方案，支持多语言切换
- **权限验证**：完善的权限验证方案，按钮级别权限控制
- **多主题**：内置多种主题配置和黑暗模式，满足个性化需求
- **动态菜单**：支持动态菜单，可以根据权限配置显示菜单
- **Mock 数据**：基于 `Nitro` 的本地高性能 Mock 数据方案
- **组件丰富**：提供了丰富的组件，可以满足大部分的业务需求
- **规范**：代码规范，使用 `ESLint`、`Prettier`、`Stylelint`、`Publint`、`CSpell` 等工具保证代码质量
- **工程化**：使用 `Pnpm Monorepo`、`TurboRepo`、`Changeset` 等工具，提高开发效率
- **多UI库支持**：支持 `Ant Design Vue`、`Element Plus`、`Naive` 等主流 UI 库，不再限制于特定框架

## 📦 项目结构

### Monorepo 架构

Vben Admin 采用 **Monorepo** 架构，使用 **pnpm workspaces** 和 **TurboRepo** 进行管理：

```
vue-vben-admin/
├── apps/                    # 应用程序
│   ├── web-antd/           # Ant Design Vue 版本
│   ├── web-ele/            # Element Plus 版本
│   ├── web-naive/          # Naive UI 版本
│   ├── web-tdesign/        # TDesign 版本
│   ├── playground/         # 开发测试应用
│   └── docs/               # 文档站点
├── packages/               # 共享包
│   ├── effects/            # 通用效果
│   ├── hooks/              # 共享 Hooks
│   ├── utils/              # 工具函数
│   └── ...
├── internal/               # 内部工具
│   └── lint-configs/       # 代码规范配置
├── scripts/                # 脚本工具
└── ...
```

### 应用目录结构

每个应用（如 `web-antd`）的典型结构：

```
apps/web-antd/src/
├── api/                    # API 接口
├── assets/                 # 静态资源
├── components/             # 业务组件
│   ├── common/             # 公共组件
│   ├── layout/             # 布局组件
│   └── features/           # 功能组件
├── composables/            # 组合式函数
├── constants/              # 常量定义
├── layouts/                # 页面布局
├── router/                 # 路由配置
│   ├── routes/             # 路由定义
│   │   ├── core/           # 核心路由
│   │   ├── index.ts        # 静态路由
│   │   └── modules/        # 动态路由模块
│   └── ...
├── stores/                 # Pinia 状态管理
├── utils/                  # 工具函数
├── views/                  # 页面组件
└── ...
```

## 🔧 核心能力

### 1. 路由与菜单系统

Vben Admin 的路由系统基于 **Vue Router**，并自动生成对应的菜单结构。

#### 路由分类

1. **核心路由 (Core Routes)**：框架内置的路由（登录、404等）
   - 配置位置：`src/router/routes/core`
   - 不建议修改业务逻辑

2. **静态路由 (Static Routes)**：项目启动时确定的路由
   - 配置位置：`src/router/routes/index`

3. **动态路由 (Dynamic Routes)**：登录后根据权限动态生成的路由
   - 配置位置：`src/router/routes/modules`

#### 路由配置示例

```typescript
// src/router/routes/modules/demo.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('@/views/demo/index.vue'),
    meta: {
      title: '演示页面',
      icon: 'mdi:home',
      order: 1,
      // 权限控制
      authority: ['admin', 'user'],
      // 忽略权限检查
      ignoreAccess: false,
    },
    children: [
      {
        path: 'list',
        name: 'DemoList',
        component: () => import('@/views/demo/list/index.vue'),
        meta: {
          title: '列表页',
          icon: 'mdi:format-list-bulleted',
        },
      },
      {
        path: 'detail/:id',
        name: 'DemoDetail',
        component: () => import('@/views/demo/detail/index.vue'),
        meta: {
          title: '详情页',
          hideMenu: true, // 隐藏菜单
        },
      },
    ],
  },
]

export default routes
```

#### 菜单生成

菜单结构自动从路由配置中生成，支持：
- 多级菜单（嵌套路由）
- 菜单图标
- 菜单排序
- 隐藏菜单项
- 外部链接

### 2. 权限系统

Vben Admin 提供三种访问控制方法：

#### 前端权限控制

权限在前端路由中硬编码，适合角色相对固定的系统。

```typescript
// 路由配置中定义权限
meta: {
  authority: ['admin', 'editor'], // 只有 admin 和 editor 可以访问
}
```

#### 后端权限控制

路由表通过 API 动态生成，适合权限复杂的系统。

```typescript
// 登录后获取动态路由
const fetchRoutes = async () => {
  const routes = await api.getRoutes()
  // 将后端返回的路由结构转换为 Vue Router 格式
  const routerRoutes = convertToRouterRoutes(routes)
  // 添加到路由
  router.addRoute(routerRoutes)
}
```

#### 混合模式

结合前端固定路由和后端动态菜单，提供灵活性。

#### 按钮级权限

支持基于权限码或角色的按钮级控制：

```vue
<template>
  <!-- 使用组件方式 -->
  <VbenButton v-if="hasAccessByCode('user:add')">添加用户</VbenButton>
  
  <!-- 使用指令方式 -->
  <VbenButton v-access:code="'user:add'">添加用户</VbenButton>
  
  <!-- 使用 API 方式 -->
  <VbenButton v-if="hasAccessByRoles(['admin'])">管理员操作</VbenButton>
</template>

<script setup>
import { hasAccessByCode, hasAccessByRoles } from '@/utils/auth'
</script>
```

### 3. 状态管理 (Pinia)

Vben Admin 使用 **Pinia** 进行状态管理，采用模块化设计。

#### Store 模式

每个功能模块创建独立的 Store：

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import type { UserInfo } from '#/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: '',
    roles: [] as string[],
    permissions: [] as string[],
  }),

  getters: {
    isAdmin: (state) => state.roles.includes('admin'),
    hasPermission: (state) => (code: string) => state.permissions.includes(code),
  },

  actions: {
    async login(username: string, password: string) {
      const res = await api.login({ username, password })
      this.token = res.token
      this.userInfo = res.user
      this.roles = res.roles
      this.permissions = res.permissions
    },
    
    async logout() {
      this.$reset()
    },
  },
})
```

#### 在组件中使用

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const { userInfo, isAdmin } = storeToRefs(userStore)
</script>
```

### 4. 组件开发

Vben Admin 提供丰富的二次封装组件，支持 Ant Design Vue、Element Plus、Naive UI 等 UI 库。

#### 组件命名规范

- **组件名**：PascalCase（如 `VbenButton`、`VbenTable`）
- **文件名**：PascalCase（如 `VbenButton.vue`）
- **目录名**：kebab-case（如 `components/common/`）

#### 组件开发最佳实践

1. **使用 `<script setup>` 语法**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  loading?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  size: 'medium',
})

const emit = defineEmits<{
  click: [value: number]
}>()

const handleClick = () => {
  emit('click', 1)
}
</script>
```

2. **使用 Vben 组件库**
```vue
<template>
  <VbenCard title="卡片标题">
    <VbenButton @click="handleClick">按钮</VbenButton>
    <VbenTable :data="data" :columns="columns" />
  </VbenCard>
</template>
```

3. **表单组件开发**
```vue
<script setup lang="ts">
import { useForm } from '@/hooks/useForm'
import { useVbenForm } from '@/components/form'

const [Form, formApi] = useVbenForm({
  schema: [
    {
      field: 'username',
      label: '用户名',
      component: 'Input',
      rules: [{ required: true, message: '请输入用户名' }],
    },
    {
      field: 'password',
      label: '密码',
      component: 'InputPassword',
      rules: [{ required: true, message: '请输入密码' }],
    },
  ],
  onSubmit: async (values) => {
    await api.submit(values)
  },
})

#### 4. 列表页面开发

Vben Admin 提供完整的列表页面开发模式，包含搜索表单、表格、CRUD 操作等。

##### 可用模板

- `assets/list-templates/OperatorList.vue` - 运营方管理列表页面（完整示例）
- `assets/list-templates/modal.vue` - 新增/编辑模态框
- `assets/list-templates/api.ts` - API 接口定义

##### 使用方法

```bash
# 1. 复制模板文件
cp assets/list-templates/OperatorList.vue src/views/operator/
cp assets/list-templates/modal.vue src/views/operator/components/
cp assets/list-templates/api.ts src/api/operator/
```

##### 完整列表页面示例

```vue
<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';
import { useRouter } from 'vue-router';
import { message, Button, Switch, Modal as AntModal } from 'ant-design-vue';

import {
  getUserList,
  addUser,
  delUser,
  updateUser,
  resetUserPassword,
  updateStatus,
} from '#/api/operator';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import ExtraModal from './modal.vue';

// 搜索表单配置
const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'operatorName',
      label: '运营方名称',
    },
  ],
  submitOnChange: true,
  submitOnEnter: false,
};

// 表格配置
const gridOptions = {
  columns: [
    { title: '序号', type: 'seq', width: 80 },
    { field: 'operatorName', title: '运营方名称', minWidth: 150 },
    { field: 'status', slots: { default: 'status' }, title: '状态', width: 100 },
    { slots: { default: 'action' }, fixed: 'right', width: 250, title: '操作' },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getUserList({
          pageIndex: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

// 创建表格
const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false,
  formOptions,
  gridOptions,
});

// 创建模态框
const [Modal, modalApi] = useVbenModal({
  connectedComponent: ExtraModal,
  onOpenChange(isOpen) {
    if (!isOpen) {
      gridApi.query();
    }
  },
});

// 打开模态框
function openModal(row?) {
  if (row) {
    modalApi.setData({ row });
    modalApi.setState({ title: '编辑运营方' });
  } else {
    modalApi.setData({});
    modalApi.setState({ title: '新增运营方' });
  }
  modalApi.open();
}

// 路由跳转
const router = useRouter();
function openDetail(operatorId) {
  router.push({ name: 'OperatorDetail', query: { operatorId } });
}
</script>

<template>
  <Page auto-content-height title="运营方管理">
    <template #extra>
      <Button type="primary" ghost @click="openModal()">新增</Button>
    </template>
    <Grid>
      <template #operatorName="{ row }">
        <Button type="link" @click="openDetail(row.operatorId)">
          {{ row.operatorName }}
        </Button>
      </template>
      <template #status="{ row }">
        <Switch :checked="row.status === 'ON'" />
      </template>
      <template #action="{ row }">
        <Button type="link" @click="openModal(row)">编辑</Button>
        <Button type="link" @click="handleAction(row, 'reset')">重置密码</Button>
        <Button 
          type="link" 
          @click="handleAction(row, row.status === 'ON' ? 'stop' : 'start')"
        >
          {{ row.status === 'ON' ? '停用' : '启用' }}
        </Button>
      </template>
    </Grid>
    <Modal />
  </Page>
</template>
```

##### 核心功能

| 功能 | 说明 |
|------|------|
| 搜索表单 | 支持字段搜索、回车提交、值变化时提交 |
| 表格 | 支持分页、排序、复选、工具栏、自定义列 |
| 模态框 | 支持新增、编辑、表单验证 |
| CRUD | 支持增删改查、状态切换、密码重置 |
| 路由 | 支持页面跳转、详情页导航 |

### 5. 主题与样式

Vben Admin 基于 **shadcn-vue** 和 **tailwindcss**，提供丰富的主题配置。

#### 主题定制

使用 CSS 变量定制主题：

```css
/* src/styles/theme.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

#### 暗黑模式

暗黑模式通过 CSS 变量和 Tailwind 的 `dark:` 类实现：

```vue
<template>
  <div class="bg-background text-foreground dark:bg-dark-background">
    <!-- 内容 -->
  </div>
</template>
```

#### 切换主题

```typescript
import { useThemeStore } from '@/stores/modules/theme'

const themeStore = useThemeStore()

// 切换暗黑模式
themeStore.toggleDarkMode()

// 设置主题色
themeStore.setThemeColor('#1890ff')
```

### 6. 构建与部署

#### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 启动特定应用
pnpm dev --filter @vben/web-antd
```

#### 构建

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm build --filter @vben/web-antd

# 构建并分析
pnpm run build:analyze
```

#### 预览

```bash
# 预览构建结果
pnpm preview

# 预览特定应用
pnpm preview --filter @vben/web-antd
```

#### 部署配置

1. **环境变量配置**
```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_GLOB_API_URL=https://api.example.com
```

2. **Nginx 配置示例**
```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        root /var/www/vben-admin;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:8080;
    }
}
```

### 7. 测试

Vben Admin 支持单元测试，使用 **Vitest** 和 **Vue Test Utils**。

#### 测试配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

#### 测试示例

```typescript
// tests/components/VbenButton.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VbenButton from '@/components/common/VbenButton.vue'

describe('VbenButton', () => {
  it('renders correctly', () => {
    const wrapper = mount(VbenButton, {
      props: { label: 'Click me' },
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(VbenButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

#### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test tests/components/VbenButton.spec.ts

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

### 8. 代码质量

Vben Admin 使用多种工具保证代码质量：

#### ESLint

```bash
# 检查代码
pnpm lint

# 自动修复
pnpm lint:fix
```

#### Prettier

```bash
# 格式化代码
pnpm format
```

#### Stylelint

```bash
# 检查样式
pnpm stylelint

# 自动修复样式
pnpm stylelint:fix
```

#### CSpell (拼写检查)

```bash
# 检查拼写
pnpm run check:cspell
```

#### 提交前检查

Vben Admin 使用 **lefthook** 在提交前自动运行检查：

```bash
# 安装 lefthook
pnpm lefthook install

# 提交时自动检查
git commit -m "feat: add new feature"
# 会自动运行 lint, type-check, test 等
```

## 🛠️ 开发工作流

### 工作流 1: 创建新功能模块

```bash
# 1. 创建路由配置
# src/router/routes/modules/feature.ts
# 定义路由结构和权限

# 2. 创建页面组件
# src/views/feature/index.vue
# 使用 Vben 组件库

# 3. 创建 API 接口
# src/api/feature.ts
# 定义接口类型和请求函数

# 4. 创建状态管理 (如果需要)
# src/stores/modules/feature.ts
# 使用 Pinia 管理状态

# 5. 运行检查
pnpm lint
pnpm type-check
pnpm test
```

### 工作流 2: 二次封装组件

```bash
# 1. 查看现有组件
# packages/effects/src/components/

# 2. 创建新组件
# apps/web-antd/src/components/common/MyComponent.vue

# 3. 使用 TypeScript 类型
# 定义 Props 和 Emits 接口

# 4. 添加单元测试
# tests/components/MyComponent.spec.ts

# 5. 运行测试
pnpm test tests/components/MyComponent.spec.ts
```

### 工作流 3: 主题定制

```bash
# 1. 修改 CSS 变量
# src/styles/theme.css

# 2. 更新 Tailwind 配置
# tailwind.config.js

# 3. 测试暗黑模式
# 在浏览器中切换主题

# 4. 构建验证
pnpm build
pnpm preview
```

### 工作流 4: 权限配置

```bash
# 1. 前端路由配置
# src/router/routes/modules/feature.ts
# 添加 authority 字段

# 2. 后端权限接口
# src/api/permission.ts
# 获取用户权限列表

# 3. 按钮级权限
# 在组件中使用 v-access 指令

# 4. 测试权限
# 使用不同角色账号登录测试
```

## 📚 参考文档

### 核心参考

在处理特定任务时，请务必阅读以下文档：

**路由与菜单:**
- `doc.vben.pro/guide/essentials/route.html` - 路由和菜单配置

**权限系统:**
- `doc.vben.pro/guide/in-depth/access.html` - 访问控制详解

**主题定制:**
- `doc.vben.pro/guide/in-depth/theme.html` - 主题配置指南

**构建部署:**
- `doc.vben.pro/guide/essentials/build.html` - 构建与部署

**代码规范:**
- `doc.vben.pro/guide/project/standard.html` - 代码规范标准

### 何时阅读参考文档

**开始新项目前:**
1. 阅读快速开始指南
2. 了解项目结构和配置
3. 熟悉核心概念

**实现功能时:**
- 路由配置 → 路由与菜单文档
- 权限控制 → 访问控制文档
- 主题定制 → 主题文档
- 构建部署 → 构建部署文档

**遇到问题时:**
- 查看常见问题 (FAQ)
- 搜索 GitHub Issues
- 参考示例代码

## ⚠️ 常见陷阱与最佳实践

### 路由配置

1. **动态路由加载时机**
   - 必须在登录后加载动态路由
   - 避免在路由守卫中重复加载

2. **路由权限配置**
   - 使用 `authority` 字段控制权限
   - 设置 `ignoreAccess: true` 忽略权限检查

3. **菜单隐藏**
   - 使用 `hideMenu: true` 隐藏菜单项
   - 使用 `hideBreadcrumb: true` 隐藏面包屑

### 状态管理

1. **Store 命名**
   - 使用小写加连字符命名（如 `user`、`permission`）
   - 避免使用大写或特殊字符

2. **Store 拆分**
   - 按功能模块拆分 Store
   - 避免创建巨型 Store

3. **异步操作**
   - 在 actions 中处理异步逻辑
   - 使用 try-catch 处理错误

### 组件开发

1. **Props 验证**
   - 使用 TypeScript 接口定义 Props
   - 提供默认值和验证规则

2. **组件通信**
   - 使用 emit 事件而非直接修改 props
   - 复杂状态使用 Pinia Store

3. **性能优化**
   - 使用 `v-show` 处理频繁切换
   - 使用 `defineAsyncComponent` 懒加载

### 主题定制

1. **CSS 变量**
   - 使用 `hsl` 格式定义颜色
   - 同时定义 `:root` 和 `.dark` 选择器

2. **Tailwind 配置**
   - 扩展主题色
   - 自定义组件样式

3. **暗黑模式**
   - 测试两种模式下的显示
   - 确保颜色对比度符合标准

## 🔗 外部资源

### 官方文档
- [Vben Admin 官方文档](https://doc.vben.pro/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

### UI 库
- [Ant Design Vue](https://www.antdv.com/)
- [Element Plus](https://element-plus.org/)
- [Naive UI](https://www.naiveui.com/)
- [Shadcn Vue](https://www.shadcn-vue.com/)

### 工具库
- [Pinia](https://pinia.vuejs.org/) - 状态管理
- [Vue Router](https://router.vuejs.org/) - 路由管理
- [Vitest](https://vitest.dev/) - 测试框架
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架

### 开发工具
- [VS Code](https://code.visualstudio.com/) - 推荐编辑器
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 语言支持
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - TypeScript 支持

## 📖 本技能使用提示

1. **始终从官方文档开始**: 编码前阅读相关文档
2. **遵循现有模式**: 不要创建新的模式，遵循 Vben Admin 的约定
3. **使用 TypeScript**: Vben Admin 是 TypeScript 项目，保持类型安全
4. **测试驱动**: 编写测试后再实现功能
5. **代码审查**: 使用 ESLint 和 Prettier 保证代码质量
6. **性能优化**: 关注构建大小和运行时性能
7. **安全考虑**: 注意权限控制和数据验证

## 💡 提示词优化建议

当使用 AI 辅助开发时，可以尝试以下提示词:

1. **生成组件**: "创建一个 Vben Admin 的 [功能] 组件，使用 Ant Design Vue 组件库，包含完整的 TypeScript 类型定义和权限控制。"
2. **路由配置**: "为 Vben Admin 配置一个动态路由模块，包含权限控制和菜单生成。"
3. **状态管理**: "创建一个 Pinia Store 用于管理 [功能] 状态，包含异步操作和错误处理。"
4. **主题定制**: "为 Vben Admin 定制一套主题色，包括浅色和深色模式，使用 CSS 变量。"
5. **权限实现**: "实现 Vben Admin 的按钮级权限控制，支持权限码和角色两种方式。"
6. **构建优化**: "优化 Vben Admin 的构建配置，减少包大小并提升性能。"
