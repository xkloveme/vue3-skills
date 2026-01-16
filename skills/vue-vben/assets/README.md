# Vben Admin 资源模板

本目录包含 Vben Admin 开发的资源模板和示例代码。

## 📁 目录结构

```
assets/
├── list-templates/         # 列表页面模板
│   ├── README.md           # 使用说明
│   ├── OperatorList.vue    # 列表主页面
│   ├── modal.vue           # 模态框组件
│   └── api.ts              # API 接口定义
├── form-templates/         # 表单模板
│   ├── README.md           # 使用说明
│   └── ZodFormModal.vue    # Zod 验证表单模态框
└── detail-templates/       # 详情页面模板
    ├── README.md           # 使用说明
    └── OperatorDetail.vue  # 详情页面组件
```

## 🚀 快速使用

### 列表页面模板

1. **复制文件**
   
   ```bash
   # 复制列表页面
   cp assets/list-templates/OperatorList.vue src/views/your-module/
   
   # 复制模态框
   cp assets/list-templates/modal.vue src/views/your-module/components/
   
   # 复制 API
   cp assets/list-templates/api.ts src/api/your-module/
   ```

2. **修改配置**
   
   根据业务需求修改：
   - 表格列配置
   - 表单字段
   - API 接口地址

3. **添加路由**
   
   在路由配置中添加对应路径

## 📄 列表模板说明

### 文件列表

| 文件 | 说明 | 用途 |
|------|------|------|
| `OperatorList.vue` | 列表主页面 | 包含搜索表单、表格、操作按钮 |
| `modal.vue` | 模态框组件 | 新增/编辑表单 |
| `api.ts` | API 接口定义 | 类型声明和接口函数 |
| `README.md` | 使用说明 | 模板使用文档 |

### 功能特性

- ✅ 搜索表单（支持多个搜索字段）
- ✅ 分页表格（支持排序、复选）
- ✅ CRUD 操作（新增、编辑、删除）
- ✅ 状态切换（启用/停用）
- ✅ 模态框集成
- ✅ 路由跳转
- ✅ TypeScript 类型支持

### 使用示例

```typescript
// 1. 导入组件
import { useVbenVxeGrid } from '#/adapter/vxe-table'
import { useVbenModal } from '@vben/common-ui'

// 2. 创建表格
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      { fieldName: 'name', label: '名称', component: 'Input' },
    ],
  },
  gridOptions: {
    columns: [
      { field: 'name', title: '名称' },
      { field: 'status', title: '状态' },
      { slots: { default: 'action' }, title: '操作' },
    ],
  },
})

// 3. 创建模态框
const [Modal, modalApi] = useVbenModal({
  connectedComponent: YourModalComponent,
})

// 4. 定义操作
function openModal(row?) {
  modalApi.setData({ row })
  modalApi.open()
}
```

## 📝 自定义配置

### 表格列配置

```typescript
const gridOptions = {
  columns: [
    { title: '名称', field: 'name', minWidth: 150 },
    { title: '状态', field: 'status', width: 100 },
    { 
      slots: { default: 'custom' }, 
      title: '自定义列',
      width: 200 
    },
  ],
}
```

### 表单字段配置

```typescript
const formOptions = {
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      rules: [{ required: true, message: '请输入名称' }],
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        options: [
          { label: '启用', value: 'ON' },
          { label: '停用', value: 'OFF' },
        ],
      },
    },
  ],
}
```

## 🔧 最佳实践

1. **文件命名**
   - 使用 PascalCase 命名组件文件
   - 使用 kebab-case 命名目录

2. **代码组织**
   - 将相关文件放在同一目录
   - 使用 index.ts 导出模块

3. **类型定义**
   - 使用 TypeScript 定义类型
   - 导出公共类型供其他地方使用

4. **错误处理**
   - 使用 try-catch 处理异步操作
   - 显示友好的错误提示

5. **性能优化**
   - 使用虚拟滚动处理大数据
   - 合理使用 computed 和 watch

### 表单模板

1. **复制文件**

   ```bash
   # 复制表单模态框
   cp assets/form-templates/ZodFormModal.vue src/views/your-module/components/
   ```

2. **使用模态框**

   ```typescript
   import { useVbenModal } from '@vben/common-ui'
   import ZodFormModal from './components/ZodFormModal.vue'

   const [Modal, modalApi] = useVbenModal({
     connectedComponent: ZodFormModal,
   })

   function openModal(row?: Record<string, any>) {
     modalApi.setData({ row })
     modalApi.open()
   }
   ```

3. **Zod 验证配置**

   ```typescript
   import { z } from '#/adapter/form'

   const rules = {
     username: z
       .string()
       .min(4, { message: '用户名至少4个字符' })
       .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
         message: '支持英文、数字、下划线，字母开头',
       }),
     mobile: z
       .string()
       .regex(/^1\d{10}$/, { message: '请输入有效的手机号' }),
     email: z.string().email('请输入正确的邮箱'),
   }
   ```

### 功能特性

| 模板 | 特性 |
|------|------|
| list-templates | 搜索表单、表格 CRUD、状态切换 |
| form-templates | Zod 验证、动态数据、模态框集成 |
| detail-templates | 详情展示、关联列表、状态操作 |

### 详情页面模板

1. **复制文件**

   ```bash
   # 复制详情页面
   cp assets/detail-templates/OperatorDetail.vue src/views/your-module/detail.vue
   ```

2. **添加路由**

   ```typescript
   {
     path: 'detail/:id',
     name: 'ModuleDetail',
     component: () => import('@/views/your-module/detail.vue'),
     meta: {
       title: '详情页面',
       hideMenu: true,
     },
   }
   ```

3. **从列表页跳转**

   ```typescript
   const router = useRouter();
   function openDetail(id: string) {
     router.push({ name: 'ModuleDetail', query: { id } });
   }
   ```

4. **核心功能**

   - 页面描述区域（标题、状态、返回按钮）
   - 基本信息展示（Descriptions 组件）
   - 关联列表（Grid 组件）
   - 状态切换操作
   - Tab 管理集成

5. **模板结构**

   | 文件 | 说明 |
   |------|------|
   | `OperatorDetail.vue` | 详情页面主组件 |
   | `README.md` | 使用说明 |

### 最佳实践总结

1. **文件命名**
   - 使用 PascalCase 命名组件文件
   - 使用 kebab-case 命名目录

2. **代码组织**
   - 将相关文件放在同一目录
   - 使用 index.ts 导出模块

3. **类型定义**
   - 使用 TypeScript 定义类型
   - 导出公共类型供其他地方使用

4. **错误处理**
   - 使用 try-catch 处理异步操作
   - 显示友好的错误提示

5. **性能优化**
   - 使用虚拟滚动处理大数据
   - 合理使用 computed 和 watch
