const asyncHandler = require('express-async-handler');
const Pizza = require('../models/pizzaModel');

const getLowestPrice = (pizza) => {
  if (!pizza.sizes || pizza.sizes.length === 0) {
    return 0;
  }

  return Math.min(...pizza.sizes.map((size) => size.price));
};

// @desc    Get pizzas with search and filters
// @route   GET /api/v1/pizzas
// @access  Public
const getPizzas = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    isAvailable,
    sort = 'name'
  } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  }

  if (minPrice || maxPrice) {
    query.sizes = {
      $elemMatch: {
        price: {
          ...(minPrice ? { $gte: Number(minPrice) } : {}),
          ...(maxPrice ? { $lte: Number(maxPrice) } : {})
        }
      }
    };
  }

  const sortOptions = {
    name: { name: 1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
    price: { 'sizes.price': 1 }
  };

  const pizzas = await Pizza.find(query)
    .populate('inventoryItems.item', 'name unit quantity lowStockThreshold')
    .sort(sortOptions[sort] || sortOptions.name);

  res.status(200).json({
    success: true,
    count: pizzas.length,
    data: pizzas.map((pizza) => ({
      ...pizza.toObject(),
      startingPrice: getLowestPrice(pizza)
    }))
  });
});

// @desc    Get single pizza
// @route   GET /api/v1/pizzas/:id
// @access  Public
const getPizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.findById(req.params.id)
    .populate('inventoryItems.item', 'name unit quantity lowStockThreshold');

  if (!pizza) {
    res.status(404);
    throw new Error('Pizza not found');
  }

  res.status(200).json({
    success: true,
    data: {
      ...pizza.toObject(),
      startingPrice: getLowestPrice(pizza)
    }
  });
});

// @desc    Create pizza
// @route   POST /api/v1/pizzas
// @access  Private/Admin
const createPizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.create(req.body);

  res.status(201).json({
    success: true,
    data: pizza
  });
});

// @desc    Update pizza
// @route   PUT /api/v1/pizzas/:id
// @access  Private/Admin
const updatePizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true
  });

  if (!pizza) {
    res.status(404);
    throw new Error('Pizza not found');
  }

  res.status(200).json({
    success: true,
    data: pizza
  });
});

// @desc    Delete pizza
// @route   DELETE /api/v1/pizzas/:id
// @access  Private/Admin
const deletePizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.findByIdAndDelete(req.params.id);

  if (!pizza) {
    res.status(404);
    throw new Error('Pizza not found');
  }

  res.status(200).json({
    success: true,
    message: 'Pizza deleted'
  });
});

module.exports = {
  getPizzas,
  getPizza,
  createPizza,
  updatePizza,
  deletePizza
};
