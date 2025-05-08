// src/services/slices/constructorSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder, TIngredient } from '@utils-types';

type TConstructorItem = {
  bun: TIngredient | null;
  ingredients: TIngredient[];
};

type ConstructorState = {
  items: TConstructorItem;
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

const initialState: ConstructorState = {
  items: { bun: null, ingredients: [] },
  orderRequest: false,
  orderModalData: null,
  error: null
};

export const orderBurger = createAsyncThunk<TOrder, string[]>(
  'burgerConstructor/orderBurger',
  async (ids) => {
    const res = await orderBurgerApi(ids);
    return res.order;
  }
);

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    clearConstructor(state) {
      state.items = { bun: null, ingredients: [] };
      state.orderModalData = null;
      state.error = null;
    },
    addBun(state, action: PayloadAction<TIngredient>) {
      state.items.bun = action.payload;
    },
    addIngredient(state, action: PayloadAction<TIngredient>) {
      state.items.ingredients.push(action.payload);
    },
    removeIngredientByIndex(state, action: PayloadAction<number>) {
      state.items.ingredients.splice(action.payload, 1);
    },
    // ← Новый редьюсер: перемещение внутри массива по индексам
    moveIngredient(
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) {
      const { fromIndex, toIndex } = action.payload;
      const list = state.items.ingredients;
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= list.length ||
        toIndex >= list.length
      ) {
        return;
      }
      const [item] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, item);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(orderBurger.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(orderBurger.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message ?? 'Ошибка заказа';
      });
  }
});

export const {
  clearConstructor,
  addBun,
  addIngredient,
  removeIngredientByIndex,
  moveIngredient
} = constructorSlice.actions;

export default constructorSlice.reducer;
