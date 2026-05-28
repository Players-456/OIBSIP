const mongoose = require('mongoose');

const pizzaSizeSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const pizzaInventorySchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative']
  }
}, { _id: false });

const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a pizza name'],
    trim: true,
    maxlength: [80, 'Pizza name cannot exceed 80 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan'],
    required: true
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  sizes: {
    type: [pizzaSizeSchema],
    validate: {
      validator: (sizes) => sizes.length > 0,
      message: 'Please add at least one size'
    }
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  inventoryItems: [pizzaInventorySchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  prepTime: {
    type: Number,
    default: 20,
    min: [1, 'Prep time must be at least 1 minute']
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

pizzaSchema.index({ name: 'text', description: 'text', tags: 'text', ingredients: 'text' });

module.exports = mongoose.model('Pizza', pizzaSchema);
