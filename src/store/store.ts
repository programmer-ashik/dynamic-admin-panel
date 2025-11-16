import { configureStore } from '@reduxjs/toolkit';
import globalReducer from './features/global/globalSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    global: globalReducer,
  },
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});

// RootState/type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
