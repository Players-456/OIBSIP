import axios from '../../utils/axios';

const getBuilderOptions = async () => {
  const response = await axios.get('/custom-pizzas/options');
  return response.data.data;
};

const createCustomPizza = async (customPizzaData) => {
  const response = await axios.post('/custom-pizzas', customPizzaData);
  return response.data.data;
};

const customPizzaService = {
  getBuilderOptions,
  createCustomPizza,
};

export default customPizzaService;
