const asyncHandler = require('express-async-handler');
const CustomPizza = require('../models/customPizzaModel');
const { builderOptions, calculateCustomPizzaPrice } = require('../utils/customPizzaPricing');

// @desc    Get custom pizza builder options
// @route   GET /api/v1/custom-pizzas/options
// @access  Public
const getCustomPizzaOptions = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: builderOptions
  });
});

// @desc    Create custom pizza
// @route   POST /api/v1/custom-pizzas
// @access  Public
const createCustomPizza = asyncHandler(async (req, res) => {
  const { base, sauce, cheese, veggies = [], extras = [] } = req.body;
  const pricing = calculateCustomPizzaPrice({ base, sauce, cheese, veggies, extras });

  const customPizza = await CustomPizza.create({
    base,
    sauce,
    cheese,
    veggies,
    extras,
    price: pricing.total,
    priceBreakdown: pricing.breakdown,
    selectionSummary: pricing.selections
  });

  res.status(201).json({
    success: true,
    data: {
      _id: customPizza._id,
      name: customPizza.name,
      base,
      sauce,
      cheese,
      veggies,
      extras,
      price: customPizza.price,
      priceBreakdown: customPizza.priceBreakdown,
      selectionSummary: customPizza.selectionSummary
    }
  });
});

module.exports = {
  getCustomPizzaOptions,
  createCustomPizza
};
