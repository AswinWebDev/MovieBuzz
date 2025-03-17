import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import axios from 'axios';
import { addToFavorites, removeFromFavorites } from '../store/favoritesSlice';
import { colors } from '../styles/theme';

function Home() {
  const [search, setSearch] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  const searchMovies = useCallback(async (query) => {
    if (!query) {
      setMovies([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`https://www.omdbapi.com/?apikey=4abf06c1&s=${query}`);
      if (response.data.Response === 'True') {
        setMovies(response.data.Search);
      } else {
        setError(response.data.Error);
        setMovies([]);
      }
    } catch (err) {
      setError('Failed to fetch movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((query) => searchMovies(query), 500),
    [searchMovies]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    debouncedSearch(query);
  };

  const isFavorite = useCallback((movieId) => {
    return favorites.some(movie => movie.imdbID === movieId);
  }, [favorites]);

  const toggleFavorite = (movie) => {
    if (isFavorite(movie.imdbID)) {
      dispatch(removeFromFavorites(movie.imdbID));
    } else {
      dispatch(addToFavorites(movie));
    }
  };

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '600px',
          margin: '0 auto 2rem',
          position: 'relative'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '50px',
          padding: '0.5rem 1.5rem',
          boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <FaSearch style={{ color: theme.text, marginRight: '1rem' }} />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search for movies..."
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: theme.text,
              fontSize: '1rem',
              padding: '0.5rem 0',
              outline: 'none'
            }}
          />
        </div>
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: theme.text
          }}
        >
          Loading...
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: theme.accent
          }}
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '2rem',
            padding: '1rem'
          }}
        >
          {movies.map((movie) => (
            <motion.div
              key={movie.imdbID}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: theme.card,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Link to={`/movie/${movie.imdbID}`} style={{ textDecoration: 'none' }}>
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.Title}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover'
                  }}
                />
              </Link>
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  margin: '0 0 0.5rem',
                  color: theme.text,
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {movie.Title}
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: theme.text, fontSize: '0.9rem' }}>
                    {movie.Year}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(movie)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isFavorite(movie.imdbID) ? '#ff6b6b' : theme.text,
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1.2rem'
                    }}
                  >
                    <FaHeart />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Home;