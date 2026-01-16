# Vue 组件测试模式

## 完整的组件测试示例

### 测试 Props 和验证

```typescript
import { mount } from '@vue/test-utils';
import UserProfile from '@/components/UserProfile.vue';

describe('UserProfile - Props', () => {
  it('应该使用必需的 props 渲染', () => {
    const wrapper = mount(UserProfile, {
      props: {
        username: 'john_doe',
        email: 'john@example.com'
      }
    });
    
    expect(wrapper.find('.username').text()).toBe('john_doe');
    expect(wrapper.find('.email').text()).toBe('john@example.com');
  });

  it('未提供 props 时应该应用默认值', () => {
    const wrapper = mount(UserProfile, {
      props: {
        username: 'john_doe'
        // email 未提供，应该使用默认值
      }
    });
    
    expect(wrapper.find('.email').text()).toBe('');
  });

  it('开发环境下应该验证 prop 类型', () => {
    // Vitest 会在开发环境下显示无效 prop 类型的警告
    const wrapper = mount(UserProfile, {
      props: {
        username: 123, // 应该是字符串
        email: 'john@example.com'
      }
    });
    
    // 组件仍应通过类型强制转换进行渲染
    expect(wrapper.exists()).toBe(true);
  });
});
```

### 测试发射的事件 (Emitted Events)

```typescript
import { mount } from '@vue/test-utils';
import SearchInput from '@/components/SearchInput.vue';

describe('SearchInput - Events', () => {
  it('提交时应该发射带有查询参数的 search 事件', async () => {
    const wrapper = mount(SearchInput);
    
    await wrapper.find('input').setValue('test query');
    await wrapper.find('form').trigger('submit');
    
    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')?.[0]).toEqual(['test query']);
  });

  it('v-model 应该发射 update:modelValue 事件', async () => {
    const wrapper = mount(SearchInput, {
      props: {
        modelValue: 'initial'
      }
    });
    
    await wrapper.find('input').setValue('updated value');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['updated value']);
  });

  it('应该按顺序发射多个事件', async () => {
    const wrapper = mount(SearchInput);
    
    await wrapper.find('input').setValue('a');
    await wrapper.find('input').setValue('ab');
    await wrapper.find('input').setValue('abc');
    
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(3);
    expect(emitted?.[0]).toEqual(['a']);
    expect(emitted?.[1]).toEqual(['ab']);
    expect(emitted?.[2]).toEqual(['abc']);
  });
});
```

### 测试插槽 (Slots)

```typescript
import { mount } from '@vue/test-utils';
import Card from '@/components/Card.vue';

describe('Card - Slots', () => {
  it('应该渲染默认插槽内容', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<p>Card content</p>'
      }
    });
    
    expect(wrapper.html()).toContain('Card content');
  });

  it('应该渲染具名插槽', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<h2>Card Title</h2>',
        default: '<p>Card content</p>',
        footer: '<button>Action</button>'
      }
    });
    
    expect(wrapper.find('.card-header').html()).toContain('Card Title');
    expect(wrapper.find('.card-body').html()).toContain('Card content');
    expect(wrapper.find('.card-footer').html()).toContain('Action');
  });

  it('应该渲染带有 props 的作用域插槽', () => {
    const wrapper = mount(Card, {
      slots: {
        default: `
          <template #default="{ data }">
            <span class="data-value">{{ data }}</span>
          </template>
        `
      }
    });
    
    expect(wrapper.find('.data-value').exists()).toBe(true);
  });

  it('应该处理条件插槽渲染', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<h2>Title</h2>'
        // 未提供 footer 插槽
      }
    });
    
    expect(wrapper.find('.card-header').exists()).toBe(true);
    expect(wrapper.find('.card-footer').exists()).toBe(false);
  });
});
```

### 测试 Provide/Inject

```typescript
import { mount } from '@vue/test-utils';
import ParentComponent from '@/components/ParentComponent.vue';
import ChildComponent from '@/components/ChildComponent.vue';

describe('Provide/Inject', () => {
  it('应该向子组件提供值', () => {
    const wrapper = mount(ParentComponent, {
      global: {
        provide: {
          theme: 'dark',
          language: 'en'
        }
      }
    });
    
    const child = wrapper.findComponent(ChildComponent);
    expect(child.vm.theme).toBe('dark');
    expect(child.vm.language).toBe('en');
  });

  it('应该测试带有注入依赖的子组件', () => {
    const wrapper = mount(ChildComponent, {
      global: {
        provide: {
          apiClient: {
            get: vi.fn().mockResolvedValue({ data: [] }),
            post: vi.fn()
          }
        }
      }
    });
    
    expect(wrapper.vm.apiClient).toBeDefined();
  });
});
```

### 测试异步组件 (Async Components)

```typescript
import { mount, flushPromises } from '@vue/test-utils';
import AsyncDataList from '@/components/AsyncDataList.vue';

describe('AsyncDataList', () => {
  it('初始状态应该显示 loading', () => {
    const wrapper = mount(AsyncDataList);
    
    expect(wrapper.find('.loading').exists()).toBe(true);
    expect(wrapper.find('.data-list').exists()).toBe(false);
  });

  it('加载完成后应该显示数据', async () => {
    const mockData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];
    
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockData)
    });
    
    const wrapper = mount(AsyncDataList);
    
    await flushPromises();
    
    expect(wrapper.find('.loading').exists()).toBe(false);
    expect(wrapper.findAll('.data-item')).toHaveLength(2);
  });

  it('应该优雅地处理 API 错误', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
    
    const wrapper = mount(AsyncDataList);
    
    await flushPromises();
    
    expect(wrapper.find('.error').exists()).toBe(true);
    expect(wrapper.find('.error').text()).toContain('API Error');
  });
});
```

### 测试 Teleport 组件

```typescript
import { mount } from '@vue/test-utils';
import ModalDialog from '@/components/ModalDialog.vue';

describe('ModalDialog with Teleport', () => {
  beforeEach(() => {
    // 创建 teleport 目标
    const el = document.createElement('div');
    el.id = 'modal-target';
    document.body.appendChild(el);
  });

  afterEach(() => {
    // 清理
    document.body.innerHTML = '';
  });

  it('应该将内容传送 (teleport) 到目标元素', async () => {
    const wrapper = mount(ModalDialog, {
      props: {
        isOpen: true
      },
      attachTo: document.body
    });
    
    await wrapper.vm.$nextTick();
    
    const target = document.getElementById('modal-target');
    expect(target?.innerHTML).toContain('modal-content');
  });

  it('isOpen 为 false 时不应该渲染', async () => {
    const wrapper = mount(ModalDialog, {
      props: {
        isOpen: false
      }
    });
    
    await wrapper.vm.$nextTick();
    
    const target = document.getElementById('modal-target');
    expect(target?.innerHTML).toBe('');
  });
});
```

### 测试表单验证

```typescript
import { mount } from '@vue/test-utils';
import LoginForm from '@/components/LoginForm.vue';

describe('LoginForm - Validation', () => {
  it('空字段应该显示验证错误', async () => {
    const wrapper = mount(LoginForm);
    
    await wrapper.find('form').trigger('submit');
    
    expect(wrapper.find('.email-error').text()).toBe('Email is required');
    expect(wrapper.find('.password-error').text()).toBe('Password is required');
  });

  it('应该验证 email 格式', async () => {
    const wrapper = mount(LoginForm);
    
    await wrapper.find('input[type="email"]').setValue('invalid-email');
    await wrapper.find('form').trigger('submit');
    
    expect(wrapper.find('.email-error').text()).toContain('valid email');
  });

  it('输入有效时应该清除错误', async () => {
    const wrapper = mount(LoginForm);
    
    // 触发错误
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.email-error').exists()).toBe(true);
    
    // 修正输入
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    
    expect(wrapper.find('.email-error').exists()).toBe(false);
  });

  it('数据无效时应该阻止提交', async () => {
    const wrapper = mount(LoginForm);
    const submitHandler = vi.fn();
    
    wrapper.vm.$on('submit', submitHandler);
    
    await wrapper.find('input[type="email"]').setValue('invalid');
    await wrapper.find('form').trigger('submit');
    
    expect(submitHandler).not.toHaveBeenCalled();
  });
});
```

### 测试计算属性和侦听器 (Computed and Watchers)

```typescript
import { mount } from '@vue/test-utils';
import ShoppingCart from '@/components/ShoppingCart.vue';

describe('ShoppingCart - Computed and Watchers', () => {
  it('应该从项目计算总价', () => {
    const wrapper = mount(ShoppingCart, {
      props: {
        items: [
          { id: 1, name: 'Item 1', price: 100, quantity: 2 },
          { id: 2, name: 'Item 2', price: 50, quantity: 1 }
        ]
      }
    });
    
    expect(wrapper.vm.totalPrice).toBe(250);
    expect(wrapper.find('.total').text()).toContain('250');
  });

  it('props 改变时应该更新计算值', async () => {
    const wrapper = mount(ShoppingCart, {
      props: {
        items: [{ id: 1, price: 100, quantity: 1 }]
      }
    });
    
    expect(wrapper.vm.totalPrice).toBe(100);
    
    await wrapper.setProps({
      items: [
        { id: 1, price: 100, quantity: 1 },
        { id: 2, price: 50, quantity: 2 }
      ]
    });
    
    expect(wrapper.vm.totalPrice).toBe(200);
  });

  it('数量改变时应该触发侦听器', async () => {
    const wrapper = mount(ShoppingCart);
    const notifySpy = vi.spyOn(wrapper.vm, 'notifyChange');
    
    await wrapper.find('.quantity-input').setValue(5);
    
    expect(notifySpy).toHaveBeenCalled();
  });
});
```

## 测试全局插件

```typescript
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent with Global Plugins', () => {
  it('应该能与 vue-i18n 配合工作', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          hello: 'Hello World'
        }
      }
    });
    
    const wrapper = mount(MyComponent, {
      global: {
        plugins: [i18n]
      }
    });
    
    expect(wrapper.text()).toContain('Hello World');
  });

  it('应该能与 vue-router 配合工作', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } }
      ]
    });
    
    const wrapper = mount(MyComponent, {
      global: {
        plugins: [router]
      }
    });
    
    await router.push('/about');
    await wrapper.vm.$nextTick();
    
    expect(router.currentRoute.value.path).toBe('/about');
  });
});
```