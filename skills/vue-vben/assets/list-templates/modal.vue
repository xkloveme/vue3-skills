<script setup lang="ts">
import { ref, watch } from 'vue';
import { useVbenForm } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { addUser, updateUser } from '#/api/sys/operator';

interface Props {
  title?: string;
  open?: boolean;
  type?: 'add' | 'edit';
  row?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  title: '新增运营方',
  open: false,
  type: 'add',
  row: () => ({}),
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  'success': [];
}>();

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  buttonOptions: { confirmText: '确定', cancelText: '取消' },
  showResetButton: false,
  showSubmitButton: true,
  schema: [
    {
      field: 'operatorName',
      label: '运营方名称',
      component: 'Input',
      rules: [
        { required: true, message: '请输入运营方名称' },
        { min: 2, max: 50, message: '名称长度为2-50个字符' },
      ],
      componentProps: {
        placeholder: '请输入运营方名称',
        maxLength: 50,
        allowClear: true,
      },
    },
    {
      field: 'operatorCode',
      label: '运营方编码',
      component: 'Input',
      rules: [
        { required: true, message: '请输入运营方编码' },
        { pattern: /^[A-Z][A-Z0-9_]*$/, message: '编码必须以大写字母开头，只能包含大写字母、数字和下划线' },
      ],
      componentProps: {
        placeholder: '请输入运营方编码',
        maxLength: 20,
        allowClear: true,
        disabled: props.type === 'edit',
      },
    },
    {
      field: 'aliasName',
      label: '联系人',
      component: 'Input',
      rules: [{ required: true, message: '请输入联系人姓名' }],
      componentProps: { placeholder: '请输入联系人姓名', maxLength: 20, allowClear: true },
    },
    {
      field: 'mobile',
      label: '联系手机',
      component: 'Input',
      rules: [
        { required: true, message: '请输入联系手机' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
      ],
      componentProps: { placeholder: '请输入联系手机', maxLength: 11, allowClear: true },
    },
    {
      field: 'email',
      label: '联系邮箱',
      component: 'Input',
      rules: [
        { required: true, message: '请输入联系邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
      componentProps: { placeholder: '请输入联系邮箱', maxLength: 50, allowClear: true },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'Textarea',
      rules: [{ max: 200, message: '备注不能超过200个字符' }],
      componentProps: { placeholder: '请输入备注信息', maxLength: 200, rows: 3, showCount: true, allowClear: true },
    },
  ],
  async onSubmit(values: any) {
    try {
      if (props.type === 'edit') {
        await updateUser({ ...values, userId: props.row.userId });
        message.success('编辑成功');
      } else {
        await addUser(values);
        message.success('新增成功');
      }
      handleClose();
      emit('success');
    } catch {
      message.error('操作失败，请稍后重试');
    }
  },
});

const loading = ref(false);

watch(() => props.row, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    formApi.setFieldsValue(newVal);
  }
}, { immediate: true, deep: true });

watch(() => props.open, (isOpen) => {
  if (isOpen && props.type === 'add') {
    formApi.resetForm();
  }
});

function handleClose() {
  emit('update:open', false);
}

function handleCancel() {
  handleClose();
}

defineExpose({
  formApi,
  setLoading: (value: boolean) => { loading.value = value; },
});
</script>

<template>
  <AntModal
    :title="title"
    :open="open"
    :confirm-loading="loading"
    :mask-closable="false"
    :destroy-on-close="true"
    width="600px"
    @cancel="handleCancel"
    @ok="formApi.submit"
  >
    <Form />
  </AntModal>
</template>
