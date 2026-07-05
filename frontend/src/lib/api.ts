import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

/**
 * 将后端返回的相对图片路径转为完整URL
 * 例: "/upload/2024/07/03/abc.jpg" → "http://localhost:8080/upload/2024/07/03/abc.jpg"
 * 已经是完整URL（http/https开头）则原样返回
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return API_BASE + (url.startsWith('/') ? '' : '/') + url;
}

// 请求拦截器 - 附加JWT令牌
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器 - 处理401和解包Result
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export { api };

// 认证接口
export const authApi = {
  login: (data: { username: string; password: string }) => api.post('/api/auth/login', data),
  register: (data: { username: string; password: string; nickname?: string; email?: string }) =>
    api.post('/api/auth/register', data),
  refreshToken: (token: string) => api.post(`/api/auth/refresh?refreshToken=${token}`),
};

// 文章接口
export const articlesApi = {
  list: (params: Record<string, unknown>) => api.get('/api/articles', { params }),
  getById: (id: number) => api.get(`/api/articles/${id}`),
};

// 分类接口
export const categoriesApi = {
  listTree: () => api.get('/api/categories'),
};

// 搜索接口
export const searchApi = {
  search: (q: string, pageNum = 1, pageSize = 10) =>
    api.get('/api/search', { params: { q, pageNum, pageSize } }),
  suggest: (q: string) =>
    api.get('/api/search', { params: { q, pageNum: 1, pageSize: 8 } }),
};

// 用户接口
export const userApi = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/api/user/profile', data),
  uploadAvatar: (formData: FormData) =>
    api.post('/api/user/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// 收藏接口
export const favoritesApi = {
  toggle: (articleId: number) => api.post(`/api/favorites/articles/${articleId}`),
  list: (pageNum = 1, pageSize = 10) => api.get('/api/favorites', { params: { pageNum, pageSize } }),
};

// 评论接口
export const commentsApi = {
  listByArticle: (articleId: number, pageNum = 1, pageSize = 10) =>
    api.get(`/api/articles/${articleId}/comments`, { params: { pageNum, pageSize } }),
  create: (articleId: number, data: { content: string; parentId?: number; replyUserId?: number }) =>
    api.post(`/api/articles/${articleId}/comments`, data),
};

// 公告接口（前台）
export const announcementsApi = {
  list: (params?: Record<string, unknown>) => api.get('/api/announcements', { params }),
  getLatest: (limit?: number) => api.get('/api/announcements/latest', { params: { limit: limit || 5 } }),
  getById: (id: number) => api.get(`/api/announcements/${id}`),
};

// 管理员接口
export const adminApi = {
  // 仪表盘
  getStats: () => api.get('/api/admin/dashboard/stats'),
  // 权限
  permissions: {
    list: () => api.get('/api/admin/permissions'),
    create: (data: Record<string, unknown>) => api.post('/api/admin/permissions', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/permissions/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/permissions/${id}`),
  },
  // 文章
  articles: {
    list: (params: Record<string, unknown>) => api.get('/api/admin/articles', { params }),
    getById: (id: number) => api.get(`/api/admin/articles/${id}`),
    create: (data: Record<string, unknown>) => api.post('/api/admin/articles', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/articles/${id}`, data),
    updateStatus: (id: number, status: number) => api.put(`/api/admin/articles/${id}/status?status=${status}`),
    delete: (id: number) => api.delete(`/api/admin/articles/${id}`),
  },
  // 分类
  categories: {
    list: () => api.get('/api/admin/categories'),
    create: (data: Record<string, unknown>) => api.post('/api/admin/categories', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/categories/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/categories/${id}`),
  },
  // 用户
  users: {
    list: (params: Record<string, unknown>) => api.get('/api/admin/users', { params }),
    getById: (id: number) => api.get(`/api/admin/users/${id}`),
    create: (data: Record<string, unknown>) => api.post('/api/admin/users', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/users/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/users/${id}`),
    assignRoles: (id: number, roleIds: number[]) => api.put(`/api/admin/users/${id}/roles`, roleIds),
    resetPassword: (id: number, newPassword: string) => api.put(`/api/admin/users/${id}/password?newPassword=${encodeURIComponent(newPassword)}`),
  },
  // 角色
  roles: {
    list: () => api.get('/api/admin/roles'),
    create: (data: Record<string, unknown>) => api.post('/api/admin/roles', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/roles/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/roles/${id}`),
    getPermissions: (id: number) => api.get(`/api/admin/roles/${id}/permissions`),
    assignPermissions: (id: number, permIds: number[]) =>
      api.put(`/api/admin/roles/${id}/permissions`, permIds),
  },
  // 抓取
  crawl: {
    trigger: (keyword: string) => api.post(`/api/admin/crawl/trigger?keyword=${encodeURIComponent(keyword)}`),
    generate: (prompt: string) => api.post(`/api/admin/crawl/generate?prompt=${encodeURIComponent(prompt)}`),
    listResults: (params: Record<string, unknown>) => api.get('/api/admin/crawl/results', { params }),
    approve: (id: number) => api.post(`/api/admin/crawl/results/${id}/approve`),
    reject: (id: number, remark?: string) =>
      api.post(`/api/admin/crawl/results/${id}/reject`, { auditRemark: remark }),
    publish: (id: number) => api.post(`/api/admin/crawl/results/${id}/publish`),
    listTasks: (params: Record<string, unknown>) => api.get('/api/admin/crawl/tasks', { params }),
    deleteTask: (id: number) => api.delete(`/api/admin/crawl/tasks/${id}`),
  },
  // 评论
  comments: {
    list: (params: Record<string, unknown>) => api.get('/api/admin/comments', { params }),
    pending: (params: Record<string, unknown>) => api.get('/api/admin/comments/pending', { params }),
    approve: (id: number) => api.post(`/api/admin/comments/${id}/approve`),
    reject: (id: number) => api.post(`/api/admin/comments/${id}/reject`),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/comments/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/comments/${id}`),
  },
  // 系统配置
  systemConfig: {
    getAll: () => api.get('/api/admin/system-config'),
    update: (configs: Record<string, string>) => api.put('/api/admin/system-config', configs),
  },
  // 轮播图
  banners: {
    list: (params: Record<string, unknown>) => api.get('/api/admin/banners', { params }),
    getById: (id: number) => api.get(`/api/admin/banners/${id}`),
    create: (data: Record<string, unknown>) => api.post('/api/admin/banners', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/banners/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/banners/${id}`),
  },
  // 文章搜索（供轮播图选择器使用）
  articlesSearch: {
    byTitle: (title: string) => api.get('/api/admin/articles/search', { params: { title } }),
  },
  // 公告
  announcements: {
    list: (params: Record<string, unknown>) => api.get('/api/admin/announcements', { params }),
    getById: (id: number) => api.get(`/api/admin/announcements/${id}`),
    create: (data: Record<string, unknown>) => api.post('/api/admin/announcements', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/announcements/${id}`, data),
    updateStatus: (id: number, status: number) => api.put(`/api/admin/announcements/${id}/status?status=${status}`),
    delete: (id: number) => api.delete(`/api/admin/announcements/${id}`),
  },
  // ES 搜索管理
  searchManage: {
    sync: () => api.post('/api/admin/search/sync'),
    status: () => api.get('/api/admin/search/status'),
  },
};

// 轮播图接口（前台）
export const bannersApi = {
  list: () => api.get('/api/banners'),
  getConfig: () => api.get('/api/banners/config'),
};

// 文件上传接口
export const uploadApi = {
  image: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/admin/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  video: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/admin/upload/video', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
