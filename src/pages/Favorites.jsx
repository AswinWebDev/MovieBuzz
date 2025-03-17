import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { removeFromFavorites } from '../store/favoritesSlice';
import { colors } from '../styles/theme';

function Favorites() {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: '2rem 1rem' }}
    >
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: theme.text,
          textDecoration: 'none',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}
      >
        <FaArrowLeft style={{ marginRight: '0.5rem' }} /> Back to Search
      </Link>

      <h1 style={{
        color: theme.text,
        fontSize: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        My Favorite Movies
      </h1>

      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: theme.text
          }}
        >
          No favorite movies yet. Start adding some!
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '2rem',
              padding: '1rem'
            }}
          >
            {favorites.map((movie) => (
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
                      onClick={() => dispatch(removeFromFavorites(movie.imdbID))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ff6b6b',
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
      )}
    </motion.div>
  );
}

export default Favorites;