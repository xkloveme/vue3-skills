# Vue 3 Skills Library - Quick Start Guide

## 🚀 快速开始

### 1. 安装 OpenSkills CLI

**使用 Bun (推荐 - 最快):**
```bash
# 安装 Bun (如果未安装)
curl -fsSL https://bun.sh/install | bash

# 安装 OpenSkills
bun add -g openskills
```

**使用 npm:**
```bash
npm install -g openskills
```

### 2. 安装 Vue 3 Skills

```bash
# 安装技能
openskills install xkloveme/vue3-skills

# 或使用技能名称
openskills install vue3-frontend
```

### 3. 查看文档

```bash
# 查看主技能文档
openskills view vue3-frontend

# 查看最佳实践
openskills view vue3-frontend/references/best-practices.md

# 查看常用模式
openskills view vue3-frontend/references/common-patterns.md
```

## 📦 使用模板

### 复制组件模板

```bash
# 复制基础组件模板
openskills copy vue3-frontend/assets/component-templates/BasicComponent.vue src/components/MyComponent.vue

# 复制数据表格模板
openskills copy vue3-frontend/assets/component-templates/DataTable.vue src/components/UserTable.vue

# 复制模态框模板
openskills copy vue3-frontend/assets/component-templates/Modal.vue src/components/MyModal.vue
```

### 复制 Composable 模板

```bash
# 创建目录
mkdir -p src/composables

# 复制 useFetch
openskills copy vue3-frontend/assets/composable-templates/useFetch.js src/composables/useFetch.js

# 复制 useLocalStorage
openskills copy vue3-frontend/assets/composable-templates/useLocalStorage.js src/composables/useLocalStorage.js
```

## 🎯 创建 Vue 3 项目

### 使用 Bun 创建项目

```bash
# 创建 Vue 3 项目
bun create vue@latest my-vue-app

# 进入项目
cd my-vue-app

# 安装依赖 (极速)
bun install

# 开发
bun run dev

# 构建
bun run build
```

### 添加 Vue 3 Skills 到现有项目

```bash
# 1. 复制组件模板
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/

# 2. 复制 Composable 模板
mkdir -p src/composables
cp skills/vue3-frontend/assets/composable-templates/useFetch.js src/composables/

# 3. 阅读最佳实践
cat skills/vue3-frontend/references/best-practices.md
```

## 📚 学习路径

### 初学者
1. 阅读 `skills/vue3-frontend/references/composition-api.md`
2. 学习 `skills/vue3-frontend/references/best-practices.md`
3. 复制并自定义 `BasicComponent.vue`
4. 练习使用 `useFetch.js` composable

### 中级开发者
1. 阅读 `skills/vue3-frontend/references/common-patterns.md`
2. 学习 `skills/vue3-frontend/references/migration-guide.md`
3. 使用 `DataTable.vue` 和 `Modal.vue` 模板
4. 使用 common-patterns.md 中的模式实现 Pinia stores

### 高级开发者
1. 审查所有参考文档
2. 为模板贡献改进
3. 按照模式创建自己的 composables
4. 与社区分享最佳实践

## 🔧 常用命令

### 使用 Bun
```bash
# 安装依赖
bun install

# 开发服务器
bun run dev

# 构建
bun run build

# 运行测试
bun run test

# 类型检查
bun run type-check

# 代码检查
bun run lint

# 代码格式化
bun run format
```

### 使用 OpenSkills
```bash
# 查看所有可用技能
openskills list

# 查看技能详情
openskills info vue3-frontend

# 更新技能
openskills update xkloveme/vue3-skills

# 卸载技能
openskills uninstall vue3-frontend
```

## 📦 模板列表

### 组件模板
- **BasicComponent.vue**: 基础组件（Props, Emits, State, Computed, Methods, Lifecycle）
- **DataTable.vue**: 数据表格（排序、分页、搜索、插槽）
- **Modal.vue**: 模态框（动画、键盘事件、自定义）

### Composable 模板
- **useFetch.js**: API 请求封装（错误处理、加载状态、重试逻辑）
- **useLocalStorage.js**: 响应式 localStorage（跨标签页同步）

## 🎓 最佳实践

### 核心原则
1. 始终使用 `<script setup>` 语法
2. 定义带有验证的 props
3. 使用 composables 封装可重用逻辑
4. 保持组件小巧（< 200 行）
5. 使用 TypeScript 获得更好的类型安全
6. 测试遵循 AAA 模式
7. 使用 fetch API 时始终检查 `response.ok`

### 性能优化
- 使用 `computed` 代替 methods 处理衍生数据
- 频繁切换使用 `v-show`，初始条件使用 `v-if`
- `v-for` 中始终使用唯一的 key
- 使用 `defineAsyncComponent` 懒加载大型组件
- 使用 `KeepAlive` 缓存组件状态
- 大型列表使用虚拟滚动

## 🛠️ 工具推荐

### 包管理器：Bun (推荐)
- 速度：比 npm 快 10-100 倍
- 一体化：内置打包器、测试运行器、脚本执行器
- 兼容性：100% 兼容 npm 生态
- 零配置：开箱即用

### 开发工具
- **IDE**: VS Code + Volar 扩展
- **状态管理**: Pinia (官方推荐)
- **路由**: Vue Router
- **测试**: Vitest + Vue Test Utils
- **UI 库**: Element Plus, Ant Design Vue, 或 Tailwind CSS
- **构建工具**: Vite (推荐)

## 📖 参考文档

### 主要文档
- `skills/vue3-frontend/skill.md` - 主技能文档
- `skills/vue3-frontend/references/best-practices.md` - 最佳实践
- `skills/vue3-frontend/references/common-patterns.md` - 常用模式
- `skills/vue3-frontend/references/composition-api.md` - Composition API 参考
- `skills/vue3-frontend/references/migration-guide.md` - Vue 2 到 Vue 3 迁移指南

### 模板文件
- `skills/vue3-frontend/assets/component-templates/` - 组件模板
- `skills/vue3-frontend/assets/composable-templates/` - Composable 模板

## 💡 使用技巧

### 1. 快速创建组件
```bash
# 复制模板
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/MyComponent.vue

# 自定义
# - 更新 props
# - 添加你的逻辑
# - 自定义模板和样式
```

### 2. 使用 Composable
```bash
# 复制到项目
mkdir -p src/composables
cp skills/vue3-frontend/assets/composable-templates/useFetch.js src/composables/useFetch.js

# 在组件中使用
# import { useFetch } from '@/composables/useFetch'
```

### 3. 阅读文档
```bash
# 查看主文档
cat skills/vue3-frontend/skill.md

# 查看最佳实践
cat skills/vue3-frontend/references/best-practices.md

# 查看常用模式
cat skills/vue3-frontend/references/common-patterns.md
```

## 🎯 常见场景

### 创建新 Vue 3 项目
```bash
bun create vue@latest my-project
cd my-project
bun install
bun run dev
```

### 添加组件模板
```bash
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/
```

### 添加 Composable
```bash
mkdir -p src/composables
cp skills/vue3-frontend/assets/composable-templates/useFetch.js src/composables/
```

### 学习最佳实践
```bash
cat skills/vue3-frontend/references/best-practices.md
```

## 📞 获取帮助

1. 查看 `skills/vue3-frontend/skill.md` 获取详细文档
2. 阅读参考文档中的相关章节
3. 在 GitHub 上提交 issue
4. 参与 Vue.js 社区讨论

## 🎉 开始使用

```bash
# 1. 安装 OpenSkills
bun add -g openskills

# 2. 安装 Vue 3 Skills
openskills install xkloveme/vue3-skills

# 3. 查看文档
openskills view vue3-frontend

# 4. 开始编码！
```

**Happy Coding!** 🚀
