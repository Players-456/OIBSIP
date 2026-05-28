const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Inventory = require('../models/inventoryModel');
const Pizza = require('../models/pizzaModel');
const { sampleInventory, samplePizzas } = require('../data/samplePizzas');

dotenv.config();

const seedPhase2 = async () => {
  await connectDB();

  const inventoryMap = {};

  for (const item of sampleInventory) {
    const savedItem = await Inventory.findOneAndUpdate(
      { name: item.name },
      item,
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    inventoryMap[savedItem.name] = savedItem._id;
  }

  for (const pizza of samplePizzas) {
    const inventoryItems = pizza.inventoryItems.map((item) => ({
      item: inventoryMap[item.name],
      quantity: item.quantity
    }));

    await Pizza.findOneAndUpdate(
      { slug: pizza.slug },
      { ...pizza, inventoryItems },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Phase 2 sample pizzas and inventory seeded');
  process.exit(0);
};

seedPhase2().catch((error) => {
  console.error(error);
  process.exit(1);
});
