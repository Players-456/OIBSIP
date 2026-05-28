const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createOrder);

router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/razorpay', createPaymentOrder);
router.post('/:id/verify-payment', verifyPayment);
router.post('/:id/payment-failed', markPaymentFailed);

module.exports = router;
