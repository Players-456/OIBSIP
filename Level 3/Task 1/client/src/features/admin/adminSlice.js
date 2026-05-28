import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import adminService from './adminService';

const getMessage = (error) =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  error.toString();

const initialState = {
  analytics: {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    totalPizzas: 0,
    customPizzaOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    recentOrders: [],
  },
  users: [],
  orders: [],
  pizzas: [],
  inventory: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const fetchAnalytics = createAsyncThunk(
  'admin/analytics',
  async (_, thunkAPI) => {
    try {
      return await adminService.getAnalytics();
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/users',
  async (search, thunkAPI) => {
    try {
      return await adminService.getUsers(search);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const changeUserRole = createAsyncThunk(
  'admin/changeRole',
  async ({ userId, role }, thunkAPI) => {
    try {
      return await adminService.updateUserRole(userId, role);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const removeUser = createAsyncThunk(
  'admin/removeUser',
  async (userId, thunkAPI) => {
    try {
      return await adminService.deleteUser(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/orders',
  async (filters, thunkAPI) => {
    try {
      return await adminService.getOrders(filters);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  'admin/changeOrderStatus',
  async ({ orderId, orderStatus }, thunkAPI) => {
    try {
      return await adminService.updateOrderStatus(orderId, orderStatus);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const fetchAdminPizzas = createAsyncThunk(
  'admin/pizzas',
  async (filters, thunkAPI) => {
    try {
      return await adminService.getPizzas(filters);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const createAdminPizza = createAsyncThunk(
  'admin/createPizza',
  async (pizzaData, thunkAPI) => {
    try {
      return await adminService.createPizza(pizzaData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const updateAdminPizza = createAsyncThunk(
  'admin/updatePizza',
  async ({ pizzaId, pizzaData }, thunkAPI) => {
    try {
      return await adminService.updatePizza(pizzaId, pizzaData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const removeAdminPizza = createAsyncThunk(
  'admin/removePizza',
  async (pizzaId, thunkAPI) => {
    try {
      return await adminService.deletePizza(pizzaId);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const fetchAdminInventory = createAsyncThunk(
  'admin/inventory',
  async (filters, thunkAPI) => {
    try {
      return await adminService.getInventory(filters);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

export const changeInventoryStock = createAsyncThunk(
  'admin/changeStock',
  async ({ itemId, quantity }, thunkAPI) => {
    try {
      return await adminService.updateInventoryStock(itemId, quantity);
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error));
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload || initialState.analytics;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload || [];
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(
          (user) => user._id !== action.payload
        );
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(fetchAdminPizzas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pizzas = action.payload || [];
      })
      .addCase(createAdminPizza.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pizzas = [action.payload, ...state.pizzas];
      })
      .addCase(updateAdminPizza.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pizzas = state.pizzas.map((pizza) =>
          pizza._id === action.payload._id ? action.payload : pizza
        );
      })
      .addCase(removeAdminPizza.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pizzas = state.pizzas.filter(
          (pizza) => pizza._id !== action.payload
        );
      })
      .addCase(fetchAdminInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = action.payload || [];
      })
      .addCase(changeInventoryStock.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = state.inventory.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('admin/') &&
          action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.isError = false;
          state.message = '';
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('admin/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;