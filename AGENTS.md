# AGENTS.md - Vue 3 Skills Library

This document provides essential information for AI agents working on this Vue 3 skills library repository.

## 📋 Project Overview

**Vue 3 Skills Library** - A learning resource library for Vue 3 skills and best practices. This is a documentation-focused repository containing templates, guides, and reference materials for Vue 3 development.

**Project Type**: Documentation/Reference Library (not a runnable application)

## 🚀 Build/Lint/Test Commands

### Project Structure
```
vue3-skills/
├── skills/
│   ├── vue3-frontend/          # Vue 3 frontend skills
│   │   ├── assets/             # Component & composable templates
│   │   ├── references/         # Best practices & guides
│   │   └── skill.md            # Main skill documentation
│   └── vue-vite-testing/       # Testing skills
│       ├── references/         # Testing guides
│       └── skill.md            # Testing documentation
└── README.md
```

### Commands

**There are no build/lint/test commands for this repository.** This is a documentation-only repository containing:
- Markdown reference files
- Vue component templates
- JavaScript composable templates

**For Vue 3 component testing** (when working with actual Vue projects):
```bash
# Install dependencies
npm install -D vitest @vue/test-utils @vitest/ui

# Run tests
npm run test
npm run test:ui          # With visual UI
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report

# Run single test file
npx vitest run path/to/test.spec.ts
npx vitest run path/to/test.spec.ts --reporter=verbose

# Run specific test
npx vitest run -t "should handle error case"
```

## 🎨 Code Style Guidelines

### Vue 3 Component Style

**Always use `<script setup>` syntax:**
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

// Props with validation
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0
  }
})

// Emits
const emit = defineEmits(['update', 'change'])

// State
const isActive = ref(false)

// Computed
const displayText = computed(() => {
  return props.title.toUpperCase()
})

// Methods
const handleClick = () => {
  isActive.value = !isActive.value
  emit('change', isActive.value)
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>
```

**Template structure:**
```vue
<template>
  <div class="component">
    <h2>{{ displayText }}</h2>
    <button @click="handleClick">
      {{ isActive ? '启用' : '停用' }}
    </button>
  </div>
</template>

<style scoped>
.component {
  /* Component-specific styles */
}
</style>
```

### Naming Conventions

**Components (PascalCase):**
- ✅ `UserProfile.vue`, `TheHeader.vue`, `BaseButton.vue`
- ❌ `userprofile.vue`, `header.vue`, `button.vue`

**Composables (use prefix):**
- ✅ `useAuth()`, `useFetch()`, `useLocalStorage()`
- ❌ `auth()`, `fetch()`

**Files:**
- ✅ `UserProfile.vue`, `useFetch.js`, `best-practices.md`
- ❌ `user_profile.vue`, `fetch.js`, `BestPractices.md`

### Import Order

```javascript
// 1. Vue core imports
import { ref, computed, watch, onMounted } from 'vue'

// 2. External library imports
import { useAuth } from '@/composables/useAuth'
import { storeToRefs } from 'pinia'

// 3. Internal composables
import { useFetch } from '@/composables/useFetch'

// 4. Components
import UserCard from '@/components/UserCard.vue'

// 5. Utils/Services
import { formatDate } from '@/utils/date'
```

### TypeScript Integration

**Props with TypeScript:**
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

**Emits with TypeScript:**
```vue
<script setup lang="ts">
interface Emits {
  (e: 'update', id: number, value: string): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()
</script>
```

**Composables with TypeScript:**
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

### Response API Usage

**Always handle errors properly:**
```javascript
// ✅ Good - Proper error handling
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

// ❌ Bad - Missing error handling
const fetchData = async () => {
  const response = await fetch('/api/data')
  data.value = await response.json() // Will crash on error
}
```

### Error Handling Patterns

**Global error handler (main.js):**
```javascript
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
  // Send to error tracking service
}
```

**Component-level error handling:**
```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = err.message
  console.error('Captured error:', err)
  return false // Stop error propagation
})
</script>

<template>
  <div v-if="error" class="error">{{ error }}</div>
  <slot v-else />
</template>
```

### Response API Best Practices

**Always check response.ok:**
```javascript
const response = await fetch('/api/data')
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`)
}
const data = await response.json()
```

**Handle different response types:**
```javascript
// JSON response
const data = await response.json()

// Text response
const text = await response.text()

// Blob response (for files)
const blob = await response.blob()
```

### Testing Style (Vitest)

**Use AAA pattern (Arrange-Act-Assert):**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  let mockDependency
  
  beforeEach(() => {
    mockDependency = createMockDependency()
  })

  it('should handle happy path scenario', () => {
    // Arrange: Setup test data
    const props = { title: 'Test' }
    
    // Act: Execute code
    const wrapper = mount(MyComponent, { props })
    
    // Assert: Verify results
    expect(wrapper.text()).toContain('Test')
  })

  it('should handle error case', async () => {
    // Arrange
    mockDependency.method.mockRejectedValue(new Error('test error'))
    
    // Act & Assert
    await expect(someAsyncOperation()).rejects.toThrow('test error')
  })
})
```

**Test naming conventions:**
```typescript
// ✅ Good - Descriptive
it('should display error message when API request fails', () => {})
it('should validate required fields', () => {})

// ❌ Bad - Vague
it('should work', () => {})
it('test validation', () => {})
```

### File Structure Convention

```
src/
├── assets/          # Static resources
├── components/      # Reusable components
│   ├── common/      # Base components (Button, Input)
│   ├── layout/      # Layout components (Header, Footer)
│   └── features/    # Feature components
├── composables/     # Reusable logic
├── stores/          # Pinia stores
├── router/          # Router setup
├── views/           # Page components
├── utils/           # Utility functions
├── services/        # API services
├── types/           # TypeScript type definitions
└── constants/       # Constant definitions
```

## 📚 Reference Documents

When working on specific tasks, consult these reference documents:

### For Vue 3 Development
- **`skills/vue3-frontend/references/best-practices.md`** - Comprehensive Vue 3 best practices
- **`skills/vue3-frontend/references/composition-api.md`** - Composition API reference
- **`skills/vue3-frontend/references/common-patterns.md`** - Common patterns (forms, data fetching, state management)
- **`skills/vue3-frontend/references/migration-guide.md`** - Vue 2 to Vue 3 migration guide

### For Testing
- **`skills/vue-vite-testing/references/component-testing.md`** - Component testing patterns
- **`skills/vue-vite-testing/references/composables-testing.md`** - Composable testing patterns
- **`skills/vue-vite-testing/references/store-testing.md`** - Pinia store testing patterns

## 🎯 Common Workflows

### Creating a New Component
```bash
# 1. Choose appropriate template
view skills/vue3-frontend/assets/component-templates/

# 2. Read best practices
view skills/vue3-frontend/references/best-practices.md

# 3. Copy and customize template
cp skills/vue3-frontend/assets/component-templates/BasicComponent.vue src/components/MyComponent.vue

# 4. Follow naming convention (PascalCase)
# 5. Define props with validation
# 6. Use <script setup> syntax
# 7. Keep components focused and small
```

### Writing Tests
```bash
# 1. Read testing guide
view skills/vue-vite-testing/skill.md

# 2. Choose test pattern based on what you're testing
# - Component → component-testing.md
# - Composable → composables-testing.md
# - Store → store-testing.md

# 3. Run tests
npx vitest run path/to/test.spec.ts
```

## ⚠️ Important Notes

1. **This is a documentation repository** - No build process, no runtime code
2. **Templates are examples** - Adapt them to your specific needs
3. **Always check response.ok** when using fetch API
4. **Use TypeScript** for better type safety in composables
5. **Follow AAA pattern** when writing tests
6. **Keep components small** (< 200 lines)
7. **Use composables** to extract reusable logic
8. **Always clean up** side effects in composables

## 🔗 External Resources

- [Vue 3 Official Documentation](https://vuejs.org/)
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [VueUse](https://vueuse.org/) - Utility composables
- [Pinia](https://pinia.vuejs.org/) - State management
- [Vitest](https://vitest.dev/) - Testing framework
- [Vue Test Utils](https://test-utils.vuejs.org/) - Testing utilities
