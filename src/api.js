// ─── 统一 API 层 ─────────────────────────────────────────
// 所有后端请求都通过这个模块，方便将来切换 base URL（桌面端 → 线上）

const BASE_URL = import.meta.env.VITE_API_BASE || '';

let _token = null;
let _onUnauthorized = null;

export function setToken(token) { _token = token; }
export function setOnUnauthorized(fn) { _onUnauthorized = fn; }

// 底层请求：自动带 Authorization，401 自动回调
async function request(path, opts = {}) {
  const headers = { ...opts.headers };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  if (res.status === 401) _onUnauthorized?.();
  return res;
}

function jsonPost(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function jsonPut(path, body) {
  return request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function jsonPatch(path, body) {
  return request(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ─── Auth ────────────────────────────────────────────────

export const auth = {
  login: (username, password) =>
    jsonPost('/api/auth/login', { username, password }),
  me: () => request('/api/auth/me'),
};

// ─── API Key ─────────────────────────────────────────────

export const apiKey = {
  get: () => request('/api/apikey'),
  set: (key) => jsonPut('/api/apikey', { apiKey: key }),
  clear: () => jsonPut('/api/apikey', { apiKey: '' }),
};

// ─── Images CRUD ─────────────────────────────────────────

export const images = {
  list: () => request('/api/images'),
  save: (records) => jsonPost('/api/images', { records }),
  update: (id, data) => jsonPatch(`/api/images/${id}`, data),
  remove: (id) => request(`/api/images/${id}`, { method: 'DELETE' }),
};

// ─── Upload ──────────────────────────────────────────────

export const upload = (formData) =>
  request('/api/upload', { method: 'POST', body: formData });

// ─── Download ────────────────────────────────────────────

export const download = (url) =>
  request(`/api/download?url=${encodeURIComponent(url)}`);

// ─── Generate (图像) ─────────────────────────────────────

export const generate = {
  create: (body) => jsonPost('/api/generate', body),
  status: (taskId) => request(`/api/generate/status/${taskId}`),
};

// ─── Edit (图像编辑) ─────────────────────────────────────

export const edit = {
  create: (body) => jsonPost('/api/edit', body),
  // 编辑任务复用 generate 的 status 接口
  status: (taskId) => request(`/api/generate/status/${taskId}`),
};

// ─── Enhance (图像增强) ──────────────────────────────────

export const enhance = {
  create: (body) => jsonPost('/api/enhance', body),
  status: (taskId) => request(`/api/enhance/status/${taskId}`),
};

// ─── Video ───────────────────────────────────────────────

export const video = {
  create: (body) => jsonPost('/api/video/generate', body),
  status: (taskId) => request(`/api/video/status/${taskId}`),
};

// ─── Admin ───────────────────────────────────────────────

export const admin = {
  listUsers: () => request('/api/admin/users'),
  createUser: (user) => jsonPost('/api/admin/create-user', user),
  recharge: (userId, amount) =>
    jsonPost('/api/admin/recharge', { userId: Number(userId), amount: Number(amount) }),
  deleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  updateUser: (body) => jsonPost('/api/admin/update-user', body),
};
