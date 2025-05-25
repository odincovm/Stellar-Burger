import feedReducer, { clearFeed, fetchFeed, FeedState } from './feedSlice';
import { TOrder } from '@utils-types';
import { getOrdersApi } from '../../../utils/burger-api';
import thunk from 'redux-thunk';
import { AnyAction } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';

jest.mock('../../../utils/burger-api');
const mockedGetOrdersApi = getOrdersApi as jest.MockedFunction<
  typeof getOrdersApi
>;

const middlewares = [thunk];

const fakeOrders: TOrder[] = [
  {
    _id: '1',
    number: 123,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'done',
    name: 'Test order 1',
    ingredients: []
  },
  {
    _id: '2',
    number: 124,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'done',
    name: 'Test order 2',
    ingredients: []
  }
];

describe('feedSlice', () => {
  let initialState: FeedState;

  beforeEach(() => {
    initialState = {
      orders: [],
      isLoading: false,
      error: null,
      total: 0,
      totalToday: 0
    };
  });

  it('should handle initial state', () => {
    expect(feedReducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it('should handle clearFeed', () => {
    const stateWithOrders: FeedState = {
      ...initialState,
      orders: fakeOrders,
      total: 2,
      totalToday: 2,
      isLoading: true,
      error: 'Some error'
    };

    const result = feedReducer(stateWithOrders, clearFeed());
    expect(result).toEqual(initialState);
  });

  it('should handle fetchFeed.pending', () => {
    const action = { type: fetchFeed.pending.type };
    const result = feedReducer(initialState, action);
    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should handle fetchFeed.fulfilled', () => {
    const action: PayloadAction<TOrder[]> = {
      type: fetchFeed.fulfilled.type,
      payload: fakeOrders
    };
    const result = feedReducer(initialState, action);
    expect(result.orders).toEqual(fakeOrders);
    expect(result.isLoading).toBe(false);
    expect(result.total).toBe(2);
    expect(result.totalToday).toBe(2); // потому что оба заказа созданы "сегодня"
  });

  it('should handle fetchFeed.rejected', () => {
    const action = {
      type: fetchFeed.rejected.type,
      error: { message: 'API error' }
    };
    const result = feedReducer(initialState, action);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe('API error');
  });
});
