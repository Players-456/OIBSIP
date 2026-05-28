import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import pizzaReducer from '../features/pizzas/pizzaSlice';
import cartReducer from '../features/cart/cartSlice';
import orderReducer from '../features/orders/orderSlice';
import adminReducer from '../features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pizzas: pizzaReducer,
    cart: cartReducer,
    orders: orderReducer,
    admin: adminReducer,
  },
});
