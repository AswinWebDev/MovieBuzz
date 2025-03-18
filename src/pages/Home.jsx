import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaStar, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import { addToFavorites, removeFromFavorites } from '../store/favoritesSlice';
import { searchMovies, clearSearchResults, setCurrentPage } from '../store/movieSlice';
import { colors, fonts, shadows, transitions } from '../styles/theme';

// Import lamp component
import { LampContainer } from '../components/ui/lamp';

function Home() {
  const dispatch = useDispatch();
  
  const { searchResults, status, error, totalResults, currentPage, searchQuery } = useSelector((state) => state.movies);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  // Calculate pagination info
  const resultsPerPage = 10; // OMDb API returns 10 results per page
  const totalPages = Math.ceil(totalResults / resultsPerPage);

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
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  // When searchQuery updates from redux, update local searchTerm
  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  // Load search results if we have a query but no results yet
  useEffect(() => {
    // If we have a search query in redux but no results, fetch the results
    if (searchQuery && !searchResults.length && status !== 'loading') {
      dispatch(searchMovies({ query: searchQuery, page: currentPage }));
    }
  }, [searchQuery, searchResults.length, currentPage, dispatch, status]);

  // Debounce search input
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      if (query.trim()) {
        // Reset to page 1 when search term changes
        dispatch(setCurrentPage(1));
        dispatch(searchMovies({ query, page: 1 }));
      } else {
        dispatch(clearSearchResults());
      }
    }, 500),
    [dispatch]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
      dispatch(searchMovies({ query: searchTerm, page: newPage }));
      // Scroll to top of results
      window.scrollTo({ top: document.querySelector('.movie-results-container')?.offsetTop - 20 || 0, behavior: 'smooth' });
    }
  };

  // Check if movie is in favorites
  const isInFavorites = (imdbID) => {
    return favorites.some(fav => fav.imdbID === imdbID);
  };

  // Toggle favorites
  const toggleFavorite = (movie) => {
    if (isInFavorites(movie.imdbID)) {
      dispatch(removeFromFavorites(movie.imdbID));
    } else {
      dispatch(addToFavorites(movie));
    }
  };

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: '2rem',
        gap: '1rem'
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            backgroundColor: theme.card,
            color: currentPage === 1 ? theme.border : theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
            transition: transitions.default
          }}
        >
          <FaChevronLeft style={{ marginRight: '4px' }} /> Prev
        </motion.button>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          fontSize: '0.9rem' 
        }}>
          Page <span style={{ 
            margin: '0 8px', 
            fontWeight: 'bold', 
            color: theme.primary 
          }}>{currentPage}</span> of <span style={{ 
            margin: '0 8px', 
            fontWeight: 'bold' 
          }}>{totalPages}</span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            backgroundColor: theme.card,
            color: currentPage === totalPages ? theme.border : theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
            transition: transitions.default
          }}
        >
          Next <FaChevronRight style={{ marginLeft: '4px' }} />
        </motion.button>
      </div>
    );
  };

  // Render movie results
  const renderMovieResults = () => {
    if (status === 'loading') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <div className="loader" style={{
            border: '4px solid rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #f59e0b',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            backgroundColor: theme.card,
            padding: '1.5rem',
            borderRadius: '12px',
            marginTop: '2rem',
            textAlign: 'center',
            color: '#e74c3c',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <p style={{ 
            fontSize: '1.1rem', 
            marginBottom: '0.5rem',
            wordBreak: 'break-word'
          }}>
            Error: {error || 'Something went wrong during search.'}
          </p>
          <p style={{ fontSize: '1rem' }}>
            Please try another search term or try again later.
          </p>
        </motion.div>
      );
    }

    if (status === 'succeeded' && searchResults.length === 0 && searchTerm) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '3rem',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '2rem'
          }}
        >
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '1.5rem', 
            opacity: 0.5 
          }}>
            🎬
          </div>
          <h2 style={{ 
            color: '#e2e8f0', 
            fontSize: '1.8rem', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            No movies found
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            marginBottom: '1rem', 
            opacity: 0.8,
            padding: '0 0.5rem',
            color: '#e2e8f0'
          }}>
            We couldn't find any movies matching "{searchTerm}".
          </p>
          <p style={{ 
            fontSize: '1rem', 
            opacity: 0.7,
            padding: '0 0.5rem',
            color: '#e2e8f0'
          }}>
            Try adjusting your search term or search for a different movie.
          </p>
        </motion.div>
      );
    }

    if (status === 'succeeded' && searchResults.length > 0) {
      return (
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <motion.h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                marginTop: '1rem',
                color: '#e2e8f0'
              }}
            >
              Search Results {totalResults > 0 && <span style={{ fontSize: '1rem', opacity: 0.7 }}>({totalResults} movies found)</span>}
            </motion.h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '1rem'
            }}
          >
            {searchResults.map((movie) => (
              <motion.div
                key={movie.imdbID}
                variants={itemVariants}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                whileHover={{
                  y: -5,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                  borderColor: '#f59e0b'
                }}
              >
                <Link 
                  to={`/movie/${movie.imdbID}`} 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    {movie.Poster && movie.Poster !== 'N/A' ? (
                      <img 
                        src={movie.Poster} 
                        alt={movie.Title}
                        style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        aspectRatio: '2/3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        color: '#e2e8f0',
                        fontSize: '3rem',
                        opacity: 0.5
                      }}>
                        🎬
                      </div>
                    )}
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(movie);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isInFavorites(movie.imdbID) ? '#e74c3c' : '#fff',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaHeart size={16} />
                    </motion.button>
                  </div>
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      marginBottom: '0.5rem',
                      color: '#e2e8f0',
                      lineHeight: 1.3
                    }}>
                      {movie.Title}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginTop: 'auto',
                      color: '#94a3b8',
                      fontSize: '0.875rem'
                    }}>
                      <span>{movie.Year}</span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#f1c40f'
                      }}>
                        <FaStar size={12} style={{ marginRight: '4px' }} />
                        {movie.imdbRating || 'N/A'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          {renderPagination()}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="home-container" style={{ 
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Hero Section with Lamp */}
      <div className="hero-section" style={{ 
        position: 'relative',
        width: '100%',
        height: '70vh',
        minHeight: '500px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Single Lamp Container */}
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}>
          <LampContainer>
            {/* Empty - just for background effect */}
          </LampContainer>
        </div>
        
        {/* Content Container */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '800px',
          padding: '0 20px'
        }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(to right, #f59e0b, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
          >
            MovieBuzz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              marginBottom: '2rem',
              color: '#e2e8f0',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}
          >
            Discover and explore your favorite movies with our simple and elegant movie search app.
          </motion.p>
          
          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              width: '100%',
              maxWidth: '500px',
              position: 'relative',
              margin: '0 auto'
            }}
          >
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: isInputFocused ? '2px solid #f59e0b' : '2px solid transparent',
              transition: 'all 0.3s ease'
            }}>
              <FaSearch style={{ 
                color: '#e2e8f0', 
                marginRight: '0.75rem',
                fontSize: '1.25rem'
              }} />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Search for movies..."
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e2e8f0',
                  fontSize: '1.125rem'
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Movie Results Section */}
      <div className="movie-results-container" style={{ 
        padding: '2rem 1rem', 
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 5,
        backgroundColor: '#0f172a'
      }}>
        {renderMovieResults()}
      </div>

      {/* Add a keyframes style for the loader animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Home;