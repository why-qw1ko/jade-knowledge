import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 15000,
});

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
};

// 用户接口
export const userApi = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/api/user/profile', data),
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

// 管理员接口
export const adminApi = {
  // 仪表盘
  getStats: () => api.get('/api/admin/dashboard/stats'),
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
    create: (data: Record<string, unknown>) => api.post('/api/admin/users', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/api/admin/users/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/users/${id}`),
    assignRoles: (id: number, roleIds: number[]) => api.put(`/api/admin/users/${id}/roles`, roleIds),
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
    listResults: (params: Record<string, unknown>) => api.get('/api/admin/crawl/results', { params }),
    approve: (id: number) => api.post(`/api/admin/crawl/results/${id}/approve`),
    reject: (id: number, remark?: string) =>
      api.post(`/api/admin/crawl/results/${id}/reject`, { auditRemark: remark }),
    publish: (id: number) => api.post(`/api/admin/crawl/results/${id}/publish`),
    listTasks: (params: Record<string, unknown>) => api.get('/api/admin/crawl/tasks', { params }),
  },
  // 评论
  comments: {
    pending: (params: Record<string, unknown>) => api.get('/api/admin/comments/pending', { params }),
    approve: (id: number) => api.post(`/api/admin/comments/${id}/approve`),
    reject: (id: number) => api.post(`/api/admin/comments/${id}/reject`),
    delete: (id: number) => api.delete(`/api/admin/comments/${id}`),
  },
  // 系统配置
  systemConfig: {
    getAll: () => api.get('/api/admin/system-config'),
    update: (configs: Record<string, string>) => api.put('/api/admin/system-config', configs),
  },
};
