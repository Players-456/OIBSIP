import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import pizzaService from './pizzaService';

const initialFilters = {
  search: '',
  category: 'all',
  minPrice: '',
  maxPrice: '',
  isAvailable: 'true',
  sort: 'name',
};

const initialState = {
  pizzas: [],
  count: 0,
  filters: initialFilters,
  isLoading: false,
  isError: false,
  message: '',
};

export const fetchPizzas = createAsyncThunk('pizzas/fetchAll', async (filters, thunkAPI) => {
  try {
    return await pizzaService.getPizzas(filters);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const pizzaSlice = createSlice({
  name: 'pizzas',
  initialState,
  reducers: {
    setPizzaFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetPizzaFilters: (state) => {
      state.filters = initialFilters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPizzas.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchPizzas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pizzas = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(fetchPizzas.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { setPizzaFilters, resetPizzaFilters } = pizzaSlice.actions;
export default pizzaSlice.reducer;
