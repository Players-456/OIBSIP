const sampleInventory = [
  { name: 'Mozzarella Cheese', unit: 'g', quantity: 12000, lowStockThreshold: 2000, costPerUnit: 0.45 },
  { name: 'Pizza Sauce', unit: 'ml', quantity: 9000, lowStockThreshold: 1500, costPerUnit: 0.18 },
  { name: 'Dough Ball', unit: 'pcs', quantity: 180, lowStockThreshold: 30, costPerUnit: 18 },
  { name: 'Basil Leaves', unit: 'g', quantity: 900, lowStockThreshold: 150, costPerUnit: 1.2 },
  { name: 'Paneer Cubes', unit: 'g', quantity: 5000, lowStockThreshold: 800, costPerUnit: 0.75 },
  { name: 'Chicken Tikka', unit: 'g', quantity: 4500, lowStockThreshold: 800, costPerUnit: 0.95 },
  { name: 'Bell Peppers', unit: 'g', quantity: 3500, lowStockThreshold: 600, costPerUnit: 0.35 },
  { name: 'Olives', unit: 'g', quantity: 1800, lowStockThreshold: 300, costPerUnit: 0.65 },
  { name: 'Mushrooms', unit: 'g', quantity: 2600, lowStockThreshold: 500, costPerUnit: 0.5 }
];

const samplePizzas = [
  {
    name: 'Margherita Classic',
    slug: 'margherita-classic',
    description: 'A comfort-first classic with mozzarella, tomato sauce, and fresh basil.',
    category: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=1200&auto=format&fit=crop',
    sizes: [
      { size: 'small', price: 199 },
      { size: 'medium', price: 299 },
      { size: 'large', price: 429 }
    ],
    ingredients: ['Mozzarella Cheese', 'Pizza Sauce', 'Basil Leaves'],
    inventoryItems: [
      { name: 'Dough Ball', quantity: 1 },
      { name: 'Mozzarella Cheese', quantity: 120 },
      { name: 'Pizza Sauce', quantity: 90 },
      { name: 'Basil Leaves', quantity: 8 }
    ],
    tags: ['classic', 'cheese', 'fresh'],
    prepTime: 18,
    rating: 4.7,
    isAvailable: true
  },
  {
    name: 'Paneer Inferno',
    slug: 'paneer-inferno',
    description: 'Spicy paneer, peppers, olives, and a bold sauce for heat seekers.',
    category: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop',
    sizes: [
      { size: 'small', price: 259 },
      { size: 'medium', price: 369 },
      { size: 'large', price: 499 }
    ],
    ingredients: ['Paneer Cubes', 'Bell Peppers', 'Olives', 'Pizza Sauce'],
    inventoryItems: [
      { name: 'Dough Ball', quantity: 1 },
      { name: 'Paneer Cubes', quantity: 130 },
      { name: 'Bell Peppers', quantity: 60 },
      { name: 'Olives', quantity: 30 },
      { name: 'Pizza Sauce', quantity: 95 }
    ],
    tags: ['spicy', 'paneer', 'popular'],
    prepTime: 22,
    rating: 4.8,
    isAvailable: true
  },
  {
    name: 'Chicken Tikka Feast',
    slug: 'chicken-tikka-feast',
    description: 'Smoky chicken tikka, mozzarella, peppers, and herbed sauce.',
    category: 'non-vegetarian',
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=1200&auto=format&fit=crop',
    sizes: [
      { size: 'small', price: 289 },
      { size: 'medium', price: 409 },
      { size: 'large', price: 549 }
    ],
    ingredients: ['Chicken Tikka', 'Mozzarella Cheese', 'Bell Peppers', 'Pizza Sauce'],
    inventoryItems: [
      { name: 'Dough Ball', quantity: 1 },
      { name: 'Chicken Tikka', quantity: 150 },
      { name: 'Mozzarella Cheese', quantity: 110 },
      { name: 'Bell Peppers', quantity: 55 },
      { name: 'Pizza Sauce', quantity: 90 }
    ],
    tags: ['chicken', 'smoky', 'feast'],
    prepTime: 24,
    rating: 4.6,
    isAvailable: true
  },
  {
    name: 'Garden Vegan',
    slug: 'garden-vegan',
    description: 'Mushrooms, peppers, olives, basil, and bright tomato sauce with no dairy.',
    category: 'vegan',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1200&auto=format&fit=crop',
    sizes: [
      { size: 'small', price: 229 },
      { size: 'medium', price: 329 },
      { size: 'large', price: 459 }
    ],
    ingredients: ['Mushrooms', 'Bell Peppers', 'Olives', 'Basil Leaves', 'Pizza Sauce'],
    inventoryItems: [
      { name: 'Dough Ball', quantity: 1 },
      { name: 'Mushrooms', quantity: 90 },
      { name: 'Bell Peppers', quantity: 70 },
      { name: 'Olives', quantity: 35 },
      { name: 'Basil Leaves', quantity: 8 },
      { name: 'Pizza Sauce', quantity: 100 }
    ],
    tags: ['vegan', 'garden', 'light'],
    prepTime: 20,
    rating: 4.4,
    isAvailable: true
  }
];

module.exports = { sampleInventory, samplePizzas };
