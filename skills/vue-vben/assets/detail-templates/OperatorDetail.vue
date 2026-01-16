<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button as AButton,
  Badge as ABadge,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Modal as AntModal,
  message,
} from 'ant-design-vue';
import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getQueryUsers, updateStatus } from '#/api/sys/operator';

interface DetailItem {
  operatorId: number;
  userName: string;
  operatorName: string;
  operatorCode: string;
  aliasName: string;
  mobile: string;
  email: string;
  status: 'ON' | 'OFF';
  createdTime: string;
  remark: string;
}

// 路由和导航
const route = useRoute();
const router = useRouter();
const { closeCurrentTab } = useTabs();

// 详情数据
const dataDetail = ref<DetailItem>({} as DetailItem);
const loading = ref(false);

// 返回上一页
function back() {
  closeCurrentTab();
  router.back();
}

// 获取详情数据
async function fetchDetail() {
  loading.value = true;
  try {
    const res = await getQueryUsers({
      pageIndex: 1,
      pageSize: 100,
      operatorId: route.query.operatorId,
    });

    const targetId = Number(route.query.operatorId);
    dataDetail.value =
      res.items.find((item: DetailItem) => item.operatorId === targetId) ||
      ({} as DetailItem);
  } catch (error) {
    console.error('获取详情失败:', error);
    message.error('获取详情失败');
  } finally {
    loading.value = false;
  }
}

// 搜索表单配置
const formOptions = {
  collapsed: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'keyword',
      label: '关键字搜索',
      componentProps: {
        placeholder: '请输入账号/姓名',
        allowClear: true,
      },
    },
  ],
  showCollapseButton: false,
  submitOnChange: true,
  submitOnEnter: true,
};

// 表格配置
const gridOptions = {
  stripe: true,
  seqConfig: { startIndex: 1 },
  checkboxConfig: { highlight: true, labelField: 'name' },
  columns: [
    { field: 'userName', title: '账号', width: 120 },
    { field: 'aliasName', title: '姓名', width: 120 },
    { field: 'mobile', title: '联系手机', width: 140 },
    { field: 'email', title: '联系邮箱', width: 180 },
    {
      field: 'status',
      slots: { default: 'status' },
      width: 100,
      title: '状态',
      align: 'center',
    },
    {
      field: 'createdTime',
      title: '创建时间',
      formatter: 'formatDateTime',
      width: 180,
      align: 'center',
    },
    { field: 'remark', title: '备注', width: 150 },
  ],
  keepSource: true,
  pagerConfig: { pageSize: 10 },
  proxyConfig: {
    ajax: {
      query: async (
        { page }: { page: { currentPage: number; pageSize: number } },
        formValues: { keyword?: string },
      ) => {
        const res = await getQueryUsers({
          pageIndex: page.currentPage,
          pageSize: page.pageSize,
          operatorId: route.query.operatorId,
          ...formValues,
        });

        // 更新详情数据
        const targetId = Number(route.query.operatorId);
        const targetItem = res.items.find(
          (item: DetailItem) => item.operatorId === targetId,
        );
        if (targetItem) {
          dataDetail.value = targetItem;
        }

        return res;
      },
    },
  },
  toolbarConfig: {
    custom: false,
    export: false,
    refresh: false,
    resizable: false,
    search: false,
    zoom: false,
  },
};

// 创建表格
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  formOptions,
});

// 状态切换操作
function handleAction(record: DetailItem) {
  let modal: AntModal | null = null;
  const isEnable = record.status === 'OFF';

  modal = AntModal.confirm({
    title: isEnable ? '确定要启用此账户吗?' : '确定要停用此账户吗?',
    content: isEnable ? undefined : '该账号将无法登录平台',
    centered: true,
    async onOk() {
      try {
        const { msg } = await updateStatus({
          operatorCode: record.operatorCode,
          control: isEnable ? 'ON' : 'OFF',
        });
        message.success(msg);
        modal?.destroy();
        gridApi.query();
      } catch {
        message.error('操作失败');
      }
    },
    onCancel() {
      modal?.destroy();
    },
  });
}

// 暴露方法
defineExpose({
  fetchDetail,
  refresh: () => gridApi.query(),
});
</script>

<template>
  <Page :loading="loading" title="运营方详情">
    <!-- 页面描述区域 -->
    <template #description>
      <div class="flex items-center justify-start">
        <AButton type="text" @click="back()">
          <template #icon>
            <span class="icon-[tabler--arrow-back-up] text-xl" />
          </template>
        </AButton>
        <span class="mx-2 text-gray-300">|</span>
        <span class="icon-[fluent-color--building-32] text-xl" />
        <span class="mx-2 text-lg font-medium">
          {{ dataDetail.operatorName || '-' }} 的运营方
        </span>
        <ABadge
          :status="dataDetail.status === 'ON' ? 'success' : 'warning'"
          :text="dataDetail.status === 'ON' ? '启用' : '停用'"
          class="ml-2"
        />
      </div>
    </template>

    <!-- 页面额外操作 -->
    <template #extra>
      <div>
        <AButton
          v-if="dataDetail.status === 'ON'"
          danger
          @click="handleAction(dataDetail)"
        >
          停用
        </AButton>
        <AButton
          v-if="dataDetail.status === 'OFF'"
          type="primary"
          @click="handleAction(dataDetail)"
        >
          启用
        </AButton>
      </div>
    </template>

    <!-- 基本信息卡片 -->
    <div class="bg-white rounded-lg p-6 shadow-sm mb-4">
      <div class="mb-4 pb-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">基本信息</h3>
      </div>
      <ADescriptions :column="3" bordered>
        <ADescriptionsItem label="运营方ID">
          {{ dataDetail.operatorId || '-' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="运营方名称">
          {{ dataDetail.operatorName || '-' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="超管账号">
          {{ dataDetail.userName || '-' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="状态">
          <ABadge
            :status="dataDetail.status === 'ON' ? 'success' : 'warning'"
            :text="dataDetail.status === 'ON' ? '启用' : '停用'"
          />
        </ADescriptionsItem>
        <ADescriptionsItem label="联系人">
          {{ dataDetail.aliasName || '-' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="联系手机">
          {{ dataDetail.mobile || '-' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="联系邮箱">
          {{ dataDetail.email || '-' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="创建时间">
          {{ dataDetail.createdTime || '-' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="备注">
          <div class="max-h-20 overflow-auto">
            {{ dataDetail.remark || '-' }}
          </div>
        </ADescriptionsItem>
      </ADescriptions>
    </div>

    <!-- 关联列表 -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div class="mb-4 pb-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">关联账号列表</h3>
      </div>
      <Grid>
        <template #status="{ row }">
          <ABadge
            :status="row.status === 'ON' ? 'success' : 'warning'"
            :text="row.status === 'ON' ? '启用' : '停用'"
          />
        </template>
      </Grid>
    </div>
  </Page>
</template>
