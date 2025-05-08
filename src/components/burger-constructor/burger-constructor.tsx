import React, { FC, useMemo } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import type { RootState } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import {
  orderBurger,
  clearConstructor
} from '../../services/slices/constructorSlice';
import { BurgerConstructorUI } from '@ui';
import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1) Забираем из стора нужные поля, и дефолты
  const {
    items: constructorItems,
    orderRequest,
    orderModalData
  } = useSelector((state: RootState) => {
    const slice = state.burgerConstructor;
    return {
      items: slice?.items ?? { bun: null, ingredients: [] },
      orderRequest: slice?.orderRequest ?? false,
      orderModalData: slice?.orderModalData ?? null
    };
  });
  // Берём флаг авторизации, защищаясь от null/undefined
  const isAuth = Boolean(
    useSelector((state: RootState) => state.user.user?.email)
  );

  // 2) Обработчик «Оформить заказ»
  const onOrderClick = () => {
    // если не авторизованы — редирект на логин
    if (!isAuth) {
      navigate('/login', { replace: true });
      return;
    }

    const { bun, ingredients } = constructorItems;
    if (!bun || orderRequest) return;

    const ids = [bun._id, ...ingredients.map((i) => i._id), bun._id];
    dispatch(orderBurger(ids));
  };

  // 3) Закрытие модалки
  const closeOrderModal = () => {
    dispatch(clearConstructor());
  };

  // 4) Вычисление цены
  const price = useMemo(() => {
    const { bun, ingredients } = constructorItems;
    const bunTotal = bun ? bun.price * 2 : 0;
    const ingTotal = ingredients.reduce((sum, i) => sum + i.price, 0);
    return bunTotal + ingTotal;
  }, [constructorItems]);

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};

export default BurgerConstructor;
