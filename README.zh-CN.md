# Vue 3 Skills Library

Vue 3 技能与最佳实践学习资源库。本仓库包含 Vue 3 开发的完整模板、指南和参考材料。

## ✨ 特性

- 📦 **组件模板**：开箱即用的 Vue 3 组件模板（基础组件、数据表格、模态框）
- 🔧 **Composable 模板**：可重用的 Composition API 工具函数（useFetch、useLocalStorage）
- 📚 **全面指南**：Vue 3 最佳实践、迁移指南和常用模式
- ⚡ **TypeScript 支持**：完整的 TypeScript 集成示例
- 🎨 **现代模式**：Composition API、Pinia、Vue Router 等

## 📁 项目结构

```
vue3-skills/
├── skills/
│   ├── vue3-frontend/
│   │   ├── skill.md              # 主技能文档
│   │   ├── assets/               # 资源
│   │   │   ├── component-templates/     # 组件模板
│   │   │   │   ├── BasicComponent.vue
│   │   │   │   ├── DataTable.vue
│   │   │   │   └── Modal.vue
│   │   │   └── composable-templates/    # Composable 模板
│   │   │       ├── useFetch.js
│   │   │       └── useLocalStorage.js
│   │   └── references/           # 参考文档
│   │       ├── best-practices.md        # 最佳实践
│   │       ├── common-patterns.md       # 常用模式
│   │       ├── composition-api.md       # Composition API 指南
│   │       └── migration-guide.md       # 迁移指南
│   └── vue-vite-testing/
│       └── skill.md              # 测试指南
├── AGENTS.md                     # AI 代理指南
└── README.md
```

## 🚀 快速开始

### 方式一：使用 OpenSkills（推荐）

**安装 OpenSkills CLI：**
```bash
# 使用 Bun (推荐 - 最快)
curl -fsSL https://bun.sh/install | bash
bun add -g openskills

# 使用 npm
npm install -g openskills
```

**安装本技能：**
```bash
# 使用 OpenSkills
openskills install xkloveme/vue3-skills

# 或使用技能名称
openskills install vue3-frontend
```

**访问技能：**
```bash
# 查看技能文档
openskills view vue3-frontend

# 列出可用模板
openskills list vue3-frontend/assets/component-templates/
```

### 方式二：手动安装

**克隆仓库：**
```bash
git clone https://github.com/xkloveme/vue3-skills.git
cd vue3-skills
```

**安装依赖（使用 Bun - 推荐）：**
```bash
# 安装 Bun (如果未安装)
curl -fsSL https://bun.sh/install | bash

# 安装项目依赖
bun install
```

**浏览文档：**
```bash
# 查看主技能文档
cat skills/vue3-frontend/skill.md

# 查看最佳实践
cat skills/vue3-frontend/references/best-practices.md

# 查看组件模板
cat skills/vue3-frontend/assets/component-templates/BasicComponent.vue
```

## 📚 使用指南

### 1. 使用组件模板

**复制模板到你的项目：**
```bash
# 使用 Bun (推荐)
bun run cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/MyComponent.vue

# 或使用传统命令
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/MyComponent.vue
```

**示例：创建新组件**
```bash
# 1. 复制模板
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/UserCard.vue

# 2. 自定义组件
# - 更新 props
# - 添加你的逻辑
# - 自定义模板和样式

# 3. 在应用中使用
# <UserCard :user="userData" @update="handleUpdate" />
```

### 2. 使用 Composable 模板

**复制 Composable 到你的项目：**
```bash
# 创建目录（如果需要）
mkdir -p src/composables

# 复制模板
bun run cp skills/vue3-frontend/assets/composable-templates/useFetch.js src/composables/useFetch.js
```

**示例：使用 useFetch composable**
```javascript
// src/composables/useFetch.js (来自模板)
import { useFetch } from '@/composables/useFetch'

// 在组件中使用
<script setup>
const { data, error, loading, execute } = useFetch('/api/users')

// 手动执行 (如果 immediate: false)
const loadUsers = async () => {
  await execute()
}
</script>
```

### 3. 阅读文档

**主技能文档：**
```bash
# 使用 OpenSkills 查看
openskills view vue3-frontend

# 或直接阅读
cat skills/vue3-frontend/skill.md
```

**参考文档：**
```bash
# 最佳实践
cat skills/vue3-frontend/references/best-practices.md

# 常用模式
cat skills/vue3-frontend/references/common-patterns.md

# Composition API 参考
cat skills/vue3-frontend/references/composition-api.md

# 迁移指南 (Vue 2 到 Vue 3)
cat skills/vue3-frontend/references/migration-guide.md
```

## 🎯 常用工作流

### 创建新的 Vue 3 项目

**使用 Bun (推荐):**
```bash
# 创建 Vue 3 项目 (使用 Vite)
bun create vue@latest my-vue-app

# 进入项目目录
cd my-vue-app

# 安装依赖 (极速)
bun install

# 启动开发服务器
bun run dev

# 构建生产版本
bun run build

# 预览生产构建
bun run preview
```

**使用 pnpm (备选):**
```bash
pnpm create vue my-vue-app
cd my-vue-app
pnpm install
pnpm run dev
```

### 将本技能添加到现有项目

**选项 A：手动复制模板**
```bash
# 复制组件模板
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/

# 复制 Composable 模板
mkdir -p src/composables
cp skills/vue3-frontend/assets/composable-templates/useFetch.js src/composables/
```

**选项 B：作为参考使用**
```bash
# 将技能仓库作为参考保存
git clone https://github.com/xkloveme/vue3-skills.git ~/vue3-skills-reference

# 需要时参考
cat ~/vue3-skills-reference/skills/vue3-frontend/references/best-practices.md
```

## 🛠️ 推荐工具

### 包管理器：Bun (推荐)
**为什么选择 Bun？**
- ⚡ **比 npm 快 10-100 倍**
- 🔧 **一体化工具**：内置打包器、测试运行器、脚本执行器
- 📦 **100% 兼容** npm 生态系统
- 🎯 **零配置** - 开箱即用

**安装 Bun：**
```bash
curl -fsSL https://bun.sh/install | bash
```

### 开发工具
- **IDE**: VS Code + Volar 扩展
- **状态管理**: Pinia (官方推荐)
- **路由**: Vue Router
- **测试**: Vitest + Vue Test Utils
- **UI 库**: Element Plus, Ant Design Vue, 或 Tailwind CSS
- **构建工具**: Vite (推荐) 或 Vue CLI

## 📖 学习路径

### 初学者
1. 阅读 `skills/vue3-frontend/references/composition-api.md`
2. 学习 `skills/vue3-frontend/references/best-practices.md`
3. 复制并自定义 `BasicComponent.vue`
4. 练习使用 `useFetch.js` composable

### 中级开发者
1. 阅读 `skills/vue3-frontend/references/common-patterns.md`
2. 学习 `skills/vue3-frontend/references/migration-guide.md` (如果从 Vue 2 迁移)
3. 使用 `DataTable.vue` 和 `Modal.vue` 模板
4. 使用 common-patterns.md 中的模式实现 Pinia stores

### 高级开发者
1. 审查所有参考文档
2. 为模板贡献改进
3. 按照模式创建自己的 composables
4. 与社区分享你的最佳实践

## 🔧 开发命令

### 使用 Bun (推荐)
```bash
# 安装依赖
bun install

# 运行开发服务器
bun run dev

# 构建生产版本
bun run build

# 运行测试
bun run test

# 运行类型检查
bun run type-check

# 运行代码检查
bun run lint

# 格式化代码
bun run format
```

### 使用 pnpm (备选)
```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run test
```

## 📦 可用模板

### 组件模板
- **BasicComponent.vue**: 基础组件（Props, Emits, State, Computed, Methods, Lifecycle）
- **DataTable.vue**: 功能完整的数据表格（排序、分页、搜索、插槽）
- **Modal.vue**: 模态框/对话框组件（动画、键盘事件、自定义）

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

## 🤝 贡献

欢迎贡献！请遵循以下指南：
1. 阅读现有的模板和模式
2. 确保你的贡献遵循 Vue 3 最佳实践
3. 添加适当的文档
4. 测试你的更改

## 📖 资源

### 官方文档
- [Vue 3 官方文档](https://vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Composition API 常见问题](https://vuejs.org/guide/extras/composition-api-faq.html)

### 工具和库
- **VueUse**: https://vueuse.org/ (强大的工具 composables)
- **Pinia**: https://pinia.vuejs.org/ (官方状态管理)
- **Vite**: https://vitejs.dev/ (下一代构建工具)
- **Bun**: https://bun.sh/ (快速的 JavaScript 运行时和包管理器)

### UI 组件库
- **Element Plus**: https://element-plus.org/ (企业级 UI 组件)
- **Ant Design Vue**: https://www.antdv.com/ (企业级 UI 设计语言)
- **Vuetify**: https://vuetifyjs.com/ (Material Design 组件)
- **Tailwind CSS**: https://tailwindcss.com/ (实用优先的 CSS 框架)

### 测试工具
- **Vitest**: https://vitest.dev/ (快速测试框架)
- **Vue Test Utils**: https://test-utils.vuejs.org/ (官方测试工具)
- **Cypress**: https://www.cypress.io/ (端到端测试)
- **Playwright**: https://playwright.dev/ (跨浏览器自动化测试)

## 📄 许可证

本项目开源，采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

- Vue.js 团队提供的优秀框架
- Vue 社区的最佳实践和模式
- 所有本仓库的贡献者

## 📞 支持

如有问题或需要帮助：
1. 查看 `skills/vue3-frontend/skill.md` 中的文档
2. 阅读 `skills/vue3-frontend/references/` 中的参考文档
3. 在 GitHub 上提交 issue
4. 参与 Vue.js 社区讨论

---

**祝编码愉快！** 🚀
