import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer from './favoritesSlice';
import themeReducer from './themeSlice';
import movieReducer from './movieSlice';

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    theme: themeReducer,
    movies: movieReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});