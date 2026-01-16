# Vue 3 Composition API 参考

## 响应式 API (Reactivity APIs)

### ref()
为基本类型创建响应式引用。

```javascript
import { ref } from 'vue'

const count = ref(0)
const message = ref('Hello')

// 读取值
console.log(count.value) // 0

// 更新值
count.value++

// 在 template 中会自动解包,不需要 .value
```

**使用时机:** 基本类型 (string, number, boolean) 或需要重新赋值的对象。

### reactive()
为对象创建深层响应式代理。

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: {
    name: 'EVA',
    role: 'Frontend Engineer'
  }
})

// 直接访问和修改
state.count++
state.user.name = 'Eva Chen'

// ❌ 不能重新赋值,会失去响应性
state = { count: 1 } // 错误!

// ✅ 应该修改属性
Object.assign(state, { count: 1 })
```

**使用时机:** 复杂对象结构,不需要重新赋值的情况。

### computed()
创建计算属性。

```javascript
import { ref, computed } from 'vue'

const count = ref(0)

// 只读 computed
const doubleCount = computed(() => count.value * 2)

// 可写 computed
const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
```

### watch()
观察响应式数据变化。

```javascript
import { ref, watch } from 'vue'

const count = ref(0)

// 观察单一源
watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
})

// 观察多个源
watch([count, message], ([newCount, newMsg], [oldCount, oldMsg]) => {
  console.log('Multiple sources changed')
})

// 深度观察
const state = reactive({ nested: { count: 0 } })
watch(
  () => state.nested,
  (newValue) => {
    console.log('Nested changed')
  },
  { deep: true }
)

// 立即执行
watch(
  source,
  callback,
  { immediate: true }
)
```

### watchEffect()
自动追踪依赖并执行副作用。

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)
const message = ref('Hello')

watchEffect(() => {
  // 自动追踪 count 和 message
  console.log(`Count: ${count.value}, Message: ${message.value}`)
})

// 清理副作用
watchEffect((onCleanup) => {
  const timer = setTimeout(() => {}, 1000)
  
  onCleanup(() => {
    clearTimeout(timer)
  })
})
```

**watch vs watchEffect:**
- `watch`: 需明确指定要观察的数据,可访问旧值
- `watchEffect`: 自动追踪依赖,立即执行,无法访问旧值

## 生命周期钩子 (Lifecycle Hooks)

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue'

export default {
  setup() {
    // setup() 本身就相当于 beforeCreate 和 created
    
    onBeforeMount(() => {
      console.log('Component is about to mount')
    })
    
    onMounted(() => {
      console.log('Component mounted')
      // DOM 已经可用
    })
    
    onBeforeUpdate(() => {
      console.log('Component is about to update')
    })
    
    onUpdated(() => {
      console.log('Component updated')
    })
    
    onBeforeUnmount(() => {
      console.log('Component is about to unmount')
      // 清理工作
    })
    
    onUnmounted(() => {
      console.log('Component unmounted')
    })
    
    // Keep-alive 组件专用
    onActivated(() => {
      console.log('Component activated')
    })
    
    onDeactivated(() => {
      console.log('Component deactivated')
    })
    
    // 错误捕获
    onErrorCaptured((err, instance, info) => {
      console.error('Error captured:', err)
      return false // 停止错误传播
    })
  }
}
```

## 组件 API (Component APIs)

### defineProps()
定义组件 props (仅在 `<script setup>` 中可用)。

```javascript
<script setup>
// 基本用法
const props = defineProps(['title', 'likes'])

// 类型定义 (TypeScript)
const props = defineProps<{
  title: string
  likes: number
}>()

// 带默认值 (TypeScript)
interface Props {
  title?: string
  likes?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Default Title',
  likes: 0
})

// 运行时验证
const props = defineProps({
  title: String,
  likes: {
    type: Number,
    required: true,
    default: 0,
    validator: (value) => value >= 0
  },
  status: {
    type: String,
    enum: ['draft', 'published']
  }
})
</script>
```

### defineEmits()
定义组件事件 (仅在 `<script setup>` 中可用)。

```javascript
<script setup>
// 基本用法
const emit = defineEmits(['update', 'delete'])

// 类型定义 (TypeScript)
const emit = defineEmits<{
  update: [id: number, value: string]
  delete: [id: number]
}>()

// 运行时验证
const emit = defineEmits({
  update: (id, value) => {
    if (typeof id !== 'number') {
      console.warn('Invalid id type')
      return false
    }
    return true
  }
})

// 使用
emit('update', 1, 'new value')
</script>
```

### defineExpose()
暴露组件内部方法给父组件 (仅在 `<script setup>` 中可用)。

```javascript
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++

// 只暴露这些给父组件
defineExpose({
  count,
  increment
})
</script>
```

### useSlots() & useAttrs()
访问 slots 和 attrs。

```javascript
<script setup>
import { useSlots, useAttrs } from 'vue'

const slots = useSlots()
const attrs = useAttrs()

// 检查 slot 是否存在
const hasDefaultSlot = !!slots.default
const hasHeaderSlot = !!slots.header

// 访问属性
console.log(attrs.class)
console.log(attrs.style)
</script>
```

## 依赖注入 (Dependency Injection)

### provide() / inject()
跨层级组件通信。

```javascript
// 祖先组件
<script setup>
import { provide, ref } from 'vue'

const theme = ref('light')
const updateTheme = (newTheme) => {
  theme.value = newTheme
}

// 提供响应式数据
provide('theme', theme)
provide('updateTheme', updateTheme)

// 使用 Symbol 避免冲突
export const ThemeSymbol = Symbol()
provide(ThemeSymbol, theme)
</script>

// 后代组件
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
const updateTheme = inject('updateTheme')

// 提供默认值
const theme = inject('theme', 'light')

// 使用 Symbol
import { ThemeSymbol } from './parent'
const theme = inject(ThemeSymbol)
</script>
```

## 模板引用 (Template Refs)

```javascript
<script setup>
import { ref, onMounted } from 'vue'

// 单一元素 ref
const inputRef = ref(null)

onMounted(() => {
  inputRef.value.focus()
})

// 组件 ref (需要 defineExpose)
const childRef = ref(null)

onMounted(() => {
  childRef.value.someMethod()
})

// v-for 中的 ref
const itemRefs = ref([])

onMounted(() => {
  itemRefs.value.forEach(el => {
    console.log(el)
  })
})
</script>

<template>
  <input ref="inputRef" />
  <ChildComponent ref="childRef" />
  
  <div v-for="item in items" :ref="el => itemRefs.push(el)">
    {{ item }}
  </div>
</template>
```

## Composables (可重用逻辑)

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const doubleCount = computed(() => count.value * 2)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement
  }
}

// 在组件中使用
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, doubleCount, increment, decrement } = useCounter(10)
</script>
```

## 高级响应式 API (Advanced Reactivity APIs)

### toRef() / toRefs()
```javascript
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({
  name: 'EVA',
  age: 25
})

// 为单一属性创建 ref
const nameRef = toRef(state, 'name')
nameRef.value = 'Eva Chen' // state.name 也会更新

// 为所有属性创建 ref
const { name, age } = toRefs(state)
name.value = 'Eva Chen' // state.name 也会更新
```

### unref()
```javascript
import { ref, unref } from 'vue'

const count = ref(10)

unref(count) // 10
unref(5) // 5 (如果不是 ref,返回原值)
```

### isRef() / isReactive() / isReadonly()
```javascript
import { ref, reactive, readonly, isRef, isReactive, isReadonly } from 'vue'

const count = ref(0)
const state = reactive({})
const readonlyState = readonly(state)

isRef(count) // true
isReactive(state) // true
isReadonly(readonlyState) // true
```

### shallowRef() / shallowReactive()
浅层响应式,只有根层级是响应式的。

```javascript
import { shallowRef, shallowReactive } from 'vue'

// 浅层 ref - 只有 .value 的变化会触发更新
const state = shallowRef({ count: 0 })
state.value.count++ // 不会触发更新
state.value = { count: 1 } // 会触发更新

// 浅层 reactive - 只有根层级属性的变化会触发更新
const state = shallowReactive({
  nested: { count: 0 }
})
state.nested.count++ // 不会触发更新
state.nested = { count: 1 } // 会触发更新
```

**使用时机:** 性能优化,大型不可变数据结构。
