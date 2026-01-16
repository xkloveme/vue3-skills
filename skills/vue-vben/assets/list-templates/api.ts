import { request } from '@vben/axios';
import type { BasicPageResponse } from '@vben/axios';
export interface OperatorInfo {
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

export interface OperatorQueryParams {
  pageIndex: number;
  pageSize: number;
  operatorName?: string;
  operatorCode?: string;
  status?: string;
}

export interface OperatorFormData {
  operatorName: string;
  operatorCode: string;
  aliasName: string;
  mobile: string;
  email: string;
  remark?: string;
}

export interface OperatorPageResponse extends BasicPageResponse {
  list: OperatorInfo[];
}
export function getUserList(params: OperatorQueryParams) {
  return request.get<OperatorPageResponse>('/api/operator/list', { params });
}

export function getUserDetail(userId: string) {
  return request.get<OperatorInfo>(`/api/operator/detail/${userId}`);
}

export function addUser(data: OperatorFormData) {
  return request.post('/api/operator/add', data);
}

export function updateUser(data: OperatorFormData & { userId: string }) {
  return request.put('/api/operator/update', data);
}

export function delUser(params: { userId: string }) {
  return request.delete('/api/operator/delete', { params });
}

export function resetUserPassword(params: { userId: string }) {
  return request.post('/api/operator/reset-password', params);
}

export function updateStatus(params: { operatorCode: string; control: 'ON' | 'OFF' }) {
  return request.put('/api/operator/update-status', params);
}

export function exportUserList(params: OperatorQueryParams) {
  return request.get('/api/operator/export', { params, responseType: 'blob' });
}
