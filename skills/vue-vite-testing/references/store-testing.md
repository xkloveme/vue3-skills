# Pinia Store 测试模式

## 基础 Store 测试

### 测试 State 和 Getters

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';

describe('useUserStore - State and Getters', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('应该使用默认 state 初始化', () => {
    const store = useUserStore();
    
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBe('');
  });

  it('应该计算 isAuthenticated getter', () => {
    const store = useUserStore();
    
    expect(store.isAuthenticated).toBe(false);
    
    store.user = { id: 1, name: 'John Doe' };
    store.token = 'abc123';
    
    expect(store.isAuthenticated).toBe(true);
  });

  it('应该从用户数据计算 fullName getter', () => {
    const store = useUserStore();
    
    store.user = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    };
    
    expect(store.fullName).toBe('John Doe');
  });
});
```

### 测试 Actions

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';

describe('useUserStore - Actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    global.fetch = vi.fn();
  });

  it('应该成功登录', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    const mockToken = 'token123';
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser, token: mockToken })
    });
    
    const store = useUserStore();
    
    await store.login('john@example.com', 'password');
    
    expect(store.user).toEqual(mockUser);
    expect(store.token).toBe(mockToken);
    expect(store.isAuthenticated).toBe(true);
  });

  it('应该处理登录失败', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Invalid credentials' })
    });
    
    const store = useUserStore();
    
    await expect(store.login('wrong@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials'
    );
    
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('应该注销并清除 state', () => {
    const store = useUserStore();
    
    // 设置初始 state
    store.user = { id: 1, name: 'John Doe' };
    store.token = 'token123';
    
    store.logout();
    
    expect(store.user).toBeNull();
    expect(store.token).toBe('');
    expect(store.isAuthenticated).toBe(false);
  });

  it('应该更新用户资料', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Jane Doe', email: 'jane@example.com' })
    });
    
    const store = useUserStore();
    store.user = { id: 1, name: 'John Doe' };
    
    await store.updateProfile({ name: 'Jane Doe', email: 'jane@example.com' });
    
    expect(store.user.name).toBe('Jane Doe');
    expect(store.user.email).toBe('jane@example.com');
  });
});
```

### 测试带有多个依赖的 Store

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '@/stores/cart';
import { useProductStore } from '@/stores/product';

describe('useCartStore with Dependencies', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('应该添加产品到购物车', () => {
    const productStore = useProductStore();
    const cartStore = useCartStore();
    
    const product = { id: 1, name: 'Product 1', price: 100 };
    productStore.products = [product];
    
    cartStore.addItem(product.id, 2);
    
    expect(cartStore.items).toHaveLength(1);
    expect(cartStore.items[0]).toEqual({
      productId: 1,
      quantity: 2,
      price: 100
    });
  });

  it('应该计算购物车项目总价', () => {
    const cartStore = useCartStore();
    
    cartStore.items = [
      { productId: 1, quantity: 2, price: 100 },
      { productId: 2, quantity: 1, price: 50 }
    ];
    
    expect(cartStore.total).toBe(250);
  });

  it('应该从购物车移除项目', () => {
    const cartStore = useCartStore();
    
    cartStore.items = [
      { productId: 1, quantity: 2, price: 100 },
      { productId: 2, quantity: 1, price: 50 }
    ];
    
    cartStore.removeItem(1);
    
    expect(cartStore.items).toHaveLength(1);
    expect(cartStore.items[0].productId).toBe(2);
  });

  it('应该清空购物车', () => {
    const cartStore = useCartStore();
    
    cartStore.items = [
      { productId: 1, quantity: 2, price: 100 }
    ];
    
    cartStore.clear();
    
    expect(cartStore.items).toEqual([]);
    expect(cartStore.total).toBe(0);
  });
});
```

### 测试 Store 持久化

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore } from '@/stores/settings';

describe('useSettingsStore - Persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('应该从 localStorage 加载设置', () => {
    localStorage.setItem('settings', JSON.stringify({
      theme: 'dark',
      language: 'zh-TW'
    }));
    
    const store = useSettingsStore();
    
    expect(store.theme).toBe('dark');
    expect(store.language).toBe('zh-TW');
  });

  it('更改时应该保存设置到 localStorage', () => {
    const store = useSettingsStore();
    
    store.updateTheme('dark');
    
    const saved = localStorage.getItem('settings');
    expect(JSON.parse(saved!).theme).toBe('dark');
  });

  it('应该处理损坏的 localStorage 数据', () => {
    localStorage.setItem('settings', 'invalid-json');
    
    const store = useSettingsStore();
    
    // 应该回退到默认值
    expect(store.theme).toBe('light');
    expect(store.language).toBe('en');
  });
});
```

### 测试异步 Store Actions

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { usePostStore } from '@/stores/post';
import { flushPromises } from '@vue/test-utils';

describe('usePostStore - Async Actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    global.fetch = vi.fn();
  });

  it('应该成功获取帖子', async () => {
    const mockPosts = [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' }
    ];
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPosts)
    });
    
    const store = usePostStore();
    
    expect(store.loading).toBe(false);
    
    const promise = store.fetchPosts();
    
    expect(store.loading).toBe(true);
    
    await promise;
    
    expect(store.loading).toBe(false);
    expect(store.posts).toEqual(mockPosts);
    expect(store.error).toBeNull();
  });

  it('应该处理获取错误', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    const store = usePostStore();
    
    await store.fetchPosts();
    
    expect(store.loading).toBe(false);
    expect(store.posts).toEqual([]);
    expect(store.error).toBe('Network error');
  });

  it('应该创建新帖子', async () => {
    const newPost = { title: 'New Post', content: 'Content' };
    const createdPost = { id: 1, ...newPost };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createdPost)
    });
    
    const store = usePostStore();
    
    await store.createPost(newPost);
    
    expect(store.posts).toContainEqual(createdPost);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newPost)
      })
    );
  });

  it('应该更新现有帖子', async () => {
    const store = usePostStore();
    store.posts = [
      { id: 1, title: 'Old Title', content: 'Old Content' }
    ];
    
    const updatedPost = { id: 1, title: 'New Title', content: 'New Content' };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updatedPost)
    });
    
    await store.updatePost(1, { title: 'New Title', content: 'New Content' });
    
    expect(store.posts[0]).toEqual(updatedPost);
  });

  it('应该删除帖子', async () => {
    const store = usePostStore();
    store.posts = [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' }
    ];
    
    (global.fetch as any).mockResolvedValue({ ok: true });
    
    await store.deletePost(1);
    
    expect(store.posts).toHaveLength(1);
    expect(store.posts[0].id).toBe(2);
  });
});
```

### 测试 Store State 水合 (Hydration)

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useHydratedStore } from '@/stores/hydrated';

describe('useHydratedStore - Hydration', () => {
  it('应该从服务器 state 水合 store', () => {
    const serverState = {
      user: { id: 1, name: 'John' },
      settings: { theme: 'dark' }
    };
    
    const pinia = createPinia();
    pinia.state.value = serverState;
    setActivePinia(pinia);
    
    const store = useHydratedStore();
    
    expect(store.user).toEqual(serverState.user);
    expect(store.settings).toEqual(serverState.settings);
  });
});
```

### 测试 Store 订阅

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from '@/stores/notification';

describe('useNotificationStore - Subscriptions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('state 改变时应该触发订阅', () => {
    const store = useNotificationStore();
    const subscriber = vi.fn();
    
    store.$subscribe(subscriber);
    
    store.addNotification({ id: 1, message: 'Test' });
    
    expect(subscriber).toHaveBeenCalled();
  });

  it('应该将 mutation 详情传递给订阅者', () => {
    const store = useNotificationStore();
    const subscriber = vi.fn();
    
    store.$subscribe((mutation, state) => {
      subscriber(mutation, state);
    });
    
    store.addNotification({ id: 1, message: 'Test' });
    
    expect(subscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        storeId: 'notification'
      }),
      expect.objectContaining({
        notifications: expect.any(Array)
      })
    );
  });

  it('应该支持分离的订阅 (detached subscription)', () => {
    const store = useNotificationStore();
    const subscriber = vi.fn();
    
    const unsubscribe = store.$subscribe(subscriber, { detached: true });
    
    store.addNotification({ id: 1, message: 'Test' });
    
    expect(subscriber).toHaveBeenCalled();
    
    unsubscribe();
    
    store.addNotification({ id: 2, message: 'Test 2' });
    
    expect(subscriber).toHaveBeenCalledTimes(1); // 取消订阅后不应再调用
  });
});
```

### 测试 Options API Store

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { defineStore } from 'pinia';

const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++;
    }
  }
});

describe('Options API Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('应该能与 Options API 配合工作', () => {
    const store = useCounterStore();
    
    expect(store.count).toBe(0);
    expect(store.doubleCount).toBe(0);
    
    store.increment();
    
    expect(store.count).toBe(1);
    expect(store.doubleCount).toBe(2);
  });
});
```

### 测试 Store 重置

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';

describe('useUserStore - Reset', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('应该将 store 重置为初始 state', () => {
    const store = useUserStore();
    
    // 修改 state
    store.user = { id: 1, name: 'John' };
    store.token = 'token123';
    
    expect(store.user).not.toBeNull();
    
    // 重置
    store.$reset();
    
    expect(store.user).toBeNull();
    expect(store.token).toBe('');
  });
});
```

## 在组件中测试 Stores

```typescript
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import UserProfile from '@/components/UserProfile.vue';

describe('UserProfile with Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('应该显示 store 中的用户数据', () => {
    const store = useUserStore();
    store.user = { id: 1, name: 'John Doe', email: 'john@example.com' };
    
    const wrapper = mount(UserProfile);
    
    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('john@example.com');
  });

  it('点击按钮时应该调用 store action', async () => {
    const store = useUserStore();
    const logoutSpy = vi.spyOn(store, 'logout');
    
    const wrapper = mount(UserProfile);
    
    await wrapper.find('.logout-btn').trigger('click');
    
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('应该对 store state 变化做出反应', async () => {
    const store = useUserStore();
    
    const wrapper = mount(UserProfile);
    
    expect(wrapper.find('.username').exists()).toBe(false);
    
    store.user = { id: 1, name: 'John Doe' };
    
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.username').text()).toBe('John Doe');
  });
});
```