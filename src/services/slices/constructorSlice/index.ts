import constructorReducer, {
  clearConstructor,
  addBun,
  addIngredient,
  removeIngredientByIndex,
  moveIngredient,
  orderBurger
} from './constructorSlice';

export {
  constructorReducer,
  clearConstructor,
  addBun,
  addIngredient,
  removeIngredientByIndex,
  moveIngredient,
  orderBurger
};

export type { ConstructorState, TConstructorItem } from './constructorSlice';
