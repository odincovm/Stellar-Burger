import { useEffect, useState } from 'react';
import { getOrdersApi } from '../../utils/burger-api';
import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';

export const ProfileOrders = () => {
  const [orders, setOrders] = useState<TOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrdersApi()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки заказов:', err);
        setLoading(false);
      });
  }, []);

  return loading ? (
    <p>Загрузка истории заказов...</p>
  ) : (
    <ProfileOrdersUI orders={orders} />
  );
};
