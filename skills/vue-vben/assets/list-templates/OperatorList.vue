<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';
import { useRouter } from 'vue-router';
import { message, Button, Switch, Modal as AntModal, Space } from 'ant-design-vue';

import {
  getUserList,
  addUser,
  delUser,
  updateUser,
  resetUserPassword,
  updateStatus,
} from '#/api/sys/operator';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import ExtraModal from './modal.vue';

interface UserItem {
  userId: string;
  operatorName: string;
  operatorCode: string;
  aliasName: string;
  mobile: string;
  email: string;
  status: 'ON' | 'OFF';
  domainNum: number;
  createdTime: string;
  remark: string;
}

interface SearchFormValues {
  operatorName: string;
  status?: string;
}

const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'operatorName',
      label: '运营方名称',
      componentProps: {
        placeholder: '请输入运营方名称',
        allowClear: true,
      },
    },
    {
      component: 'Select',
      defaultValue: undefined,
      fieldName: 'status',
      label: '状态',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '启用', value: 'ON' },
          { label: '停用', value: 'OFF' },
        ],
        allowClear: true,
      },
    },
  ],
  showCollapseButton: false,
  submitOnChange: true,
  submitOnEnter: false,
};

const gridOptions = {
  stripe: true,
  seqConfig: { startIndex: 1 },
  checkboxConfig: { highlight: true, labelField: 'name' },
  columns: [
    { title: '序号', type: 'seq', width: 80, align: 'center' },
    { field: 'operatorName', slots: { default: 'operatorName' }, title: '运营方名称', minWidth: 150 },
    { field: 'domainNum', title: '激活区域数', width: 120, align: 'center' },
    { field: 'operatorCode', title: '超管账号', width: 150 },
    { field: 'aliasName', title: '联系人', width: 120 },
    { field: 'mobile', title: '联系手机', width: 140 },
    { field: 'email', title: '联系邮箱', width: 180 },
    { field: 'status', slots: { default: 'status' }, width: 100, title: '状态', align: 'center' },
    { field: 'createdTime', title: '创建时间', formatter: 'formatDateTime', width: 180, align: 'center' },
    { field: 'remark', title: '备注', width: 150 },
    { slots: { default: 'action' }, fixed: 'right', width: 280, title: '操作', align: 'center' },
  ],
  exportConfig: { fileName: '运营方列表', sheetName: '运营方数据' },
  height: 'auto',
  keepSource: true,
  pagerConfig: { pageSize: 10, pageSizes: [10, 20, 50, 100] },
  proxyConfig: {
    ajax: {
      query: async ({ page }: { page: { currentPage: number; pageSize: number } }, formValues: SearchFormValues) => {
        return await getUserList({
          pageIndex: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  toolbarConfig: { custom: true, export: true, refresh: true, resizable: true, search: false, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false,
  formOptions,
  gridOptions,
});

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ExtraModal,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      gridApi.query();
    }
  },
});

function openModal(row?: UserItem) {
  if (row) {
    modalApi.setData({ row });
    modalApi.setState({ title: '编辑运营方' });
  } else {
    modalApi.setData({});
    modalApi.setState({ title: '新增运营方' });
  }
  modalApi.open();
}

async function handleDelete(record: UserItem) {
  const modal = AntModal.confirm({
    title: '确定要删除此运营方吗?',
    content: '删除后无法恢复，请谨慎操作',
    centered: true,
    async onOk() {
      try {
        await delUser({ userId: record.userId });
        message.success('删除成功');
        modal.destroy();
        gridApi.query();
      } catch {
        message.error('删除失败');
      }
    },
    onCancel() {
      modal.destroy();
    },
  });
}

function handleResetPassword(record: UserItem) {
  let modal: AntModal | null = null;
  modal = AntModal.confirm({
    title: '确定要对此账号重置密码吗?',
    content: '重置后，将发送临时密码至账号关联的邮箱',
    centered: true,
    async onOk() {
      try {
        const { msg } = await resetUserPassword({ userId: record.userId });
        message.success(msg);
        modal?.destroy();
      } catch {
        message.error('重置密码失败');
      }
    },
    onCancel() {
      modal?.destroy();
    },
  });
}

function handleToggleStatus(record: UserItem) {
  let modal: AntModal | null = null;
  const isEnable = record.status === 'OFF';
  modal = AntModal.confirm({
    title: isEnable ? '确定要启用此账户吗?' : '确定要停用此账户吗?',
    content: isEnable ? undefined : '该账号将无法登录平台',
    centered: true,
    async onOk() {
      try {
        const { msg } = await updateStatus({ operatorCode: record.operatorCode, control: isEnable ? 'ON' : 'OFF' });
        message.success(msg);
        modal?.destroy();
        gridApi.query();
      } catch {
        message.error('状态切换失败');
      }
    },
    onCancel() {
      modal?.destroy();
    },
  });
}

function handleAction(record: UserItem, key: string) {
  switch (key) {
    case 'reset':
      handleResetPassword(record);
      break;
    case 'stoporstart':
      handleToggleStatus(record);
      break;
    case 'delete':
      handleDelete(record);
      break;
  }
}

const router = useRouter();
function openDetail(operatorId: string) {
  router.push({ name: 'OperatorDetail', query: { operatorId } });
}

defineExpose({ gridApi, modalApi, openModal, openDetail });
</script>

<template>
  <Page auto-content-height title="运营方管理" class="operator-list-page">
    <template #extra>
      <Button type="primary" ghost @click="openModal()" class="flex items-center gap-2">
        <template #icon><span class="icon-[mdi--add]"></span></template>
        新增
      </Button>
    </template>
    <Grid>
      <template #operatorName="{ row }">
        <Button type="link" @click="openDetail(row.operatorId)">{{ row.operatorName }}</Button>
      </template>
      <template #status="{ row }">
        <Switch :checked="row.status === 'ON'" />
      </template>
      <template #action="{ row }">
        <Space>
          <Button type="link" size="small" @click="openModal(row)">编辑</Button>
          <Button v-if="row.status === 'ON'" type="link" size="small" @click="handleAction(row, 'reset')">重置密码</Button>
          <Button v-if="row.status === 'ON'" type="link" size="small" danger @click="handleAction(row, 'stoporstart')">停用</Button>
          <Button v-if="row.status === 'OFF'" type="link" size="small" @click="handleAction(row, 'stoporstart')">启用</Button>
          <Button type="link" size="small" danger @click="handleAction(row, 'delete')">删除</Button>
        </Space>
      </template>
    </Grid>
    <Modal />
  </Page>
</template>

<style lang="scss" scoped>
.operator-list-page {
  :deep(.vben-page-body) {
    padding: 16px;
  }
}
</style>
