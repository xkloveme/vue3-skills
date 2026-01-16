# Vue 3 Skills Library

A learning resource library for Vue 3 skills and best practices. This repository contains comprehensive templates, guides, and reference materials for Vue 3 development.

## ✨ Features

- 📦 **Component Templates**: Ready-to-use Vue 3 component templates (Basic, DataTable, Modal)
- 🔧 **Composable Templates**: Reusable Composition API utilities (useFetch, useLocalStorage)
- 📚 **Comprehensive Guides**: Vue 3 best practices, migration guide, and common patterns
- ⚡ **TypeScript Support**: Full TypeScript integration examples
- 🎨 **Modern Patterns**: Composition API, Pinia, Vue Router, and more

## 📁 Project Structure

```
vue3-skills/
├── skills/
│   ├── vue3-frontend/
│   │   ├── skill.md              # Main skill documentation
│   │   ├── assets/               # Resources
│   │   │   ├── component-templates/     # Component templates
│   │   │   │   ├── BasicComponent.vue
│   │   │   │   ├── DataTable.vue
│   │   │   │   └── Modal.vue
│   │   │   └── composable-templates/    # Composable templates
│   │   │       ├── useFetch.js
│   │   │       └── useLocalStorage.js
│   │   └── references/           # Reference documents
│   │       ├── best-practices.md        # Best practices
│   │       ├── common-patterns.md       # Common patterns
│   │       ├── composition-api.md       # Composition API guide
│   │       └── migration-guide.md       # Migration guide
│   └── vue-vite-testing/
│       └── skill.md              # Testing guide
├── AGENTS.md                     # Guide for AI agents
└── README.md
```

## 🚀 Quick Start

### Option 1: Using OpenSkills (Recommended)

**Install OpenSkills CLI:**
```bash
# Using Bun (recommended - fastest)
curl -fsSL https://bun.sh/install | bash
bun add -g openskills

# Using npm
npm install -g openskills
```

**Install this skill:**
```bash
# Using OpenSkills
openskills install xkloveme/vue3-skills

# Or using the skill name
openskills install vue3-frontend
```

**Access the skill:**
```bash
# View skill documentation
openskills view vue3-frontend

# List available templates
openskills list vue3-frontend/assets/component-templates/
```

### Option 2: Manual Installation

**Clone the repository:**
```bash
git clone https://github.com/xkloveme/vue3-skills.git
cd vue3-skills
```

**Install dependencies (using Bun - recommended):**
```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install project dependencies
bun install
```

**Explore the documentation:**
```bash
# View main skill documentation
cat skills/vue3-frontend/skill.md

# View best practices
cat skills/vue3-frontend/references/best-practices.md

# View component templates
cat skills/vue3-frontend/assets/component-templates/BasicComponent.vue
```

## 📚 Usage Guide

### 1. Using Component Templates

**Copy a template to your project:**
```bash
# Using Bun (recommended)
bun run cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/MyComponent.vue

# Or using traditional command
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/MyComponent.vue
```

**Example: Creating a new component**
```bash
# 1. Copy template
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/UserCard.vue

# 2. Customize the component
# - Update props
# - Add your logic
# - Customize template and styles

# 3. Use in your app
# <UserCard :user="userData" @update="handleUpdate" />
```

### 2. Using Composable Templates

**Copy a composable to your project:**
```bash
# Create directory if needed
mkdir -p src/composables

# Copy template
bun run cp skills/vue3-frontend/assets/composable-templates/useFetch.js src/composables/useFetch.js
```

**Example: Using useFetch composable**
```javascript
// src/composables/useFetch.js (from template)
import { useFetch } from '@/composables/useFetch'

// In your component
<script setup>
const { data, error, loading, execute } = useFetch('/api/users')

// Execute manually (if immediate: false)
const loadUsers = async () => {
  await execute()
}
</script>
```

### 3. Reading Documentation

**Main skill documentation:**
```bash
# View using OpenSkills
openskills view vue3-frontend

# Or read directly
cat skills/vue3-frontend/skill.md
```

**Reference documents:**
```bash
# Best practices
cat skills/vue3-frontend/references/best-practices.md

# Common patterns
cat skills/vue3-frontend/references/common-patterns.md

# Composition API reference
cat skills/vue3-frontend/references/composition-api.md

# Migration guide (Vue 2 to Vue 3)
cat skills/vue3-frontend/references/migration-guide.md
```

## 🎯 Common Workflows

### Creating a New Vue 3 Project

**Using Bun (Recommended):**
```bash
# Create Vue 3 project with Vite
bun create vue@latest my-vue-app

# Enter project directory
cd my-vue-app

# Install dependencies (极速)
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

**Using pnpm (Alternative):**
```bash
pnpm create vue my-vue-app
cd my-vue-app
pnpm install
pnpm run dev
```

### Adding This Skill to Your Project

**Option A: Copy templates manually**
```bash
# Copy component template
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/

# Copy composable template
mkdir -p src/composables
cp skills/vue3-frontend/assets/composable-templates/useFetch.js src/composables/
```

**Option B: Use as reference**
```bash
# Keep the skill repository as reference
git clone https://github.com/xkloveme/vue3-skills.git ~/vue3-skills-reference

# Reference when needed
cat ~/vue3-skills-reference/skills/vue3-frontend/references/best-practices.md
```

## 🛠️ Recommended Tools

### Package Manager: Bun (Recommended)
**Why Bun?**
- ⚡ **10-100x faster** than npm
- 🔧 **All-in-one**: Bundler, test runner, script executor
- 📦 **100% compatible** with npm ecosystem
- 🎯 **Zero configuration** - works out of the box

**Install Bun:**
```bash
curl -fsSL https://bun.sh/install | bash
```

### Development Tools
- **IDE**: VS Code + Volar extension
- **State Management**: Pinia (official)
- **Routing**: Vue Router
- **Testing**: Vitest + Vue Test Utils
- **UI Libraries**: Element Plus, Ant Design Vue, or Tailwind CSS
- **Build Tool**: Vite (recommended) or Vue CLI

## 📖 Learning Path

### For Beginners
1. Read `skills/vue3-frontend/references/composition-api.md`
2. Study `skills/vue3-frontend/references/best-practices.md`
3. Copy and customize `BasicComponent.vue`
4. Practice with `useFetch.js` composable

### For Intermediate Developers
1. Read `skills/vue3-frontend/references/common-patterns.md`
2. Study `skills/vue3-frontend/references/migration-guide.md` (if migrating from Vue 2)
3. Use `DataTable.vue` and `Modal.vue` templates
4. Implement Pinia stores using the patterns in common-patterns.md

### For Advanced Developers
1. Review all reference documents
2. Contribute improvements to the templates
3. Create your own composables following the patterns
4. Share your best practices with the community

## 🔧 Development Commands

### Using Bun (Recommended)
```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Run type checking
bun run type-check

# Run linting
bun run lint

# Format code
bun run format
```

### Using pnpm (Alternative)
```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run test
```

## 📦 Available Templates

### Component Templates
- **BasicComponent.vue**: Foundation component with props, emits, state, computed, methods, lifecycle
- **DataTable.vue**: Full-featured data table with sorting, pagination, search, and slots
- **Modal.vue**: Modal/dialog component with animations, keyboard events, and customization

### Composable Templates
- **useFetch.js**: API request wrapper with error handling, loading states, and retry logic
- **useLocalStorage.js**: Reactive localStorage sync with cross-tab support

## 🎓 Best Practices

### Key Principles
1. Always use `<script setup>` syntax
2. Define props with validation
3. Use composables to extract reusable logic
4. Keep components small (< 200 lines)
5. Use TypeScript for better type safety
6. Follow AAA pattern for tests
7. Always check `response.ok` when using fetch API

### Performance Optimization
- Use `computed` instead of methods for derived data
- Use `v-show` for frequent toggles, `v-if` for initial conditions
- Always use unique keys in `v-for`
- Use `defineAsyncComponent` for lazy loading
- Use `KeepAlive` to cache component state
- Use virtual scrolling for large lists

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Read the existing templates and patterns
2. Ensure your contribution follows Vue 3 best practices
3. Add appropriate documentation
4. Test your changes

## 📖 Resources

### Official Documentation
- [Vue 3 Official Documentation](https://vuejs.org/)
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Composition API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html)

### Tools and Libraries
- **VueUse**: https://vueuse.org/ (Powerful utility composables)
- **Pinia**: https://pinia.vuejs.org/ (Official state management)
- **Vite**: https://vitejs.dev/ (Next-gen build tool)
- **Bun**: https://bun.sh/ (Fast JavaScript runtime and package manager)

### UI Component Libraries
- **Element Plus**: https://element-plus.org/ (Enterprise UI components)
- **Ant Design Vue**: https://www.antdv.com/ (Enterprise UI design language)
- **Vuetify**: https://vuetifyjs.com/ (Material Design components)
- **Tailwind CSS**: https://tailwindcss.com/ (Utility-first CSS framework)

### Testing Tools
- **Vitest**: https://vitest.dev/ (Fast test framework)
- **Vue Test Utils**: https://test-utils.vuejs.org/ (Official testing utilities)
- **Cypress**: https://www.cypress.io/ (End-to-end testing)
- **Playwright**: https://playwright.dev/ (Cross-browser automation)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Vue.js team for the excellent framework
- The Vue community for best practices and patterns
- All contributors to this repository

## 📞 Support

If you have questions or need help:
1. Check the documentation in `skills/vue3-frontend/skill.md`
2. Read the reference documents in `skills/vue3-frontend/references/`
3. Open an issue on GitHub
4. Join the Vue.js community discussions

---

**Happy Coding!** 🚀
