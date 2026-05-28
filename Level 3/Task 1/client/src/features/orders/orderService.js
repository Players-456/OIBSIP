import axios from '../../utils/axios';

const createOrder = async (orderData) => {
  const response = await axios.post('/orders', orderData);
  return response.data.data;
};

const createPaymentOrder = async (orderId) => {
  const response = await axios.post(`/orders/${orderId}/razorpay`);
  return response.data.data;
};

const verifyPayment = async (orderId, paymentData) => {
  const response = await axios.post(`/orders/${orderId}/verify-payment`, paymentData);
  return response.data.data;
};

const markPaymentFailed = async (orderId) => {
  const response = await axios.post(`/orders/${orderId}/payment-failed`);
  return response.data.data;
};

const getMyOrders = async () => {
  const response = await axios.get('/orders/my-orders');
  return response.data;
};

const getOrderById = async (orderId) => {
  const response = await axios.get(`/orders/${orderId}`);
  return response.data.data;
};

const orderService = {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getMyOrders,
  getOrderById,
};

export default orderService;
