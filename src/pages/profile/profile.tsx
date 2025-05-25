import React, { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { ProfileUI } from '@ui-pages';
import type { RootState } from '../../services/store';
import { updateUserThunk } from '../../services/slices/userSlice';

export const Profile: FC = () => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.user);

  if (!user) {
    return null;
  }

  // Локальное состояние формы
  const [formValue, setFormValue] = useState({
    name: user.name,
    email: user.email,
    password: '' // Изначально пустое значение пароля
  });

  // Синхронизация formValue с user, если user изменился
  useEffect(() => {
    setFormValue({
      name: user.name,
      email: user.email,
      password: '' // Не заполняем пароль автоматически
    });
  }, [user]);

  // Проверка, были ли изменения
  const isFormChanged =
    formValue.name !== user.name ||
    formValue.email !== user.email ||
    formValue.password !== '';

  // Отправка обновлённого профиля
  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (isFormChanged) {
      dispatch(updateUserThunk(formValue));
    }
  };

  // Сброс изменений
  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user.name,
      email: user.email,
      password: ''
    });
  };

  // Обработчик ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValue((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};

export default Profile;
