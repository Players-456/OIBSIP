import axios from '../../utils/axios';

const getAnalytics = async () => {
  const response = await axios.get('/admin/analytics');
  return response.data.data;
};

const getUsers = async (search = '') => {
  const response = await axios.get('/admin/users', { params: { search } });
  return response.data.data;
};

const updateUserRole = async (userId, role) => {
  const response = await axios.patch(`/admin/users/${userId}/role`, { role });
  return response.data.data;
};

const deleteUser = async (userId) => {
  await axios.delete(`/admin/users/${userId}`);
  return userId;
};

const getOrders = async (filters = {}) => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== 'all'));
  const response = await axios.get('/admin/orders', { params });
  return response.data.data;
};

const updateOrderStatus = async (orderId, orderStatus) => {
  const response = await axios.patch(`/admin/orders/${orderId}/status`, { orderStatus });
  return response.data.data;
};

const getPizzas = async (filters = {}) => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== 'all'));
  const response = await axios.get('/pizzas', { params });
  return response.data.data;
};

const createPizza = async (pizzaData) => {
  const response = await axios.post('/pizzas', pizzaData);
  return response.data.data;
};

const updatePizza = async (pizzaId, pizzaData) => {
  const response = await axios.put(`/pizzas/${pizzaId}`, pizzaData);
  return response.data.data;
};

const deletePizza = async (pizzaId) => {
  await axios.delete(`/pizzas/${pizzaId}`);
  return pizzaId;
};

const getInventory = async (filters = {}) => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== 'all'));
  const response = await axios.get('/inventory', { params });
  return response.data.data;
};

const updateInventoryStock = async (itemId, quantity) => {
  const response = await axios.patch(`/inventory/${itemId}/stock`, { quantity });
  return response.data.data;
};

const updateInventoryItem = async (itemId, itemData) => {
  const response = await axios.put(`/inventory/${itemId}`, itemData);
  return response.data.data;
};

const adminService = {
  getAnalytics,
  getUsers,
  updateUserRole,
  deleteUser,
  getOrders,
  updateOrderStatus,
  getPizzas,
  createPizza,
  updatePizza,
  deletePizza,
  getInventory,
  updateInventoryStock,
  updateInventoryItem,
};

export default adminService;
