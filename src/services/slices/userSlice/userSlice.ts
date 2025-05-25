import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  registerUserApi,
  loginUserApi,
  getUserApi,
  updateUserApi,
  logoutApi,
  refreshToken
} from '../../../utils/burger-api';
import { setCookie } from '../../../utils/cookie';

// ← эти типы берем из utils/types
import { TRegisterData, TUser } from '../../../utils/types';
// ← а TLoginData приходит из burger‑api
import { TLoginData } from '../../../utils/burger-api';

interface UserState {
  user: TUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checked: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  checked: false
};

// Thunk: регистрация
export const registerThunk = createAsyncThunk<
  TUser,
  TRegisterData,
  { rejectValue: string }
>('user/register', async (data, { rejectWithValue }) => {
  try {
    const res = await registerUserApi(data);
    setCookie('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    return res.user;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

// Thunk: логин
export const loginThunk = createAsyncThunk<
  TUser,
  TLoginData,
  { rejectValue: string }
>('user/login', async (data, { rejectWithValue }) => {
  try {
    const res = await loginUserApi(data);
    setCookie('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    return res.user;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

// Thunk: получить профиль
export const fetchUserThunk = createAsyncThunk<
  TUser,
  void,
  { rejectValue: string }
>('user/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await getUserApi();
    return res.user;
  } catch (err: any) {
    if (err.message === 'jwt expired') {
      await refreshToken();
      const res2 = await getUserApi();
      return res2.user;
    }
    return rejectWithValue(err.message || 'Fetch user failed');
  }
});

// Thunk: обновить профиль
export const updateUserThunk = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  { rejectValue: string }
>('user/update', async (data, { rejectWithValue }) => {
  try {
    const res = await updateUserApi(data);
    return res.user;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Update user failed');
  }
});

// Thunk: логаут
export const logoutThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('user/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
    document.cookie =
      'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('refreshToken');
  } catch (err: any) {
    return rejectWithValue(err.message || 'Logout failed');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // регистрация
      .addCase(registerThunk.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(registerThunk.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload;
        s.isAuthenticated = true;
      })
      .addCase(registerThunk.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload!;
      })
      // логин
      .addCase(loginThunk.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload;
        s.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload!;
      })
      // fetch
      .addCase(fetchUserThunk.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(fetchUserThunk.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload;
        s.isAuthenticated = true;
        s.checked = true;
      })
      .addCase(fetchUserThunk.rejected, (s) => {
        s.isLoading = false;
        s.checked = true;
      })
      // update
      .addCase(updateUserThunk.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload;
      })
      .addCase(updateUserThunk.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload!;
      })
      // logout
      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null;
        s.isAuthenticated = false;
      });
  }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
