# 详情页面模板

本目录包含 Vben Admin 的详情页面模板示例。

## 📁 目录结构

```
detail-templates/
├── README.md              # 使用说明
└── OperatorDetail.vue     # 运营方详情页面
```

## 📄 模板说明

### OperatorDetail.vue

运营方详情页面模板，包含：

**特性：**
- ✅ 页面描述区域（标题、状态、返回按钮）
- ✅ 基本信息展示（Descriptions 组件）
- ✅ 关联列表（Grid 组件）
- ✅ 状态切换操作
- ✅ 路由参数获取
- ✅ Tab 管理集成

## 🚀 快速使用

### 1. 复制文件

```bash
cp assets/detail-templates/OperatorDetail.vue src/views/operator/detail.vue
```

### 2. 添加路由typescript
{
 

``` path: 'detail/:operatorId',
  name: 'OperatorDetail',
  component: () => import('@/views/operator/detail.vue'),
  meta: {
    title: '运营方详情',
    hideMenu: true,
  },
}
```

### 3. 从列表页跳转

```typescript
const router = useRouter();
function openDetail(operatorId: string) {
  router.push({
    name: 'OperatorDetail',
    query: { operatorId },
  });
}
```

## 📝 模板结构

### 页面布局

```vue
<template>
  <Page title="运营方详情">
    <!-- 描述区域 -->
    <template #description>
      <div class="flex items-center">
        <AButton @click="back()">返回</AButton>
        <span class="mx-2">|</span>
        <span>{{ dataDetail.name }}</span>
        <ABadge :status="dataDetail.status" />
      </div>
    </template>

    <!-- 额外操作 -->
    <template #extra>
      <AButton @click="handleAction()">操作</AButton>
    </template>

    <!-- 基本信息 -->
    <div class="bg-white p-6 rounded-lg">
      <ADescriptions :column="3">
        <ADescriptionsItem label="字段1">{{ value1 }}</ADescriptionsItem>
        <ADescriptionsItem label="字段2">{{ value2 }}</ADescriptionsItem>
        <ADescriptionsItem label="字段3">{{ value3 }}</ADescriptionsItem>
      </ADescriptions>
    </div>

    <!-- 关联列表 -->
    <div class="bg-white p-6 rounded-lg mt-4">
      <Grid />
    </div>
  </Page>
</template>
```

### 核心功能

| 功能 | 说明 |
|------|------|
| 返回导航 | 使用 `useTabs().closeCurrentTab()` 关闭当前 Tab |
| 状态展示 | 使用 `ABadge` 组件展示状态 |
| 基本信息 | 使用 `ADescriptions` 组件展示详情 |
| 关联列表 | 使用 `useVbenVxeGrid` 展示关联数据 |
| 操作按钮 | 在 `#extra` 插槽中放置操作按钮 |

## 🔧 自定义配置

### Descriptions 配置

```typescript
const descriptionsConfig = {
  // 列数
  column: 3,
  // 是否显示边框
  bordered: true,
  // 表格布局
  layout: 'vertical' | 'horizontal',
};

// 字段配置
const fields = [
  { label: '字段名', value: 'fieldKey', span: 1 },
  { label: '长字段', value: 'longField', span: 2 },
];
```

### 表格配置

```typescript
const gridOptions = {
  columns: [
    { field: 'name', title: '名称', width: 150 },
    { field: 'status', slots: { default: 'status' }, title: '状态', width: 100 },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getList({
          pageIndex: page.currentPage,
          pageSize: page.pageSize,
          parentId: route.query.id,
          ...formValues,
        });
      },
    },
  },
};
```

### 状态切换

```typescript
function handleAction(record: DetailItem) {
  const modal = AntModal.confirm({
    title: record.status === 'ON' ? '确定要停用吗?' : '确定要启用吗?',
    async onOk() {
      await updateStatus({ id: record.id, status: newStatus });
      message.success('操作成功');
      gridApi.query();
    },
  });
}
```

## 📋 最佳实践

1. **数据加载**
   - 在 `onMounted` 中调用 `fetchDetail()`
   - 或在 Grid 的 `proxyConfig` 中更新详情数据

2. **状态管理**
   - 使用 `ref` 存储详情数据
   - 保持数据响应性

3. **错误处理**
   - 使用 `try-catch` 处理异步操作
   - 显示友好的错误提示

4. **页面导航**
   - 使用 `useTabs` 管理 Tab 生命周期
   - 返回时关闭当前 Tab
