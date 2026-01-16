# Vue Composable 测试模式

## 测试 Composable 函数

### 基础 Composable 测试

```typescript
import { ref, computed } from 'vue';
import { useCounter } from '@/composables/useCounter';

describe('useCounter', () => {
  it('应该使用默认值初始化', () => {
    const { count, increment, decrement } = useCounter();
    
    expect(count.value).toBe(0);
  });

  it('应该使用自定义值初始化', () => {
    const { count } = useCounter(10);
    
    expect(count.value).toBe(10);
  });

  it('应该增加计数', () => {
    const { count, increment } = useCounter();
    
    increment();
    
    expect(count.value).toBe(1);
  });

  it('应该减少计数', () => {
    const { count, decrement } = useCounter(5);
    
    decrement();
    
    expect(count.value).toBe(4);
  });

  it('不应该低于零', () => {
    const { count, decrement } = useCounter(0);
    
    decrement();
    
    expect(count.value).toBe(0);
  });
});
```

### 测试带有异步操作的 Composables

```typescript
import { useFetch } from '@/composables/useFetch';
import { flushPromises } from '@vue/test-utils';

describe('useFetch', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('应该处理成功的 fetch 请求', async () => {
    const mockData = { id: 1, name: 'Test User' };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });
    
    const { data, error, loading, execute } = useFetch('/api/user');
    
    expect(loading.value).toBe(false);
    
    execute();
    expect(loading.value).toBe(true);
    
    await flushPromises();
    
    expect(loading.value).toBe(false);
    expect(data.value).toEqual(mockData);
    expect(error.value).toBeNull();
  });

  it('应该处理 fetch 错误', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    const { data, error, loading, execute } = useFetch('/api/user');
    
    execute();
    
    await flushPromises();
    
    expect(loading.value).toBe(false);
    expect(data.value).toBeNull();
    expect(error.value).toBe('Network error');
  });

  it('应该处理 HTTP 错误', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });
    
    const { error, execute } = useFetch('/api/user');
    
    execute();
    
    await flushPromises();
    
    expect(error.value).toContain('404');
  });

  it('应该支持 abort controller', async () => {
    const { loading, execute, abort } = useFetch('/api/user');
    
    execute();
    expect(loading.value).toBe(true);
    
    abort();
    
    await flushPromises();
    
    expect(loading.value).toBe(false);
  });
});
```

### 测试带有副作用的 Composables

```typescript
import { useLocalStorage } from '@/composables/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('键不存在时应该使用默认值初始化', () => {
    const { value } = useLocalStorage('test-key', 'default');
    
    expect(value.value).toBe('default');
  });

  it('应该从 localStorage 加载现有值', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    
    const { value } = useLocalStorage('test-key', 'default');
    
    expect(value.value).toBe('stored-value');
  });

  it('应该将更改同步到 localStorage', () => {
    const { value } = useLocalStorage('test-key', 'initial');
    
    value.value = 'updated';
    
    const stored = localStorage.getItem('test-key');
    expect(JSON.parse(stored!)).toBe('updated');
  });

  it('应该处理复杂对象', () => {
    const defaultObj = { name: 'test', count: 0 };
    const { value } = useLocalStorage('test-obj', defaultObj);
    
    value.value = { name: 'updated', count: 5 };
    
    const stored = localStorage.getItem('test-obj');
    expect(JSON.parse(stored!)).toEqual({ name: 'updated', count: 5 });
  });

  it('应该处理 localStorage 配额超出的情况', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    
    const { value, error } = useLocalStorage('test-key', 'value');
    
    value.value = 'new value';
    
    expect(error.value).toBeTruthy();
    
    setItemSpy.mockRestore();
  });
});
```

### 测试带有定时器的 Composables

```typescript
import { useDebounce } from '@/composables/useDebounce';
import { ref } from 'vue';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该防抖 (debounce) 值更新', () => {
    const input = ref('');
    const { debouncedValue } = useDebounce(input, 300);
    
    expect(debouncedValue.value).toBe('');
    
    input.value = 'a';
    expect(debouncedValue.value).toBe('');
    
    vi.advanceTimersByTime(150);
    expect(debouncedValue.value).toBe('');
    
    vi.advanceTimersByTime(150);
    expect(debouncedValue.value).toBe('a');
  });

  it('快速更改时应该重置定时器', () => {
    const input = ref('');
    const { debouncedValue } = useDebounce(input, 300);
    
    input.value = 'a';
    vi.advanceTimersByTime(200);
    
    input.value = 'ab';
    vi.advanceTimersByTime(200);
    
    expect(debouncedValue.value).toBe('');
    
    vi.advanceTimersByTime(100);
    expect(debouncedValue.value).toBe('ab');
  });

  it('应该处理 immediate 选项', () => {
    const input = ref('initial');
    const { debouncedValue } = useDebounce(input, 300, { immediate: true });
    
    expect(debouncedValue.value).toBe('initial');
    
    input.value = 'updated';
    expect(debouncedValue.value).toBe('updated');
    
    vi.advanceTimersByTime(300);
    expect(debouncedValue.value).toBe('updated');
  });
});
```

### 测试带有事件监听器的 Composables

```typescript
import { useEventListener } from '@/composables/useEventListener';
import { onUnmounted } from 'vue';

describe('useEventListener', () => {
  it('应该向目标添加事件监听器', () => {
    const handler = vi.fn();
    const button = document.createElement('button');
    
    useEventListener(button, 'click', handler);
    
    button.click();
    
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('清理时应该移除事件监听器', () => {
    const handler = vi.fn();
    const button = document.createElement('button');
    const removeListenerSpy = vi.spyOn(button, 'removeEventListener');
    
    const { cleanup } = useEventListener(button, 'click', handler);
    
    cleanup();
    
    expect(removeListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('应该支持 window 事件', () => {
    const handler = vi.fn();
    
    useEventListener(window, 'resize', handler);
    
    window.dispatchEvent(new Event('resize'));
    
    expect(handler).toHaveBeenCalled();
  });

  it('应该支持事件选项', () => {
    const handler = vi.fn();
    const button = document.createElement('button');
    const addListenerSpy = vi.spyOn(button, 'addEventListener');
    
    useEventListener(button, 'click', handler, { once: true, capture: true });
    
    expect(addListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      { once: true, capture: true }
    );
  });
});
```

### 测试带有侦听器的 Composables

```typescript
import { useForm } from '@/composables/useForm';
import { nextTick } from 'vue';

describe('useForm', () => {
  it('值改变时应该进行验证', async () => {
    const rules = {
      email: (value: string) => value.includes('@') || 'Invalid email'
    };
    
    const { values, errors, setFieldValue } = useForm({ email: '' }, rules);
    
    setFieldValue('email', 'invalid');
    await nextTick();
    
    expect(errors.value.email).toBe('Invalid email');
    
    setFieldValue('email', 'valid@example.com');
    await nextTick();
    
    expect(errors.value.email).toBeUndefined();
  });

  it('应该追踪脏状态 (dirty state)', async () => {
    const { values, isDirty, setFieldValue } = useForm({ name: 'initial' });
    
    expect(isDirty.value).toBe(false);
    
    setFieldValue('name', 'changed');
    await nextTick();
    
    expect(isDirty.value).toBe(true);
  });

  it('应该重置表单为初始值', async () => {
    const { values, setFieldValue, reset } = useForm({ name: 'initial' });
    
    setFieldValue('name', 'changed');
    expect(values.value.name).toBe('changed');
    
    reset();
    
    expect(values.value.name).toBe('initial');
  });
});
```

### 测试带有多个响应式依赖的 Composables

```typescript
import { useCalculator } from '@/composables/useCalculator';
import { ref } from 'vue';

describe('useCalculator', () => {
  it('应该计算响应式值的和', () => {
    const a = ref(5);
    const b = ref(10);
    
    const { sum } = useCalculator(a, b);
    
    expect(sum.value).toBe(15);
  });

  it('依赖改变时应该更新结果', () => {
    const a = ref(5);
    const b = ref(10);
    
    const { sum, product } = useCalculator(a, b);
    
    expect(sum.value).toBe(15);
    expect(product.value).toBe(50);
    
    a.value = 3;
    
    expect(sum.value).toBe(13);
    expect(product.value).toBe(30);
    
    b.value = 7;
    
    expect(sum.value).toBe(10);
    expect(product.value).toBe(21);
  });
});
```

### 测试 Composable 清理和生命周期

```typescript
import { useInterval } from '@/composables/useInterval';
import { effectScope } from 'vue';

describe('useInterval - Cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('作用域销毁时应该清理 interval', () => {
    const callback = vi.fn();
    const scope = effectScope();
    
    scope.run(() => {
      useInterval(callback, 1000);
    });
    
    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3);
    
    scope.stop();
    
    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(3); // 清理后不再调用
  });

  it('应该支持手动暂停和恢复', () => {
    const callback = vi.fn();
    const { pause, resume } = useInterval(callback, 1000);
    
    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(2);
    
    pause();
    
    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(2); // 暂停中，无新调用
    
    resume();
    
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(3); // 已恢复
  });
});
```

## 在组件上下文中测试 Composables

```typescript
import { mount } from '@vue/test-utils';
import ComponentUsingComposable from '@/components/ComponentUsingComposable.vue';

describe('Component with Composable', () => {
  it('应该在组件内使用 composable', async () => {
    const wrapper = mount(ComponentUsingComposable);
    
    expect(wrapper.find('.count').text()).toBe('0');
    
    await wrapper.find('.increment-btn').trigger('click');
    
    expect(wrapper.find('.count').text()).toBe('1');
  });

  it('卸载时应该清理 composable', () => {
    const cleanupSpy = vi.fn();
    vi.mock('@/composables/useFeature', () => ({
      useFeature: () => {
        onUnmounted(cleanupSpy);
        return { value: ref(0) };
      }
    }));
    
    const wrapper = mount(ComponentUsingComposable);
    
    wrapper.unmount();
    
    expect(cleanupSpy).toHaveBeenCalled();
  });
});
```