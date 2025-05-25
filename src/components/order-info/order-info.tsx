import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import type { RootState } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import type { TIngredient, TOrder } from '@utils-types';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number?: string }>();
  const ingredients = useSelector(
    (state: RootState) => state.ingredients.items
  );
  const feedOrders = useSelector((state: RootState) => state.feed.orders);
  const modalOrder = useSelector(
    (state: RootState) => state.burgerConstructor.orderModalData
  );

  const orderData: TOrder | null = useMemo(() => {
    if (modalOrder) return modalOrder;
    if (!number) return null;
    const num = Number(number);
    return feedOrders.find((o: TOrder) => o.number === num) ?? null;
  }, [modalOrder, feedOrders, number]);

  const orderInfo = useMemo(() => {
    if (!orderData || ingredients.length === 0) return null;

    const date = new Date(orderData.createdAt);
    type TWithCount = TIngredient & { count: number };
    const countsMap: Record<string, TWithCount> = {};

    orderData.ingredients.forEach((id: string) => {
      const ing = ingredients.find((i) => i._id === id);
      if (ing) {
        if (!countsMap[id]) {
          countsMap[id] = { ...ing, count: 1 };
        } else {
          countsMap[id].count++;
        }
      }
    });

    const ingredientsInfo: Record<string, TWithCount> = Object.fromEntries(
      Object.values(countsMap).map((item) => [item._id, item])
    );

    const total = Object.values(ingredientsInfo).reduce(
      (sum: number, item) => sum + item.price * item.count,
      0
    );

    return { ...orderData, ingredientsInfo, total, date };
  }, [orderData, ingredients]);

  if (!orderInfo) return <Preloader />;

  return <OrderInfoUI orderInfo={orderInfo} />;
};

export default OrderInfo;
