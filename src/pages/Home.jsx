import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaStar, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import { addToFavorites, removeFromFavorites } from '../store/favoritesSlice';
import { searchMovies, clearSearchResults, setCurrentPage } from '../store/movieSlice';
import { colors, fonts, shadows, transitions } from '../styles/theme';

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
      window.scrollTo({ top: document.querySelector('.container').offsetTop - 20, behavior: 'smooth' });
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

  return (
    <div style={{ 
      backgroundColor: theme.background,
      minHeight: '100vh',
      fontFamily: fonts.body,
      color: theme.text,
      padding: '0'
    }}>
      {/* Main Content Section */}
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        {/* Title and Description */}
        <motion.h1 
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            color: theme.primary,
            marginBottom: '1rem',
            fontFamily: fonts.heading
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Movie<motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ color: theme.accent }}
          >
            Buzz
          </motion.span>
        </motion.h1>
        
        <motion.p 
          style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: '600px',
            margin: '0 auto 1.5rem',
            opacity: 0.9,
            lineHeight: 1.6
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Discover your next favorite movie with our extensive collection. Search, explore, and save your favorites all in one place.
        </motion.p>
        
        {/* Search input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            maxWidth: '600px',
            width: '100%',
            margin: '0 auto',
            position: 'relative',
            padding: '0 16px'
          }}
        >
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            boxShadow: isInputFocused 
              ? isDarkMode ? '0 0 0 3px rgba(255, 255, 255, 0.2)' : '0 0 0 3px rgba(0, 0, 0, 0.1)'
              : isDarkMode ? shadows.dark.md : shadows.light.md,
            borderRadius: '24px',
            transition: transitions.default,
            backgroundColor: theme.card,
            border: `1px solid ${isInputFocused ? theme.accent : theme.border}`
          }}>
            <FaSearch style={{ 
              marginLeft: '16px', 
              color: isInputFocused ? theme.accent : theme.text,
              opacity: 0.7,
              transition: 'color 0.3s ease',
              fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem'
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
                padding: window.innerWidth <= 480 ? '12px 16px' : '16px',
                fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: theme.text,
                width: '100%',
                borderRadius: '24px'
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Results Section */}
      <div className="container" style={{ padding: '2rem 1rem' }}>
        {status === 'loading' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div className="loader" />
          </div>
        )}

        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              backgroundColor: theme.card,
              padding: window.innerWidth <= 480 ? '1rem' : '1.5rem',
              borderRadius: window.innerWidth <= 480 ? '10px' : '12px',
              marginTop: '2rem',
              textAlign: 'center',
              color: '#e74c3c',
              boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
              border: `1px solid ${theme.border}`
            }}
          >
            <p style={{ 
              fontSize: window.innerWidth <= 480 ? '1rem' : '1.1rem', 
              marginBottom: '0.5rem',
              wordBreak: 'break-word'
            }}>
              Error: {error || 'Something went wrong during search.'}
            </p>
            <p style={{ fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem' }}>
              Please try another search term or try again later.
            </p>
          </motion.div>
        )}

        {status === 'succeeded' && searchResults.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundColor: theme.card,
              padding: window.innerWidth <= 480 ? '2rem 1rem' : '3rem',
              borderRadius: window.innerWidth <= 480 ? '12px' : '16px',
              textAlign: 'center',
              boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md,
              border: `1px solid ${theme.border}`,
              marginTop: '2rem'
            }}
          >
            <div style={{ 
              fontSize: window.innerWidth <= 480 ? '3rem' : '4rem', 
              marginBottom: window.innerWidth <= 480 ? '1rem' : '1.5rem', 
              opacity: 0.5 
            }}>
              🎬
            </div>
            <h2 style={{ 
              color: theme.text, 
              fontSize: window.innerWidth <= 480 ? '1.5rem' : '1.8rem', 
              marginBottom: '1rem',
              fontFamily: fonts.heading
            }}>
              No movies found
            </h2>
            <p style={{ 
              fontSize: window.innerWidth <= 480 ? '1rem' : '1.1rem', 
              marginBottom: '1rem', 
              opacity: 0.8,
              padding: '0 0.5rem'
            }}>
              We couldn't find any movies matching "{searchTerm}".
            </p>
            <p style={{ 
              fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem', 
              opacity: 0.7,
              padding: '0 0.5rem'
            }}>
              Try adjusting your search term or search for a different movie.
            </p>
          </motion.div>
        )}

        {status === 'succeeded' && searchResults.length > 0 && (
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
                  fontFamily: fonts.heading,
                  color: theme.text
                }}
              >
                Search Results
              </motion.h2>
              
              {totalResults > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}
                >
                  Found {totalResults} result{totalResults !== 1 ? 's' : ''}
                </motion.p>
              )}
            </motion.div>
            
            <AnimatePresence>
              <motion.div
                className="grid-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
                  width: '100%'
                }}
              >
                {searchResults.map((movie) => (
                  <motion.div
                    key={movie.imdbID}
                    variants={itemVariants}
                    whileHover={{ 
                      y: window.innerWidth <= 480 ? -5 : -10,
                      transition: { duration: 0.3 }
                    }}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: window.innerWidth <= 480 ? '12px' : '16px',
                      overflow: 'hidden',
                      boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md,
                      border: `1px solid ${theme.border}`,
                      transition: transitions.default,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        toggleFavorite(movie);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: isInFavorites(movie.imdbID) 
                          ? 'rgba(255, 65, 65, 0.95)' 
                          : 'rgba(0, 0, 0, 0.7)',
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
                      aria-label={isInFavorites(movie.imdbID) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <FaHeart size={24} />
                    </motion.button>

                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <Link to={`/movie/${movie.imdbID}`} style={{ textDecoration: 'none' }}>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <img
                            src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}
                            alt={movie.Title}
                            style={{
                              width: '100%',
                              height: window.innerWidth <= 480 ? '250px' : window.innerWidth <= 768 ? '280px' : '320px',
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
                      
                      {/* Year Badge */}
                      <div style={{
                        position: 'absolute',
                        top: window.innerWidth <= 480 ? '8px' : '12px',
                        right: window.innerWidth <= 480 ? '8px' : '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        padding: window.innerWidth <= 480 ? '3px 6px' : '4px 8px',
                        borderRadius: '4px',
                        fontSize: window.innerWidth <= 480 ? '0.7rem' : '0.8rem',
                        fontWeight: '600',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {movie.Year}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: window.innerWidth <= 480 ? '0.75rem 1rem' : '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                      justifyContent: 'space-between'
                    }}>
                      <Link to={`/movie/${movie.imdbID}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{
                          margin: '0 0 0.75rem',
                          color: theme.text,
                          fontSize: window.innerWidth <= 480 ? '0.95rem' : '1.1rem',
                          fontWeight: '600',
                          fontFamily: fonts.heading,
                          lineHeight: '1.4'
                        }}>
                          {movie.Title}
                        </h3>
                      </Link>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem'
                      }}>
                        <span style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          color: theme.text,
                          fontSize: window.innerWidth <= 480 ? '0.8rem' : '0.9rem',
                          opacity: 0.8
                        }}>
                          <FaStar style={{ color: '#FFD700', marginRight: '5px' }} />
                          {movie.Type || 'movie'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            
            {/* Pagination */}
            {renderPagination()}
          </div>
        )}

        {/* Initial state - no search yet */}
        {!searchTerm && status !== 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{
              textAlign: 'center',
              padding: window.innerWidth <= 480 ? '2rem 1rem' : '3rem 1rem',
              marginTop: '2rem'
            }}
          >
            <div style={{ 
              fontSize: 'clamp(2rem, 5vw, 4rem)', 
              marginBottom: window.innerWidth <= 480 ? '1rem' : '1.5rem', 
              opacity: 0.5 
            }}>
              🎬
            </div>
            <h2 style={{ 
              color: theme.text, 
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', 
              marginBottom: window.innerWidth <= 480 ? '0.75rem' : '1rem',
              fontFamily: fonts.heading,
              padding: '0 0.5rem'
            }}>
              Ready to explore movies?
            </h2>
            <p style={{ 
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', 
              maxWidth: '600px', 
              margin: '0 auto',
              opacity: 0.8,
              padding: '0 1rem'
            }}>
              Search for your favorite movies above to get started
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Home;