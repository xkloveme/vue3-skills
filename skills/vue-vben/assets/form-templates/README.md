# 表单模板

本目录包含 Vben Admin 的表单模板示例。

## 📁 目录结构

```
form-templates/
├── README.md            # 使用说明
├── ZodFormModal.vue     # Zod 验证表单模态框
```

## 📄 模板说明

### ZodFormModal.vue

使用 zod 进行表单验证的模态框模板。

**特性：**
- ✅ Zod 模式验证
- ✅ 动态获取行数据
- ✅ 支持新增/编辑
- ✅ 可拖拽模态框
- ✅ 隐藏底部按钮（自定义提交）

**使用方式：**

```typescript
import { useVbenModal } from '@vben/common-ui';
import ZodFormModal from './ZodFormModal.vue';

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ZodFormModal,
});

function openModal(row?: Record<string, any>) {
  modalApi.setData({ row });
  modalApi.open();
}
```

**Zod 验证示例：**

```typescript
import { z } from '#/adapter/form';

const rules = {
  username: z
    .string()
    .min(4, { message: '用户名至少4个字符' })
    .max(64, { message: '用户名最多64个字符' })
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
      message: '支持英文、数字、下划线，字母开头',
    }),
  mobile: z
    .string()
    .regex(/^1\d{10}$/, { message: '请输入有效的手机号' }),
  email: z.string().email('请输入正确的邮箱'),
};
```

**字段配置：**

```typescript
const schema = [
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入',
      allowClear: true,
    },
    fieldName: 'fieldName',
    label: '字段标签',
    rules: 'required', // 简单验证
  },
  {
    component: 'Input',
    componentProps: { placeholder: '请输入' },
    fieldName: 'username',
    label: '用户名',
    rules: rules.username, // Zod 验证
  },
];
```

## 🔧 自定义配置

### 布局方式

```typescript
// 水平布局
const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
});

// 垂直布局
const [Form, formApi] = useVbenForm({
  layout: 'vertical',
});

// 栅格布局
const [Form, formApi] = useVbenForm({
  layout: 'grid',
});
```

### 组件类型

| 组件 | 说明 |
|------|------|
| `Input` | 输入框 |
| `InputPassword` | 密码输入框 |
| `Textarea` | 文本域 |
| `Select` | 下拉选择 |
| `Radio` | 单选框 |
| `Checkbox` | 复选框 |
| `DatePicker` | 日期选择 |
| `Switch` | 开关 |
| `Upload` | 上传组件 |

### 验证规则

```typescript
// 简单验证
rules: 'required'

// Zod 验证
rules: z.string().min(4).max(64)

// 多规则组合
rules: [
  { required: true, message: '必填' },
  { min: 4, message: '至少4个字符' },
]
```

## 📝 最佳实践

1. **表单验证**：使用 zod 进行复杂验证
2. **布局选择**：根据场景选择 horizontal/vertical/grid
3. **占位符**：提供清晰的占位符提示
4. **必填标识**：使用 rules: 'required' 显示必填星号
5. **数据回显**：使用 setValues 方法回显数据
