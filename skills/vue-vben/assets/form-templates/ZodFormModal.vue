<script setup lang="ts">
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { message } from 'ant-design-vue';
import { z } from '#/adapter/form';
import { addUser, updateUser } from '#/api/sys/operator';

// 获取行数据
let row = ref<Record<string, any> | undefined>();

// 验证规则
const rules = {
  operatorCode: z
    .string()
    .min(4, { message: '超管账号至少4个字符' })
    .max(64, { message: '超管账号最多64个字符' })
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
      message: '支持英文、数字、下划线，字母开头',
    }),
  mobile: z
    .string()
    .min(1, { message: '请输入手机号' })
    .regex(/^1\d{10}$/, { message: '请输入有效的手机号' }),
  email: z.string().email('请输入正确的邮箱'),
};

// 创建模态框
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  footer: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      row.value = modalApi.getData()?.row;
      baseFormApi.setValues(row.value);
    }
  },
});

// 创建表单
const [BaseForm, baseFormApi] = useVbenForm({
  layout: 'horizontal',
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        allowClear: true,
      },
      fieldName: 'operatorName',
      label: '运营方名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '支持英文、数字、下划线，4～64个字符，字母开头',
        allowClear: true,
      },
      fieldName: 'operatorCode',
      label: '超管账号',
      rules: rules.operatorCode,
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        allowClear: true,
      },
      fieldName: 'aliasName',
      label: '联系人',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号',
        allowClear: true,
      },
      fieldName: 'mobile',
      label: '联系手机',
      rules: rules.mobile,
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
        allowClear: true,
      },
      fieldName: 'email',
      label: '联系邮箱',
      rules: rules.email,
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入',
        autoSize: { minRows: 4, maxRows: 10 },
        showCount: true,
        maxLength: 500,
      },
      fieldName: 'remark',
      label: '备注',
    },
  ],
});

// 提交处理
async function onSubmit(values: Record<string, any>) {
  try {
    if (row.value?.operatorId) {
      await updateUser({ ...values, operatorId: row.value.operatorId });
      message.success('信息更新成功');
    } else {
      await addUser(values);
      message.success('添加成功');
    }
    modalApi.close();
  } catch {
    message.error('操作失败，请稍后重试');
  }
}

// 暴露方法
defineExpose({
  modalApi,
  setData: (data: { row?: Record<string, any> }) => {
    modalApi.setData(data);
  },
  open: () => modalApi.open(),
});
</script>

<template>
  <Modal>
    <BaseForm />
  </Modal>
</template>
