import React, { FC, SyntheticEvent, useState } from 'react';
import { useDispatch } from '../../services/store';
import { registerThunk } from '../../services/slices/userSlice';
import { RegisterUI } from '@ui-pages';
import { useNavigate } from 'react-router-dom';

export const Register: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        registerThunk({
          name: userName,
          email,
          password
        })
      ).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      // Ошибка уже отображается в RegisterUI через errorText
    }
  };

  return (
    <RegisterUI
      errorText={undefined} // можно заменить на значение из стора
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
