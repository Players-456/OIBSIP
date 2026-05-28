const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Pizza = require('../models/pizzaModel');
const Inventory = require('../models/inventoryModel');

const orderStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOrders,
    revenueResult,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockCount,
    totalPizzas,
    customPizzaResult,
    recentOrders
  ] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'preparing', 'out_for_delivery'] } }),
    Order.countDocuments({ orderStatus: 'delivered' }),
    Order.countDocuments({ orderStatus: 'cancelled' }),
    Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }),
    Pizza.countDocuments(),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.itemType': 'custom' } },
      { $group: { _id: null, count: { $sum: '$items.quantity' } } }
    ]),
    Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email')
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockCount,
      totalPizzas,
      customPizzaOrders: customPizzaResult[0]?.count || 0,
      recentOrders
    }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = search
    ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
    : {};

  const users = await User.find(query).select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { returnDocument: 'after', runValidators: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    message: 'User deleted'
  });
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const { search, paymentStatus, orderStatus } = req.query;
  const query = {};

  if (paymentStatus && paymentStatus !== 'all') {
    query.paymentStatus = paymentStatus;
  }

  if (orderStatus && orderStatus !== 'all') {
    query.orderStatus = orderStatus;
  }

  if (search) {
    query.$or = [
      { razorpayOrderId: { $regex: search, $options: 'i' } },
      { razorpayPaymentId: { $regex: search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  if (!orderStatuses.includes(orderStatus)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },
    { returnDocument: 'after', runValidators: true }
  ).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

module.exports = {
  getAnalytics,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus
};
