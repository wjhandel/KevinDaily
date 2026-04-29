/**
 * PocketBase API 辅助模块
 * 集中管理认证头和 API 调用
 */

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('pb_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: token } : {}),
  };
}

export async function apiGet(url: string): Promise<any> {
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `API error: ${res.status}` }));
    throw new Error(err.message || `API error: ${res.status}`);
  }
  return res.json();
}

export async function apiPost(url: string, body: any): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `API error: ${res.status}` }));
    throw new Error(err.message || `API error: ${res.status}`);
  }
  return res.json();
}

export async function apiPatch(url: string, body: any): Promise<any> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `API error: ${res.status}` }));
    throw new Error(err.message || `API error: ${res.status}`);
  }
  return res.json();
}

export async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
}

/** 从 PocketBase list API 响应中提取 items 数组 */
export function extractItems(data: any): any[] {
  return data?.items || data || [];
}

/** 上传文件到 PocketBase
 * @param collectionIdOrName 集合 ID 或名称
 * @param recordId 记录 ID（如果是更新已有记录）
 * @param fieldName 字段名
 * @param file 文件对象
 * @param recordData 可选的额外字段数据
 */
export async function apiUpload(
  collectionIdOrName: string,
  fieldName: string,
  file: File,
  recordId?: string,
  recordData?: Record<string, any>
): Promise<any> {
  const token = localStorage.getItem('pb_token');

  const formData = new FormData();
  formData.append(fieldName, file);

  if (recordData) {
    Object.entries(recordData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
  }

  const url = recordId
    ? `/api/collections/${collectionIdOrName}/records/${recordId}`
    : `/api/collections/${collectionIdOrName}/records`;

  const res = await fetch(url, {
    method: 'POST', // PocketBase uses POST for both create and update with files
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `Upload error: ${res.status}` }));
    throw new Error(err.message || `Upload error: ${res.status}`);
  }

  return res.json();
}

/** 登出：清除本地存储 */
export function clearAuth() {
  localStorage.removeItem('pb_token');
  localStorage.removeItem('pb_user_id');
}

/** 检查是否有有效 token */
export function hasToken(): boolean {
  return !!localStorage.getItem('pb_token');
}
