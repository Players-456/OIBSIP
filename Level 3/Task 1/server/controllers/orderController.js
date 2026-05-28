const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Pizza = require('../models/pizzaModel');
const CustomPizza = require('../models/customPizzaModel');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../utils/razorpay');

const TAX_RATE = 0.05;
const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 499;

const getLowestPrice = (pizza) => Math.min(...pizza.sizes.map((size) => size.price));

const roundAmount = (amount) => Math.round(amount * 100) / 100;

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateShippingAddress = (shippingAddress) => {
  const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  const missingField = requiredFields.find((field) => !shippingAddress?.[field]);

  if (missingField) {
    throw createHttpError('Please complete the shipping address');
  }
};

const buildOrderItems = async (cartItems = []) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw createHttpError('Cart is empty');
  }

  const orderItems = [];

  for (const item of cartItems) {
    const quantity = Number(item.quantity);

    if (!item.itemId || !item.type || !Number.isInteger(quantity) || quantity < 1) {
      throw createHttpError('Invalid cart item');
    }

    if (item.type === 'pizza') {
      const pizza = await Pizza.findById(item.itemId);

      if (!pizza || !pizza.isAvailable) {
        throw createHttpError('One of the selected pizzas is unavailable');
      }

      orderItems.push({
        itemType: 'pizza',
        itemId: pizza._id,
        name: pizza.name,
        image: pizza.image,
        quantity,
        price: getLowestPrice(pizza),
        details: pizza.category
      });
    } else if (item.type === 'custom') {
      const customPizza = await CustomPizza.findById(item.itemId);

      if (!customPizza) {
        throw createHttpError('Custom pizza not found');
      }

      orderItems.push({
        itemType: 'custom',
        itemId: customPizza._id,
        name: customPizza.name,
        image: item.image,
        quantity,
        price: customPizza.price,
        details: 'Custom build',
        selections: customPizza.selectionSummary
      });
    } else {
      throw createHttpError('Invalid cart item type');
    }
  }

  return orderItems;
};

const calculateOrderTotals = (items) => {
  const subtotal = roundAmount(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const tax = roundAmount(subtotal * TAX_RATE);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const totalAmount = roundAmount(subtotal + tax + deliveryFee);

  return { subtotal, tax, deliveryFee, totalAmount };
};

const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  validateShippingAddress(shippingAddress);

  const orderItems = await buildOrderItems(items);
  const totals = calculateOrderTotals(orderItems);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    ...totals
  });

  res.status(201).json({
    success: true,
    data: order
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.paymentStatus === 'paid') {
    res.status(400);
    throw new Error('Order is already paid');
  }

  const razorpayOrder = await createRazorpayOrder({
    amount: order.totalAmount,
    receipt: `order_${order._id}`
  });

  order.razorpayOrderId = razorpayOrder.id;
  order.paymentStatus = 'pending';
  await order.save();

  res.status(200).json({
    success: true,
    data: {
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
      order
    }
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400);
    throw new Error('Payment verification details are required');
  }

  if (order.razorpayOrderId !== razorpayOrderId) {
    res.status(400);
    throw new Error('Razorpay order mismatch');
  }

  const isValid = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  if (!isValid) {
    order.paymentStatus = 'failed';
    await order.save();
    res.status(400);
    throw new Error('Invalid payment signature');
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

const markPaymentFailed = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.paymentStatus = 'failed';
  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed
};
