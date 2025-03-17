import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_KEY = '4abf06c1';

// Async thunk for searching movies
export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async (query, { rejectWithValue }) => {
    try {
      if (!query) return [];
      const response = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
      if (response.data.Response === 'True') {
        return response.data.Search;
      } else {
        return rejectWithValue(response.data.Error || 'No results found');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch movies');
    }
  }
);

// Async thunk for fetching movie details
export const fetchMovieDetails = createAsyncThunk(
  'movies/fetchMovieDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
      if (response.data.Response === 'True') {
        return response.data;
      } else {
        return rejectWithValue(response.data.Error || 'Movie details not found');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch movie details');
    }
  }
);

const initialState = {
  searchResults: [],
  currentMovie: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.status = 'idle';
      state.error = null;
    },
    clearCurrentMovie: (state) => {
      state.currentMovie = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Search Movies
      .addCase(searchMovies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.searchResults = [];
      })
      // Fetch Movie Details
      .addCase(fetchMovieDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.currentMovie = null;
      });
  }
});

export const { clearSearchResults, clearCurrentMovie } = movieSlice.actions;
export default movieSlice.reducer;
