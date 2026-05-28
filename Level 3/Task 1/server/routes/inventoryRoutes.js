const express = require('express');
const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  getLowStockItems,
  updateInventoryStock,
  deleteInventoryItem
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.route('/')
  .get(getInventoryItems)
  .post(createInventoryItem);

router.get('/low-stock', getLowStockItems);
router.patch('/:id/stock', updateInventoryStock);

router.route('/:id')
  .get(getInventoryItem)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

module.exports = router;
