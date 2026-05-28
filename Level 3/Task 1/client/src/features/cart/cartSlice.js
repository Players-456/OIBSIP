import { createSlice } from '@reduxjs/toolkit';
import cartService from './cartService';

const recalculateCart = (state) => {
  state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.totalAmount = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartService.saveCart({
    items: state.items,
    totalQuantity: state.totalQuantity,
    totalAmount: state.totalAmount,
  });
};

const addItem = (state, item) => {
  const existingItem = state.items.find((cartItem) => cartItem.cartId === item.cartId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.items.push({
      ...item,
      quantity: 1,
    });
  }

  recalculateCart(state);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: cartService.loadCart(),
  reducers: {
    addPizzaToCart: (state, action) => {
      const pizza = action.payload;
      addItem(state, {
        cartId: `pizza-${pizza._id}`,
        type: 'pizza',
        itemId: pizza._id,
        name: pizza.name,
        image: pizza.image,
        price: pizza.startingPrice,
        details: pizza.category,
      });
    },
    addCustomPizzaToCart: (state, action) => {
      const customPizza = action.payload;
      addItem(state, {
        cartId: `custom-${customPizza._id}`,
        type: 'custom',
        itemId: customPizza._id,
        name: customPizza.name,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=900&auto=format&fit=crop',
        price: customPizza.price,
        details: 'Custom build',
        selections: customPizza.selectionSummary,
      });
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((cartItem) => cartItem.cartId === action.payload);
      if (item) {
        item.quantity += 1;
        recalculateCart(state);
      }
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((cartItem) => cartItem.cartId === action.payload);
      if (!item) {
        return;
      }

      if (item.quantity === 1) {
        state.items = state.items.filter((cartItem) => cartItem.cartId !== action.payload);
      } else {
        item.quantity -= 1;
      }

      recalculateCart(state);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.cartId !== action.payload);
      recalculateCart(state);
    },
    clearCart: (state) => {
      state.items = [];
      recalculateCart(state);
    },
  },
});

export const {
  addPizzaToCart,
  addCustomPizzaToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
