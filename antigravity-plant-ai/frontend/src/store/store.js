import { configureStore } from '@reduxjs/toolkit';
import plantReducer from './plantSlice';

export const store = configureStore({
    reducer: {
        plants: plantReducer,
    },
});
