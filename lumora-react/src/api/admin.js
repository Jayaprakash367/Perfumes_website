import apiClient from './client';

export const adminApi = {
  // Dashboard & Metrics
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  
  // Login Activity & Cyber Defense Audits
  getLoginActivities: (params = {}) => apiClient.get('/admin/login-activities', { params }),
  getLoginActivityStats: () => apiClient.get('/admin/login-activities/stats'),

  // User Management
  getUsers: (params = {}) => apiClient.get('/admin/users', { params }),
  toggleUserStatus: (id, isActive) => apiClient.put(`/admin/users/${id}/status`, { isActive }),

  // Order Management
  getOrders: (params = {}) => apiClient.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => apiClient.put(`/admin/orders/${id}/status`, { status }),
  updateTracking: (id, data) => apiClient.put(`/admin/orders/${id}/tracking`, data),

  // Product Management
  createProduct: (data) => apiClient.post('/admin/products', data),
  updateProduct: (id, data) => apiClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
};

export default adminApi;
