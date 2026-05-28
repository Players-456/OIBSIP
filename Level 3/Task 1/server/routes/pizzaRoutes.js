const express = require('express');
const {
  getPizzas,
  getPizza,
  createPizza,
  updatePizza,
  deletePizza
} = require('../controllers/pizzaController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getPizzas)
  .post(protect, admin, createPizza);

router.route('/:id')
  .get(getPizza)
  .put(protect, admin, updatePizza)
  .delete(protect, admin, deletePizza);

module.exports = router;
