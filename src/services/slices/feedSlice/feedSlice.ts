import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { TOrder } from '@utils-types';
import { getOrdersApi } from '../../../utils/burger-api';

export type FeedState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
  total: number;
  totalToday: number;
};

const initialState: FeedState = {
  orders: [],
  isLoading: false,
  error: null,
  total: 0,
  totalToday: 0
};

export const fetchFeed = createAsyncThunk<TOrder[], void>(
  'feed/fetchFeed',
  async () => {
    const orders = await getOrdersApi();
    return orders;
  }
);

const countTodayOrders = (orders: TOrder[]): number => {
  const today = new Date().toDateString();
  return orders.filter(
    (order) => new Date(order.createdAt).toDateString() === today
  ).length;
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearFeed(state) {
      state.orders = [];
      state.error = null;
      state.isLoading = false;
      state.total = 0;
      state.totalToday = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchFeed.fulfilled,
        (state, action: PayloadAction<TOrder[]>) => {
          state.isLoading = false;
          state.orders = action.payload;
          state.total = action.payload.length;
          state.totalToday = countTodayOrders(action.payload);
        }
      )
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Ошибка загрузки ленты';
      });
  }
});

export const { clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
