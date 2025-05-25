import React, { FC, SyntheticEvent, useState } from 'react';
import { useDispatch } from '../../services/store';
import { loginThunk } from '../../services/slices/userSlice';
import { LoginUI } from '@ui-pages';
import { useNavigate } from 'react-router-dom';

export const Login: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      navigate('/', { replace: true });
    } catch {}
  };

  return (
    <LoginUI
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
      errorText={undefined}
    />
  );
};
