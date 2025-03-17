import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    }
  }
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;