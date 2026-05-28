const mongoose = require('mongoose');

const priceBreakdownSchema = new mongoose.Schema({
  base: { type: Number, required: true, min: 0 },
  sauce: { type: Number, required: true, min: 0 },
  cheese: { type: Number, required: true, min: 0 },
  veggies: { type: Number, required: true, min: 0 },
  extras: { type: Number, required: true, min: 0 }
}, { _id: false });

const customPizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Custom Pizza',
    trim: true
  },
  base: {
    type: String,
    required: [true, 'Please select a pizza base']
  },
  sauce: {
    type: String,
    required: [true, 'Please select a sauce']
  },
  cheese: {
    type: String,
    required: [true, 'Please select cheese']
  },
  veggies: {
    type: [String],
    default: []
  },
  extras: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  priceBreakdown: {
    type: priceBreakdownSchema,
    required: true
  },
  selectionSummary: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CustomPizza', customPizzaSchema);
