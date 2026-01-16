# 列表模板示例

本目录包含 Vben Admin 列表页面的完整示例代码，演示了：

- 搜索表单配置
- 表格配置（vxe-table）
- CRUD 操作
- 模态框集成
- 状态切换
- 路由跳转

## 文件说明

| 文件 | 说明 |
|------|------|
| `OperatorList.vue` | 列表主页面组件 |
| `modal.vue` | 新增/编辑模态框组件 |
| `api.ts` | API 接口定义 |

## 使用方法

1. **复制模板**
   
   复制 `OperatorList.vue` 到 `src/views/operator/` 目录
   
   复制 `modal.vue` 到 `src/views/operator/components/` 目录
   
   复制 `api.ts` 到 `src/api/` 目录

2. **修改配置**
   
   根据实际业务需求修改：
   - 表单字段配置 (`formOptions.schema`)
   - 表格列配置 (`gridOptions.columns`)
   - API 接口地址 (`api.ts`)
   - 类型定义

3. **添加路由**
   
   在 `router/routes/modules/` 目录下添加路由配置：

   ```typescript
   {
     path: '/operator',
     name: 'Operator',
     component: () => import('@/layouts/default.vue'),
     meta: {
       title: '运营方管理',
       icon: 'mdi:account-group',
     },
     children: [
       {
         path: 'list',
         name: 'OperatorList',
         component: () => import('@/views/operator/OperatorList.vue'),
         meta: {
           title: '运营方列表',
         },
       },
       {
         path: 'detail/:operatorId',
         name: 'OperatorDetail',
         component: () => import('@/views/operator/Detail.vue'),
         meta: {
           title: '运营方详情',
           hideMenu: true,
         },
       },
     ],
   }
   ```

## 核心功能

### 搜索表单

```typescript
const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'operatorName',
      label: '运营方名称',
    },
  ],
  submitOnChange: true,
  submitOnEnter: false,
};
```

### 表格配置

```typescript
const gridOptions = {
  columns: [
    { title: '序号', type: 'seq', width: 80 },
    { field: 'operatorName', title: '运营方名称', minWidth: 150 },
    { field: 'status', slots: { default: 'status' }, title: '状态', width: 100 },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getUserList({
          pageIndex: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};
```

### 模态框集成

```typescript
const [Modal, modalApi] = useVbenModal({
  connectedComponent: ExtraModal,
  onOpenChange(isOpen) {
    if (!isOpen) {
      gridApi.query();
    }
  },
});

function openModal(row) {
  modalApi.setData({ row });
  modalApi.setState({ title: '编辑运营方' });
  modalApi.open();
}
```

### 操作处理

```typescript
function handleAction(record, key) {
  switch (key) {
    case 'reset':
      // 重置密码
      break;
    case 'stoporstart':
      // 启用/停用
      break;
    case 'delete':
      // 删除
      break;
  }
}
```
