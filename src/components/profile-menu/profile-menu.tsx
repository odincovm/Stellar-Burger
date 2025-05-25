// src/components/profile-menu/profile-menu.tsx

import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from '../../services/store';
import { logoutThunk, clearUser } from '../../services/slices/userSlice';
import { ProfileMenuUI } from '@ui';

export const ProfileMenu: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // 1) вызов Thunk, который удалит токены на сервере
    dispatch(logoutThunk())
      .unwrap()
      .catch(() => {
        /* можно показать ошибку логаута */
      });
    // 2) очистить локальный стейт пользователя
    dispatch(clearUser());
    // 3) перейти на страницу логина
    navigate('/login', { replace: true });
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};

export default ProfileMenu;
