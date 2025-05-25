import reducer, {
  clearUser,
  registerThunk,
  loginThunk,
  fetchUserThunk,
  updateUserThunk,
  logoutThunk
} from './userSlice';
import { TUser } from '../../../utils/types';

const userMock: TUser = {
  email: 'test@example.com',
  name: 'Test User'
};

describe('userSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    checked: false
  };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle clearUser', () => {
    const state = {
      ...initialState,
      user: userMock,
      isAuthenticated: true
    };

    expect(reducer(state, clearUser())).toEqual({
      ...state,
      user: null,
      isAuthenticated: false
    });
  });

  // REGISTER
  it('should handle registerThunk.pending', () => {
    const action = { type: registerThunk.pending.type };
    const state = reducer(initialState, action);
    expect(state).toEqual({ ...initialState, isLoading: true, error: null });
  });

  it('should handle registerThunk.fulfilled', () => {
    const action = { type: registerThunk.fulfilled.type, payload: userMock };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      user: userMock,
      isAuthenticated: true,
      isLoading: false
    });
  });

  it('should handle registerThunk.rejected', () => {
    const action = { type: registerThunk.rejected.type, payload: 'Error' };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      isLoading: false,
      error: 'Error'
    });
  });

  // LOGIN
  it('should handle loginThunk.fulfilled', () => {
    const action = { type: loginThunk.fulfilled.type, payload: userMock };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      user: userMock,
      isAuthenticated: true,
      isLoading: false
    });
  });

  // FETCH USER
  it('should handle fetchUserThunk.fulfilled', () => {
    const action = { type: fetchUserThunk.fulfilled.type, payload: userMock };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      user: userMock,
      isAuthenticated: true,
      checked: true,
      isLoading: false
    });
  });

  it('should handle fetchUserThunk.rejected', () => {
    const action = { type: fetchUserThunk.rejected.type };
    const state = reducer(initialState, action);
    expect(state).toEqual({ ...initialState, checked: true, isLoading: false });
  });

  // UPDATE
  it('should handle updateUserThunk.fulfilled', () => {
    const action = { type: updateUserThunk.fulfilled.type, payload: userMock };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      user: userMock,
      isLoading: false
    });
  });

  it('should handle updateUserThunk.rejected', () => {
    const action = {
      type: updateUserThunk.rejected.type,
      payload: 'Update failed'
    };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      error: 'Update failed',
      isLoading: false
    });
  });

  // LOGOUT
  it('should handle logoutThunk.fulfilled', () => {
    const action = { type: logoutThunk.fulfilled.type };
    const state = reducer(
      { ...initialState, user: userMock, isAuthenticated: true },
      action
    );
    expect(state).toEqual({
      ...initialState,
      user: null,
      isAuthenticated: false
    });
  });
});
