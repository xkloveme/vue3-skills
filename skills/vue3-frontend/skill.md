---
name: vue3-frontend
description: 全面的 Vue 3 前端开发技能。适用于开发 Vue 3 应用程序、组件或组合式函数时。涵盖：(1) 创建新的 Vue 3 项目和组件，(2) Vue 2 到 Vue 3 的迁移，(3) 代码审查和优化，(4) Composition API 实现，(5) 最佳实践和常见模式，(6) TypeScript 集成，(7) 使用 Pinia 进行状态管理，(8) 性能优化。包含组件模板、Composable 示例、迁移指南和最佳实践文档。推荐使用 Bun 作为包管理器以获得最佳开发体验。
---

# Vue 3 前端开发技能

全面的 Vue 3 前端开发技能，提供组件模板、最佳实践指南、迁移协助和常见模式。

## 🚀 推荐工具链

### 包管理器：Bun (推荐)
**为什么选择 Bun？**
- ⚡ **极速安装**：比 npm/yarn/pnpm 快 10-100 倍
- 🔧 **一体化工具**：内置打包器、测试运行器、脚本执行器
- 📦 **兼容性**：完全兼容 npm 生态系统
- 🎯 **零配置**：开箱即用，无需复杂配置

**安装 Bun：**
```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# 验证安装
bun --version
```

**使用 Bun 创建 Vue 3 项目：**
```bash
# 创建项目 (使用 Vite)
bun create vue@latest my-vue-app

# 进入项目
cd my-vue-app

# 安装依赖 (极速)
bun install

# 开发
bun run dev

# 构建
bun run build

# 预览
bun run preview

# 运行测试
bun run test
```

**Bun 优势对比：**
```bash
# npm (慢)
npm install

# yarn (中等)
yarn install

# pnpm (快)
pnpm install

# Bun (极速) ✅
bun install
```

### 其他推荐工具
- **IDE**: VS Code + Volar 扩展
- **状态管理**: Pinia (官方推荐)
- **路由**: Vue Router
- **测试**: Vitest + Vue Test Utils
- **UI 库**: Element Plus, Ant Design Vue, 或 Tailwind CSS
- **构建工具**: Vite (推荐) 或 Vue CLI

## 核心能力

### 1. 组件开发
创建新的 Vue 3 组件，使用 `<script setup>` 语法和 Composition API。

**可用模板:**
- `assets/component-templates/BasicComponent.vue` - 基础组件模板（Props, Emits, State, Computed, Methods, Lifecycle）
- `assets/component-templates/DataTable.vue` - 数据表格组件（含排序、分页、搜索、插槽）
- `assets/component-templates/Modal.vue` - 模态框组件（含完整功能、过渡动画、键盘事件）

**使用方法:**
```bash
# 使用 Bun 快速复制模板
bun run cp assets/component-templates/BasicComponent.vue src/components/YourComponent.vue

# 或使用传统命令
cp assets/component-templates/BasicComponent.vue src/components/YourComponent.vue
```

**组件开发最佳实践：**
1. 使用 `<script setup>` 语法（更简洁、性能更好）
2. 定义完整的 Props 验证
3. 使用 composables 封装可重用逻辑
4. 保持组件专注且小巧（< 200 行）
5. 使用 TypeScript 获得更好的类型安全

### 2. Composable 开发
创建可重用的逻辑抽象。

**可用模板:**
- `assets/composable-templates/useFetch.js` - API 请求封装（支持 GET/POST/PUT/DELETE，自动错误处理，加载状态）
- `assets/composable-templates/useLocalStorage.js` - localStorage 同步状态（支持跨标签页同步，自动清理）

**使用方法:**
```bash
# 使用 Bun 快速复制
bun run cp assets/composable-templates/useFetch.js src/composables/

# 创建目录（如果不存在）
mkdir -p src/composables
cp assets/composable-templates/useFetch.js src/composables/useFetch.js
```

**Composable 开发最佳实践：**
1. 使用 `use` 前缀命名（如 `useFetch`, `useAuth`）
2. 返回响应式数据和方法
3. 处理副作用和清理（如事件监听器、定时器）
4. 支持 TypeScript 泛型
5. 提供错误处理和加载状态

### 3. Vue 2 到 Vue 3 迁移
协助将 Vue 2 项目迁移到 Vue 3。

**迁移工作流:**
1. 阅读 `references/migration-guide.md` 了解破坏性变更
2. 识别现有代码中已弃用的 API
3. 应用指南中的迁移模式
4. 进行彻底测试

**主要迁移领域:**
- 全局 API (Vue.use → app.use)
- 响应式系统 (Vue.set → 直接赋值)
- v-model 语法 (value/input → modelValue/update:modelValue)
- 生命周期钩子 (destroyed → unmounted)
- 过滤器移除 (使用 computed/methods)
- Event Bus 替换 (使用 mitt/Pinia)

### 4. 代码审查和优化
检查和优化 Vue 3 代码质量。

**审查清单:**
- 使用 `<script setup>` 以获得更好的性能
- 正确使用 ref/reactive
- Computed vs methods 的选择
- v-show vs v-if 的选择
- v-for 中 key 的使用
- 组件拆分
- Props 验证
- 错误处理

## 参考文档

### 核心参考
在处理特定任务时，请务必阅读以下文档：

**迁移任务:**
- `references/migration-guide.md` - 完整的 Vue 2 到 Vue 3 迁移指南，包含所有破坏性变更

**Composition API 使用:**
- `references/composition-api.md` - 全面的 Composition API 参考 (ref, reactive, computed, watch, lifecycle 等)

**最佳实践:**
- `references/best-practices.md` - Vue 3 最佳实践，涵盖组件设计、响应式、性能、代码组织、错误处理、TypeScript

**常见模式:**
- `references/common-patterns.md` - 表单处理、数据获取、列表渲染、模态框、状态管理、路由、国际化 (i18n)

### 何时阅读参考文档

**编写任何组件之前:**
1. 查看 `best-practices.md` 了解组件设计模式
2. 查阅 `common-patterns.md` 中的相关模式

**迁移之前:**
1. 通读 `migration-guide.md`
2. 参考 `composition-api.md` 了解新 API 语法

**实现功能时:**
- 表单 → `common-patterns.md` 表单处理部分
- 数据获取 → `common-patterns.md` 数据获取部分
- 状态管理 → `common-patterns.md` 状态管理部分
- 国际化 → `common-patterns.md` 国际化部分

## 常见开发工作流

### 工作流 1: 创建新组件

```bash
# 1. 选择合适的模板
view assets/component-templates/

# 2. 阅读最佳实践
view references/best-practices.md

# 3. 复制并自定义模板 (推荐使用 Bun)
bun run cp assets/component-templates/BasicComponent.vue src/components/MyComponent.vue

# 4. 遵循命名规范 (PascalCase)
# 5. 定义带有验证的 props
# 6. 使用 <script setup> 语法
# 7. 保持组件专注且小巧 (< 200 行)
```

**使用 Bun 的优势：**
```bash
# Bun 的包管理命令比 npm/yarn/pnpm 更快
bun install          # 安装依赖 (比 npm 快 10-100 倍)
bun add <package>    # 添加依赖
bun remove <package> # 移除依赖
bun run dev          # 运行开发服务器
bun run build        # 构建生产版本
bun run test         # 运行测试
bun run lint         # 运行代码检查
```

### 工作流 2: 将 Vue 2 代码迁移到 Vue 3

```bash
# 1. 首先阅读迁移指南
view references/migration-guide.md

# 2. 识别需要迁移的模式
# - Options API → Composition API
# - this.$set → 直接赋值
# - filters → computed/methods
# - Event Bus → mitt/Pinia

# 3. 系统地应用更改
# 4. 测试每个更改
# 5. 更新依赖项
```

### 工作流 3: 实现数据获取

```bash
# 1. 查阅数据获取模式
view references/common-patterns.md
# 查找 "Data Fetching Patterns" 部分

# 2. 选择方法:
# - 自定义 composable (useFetch 模板)
# - VueUse (@vueuse/core)
# - TanStack Query

# 3. 实现错误处理和加载状态
```

### 工作流 4: 性能优化

```bash
# 1. 查阅性能部分
view references/best-practices.md
# 查找 "Performance Optimization" 部分

# 2. 检查问题:
# - 使用 methods 代替 computed
# - 不必要的 v-if 使用
# - v-for 缺少 key
# - 大型组件未拆分
# - 未使用懒加载

# 3. 应用优化:
# - 使用 computed 处理衍生数据
# - 使用 v-show 处理频繁切换
# - 使用 defineAsyncComponent 处理大型组件
# - 对大型列表使用虚拟滚动
```

### 工作流 5: 表单开发

```bash
# 1. 使用表单模板或 VeeValidate 模式
view assets/component-templates/FormComponent.vue
view references/common-patterns.md
# 查找 "Form Handling Patterns" 部分

# 2. 实现验证
# 3. 处理错误和加载状态
# 4. 添加成功/错误反馈
```

## 快速参考命令

### 组件模板
```bash
# 列出所有模板
ls -la assets/component-templates/

# 复制特定模板 (推荐使用 Bun)
bun run cp assets/component-templates/[TemplateName].vue src/components/

# 或使用传统命令
cp assets/component-templates/[TemplateName].vue src/components/
```

### Composable 模板
```bash
# 列出所有 composables
ls -la assets/composable-templates/

# 复制特定 composable (推荐使用 Bun)
bun run cp assets/composable-templates/[composableName].js src/composables/

# 或使用传统命令
cp assets/composable-templates/[composableName].js src/composables/
```

### 阅读文档
```bash
# 迁移指南
view references/migration-guide.md

# Composition API 参考
view references/composition-api.md

# 最佳实践
view references/best-practices.md

# 常见模式
view references/common-patterns.md
```

### 使用 Bun 进行项目管理
```bash
# 创建新 Vue 3 项目
bun create vue@latest my-project

# 安装依赖 (极速)
bun install

# 开发模式
bun run dev

# 构建生产版本
bun run build

# 运行测试
bun run test

# 运行类型检查
bun run type-check

# 运行代码格式化
bun run format

# 运行代码检查
bun run lint
```

## 最佳实践总结

### 组件设计
- 始终使用 `<script setup>` 以获得更好的性能和开发体验
- 使用完整的验证定义 props
- 使用 composables 封装可重用逻辑
- 保持组件小而专注 (< 200 行)
- 将复杂逻辑提取到 composables 中

### 响应式
- 原始类型使用 `ref()`
- 对象使用 `reactive()`
- 衍生数据使用 `computed()`
- 需要旧值时使用 `watch()`
- 自动依赖追踪使用 `watchEffect()`

### 性能
- 模板计算使用 `computed()` 而非 methods
- 频繁切换使用 `v-show`
- 初始渲染条件使用 `v-if`
- `v-for` 中始终使用唯一的 `key`
- 使用 `defineAsyncComponent()` 懒加载大型组件
- 大型列表使用虚拟滚动

### 代码组织
```
src/
├── assets/          # 静态资源
├── components/      # 可重用组件
│   ├── common/      # 基础组件
│   ├── layout/      # 布局组件
│   └── features/    # 功能组件
├── composables/     # 可重用逻辑
├── stores/          # Pinia stores
├── router/          # 路由配置
├── views/           # 页面组件
├── utils/           # 工具函数
└── services/        # API 服务
```

## TypeScript 支持

使用 TypeScript 时:
- 使用接口定义 prop 类型
- 在 composables 中使用泛型
- 正确定义 emits 类型
- 需要时使用 `defineComponent`

详见 `best-practices.md` TypeScript 集成部分。

## 常见陷阱

1. **解构响应式对象丢失响应性**
   - 使用 `toRefs()` 或直接访问属性

2. **Vue 2 风格的直接数组/对象变更**
   - Vue 3 不需要 `$set`，直接变更即可生效

3. **Refs 忘记 .value**
   - 记住: 在 `<script>` 中 refs 需要 `.value`，在 `<template>` 中不需要

4. **对原始类型使用 reactive()**
   - 原始类型使用 `ref()`，对象使用 `reactive()`

5. **未清理副作用**
   - 始终在 `onBeforeUnmount()` 中清理，或使用 `watchEffect()` 的清理函数

## 额外资源

### 官方文档
- Vue 3 官方文档: https://vuejs.org/
- Vue 3 迁移指南: https://v3-migration.vuejs.org/
- Composition API 常见问题: https://vuejs.org/guide/extras/composition-api-faq.html

### 工具和库
- **VueUse**: https://vueuse.org/ (强大的工具 composables)
- **Pinia**: https://pinia.vuejs.org/ (官方状态管理库)
- **Vite**: https://vitejs.dev/ (下一代前端构建工具)
- **Bun**: https://bun.sh/ (极速 JavaScript 运行时和包管理器)

### UI 组件库
- **Element Plus**: https://element-plus.org/ (基于 Vue 3 的企业级 UI 组件库)
- **Ant Design Vue**: https://www.antdv.com/ (企业级 UI 设计语言)
- **Vuetify**: https://vuetifyjs.com/ (Material Design 组件库)
- **Tailwind CSS**: https://tailwindcss.com/ (实用优先的 CSS 框架)

### 测试工具
- **Vitest**: https://vitest.dev/ (极速测试框架)
- **Vue Test Utils**: https://test-utils.vuejs.org/ (官方测试工具库)
- **Cypress**: https://www.cypress.io/ (端到端测试)
- **Playwright**: https://playwright.dev/ (跨浏览器自动化测试)

## 本技能使用提示

1. **始终从参考文档开始**: 编码前阅读相关文档
2. **使用模板作为起点**: 如果存在模板，不要从头开始编写
3. **遵循工作流**: 它们体现了最佳实践
4. **定期检查最佳实践**: 内化这些模式
5. **遇到困难时**: 查看 common-patterns.md 中的类似示例
6. **使用 Bun**: 享受极速的开发体验和包管理

## Bun 优化技巧

### 1. 使用 Bun 的内置工具
```bash
# 使用 Bun 运行脚本 (比 npm run 更快)
bun run dev

# 使用 Bun 执行 TypeScript 文件
bun run src/utils/format.ts

# 使用 Bun 执行测试
bun test src/components/MyComponent.spec.ts
```

### 2. 使用 Bun 的 Shell 语法
```bash
# 在 package.json 中使用 Bun 的 shell
{
  "scripts": {
    "dev": "bun run --bun vite",
    "build": "bun run --bun vite build",
    "test": "bun run --bun vitest"
  }
}
```

### 3. 使用 Bun 的热重载
```bash
# 使用 Bun 的 --watch 标志
bun run --watch src/main.ts

# 或使用 nodemon 的 Bun 替代品
bun install -D chokidar-cli
chokidar "src/**/*.ts" -c "bun run src/main.ts"
```

### 4. 使用 Bun 的缓存
```bash
# Bun 会自动缓存依赖，加速后续安装
# 清理缓存（如果需要）
bun pm cache rm
```

### 5. 使用 Bun 的工作区
```bash
# 创建 monorepo
bun init
bun workspaces add packages/app
bun workspaces add packages/lib
```

### 6. 性能对比
```bash
# 安装依赖速度对比
npm install          # ~30-60 秒
yarn install         # ~20-40 秒
pnpm install         # ~10-20 秒
bun install          # ~2-5 秒  ⚡

# 构建速度对比
npm run build        # ~30-60 秒
bun run build        # ~10-20 秒  ⚡
```

## 提示词优化建议

当使用 AI 辅助开发时，可以尝试以下提示词:

1. **生成组件**: "创建一个 Vue 3 [功能]组件，使用 script setup，包含 [特定功能]，并添加详细的中文注释。"
2. **重构代码**: "将此 Vue 2 组件重构为 Vue 3 Composition API 风格，使用 script setup，并优化性能。"
3. **解释代码**: "解释这段 Vue 3 代码的工作原理，特别是 [特定部分]，请用中文回答。"
4. **编写测试**: "为这个组件编写 Vitest 测试用例，覆盖 [特定场景]。"
5. **添加注释**: "为这段代码添加详细的 JSDoc 风格中文注释，包括参数和返回值说明。"
