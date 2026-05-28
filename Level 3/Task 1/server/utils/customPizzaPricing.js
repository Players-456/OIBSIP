const builderOptions = {
  bases: [
    { id: 'classic-hand-tossed', name: 'Classic Hand Tossed', price: 149 },
    { id: 'thin-crust', name: 'Thin Crust', price: 159 },
    { id: 'cheese-burst', name: 'Cheese Burst', price: 199 },
    { id: 'whole-wheat', name: 'Whole Wheat', price: 169 },
    { id: 'gluten-free', name: 'Gluten Free', price: 219 }
  ],
  sauces: [
    { id: 'signature-tomato', name: 'Signature Tomato', price: 39 },
    { id: 'smoky-barbeque', name: 'Smoky Barbeque', price: 49 },
    { id: 'peri-peri', name: 'Peri Peri', price: 49 },
    { id: 'creamy-alfredo', name: 'Creamy Alfredo', price: 59 },
    { id: 'pesto-basil', name: 'Pesto Basil', price: 69 }
  ],
  cheeses: [
    { id: 'mozzarella', name: 'Mozzarella', price: 79 },
    { id: 'cheddar', name: 'Cheddar', price: 89 },
    { id: 'four-cheese', name: 'Four Cheese Blend', price: 129 },
    { id: 'vegan-cheese', name: 'Vegan Cheese', price: 119 }
  ],
  veggies: [
    { id: 'onion', name: 'Onion', price: 19 },
    { id: 'capsicum', name: 'Capsicum', price: 25 },
    { id: 'mushroom', name: 'Mushroom', price: 35 },
    { id: 'corn', name: 'Sweet Corn', price: 25 },
    { id: 'jalapeno', name: 'Jalapeno', price: 29 },
    { id: 'olive', name: 'Black Olive', price: 35 },
    { id: 'tomato', name: 'Cherry Tomato', price: 29 },
    { id: 'paneer', name: 'Paneer', price: 49 }
  ],
  extras: [
    { id: 'extra-cheese', name: 'Extra Cheese', price: 59 },
    { id: 'cheese-dip', name: 'Cheese Dip', price: 39 },
    { id: 'garlic-drizzle', name: 'Garlic Drizzle', price: 29 },
    { id: 'chilli-flakes', name: 'Chilli Flakes', price: 15 },
    { id: 'oregano-pack', name: 'Oregano Pack', price: 15 }
  ]
};

const findOption = (group, id) => builderOptions[group].find((option) => option.id === id);

const validateOption = (group, id, label) => {
  const option = findOption(group, id);

  if (!option) {
    const error = new Error(`Please select a valid ${label}`);
    error.statusCode = 400;
    throw error;
  }

  return option;
};

const validateOptionList = (group, ids, label) => {
  if (!Array.isArray(ids)) {
    const error = new Error(`${label} must be an array`);
    error.statusCode = 400;
    throw error;
  }

  return ids.map((id) => validateOption(group, id, label));
};

const calculateCustomPizzaPrice = ({ base, sauce, cheese, veggies = [], extras = [] }) => {
  if (!base || !sauce || !cheese) {
    const error = new Error('Base, sauce, and cheese are required');
    error.statusCode = 400;
    throw error;
  }

  const selectedBase = validateOption('bases', base, 'base');
  const selectedSauce = validateOption('sauces', sauce, 'sauce');
  const selectedCheese = validateOption('cheeses', cheese, 'cheese');
  const selectedVeggies = validateOptionList('veggies', veggies, 'veggies');
  const selectedExtras = validateOptionList('extras', extras, 'extras');

  const groups = {
    base: selectedBase,
    sauce: selectedSauce,
    cheese: selectedCheese,
    veggies: selectedVeggies,
    extras: selectedExtras
  };

  const total = [
    selectedBase,
    selectedSauce,
    selectedCheese,
    ...selectedVeggies,
    ...selectedExtras
  ].reduce((sum, option) => sum + option.price, 0);

  return {
    total,
    breakdown: {
      base: selectedBase.price,
      sauce: selectedSauce.price,
      cheese: selectedCheese.price,
      veggies: selectedVeggies.reduce((sum, option) => sum + option.price, 0),
      extras: selectedExtras.reduce((sum, option) => sum + option.price, 0)
    },
    selections: groups
  };
};

module.exports = {
  builderOptions,
  calculateCustomPizzaPrice
};
