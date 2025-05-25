import rootReducer from './index';

describe('rootReducer', () => {
  it('should initialize state correctly', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });

    expect(initialState).toHaveProperty('burgerConstructor');
    expect(initialState).toHaveProperty('user');

    expect(initialState.burgerConstructor).toEqual({
      items: { bun: null, ingredients: [] },
      orderRequest: false,
      orderModalData: null,
      error: null
    });

    expect(initialState.user).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      checked: false
    });
  });
});
