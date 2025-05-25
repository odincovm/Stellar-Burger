/* eslint-disable prettier/prettier */
import { forwardRef, useMemo } from 'react';
import { TIngredientsCategoryProps } from './type';
import { IngredientsCategoryUI } from '../ui/ingredients-category';
import { useSelector } from '../../services/store';

export const IngredientsCategory = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryProps
>(({ title, titleRef, ingredients }, ref) => {
  // 1) Надёжно вытягиваем items из store, если вдруг state.burgerConstructor или items не инициализированы
  const constructorItems = useSelector(
    (state) => state.burgerConstructor?.items
  ) ?? { bun: null, ingredients: [] };

  // 2) Считаем счётчики на основании безопасного фоллбэка
  const ingredientsCounters = useMemo(() => {
    const { bun, ingredients: filling } = constructorItems;
    const counters: Record<string, number> = {};
    for (const ing of filling) {
      counters[ing._id] = (counters[ing._id] || 0) + 1;
    }
    if (bun?._id) counters[bun._id] = 2;
    return counters;
  }, [constructorItems]);

  return (
    <IngredientsCategoryUI
      title={title}
      titleRef={titleRef}
      ingredients={ingredients}
      ingredientsCounters={ingredientsCounters}
      ref={ref}
    />
  );
});
