import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaStar, FaSearch, FaChevronLeft, FaChevronRight, FaPlay, FaCalendarAlt, FaFilm, FaInfo, FaInfoCircle, FaArrowDown } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import { addToFavorites, removeFromFavorites } from '../store/favoritesSlice';
import { searchMovies, clearSearchResults, setCurrentPage } from '../store/movieSlice';
import { colors, fonts, shadows, transitions } from '../styles/theme';
import Navbar from '../components/Navbar';

// Import lamp component
import { LampContainer } from '../components/ui/lamp';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { searchResults, searchQuery, totalResults, status, error, currentPage } = useSelector((state) => state.movies);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasScrolledToResults, setHasScrolledToResults] = useState(false);
  const [pendingPageScroll, setPendingPageScroll] = useState(false);
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  // Create ref for the search results section
  const resultsRef = useRef(null);

  // Add scroll event listener to hide button when scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!showScrollButton) return; // Don't do anything if button is already hidden
      
      // If we've scrolled close to bottom, hide the button
      const bottomOfPage = Math.max(
        document.body.scrollHeight, 
        document.body.offsetHeight
      );
      const currentPosition = window.innerHeight + window.pageYOffset;
      
      // If we're within 300px of the bottom, hide the button
      if (currentPosition >= bottomOfPage - 300) {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showScrollButton]);

  // Handle auto-scroll for pagination
  useEffect(() => {
    if (pendingPageScroll && searchResults.length > 0 && status === 'succeeded') {
      // Auto-scroll for pagination, but don't show the button
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setPendingPageScroll(false);
    }
  }, [searchResults, status, pendingPageScroll]);

  // Function to scroll to results
  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Hide the button after scrolling
      setShowScrollButton(false);
      setHasScrolledToResults(true);
    }
  };

  // Track whether user has manually scrolled to results already
  useEffect(() => {
    if (searchResults.length > 0 && !hasScrolledToResults) {
      setShowScrollButton(true);
    }
  }, [searchResults.length, hasScrolledToResults]);

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

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Debounce search input
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      if (query.trim()) {
        // Reset to page 1 when search term changes
        dispatch(setCurrentPage(1));
        dispatch(searchMovies({ query, page: 1 }));
        
        // Always reset these for a new search
        setPendingPageScroll(false);
        setHasScrolledToResults(false);
        
        // Explicitly show the button for all new searches
        setShowScrollButton(true);
      } else {
        dispatch(clearSearchResults());
      }
    }, 500),
    [dispatch]
  );

  // Calculate pagination info
  const resultsPerPage = 10; // OMDb API returns 10 results per page
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Only update the page and fetch new results
      dispatch(setCurrentPage(newPage));
      dispatch(searchMovies({ query: searchTerm, page: newPage }));
      
      // For pagination, we want to auto-scroll but not show button
      setPendingPageScroll(true);
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

  // Function to navigate to movie details with explicit scroll
  const navigateToMovie = (movieId) => {
    // First scroll to top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Then navigate
    navigate(`/movie/${movieId}`);
  };

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Track when search status changes to loading
  useEffect(() => {
    if (status === 'loading' && pendingPageScroll) {
      // Add a class to the results container to indicate loading
      if (resultsRef.current) {
        resultsRef.current.classList.add('loading-results');
      }
    } else if (status === 'succeeded' && pendingPageScroll) {
      // Remove loading class when results arrive
      if (resultsRef.current) {
        resultsRef.current.classList.remove('loading-results');
      }
    }
  }, [status, pendingPageScroll]);

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div 
        className="pagination-container"
        style={{ 
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
          fontSize: '0.9rem',
          color: theme.text
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
            border: `4px solid ${isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.card,
            padding: '2.5rem',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: isDarkMode ? '0 4px 15px rgba(0, 0, 0, 0.1)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${theme.border}`,
            marginTop: '2rem'
          }}
        >
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '1.5rem',
            color: '#e74c3c'
          }}>
            ⚠️
          </div>
          <h2 style={{ 
            color: theme.text, 
            fontSize: '1.8rem', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            Search Error
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            marginBottom: '1rem', 
            color: isDarkMode ? '#ff6b6b' : '#e74c3c',
            padding: '0 0.5rem',
            maxWidth: '600px',
            margin: '0 auto 1rem',
            fontWeight: '500'
          }}>
            {error || 'Something went wrong during search.'}
          </p>
          <p style={{ 
            fontSize: '1rem', 
            opacity: 0.8,
            padding: '0 0.5rem',
            color: theme.text,
            maxWidth: '500px',
            margin: '0 auto 1.5rem'
          }}>
            Please try using a more specific search term or try again later.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSearchTerm('');
              dispatch(clearSearchResults());
            }}
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f5f5f5',
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            Clear Search
          </motion.button>
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
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.card,
            padding: '3rem',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: isDarkMode ? '0 4px 15px rgba(0, 0, 0, 0.1)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${theme.border}`,
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
            color: theme.text, 
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
            color: theme.text
          }}>
            We couldn't find any movies matching "{searchTerm}".
          </p>
          <p style={{ 
            fontSize: '1rem', 
            opacity: 0.7,
            padding: '0 0.5rem',
            color: theme.text
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
                color: theme.text
              }}
            >
              Search Results {totalResults > 0 && <span style={{ fontSize: '1rem', opacity: 0.7 }}>({totalResults} movies found)</span>}
            </motion.h2>
          </motion.div>

          <motion.div
            key={`search-results-page-${currentPage}`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
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
                variants={{
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
                }}
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  aspectRatio: '2/3',
                  perspective: '1000px'
                }}
                whileHover="hover"
                initial="initial"
              >
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: '0',
                    zIndex: 1,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: isDarkMode 
                      ? '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.5) inset, 0 0 20px rgba(34, 211, 238, 0.15)'
                      : '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 5px rgba(0, 0, 0, 0.1) inset, 0 0 20px rgba(112, 119, 161, 0.15)',
                    background: isDarkMode 
                      ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.7), rgba(15, 15, 15, 0.9))' 
                      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(240, 240, 240, 0.9))',
                    backdropFilter: 'blur(8px)',
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(0)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                  variants={{
                    initial: { 
                      transform: 'rotateY(0deg) translateZ(0)',
                    },
                    hover: { 
                      transform: 'rotateY(0deg) translateZ(10px)',
                      boxShadow: isDarkMode 
                        ? '0 20px 40px -5px rgba(0, 0, 0, 0.9), 0 0 5px rgba(0, 0, 0, 0.5) inset, 0 0 30px rgba(34, 211, 238, 0.25)'
                        : '0 20px 40px -5px rgba(0, 0, 0, 0.4), 0 0 5px rgba(0, 0, 0, 0.1) inset, 0 0 30px rgba(112, 119, 161, 0.25)',
                      transition: { duration: 0.4 }
                    }
                  }}
                >
                  <Link 
                    to={`/movie/${movie.imdbID}`} 
                    style={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      position: 'relative',
                      zIndex: 1
                    }}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default navigation
                      navigateToMovie(movie.imdbID);
                    }}
                  >
                    <div style={{ 
                      position: 'relative', 
                      overflow: 'hidden',
                      height: '100%',
                    }}>
                      {/* Poster Image or Placeholder */}
                      {movie.Poster && movie.Poster !== 'N/A' ? (
                        <motion.div
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative'
                          }}
                          variants={{
                            initial: { scale: 1 },
                            hover: { scale: 1.05, transition: { duration: 0.7 } }
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: isDarkMode 
                              ? 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)'
                              : 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%)',
                            zIndex: 10
                          }}/>
                          <img 
                            src={movie.Poster} 
                            alt={movie.Title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            loading="lazy"
                          />
                        </motion.div>
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isDarkMode 
                            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d3250 100%)' 
                            : 'linear-gradient(135deg, #f0f0f0 0%, #e6e9f0 100%)',
                          color: theme.text
                        }}>
                          <FaFilm size={48} style={{ opacity: 0.5 }} />
                        </div>
                      )}

                      {/* Movie Title Overlay */}
                      <motion.div 
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '1.5rem 1.2rem',
                          zIndex: 20
                        }}
                        variants={{
                          initial: { y: 0 },
                          hover: { y: 0 }
                        }}
                      >
                        <motion.h3 
                          style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 700, 
                            marginBottom: '0.5rem',
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            lineHeight: 1.3
                          }}
                          variants={{
                            initial: { opacity: 1 },
                            hover: { opacity: 1 }
                          }}
                        >
                          {movie.Title}
                        </motion.h3>
                        
                        <motion.div 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.85rem'
                          }}
                          variants={{
                            initial: { opacity: 0.7 },
                            hover: { opacity: 1 }
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <FaCalendarAlt size={12} />
                            <span>{movie.Year}</span>
                          </div>
                          
                          <span style={{ fontSize: '0.5rem' }}>•</span>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: movie.Type === 'movie' 
                              ? 'rgba(74, 222, 128, 0.2)' 
                              : 'rgba(139, 92, 246, 0.2)',
                            color: movie.Type === 'movie' 
                              ? '#4ade80' 
                              : '#8b5cf6'
                          }}>
                            <span style={{ textTransform: 'capitalize' }}>{movie.Type || 'N/A'}</span>
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Movie Info Badge */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          zIndex: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '50px',
                          padding: '6px 12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        variants={{
                          initial: { opacity: 0, x: -20 },
                          hover: { 
                            opacity: 1, 
                            x: 0,
                            transition: { 
                              duration: 0.3, 
                              delay: 0.15 
                            } 
                          }
                        }}
                      >
                        <FaInfoCircle size={12} color="#f59e0b" style={{ marginRight: '6px' }} />
                        <span style={{ 
                          fontSize: '0.7rem', 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: '500'
                        }}>
                          View Details
                        </span>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
                
                {/* Favorite Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(movie);
                  }}
                  variants={{
                    initial: { 
                      opacity: 0.9, 
                      scale: 1,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    },
                    hover: { 
                      opacity: 1, 
                      scale: 1.1, 
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                      transition: { 
                        duration: 0.2, 
                        delay: 0.1 
                      }
                    }
                  }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: isInFavorites(movie.imdbID) 
                      ? 'rgba(255, 86, 86, 0.9)' 
                      : 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    border: isInFavorites(movie.imdbID)
                      ? '1px solid rgba(255, 86, 86, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    zIndex: 30,
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={isInFavorites(movie.imdbID) ? "Remove from favorites" : "Add to favorites"}
                >
                  <FaHeart size={16} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
          
          {renderPagination()}
        </div>
      );
    }

    return null;
  };

  // Return to the original button styling
  const buttonStyle = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    color: theme.teal,
    border: 'none',
    borderRadius: '50%',
    width: '3.5rem',
    height: '3.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md,
    transition: transitions.default
  };

  return (
    <div style={{
      backgroundColor: isDarkMode ? '#0f172a' : theme.background,
      color: theme.text,
      minHeight: '100vh',
    }}>
      {/* Navigation Bar (already present in App.jsx) */}
      {/* <Navbar /> */}
      
      <div className="hero-container" style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Properly using LampContainer with content as children */}
        <LampContainer>
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            textAlign: 'center',
            padding: '0 1rem'
          }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 'bold',
                marginBottom: '0.5rem', 
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
                marginBottom: '1rem', 
                color: theme.text,
                maxWidth: '600px',
                margin: '0 auto 1rem', 
                textAlign: 'center'
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
                margin: '0 auto 0' 
              }}
            >
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '9999px',
                padding: '0.75rem 1.5rem',
                boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: isInputFocused ? '2px solid #f59e0b' : '2px solid transparent',
                transition: 'all 0.3s ease'
              }}>
                <FaSearch style={{ 
                  color: isDarkMode ? '#e2e8f0' : theme.text, 
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
                    color: theme.text,
                    fontSize: '1.125rem'
                  }}
                />
              </div>
            </motion.div>
          </div>
        </LampContainer>
      </div>

      {/* Movie Results Section - positioned below the lamp section */}
      <div 
        className="movie-results-container" 
        ref={resultsRef}
        style={{ 
          padding: '0 1rem 1rem',
          maxWidth: '1280px',
          margin: '0 auto', 
          position: 'relative',
          zIndex: 5,
          backgroundColor: isDarkMode ? '#0f172a' : theme.background
        }}
      >
        {renderMovieResults()}
      </div>

      {/* Scroll to results button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.3 }
            }}
            exit={{ 
              opacity: 0, 
              y: 20,
              transition: { duration: 0.2 }
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md
            }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToResults}
            style={buttonStyle}
          >
            <motion.div
              animate={{ 
                y: [0, 5, 0],
                transition: { 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut" 
                }
              }}
            >
              <FaArrowDown size={20} />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Add a keyframes style for the loader animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loading-results {
            position: relative;
          }
          
          .loading-results::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(to right, transparent, ${theme.teal}, transparent);
            animation: shimmer 1.5s infinite;
            z-index: 10;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
}

export default Home;