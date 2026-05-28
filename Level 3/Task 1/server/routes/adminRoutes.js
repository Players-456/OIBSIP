const express = require('express');
const {
  getAnalytics,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/analytics', getAnalytics);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
