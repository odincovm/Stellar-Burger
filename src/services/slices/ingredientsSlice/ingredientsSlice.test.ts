import { fetchIngredients } from './ingredientsSlice';
import { ingredientsReducer } from './ingredientsSlice';
import type { IngredientsState } from './ingredientsSlice';
import { TIngredient } from '@utils-types';

describe('ingredientsSlice reducer', () => {
  const initialState: IngredientsState = {
    items: [],
    isLoading: false,
    error: null,
    currentIngredient: null
  };

  it('should handle fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      isLoading: true,
      error: null
    });
  });

  it('should handle fetchIngredients.fulfilled', () => {
    const fakeIngredients: TIngredient[] = [
      {
        _id: '1',
        name: 'Bun',
        type: 'bun',
        proteins: 10,
        fat: 5,
        carbohydrates: 20,
        calories: 200,
        price: 100,
        image: '',
        image_large: '',
        image_mobile: ''
      },
      {
        _id: '2',
        name: 'Sauce',
        type: 'sauce',
        proteins: 1,
        fat: 2,
        carbohydrates: 3,
        calories: 50,
        price: 30,
        image: '',
        image_large: '',
        image_mobile: ''
      }
    ];
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: fakeIngredients
    };
    const state = ingredientsReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      isLoading: false,
      items: fakeIngredients
    });
  });

  it('should handle fetchIngredients.rejected', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: 'Network error' }
    };
    const state = ingredientsReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      isLoading: false,
      error: 'Network error'
    });
  });
});
