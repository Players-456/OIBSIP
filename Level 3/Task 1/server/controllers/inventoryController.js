const asyncHandler = require('express-async-handler');
const Inventory = require('../models/inventoryModel');

// @desc    Get inventory items
// @route   GET /api/v1/inventory
// @access  Private/Admin
const getInventoryItems = asyncHandler(async (req, res) => {
  const { search, lowStock, isActive } = req.query;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (lowStock === 'true') {
    query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
  }

  const items = await Inventory.find(query).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get inventory item
// @route   GET /api/v1/inventory/:id
// @access  Private/Admin
const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Create inventory item
// @route   POST /api/v1/inventory
// @access  Private/Admin
const createInventoryItem = asyncHandler(async (req, res) => {
  const itemData = {
    ...req.body,
    isActive: Number(req.body.quantity) === 0 ? false : req.body.isActive
  };
  const item = await Inventory.create(itemData);

  res.status(201).json({
    success: true,
    data: item
  });
});

// @desc    Update inventory item
// @route   PUT /api/v1/inventory/:id
// @access  Private/Admin
const updateInventoryItem = asyncHandler(async (req, res) => {
  const itemData = {
    ...req.body,
    ...(req.body.quantity !== undefined ? { isActive: Number(req.body.quantity) > 0 } : {})
  };
  const item = await Inventory.findByIdAndUpdate(req.params.id, itemData, {
    returnDocument: 'after',
    runValidators: true
  });

  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Get low stock inventory alerts
// @route   GET /api/v1/inventory/low-stock
// @access  Private/Admin
const getLowStockItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find({
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
  }).sort({ quantity: 1 });

  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Update inventory stock
// @route   PATCH /api/v1/inventory/:id/stock
// @access  Private/Admin
const updateInventoryStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (quantity === undefined || Number(quantity) < 0) {
    res.status(400);
    throw new Error('Please provide a valid quantity');
  }

  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    {
      quantity: Number(quantity),
      isActive: Number(quantity) > 0
    },
    { returnDocument: 'after', runValidators: true }
  );

  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Delete inventory item
// @route   DELETE /api/v1/inventory/:id
// @access  Private/Admin
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findByIdAndDelete(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  res.status(200).json({
    success: true,
    message: 'Inventory item deleted'
  });
});

module.exports = {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  getLowStockItems,
  updateInventoryStock,
  deleteInventoryItem
};
