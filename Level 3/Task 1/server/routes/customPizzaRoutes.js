const express = require('express');
const {
  getCustomPizzaOptions,
  createCustomPizza
} = require('../controllers/customPizzaController');

const router = express.Router();

router.get('/options', getCustomPizzaOptions);
router.post('/', createCustomPizza);

module.exports = router;
