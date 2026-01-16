---
name: vue3-frontend
description: 全面的 Vue 3 前端开发技能。适用于开发 Vue 3 应用程序、组件或组合式函数时。涵盖：(1) 创建新的 Vue 3 项目和组件，(2) Vue 2 到 Vue 3 的迁移，(3) 代码审查和优化，(4) Composition API 实现，(5) 最佳实践和常见模式，(6) TypeScript 集成，(7) 使用 Pinia 进行状态管理，(8) 性能优化。包含组件模板、Composable 示例、迁移指南和最佳实践文档。
---

# Vue 3 前端开发技能

全面的 Vue 3 前端开发技能，提供组件模板、最佳实践指南、迁移协助和常见模式。

## 核心能力

### 1. 组件开发
创建新的 Vue 3 组件，使用 `<script setup>` 语法和 Composition API。

**可用模板:**
- `assets/component-templates/BasicComponent.vue` - 基础组件模板
- `assets/component-templates/FormComponent.vue` - 完整的表单组件（含验证）
- `assets/component-templates/DataTable.vue` - 数据表格组件（含排序、分页、搜索）
- `assets/component-templates/Modal.vue` - 模态框组件（含完整功能）

**使用方法:**
```bash
# 复制模板到项目
cp assets/component-templates/BasicComponent.vue src/components/YourComponent.vue
```

### 2. Composable 开发
创建可重用的逻辑抽象。

**可用模板:**
- `assets/composable-templates/useFetch.js` - API 请求封装
- `assets/composable-templates/useLocalStorage.js` - localStorage 同步状态

**使用方法:**
```bash
# 复制到项目
cp assets/composable-templates/useFetch.js src/composables/
```

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

# 3. 复制并自定义模板
cp assets/component-templates/BasicComponent.vue src/components/MyComponent.vue

# 4. 遵循命名规范 (PascalCase)
# 5. 定义带有验证的 props
# 6. 使用 <script setup> 语法
# 7. 保持组件专注且小巧
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

# 复制特定模板
cp assets/component-templates/[TemplateName].vue src/components/
```

### Composable 模板
```bash
# 列出所有 composables
ls -la assets/composable-templates/

# 复制特定 composable
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

- Vue 3 官方文档: https://vuejs.org/
- Vue 3 迁移指南: https://v3-migration.vuejs.org/
- Composition API 常见问题: https://vuejs.org/guide/extras/composition-api-faq.html
- VueUse: https://vueuse.org/ (工具 composables)
- Pinia: https://pinia.vuejs.org/ (状态管理)

## 本技能使用提示

1. **始终从参考文档开始**: 编码前阅读相关文档
2. **使用模板作为起点**: 如果存在模板，不要从头开始编写
3. **遵循工作流**: 它们体现了最佳实践
4. **定期检查最佳实践**: 内化这些模式
5. **遇到困难时**: 查看 common-patterns.md 中的类似示例

## 提示词优化建议

当使用 AI 辅助开发时，可以尝试以下提示词:

1. **生成组件**: "创建一个 Vue 3 [功能]组件，使用 script setup，包含 [特定功能]，并添加详细的中文注释。"
2. **重构代码**: "将此 Vue 2 组件重构为 Vue 3 Composition API 风格，使用 script setup，并优化性能。"
3. **解释代码**: "解释这段 Vue 3 代码的工作原理，特别是 [特定部分]，请用中文回答。"
4. **编写测试**: "为这个组件编写 Vitest 测试用例，覆盖 [特定场景]。"
5. **添加注释**: "为这段代码添加详细的 JSDoc 风格中文注释，包括参数和返回值说明。"
