import axios from '../../utils/axios';

const getPizzas = async (filters) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== 'all')
  );

  const response = await axios.get('/pizzas', { params });
  return response.data;
};

const pizzaService = {
  getPizzas,
};

export default pizzaService;
