import reducer, {
  addBun,
  addIngredient,
  removeIngredientByIndex,
  moveIngredient,
  clearConstructor,
  orderBurger,
  TConstructorItem,
  ConstructorState
} from './constructorSlice';

describe('constructorSlice reducer', () => {
  const initialState: ConstructorState = {
    items: { bun: null, ingredients: [] },
    orderRequest: false,
    orderModalData: null,
    error: null
  };

  it('should handle addIngredient', () => {
    const ingredient = { _id: '123', name: 'Tomato', type: 'main' } as any;
    const nextState = reducer(initialState, addIngredient(ingredient));
    expect(nextState.items.ingredients).toEqual([ingredient]);
  });

  it('should handle removeIngredientByIndex', () => {
    const ingredients = [
      { _id: 'id1', name: 'A', type: 'main' } as any,
      { _id: 'id2', name: 'B', type: 'main' } as any
    ];
    const state = { ...initialState, items: { bun: null, ingredients } };
    const nextState = reducer(state, removeIngredientByIndex(0));
    expect(nextState.items.ingredients).toEqual([ingredients[1]]);
  });

  it('should handle moveIngredient', () => {
    const ingredients = [
      { _id: 'id1', name: 'A', type: 'main' } as any,
      { _id: 'id2', name: 'B', type: 'main' } as any,
      { _id: 'id3', name: 'C', type: 'main' } as any
    ];
    const state = {
      ...initialState,
      items: { bun: null, ingredients: [...ingredients] }
    };
    // move item at index 0 to index 2
    const nextState = reducer(
      state,
      moveIngredient({ fromIndex: 0, toIndex: 2 })
    );
    expect(nextState.items.ingredients).toEqual([
      ingredients[1],
      ingredients[2],
      ingredients[0]
    ]);
  });
});
