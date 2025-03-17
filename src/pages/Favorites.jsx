import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { removeFromFavorites } from '../store/favoritesSlice';
import { FaHeart, FaTrash, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { colors, fonts, shadows, transitions } from '../styles/theme';

function Favorites() {
  const [searchTerm, setSearchTerm] = useState('');
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const dispatch = useDispatch();
  
  const handleRemoveFavorite = (id) => {
    dispatch(removeFromFavorites(id));
  };

  const filteredFavorites = favorites.filter(
    movie => movie.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.background,
      color: theme.text,
      fontFamily: fonts.body,
      padding: '2rem 0'
    }}>
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '2rem', textAlign: 'center' }}
        >
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            color: theme.text,
            fontFamily: fonts.heading
          }}>
            Your Favorites
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.1rem)', 
            opacity: 0.8,
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Keep track of all your favorite movies in one place
          </p>
        </motion.div>

        {/* Search and controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ 
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center'
          }}
          className="search-container"
        >
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '500px'
          }}>
            <FaSearch style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              fontSize: '1rem'
            }} />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                backgroundColor: theme.card,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: '50px',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
                transition: transitions.default
              }}
            />
          </div>
        </motion.div>

        {/* Favorites list or empty state */}
        {favorites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              backgroundColor: theme.card,
              borderRadius: '16px',
              boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md,
              border: `1px solid ${theme.border}`,
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '1.5rem',
              color: theme.accent,
              opacity: 0.5
            }}>
              <FaHeart />
            </div>
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1rem',
              fontFamily: fonts.heading
            }}>
              No favorites yet
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              marginBottom: '1.5rem', 
              opacity: 0.8,
              maxWidth: '400px',
              margin: '0 auto 1.5rem'
            }}>
              Start exploring movies and add them to your favorites!
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: theme.accent,
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
                transition: transitions.default
              }}
            >
              <FaSearch />
              Explore Movies
            </Link>
          </motion.div>
        ) : filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: theme.card,
              borderRadius: '16px',
              boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md,
              border: `1px solid ${theme.border}`,
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1rem',
              fontFamily: fonts.heading
            }}>
              No matches found
            </h2>
            <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
              We couldn't find any favorites matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: theme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
                transition: transitions.default
              }}
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
            className="favorites-grid"
          >
            <AnimatePresence>
              {filteredFavorites.map(movie => (
                <motion.div
                  key={movie.imdbID}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md,
                    border: `1px solid ${theme.border}`,
                    transition: transitions.default,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                  className="favorite-card"
                >
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent link navigation
                      e.stopPropagation(); // Stop event propagation
                      handleRemoveFavorite(movie.imdbID);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255, 65, 65, 0.95)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(4px)',
                      zIndex: 100,
                      transition: 'all 0.2s ease',
                      transform: 'translateZ(50px)',
                      fontSize: '1.2rem'
                    }}
                    aria-label="Remove from favorites"
                  >
                    <FaTrash size={24} />
                  </motion.button>

                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <Link to={`/movie/${movie.imdbID}`} style={{ textDecoration: 'none' }}>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '250px', overflow: 'hidden' }}
                      >
                        <img
                          src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}
                          alt={movie.Title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                      </motion.div>
                    </Link>
                  </div>
                  
                  <div style={{ 
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        lineHeight: '1.3',
                        fontFamily: fonts.heading
                      }}>
                        {movie.Title}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        opacity: 0.7,
                        marginBottom: '0.75rem'
                      }}>
                        <span>{movie.Year}</span>
                        <span style={{ textTransform: 'capitalize' }}>{movie.Type}</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/movie/${movie.imdbID}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem',
                        marginTop: '0.5rem',
                        backgroundColor: theme.accent,
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '500',
                        fontSize: '0.9rem',
                        transition: transitions.default
                      }}
                    >
                      <FaInfoCircle size={14} />
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {/* Responsive styles */}
      <style jsx>{`
        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        @media (max-width: 992px) {
          .favorites-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          }
        }
        
        @media (max-width: 768px) {
          .favorites-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.25rem;
          }
        }
        
        @media (max-width: 576px) {
          .container {
            padding: 0 0.75rem;
          }
          
          .favorites-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
          }
          
          .favorite-card h3 {
            font-size: 0.95rem;
          }
          
          .search-container {
            padding: 0 0.5rem;
          }
        }
        
        @media (max-width: 420px) {
          .favorites-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.75rem;
          }
          
          .favorite-card {
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .favorite-card h3 {
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 320px) {
          .container {
            padding: 0 0.5rem;
          }
          
          .favorites-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 0.5rem;
          }
          
          .favorite-card h3 {
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
          }
          
          .favorite-card div {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Favorites;