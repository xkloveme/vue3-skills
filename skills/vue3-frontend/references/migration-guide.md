# Vue 2 到 Vue 3 迁移指南

## 关键破坏性变更

### 1. 全局 API 变更

**Vue 2:**
```javascript
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.component('MyComponent', MyComponent)

new Vue({
  render: h => h(App)
}).$mount('#app')
```

**Vue 3:**
```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.component('MyComponent', MyComponent)
app.mount('#app')
```

### 2. 响应式系统

**Vue 2:**
```javascript
export default {
  data() {
    return {
      count: 0,
      user: { name: 'EVA' }
    }
  },
  methods: {
    addProperty() {
      // ❌ 需要 Vue.set
      this.$set(this.user, 'age', 25)
    }
  }
}
```

**Vue 3:**
```javascript
import { reactive, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const user = reactive({ name: 'EVA' })
    
    /**
     * 直接新增属性
     */
    const addProperty = () => {
      // ✅ 直接新增属性
      user.age = 25
    }
    
    return { count, user, addProperty }
  }
}
```

### 3. v-model 变更

**Vue 2:**
```vue
<!-- 父组件 -->
<MyInput v-model="text" />

<!-- 子组件 -->
<template>
  <input :value="value" @input="$emit('input', $event.target.value)" />
</template>

<script>
export default {
  props: ['value']
}
</script>
```

**Vue 3:**
```vue
<!-- 父组件 -->
<MyInput v-model="text" />

<!-- 子组件 -->
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>

<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue']
}
</script>
```

### 4. 多重 v-model 支持

**Vue 3 新功能:**
```vue
<!-- 父组件 -->
<UserForm v-model:name="userName" v-model:email="userEmail" />

<!-- 子组件 -->
<script setup>
defineProps(['name', 'email'])
const emit = defineEmits(['update:name', 'update:email'])
</script>

<template>
  <input :value="name" @input="emit('update:name', $event.target.value)" />
  <input :value="email" @input="emit('update:email', $event.target.value)" />
</template>
```

### 5. 过滤器移除

**Vue 2:**
```vue
<template>
  <div>{{ price | currency }}</div>
</template>

<script>
export default {
  filters: {
    currency(value) {
      return '$' + value.toFixed(2)
    }
  }
}
</script>
```

**Vue 3 (使用 computed 或 methods):**
```vue
<template>
  <div>{{ formatCurrency(price) }}</div>
</template>

<script setup>
/**
 * 格式化货币
 * @param {number} value - 金额
 * @returns {string} 格式化后的金额
 */
const formatCurrency = (value) => {
  return '$' + value.toFixed(2)
}
</script>
```

### 6. Event Bus 移除

**Vue 2:**
```javascript
// event-bus.js
export const EventBus = new Vue()

// ComponentA.vue
EventBus.$emit('event-name', data)

// ComponentB.vue
EventBus.$on('event-name', (data) => {})
```

**Vue 3 (使用 mitt 或 Pinia):**
```javascript
// Using mitt
import mitt from 'mitt'
export const emitter = mitt()

// ComponentA.vue
emitter.emit('event-name', data)

// ComponentB.vue
emitter.on('event-name', (data) => {})

// 或者使用 Pinia 进行状态管理
```

### 7. 异步组件语法

**Vue 2:**
```javascript
const AsyncComponent = () => import('./AsyncComponent.vue')
```

**Vue 3:**
```javascript
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)
```

### 8. 函数式组件

**Vue 2:**
```vue
<template functional>
  <div>{{ props.msg }}</div>
</template>

<script>
export default {
  functional: true,
  props: ['msg']
}
</script>
```

**Vue 3:**
```vue
<script setup>
defineProps(['msg'])
</script>

<template>
  <div>{{ msg }}</div>
</template>
```

### 9. Composition API 中的生命周期钩子

**Vue 2 Options API → Vue 3 Composition API:**
```javascript
// Vue 2
export default {
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
}

// Vue 3 Composition API
import { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue'

setup() {
  // beforeCreate & created 的逻辑直接放在 setup() 中
  
  onBeforeMount(() => {})
  onMounted(() => {})
  onBeforeUpdate(() => {})
  onUpdated(() => {})
  onBeforeUnmount(() => {})
  onUnmounted(() => {})
}
```

### 10. $attrs 行为变更

**Vue 2:**
```javascript
// class 和 style 不包含在 $attrs 中
this.$attrs // { id: 'foo' }
```

**Vue 3:**
```javascript
// class 和 style 也包含在 $attrs 中
this.$attrs // { class: 'bar', style: {...}, id: 'foo' }
```

### 11. Key 使用变更

**Vue 2:**
```vue
<template v-for="item in items">
  <div :key="item.id">{{ item.name }}</div>
  <span :key="item.id">{{ item.desc }}</span>
</template>
```

**Vue 3:**
```vue
<!-- key 应该放在 template 上 -->
<template v-for="item in items" :key="item.id">
  <div>{{ item.name }}</div>
  <span>{{ item.desc }}</span>
</template>
```

## 迁移清单

- [ ] 更新 Vue 版本到 3.x
- [ ] 将 `new Vue()` 改为 `createApp()`
- [ ] 更新全局 API 调用 (Vue.use → app.use)
- [ ] 移除 filters,改用 computed 或 methods
- [ ] 移除 Event Bus,改用 mitt 或 Pinia
- [ ] 更新 v-model 用法 (value → modelValue, input → update:modelValue)
- [ ] 检查并更新生命周期 hook 名称
- [ ] 更新 functional components
- [ ] 检查 $attrs 的使用
- [ ] 检查 template 上的 key 使用
- [ ] 更新 async components
- [ ] 测试响应式系统的行为变化

## 常见迁移模式

### 模式 1: Options API 到 Composition API

**Before:**
```vue
<script>
export default {
  data() {
    return {
      count: 0,
      loading: false
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>
```

**After:**
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const loading = ref(false)

const doubleCount = computed(() => count.value * 2)

/**
 * 增加计数
 */
const increment = () => {
  count.value++
}

onMounted(() => {
  fetchData()
})
</script>
```

### 模式 2: Vuex 到 Pinia

**Vuex (Vue 2):**
```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const user = await api.login(credentials)
      commit('SET_USER', user)
    }
  },
  getters: {
    isLoggedIn: state => !!state.user
  }
})
```

**Pinia (Vue 3):**
```javascript
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    /**
     * 用户登录
     * @param {Object} credentials - 登录凭证
     */
    async login(credentials) {
      this.user = await api.login(credentials)
    }
  }
})
```