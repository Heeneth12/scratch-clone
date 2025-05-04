// store.js
import { configureStore } from '@reduxjs/toolkit';
import spritesReducer from './slices/spritesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    sprites: spritesReducer,
    ui: uiReducer
  }
});
