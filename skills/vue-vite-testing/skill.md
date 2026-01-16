---
name: vue-vite-testing
description: 使用 Vitest 和 Vue Test Utils 的 Vue 3 + Vite 项目的综合单元测试指南。适用于编写或审查 Vue 组件、Composables、Pinia Stores 或 Vite 项目中的 TypeScript/JavaScript 工具函数的单元测试。涵盖测试结构、最佳实践、Mock 策略和 Vue 特定的测试模式。
---

# Vue + Vite 单元测试

## 概述

使用 Vitest 框架为 Vue 3 + Vite 项目生成全面的、生产就绪的单元测试。遵循行业最佳实践，对 Vue 组件、Composables、Pinia Stores 和 TypeScript 工具函数进行测试，确保适当的隔离、Mock 和边界情况覆盖。

## 测试框架设置

**主要技术栈:**
- **Vitest**: 专为 Vite 构建的快速单元测试框架
- **Vue Test Utils**: Vue 组件的官方测试实用程序库
- **@vitest/ui**: 可选的测试可视化 UI

**导入模式:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
```

## 测试工作流

所有测试任务请遵循此系统方法：

### 1. 代码分析阶段

**在编写任何测试之前:**
- 分析代码结构并确定所有公共接口
- 确定外部依赖（API、Stores、Composables、模块）
- 记录所有可能的代码路径、条件和边缘情况
- 针对以下内容提出澄清问题：
  - 缺失的类型定义或常量
  - 不清楚的业务逻辑或验证规则
  - 外部 API 契约或数据结构
  - 预期的错误处理行为

**只有在完全理解代码后才开始编写测试。**

### 2. 测试设计阶段

**规划测试覆盖:**
- 快乐路径场景（预期的输入和输出）
- 错误处理和失败模式
- 边缘情况（空数组、null 值、边界条件）
- 异步操作（加载中、成功、错误状态）
- 用户交互（点击、输入、表单提交）
- 生命周期钩子和响应式

**对于 Vue 组件，确定:**
- Props 验证和默认值
- 触发的事件及其负载 (payloads)
- 插槽使用和内容投影
- 计算属性和侦听器
- 组件生命周期行为

**对于 Composables，确定:**
- 输入参数和返回值
- 状态管理和响应式
- 副作用（API 调用、localStorage、定时器）
- 清理要求

## 测试结构标准

### 标准测试模板

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ModuleName or ComponentName', () => {
  // 顶层测试变量
  let mockDependency: MockType;
  
  beforeEach(() => {
    // 每次测试前重置状态
    mockDependency = createMockDependency();
  });

  afterEach(() => {
    // 每次测试后清理
    vi.clearAllMocks();
  });

  describe('method or feature name', () => {
    it('should handle happy path scenario', () => {
      // Arrange: 设置测试数据和 Mock
      const input = { /* test data */ };
      
      // Act: 执行被测代码
      const result = functionUnderTest(input);
      
      // Assert: 验证预期结果
      expect(result).toBe(expectedValue);
    });

    it('should handle error case', async () => {
      // Arrange
      mockDependency.method.mockRejectedValue(new Error('test error'));
      
      // Act & Assert
      await expect(functionUnderTest()).rejects.toThrow('test error');
    });

    it('should handle edge case: empty input', () => {
      // 测试边缘情况
      expect(functionUnderTest([])).toEqual([]);
    });
  });
});
```

### AAA 模式 (Arrange-Act-Assert)

**始终使用 AAA 结构化单个测试:**

```typescript
it('should calculate total price correctly', () => {
  // Arrange: 设置测试数据
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ];
  
  // Act: 执行函数
  const total = calculateTotal(items);
  
  // Assert: 验证结果
  expect(total).toBe(250);
});
```

## Vue 特定测试模式

### 1. 组件测试

**在 mount 和 shallowMount 之间选择:**
- 使用 `mount()` 进行包含子组件的集成测试
- 使用 `shallowMount()` 进行隔离单元测试（存根子组件）

```typescript
import { mount } from '@vue/test-utils';
import MyComponent from './MyComponent.vue';

describe('MyComponent', () => {
  it('should render with props', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title',
        count: 5
      }
    });
    
    expect(wrapper.find('h1').text()).toBe('Test Title');
    expect(wrapper.find('.count').text()).toBe('5');
  });

  it('should emit event on button click', async () => {
    const wrapper = mount(MyComponent);
    
    await wrapper.find('button').trigger('click');
    
    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')[0]).toEqual([{ data: 'value' }]);
  });

  it('should handle v-model binding', async () => {
    const wrapper = mount(MyComponent, {
      props: {
        modelValue: 'initial'
      }
    });
    
    await wrapper.find('input').setValue('updated');
    
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['updated']);
  });
});
```

**详见 `references/component-testing.md` 了解完整的组件测试模式，包括插槽、provide/inject 和异步组件。**

### 2. Composables 测试

```typescript
import { composableUnderTest } from './useFeature';

describe('useFeature composable', () => {
  it('should initialize with default state', () => {
    const { state, count } = composableUnderTest();
    
    expect(state.value).toBe('idle');
    expect(count.value).toBe(0);
  });

  it('should update reactive state', () => {
    const { increment, count } = composableUnderTest();
    
    increment();
    
    expect(count.value).toBe(1);
  });

  it('should handle async operations', async () => {
    const { fetchData, data, loading } = composableUnderTest();
    
    expect(loading.value).toBe(false);
    
    const promise = fetchData();
    expect(loading.value).toBe(true);
    
    await promise;
    expect(loading.value).toBe(false);
    expect(data.value).toBeDefined();
  });
});
```

### 3. Pinia Store 测试

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useMyStore } from './myStore';

describe('myStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default state', () => {
    const store = useMyStore();
    
    expect(store.items).toEqual([]);
    expect(store.loading).toBe(false);
  });

  it('should add item to store', () => {
    const store = useMyStore();
    const newItem = { id: 1, name: 'Test' };
    
    store.addItem(newItem);
    
    expect(store.items).toContainEqual(newItem);
  });

  it('should handle async actions', async () => {
    const store = useMyStore();
    
    await store.fetchItems();
    
    expect(store.loading).toBe(false);
    expect(store.items.length).toBeGreaterThan(0);
  });
});
```

**详见 `references/store-testing.md` 了解 Pinia Store 测试模式，包括 Getters、Mutations 和 Actions。**

## Mock 策略

### 外部依赖

```typescript
// Mock API calls
vi.mock('@/api/users', () => ({
  fetchUsers: vi.fn(),
  createUser: vi.fn()
}));

// Mock composables
vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn()
  }))
}));

// Mock Vue Router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
};

const wrapper = mount(Component, {
  global: {
    mocks: {
      $router: mockRouter
    }
  }
});
```

### 定时器和延迟

```typescript
import { vi } from 'vitest';

describe('setTimeout behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute callback after delay', () => {
    const callback = vi.fn();
    
    setTimeout(callback, 1000);
    
    expect(callback).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalledOnce();
  });
});
```

## 测试最佳实践

### 1. 测试隔离
- 每个测试应该是独立的，不依赖于其他测试
- 使用 `beforeEach` 重置状态
- 使用 `vi.clearAllMocks()` 或 `vi.resetAllMocks()` 清理 Mocks

### 2. 描述性的测试名称
```typescript
// ✅ Good: 清晰且具描述性
it('should display error message when API request fails', () => {});

// ❌ Bad: 模糊且不清楚
it('should work', () => {});
```

### 3. 避免测试逻辑
```typescript
// ❌ Bad: 包含循环和条件
it('should validate all items', () => {
  for (const item of items) {
    if (item.type === 'special') {
      expect(validate(item)).toBe(true);
    }
  }
});

// ✅ Good: 简单直接
it('should validate special item', () => {
  const specialItem = { type: 'special', value: 100 };
  expect(validate(specialItem)).toBe(true);
});

it('should validate normal item', () => {
  const normalItem = { type: 'normal', value: 50 };
  expect(validate(normalItem)).toBe(true);
});
```

### 4. 测试覆盖优先级
1. **关键业务逻辑**（支付、认证、数据验证）
2. **复杂算法**（计算、转换）
3. **错误处理**（边缘情况、失败模式）
4. **用户交互**（表单、按钮、导航）
5. **集成点**（API 调用、外部服务）

### 5. 异步测试
```typescript
// ✅ 正确处理异步操作
it('should fetch data successfully', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

// ✅ 对 Promise 使用 resolves/rejects
await expect(fetchData()).resolves.toEqual(expectedData);
await expect(failingOperation()).rejects.toThrow('Error message');
```

## 完整的测试交付物

生成测试时，始终提供：

1. **完整的测试套件** - 没有占位符或 "// TODO" 注释
2. **所有边缘情况覆盖** - 空输入、null 值、边界
3. **正确的导入** - 所有必要的测试实用程序和依赖项
4. **适当的 Mocks** - 用于外部依赖和副作用
5. **清晰的测试描述** - 自文档化的测试名称
6. **适当的清理** - 需要时使用 afterEach 钩子

## 参考文件

有关详细示例和高级模式：

- **`references/component-testing.md`** - 全面的组件测试模式（插槽、teleport、provide/inject、异步组件）
- **`references/composables-testing.md`** - 高级 Composable 测试（副作用、watchers、清理）
- **`references/store-testing.md`** - Pinia Store 测试模式（getters、actions、状态管理）
