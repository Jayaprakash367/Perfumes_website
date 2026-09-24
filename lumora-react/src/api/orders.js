import apiClient from './client';

export const ordersApi = {
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getOrders: () => apiClient.get('/orders'),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  cancelOrder: (id) => apiClient.post(`/orders/${id}/cancel`),
  validateCoupon: (code, subtotal) => apiClient.post('/coupons/validate', { code, subtotal }),
};
