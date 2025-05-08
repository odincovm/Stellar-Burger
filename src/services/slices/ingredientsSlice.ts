import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TIngredient } from '@utils-types';

type IngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
  currentIngredient: TIngredient | null;
};

const initialState: IngredientsState = {
  items: [],
  isLoading: false,
  error: null,
  currentIngredient: null
};

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async () => {
    const res = await fetch(
      'https://norma.nomoreparties.space/api/ingredients'
    );
    const data = await res.json();
    return data.data as TIngredient[];
  }
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки';
      });
  }
});

export default ingredientsSlice.reducer;
