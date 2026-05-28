import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import orderService from './orderService';

const getErrorMessage = (error) => (
  (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
);

const initialState = {
  orders: [],
  currentOrder: null,
  paymentOrder: null,
  isLoading: false,
  isPaying: false,
  isError: false,
  isSuccess: false,
  message: '',
};

export const createOrder = createAsyncThunk('orders/create', async (orderData, thunkAPI) => {
  try {
    return await orderService.createOrder(orderData);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const createPaymentOrder = createAsyncThunk('orders/createPayment', async (orderId, thunkAPI) => {
  try {
    return await orderService.createPaymentOrder(orderId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const verifyPayment = createAsyncThunk('orders/verifyPayment', async ({ orderId, paymentData }, thunkAPI) => {
  try {
    return await orderService.verifyPayment(orderId, paymentData);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const markPaymentFailed = createAsyncThunk('orders/paymentFailed', async (orderId, thunkAPI) => {
  try {
    return await orderService.markPaymentFailed(orderId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (_, thunkAPI) => {
  try {
    return await orderService.getMyOrders();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (orderId, thunkAPI) => {
  try {
    return await orderService.getOrderById(orderId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createPaymentOrder.pending, (state) => {
        state.isPaying = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.isPaying = false;
        state.paymentOrder = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.isPaying = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.isPaying = true;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isPaying = false;
        state.currentOrder = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isPaying = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markPaymentFailed.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
