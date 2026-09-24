import apiClient from './client';

export const paymentsApi = {
  createOrder: (orderId) => apiClient.post('/payments/create-order', { orderId }),
  verify: (paymentData) => apiClient.post('/payments/verify', paymentData),
};
