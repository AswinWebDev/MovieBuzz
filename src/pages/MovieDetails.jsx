import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaHeart, FaArrowLeft, FaStar, FaCalendarAlt, FaClock, FaGlobe } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { addToFavorites, removeFromFavorites } from '../store/favoritesSlice';
import { fetchMovieDetails, clearCurrentMovie } from '../store/movieSlice';
import { colors, fonts, shadows, transitions } from '../styles/theme';

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const dispatch = useDispatch();
  const { currentMovie, status, error } = useSelector((state) => state.movies);
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
  
  // Add state to track screen width
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Update screen width on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch movie details on component mount
  useEffect(() => {
    dispatch(fetchMovieDetails(id));
    
    // Clean up when component unmounts
    return () => {
      dispatch(clearCurrentMovie());
    };
  }, [dispatch, id]);

  const isFavorite = useCallback((movieId) => {
    return favorites.some(movie => movie.imdbID === movieId);
  }, [favorites]);

  const toggleFavorite = () => {
    if (!currentMovie) return;
    
    if (isFavorite(currentMovie.imdbID)) {
      dispatch(removeFromFavorites(currentMovie.imdbID));
    } else {
      dispatch(addToFavorites({
        imdbID: currentMovie.imdbID,
        Title: currentMovie.Title,
        Year: currentMovie.Year,
        Poster: currentMovie.Poster,
        Type: currentMovie.Type
      }));
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        backgroundColor: theme.background,
        fontFamily: fonts.body
      }}>
        <div className="loader" style={{
          width: '48px',
          height: '48px',
          border: `5px solid ${theme.border}`,
          borderBottomColor: theme.accent,
          borderRadius: '50%',
          display: 'inline-block',
          boxSizing: 'border-box',
          animation: 'rotation 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (status === 'failed' && error) {
    return (
      <div style={{
        padding: '3rem 1rem',
        backgroundColor: theme.background,
        minHeight: '100vh',
        fontFamily: fonts.body,
        color: theme.text
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '2rem',
              backgroundColor: isDarkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}
          >
            <h2 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Error</h2>
            <p style={{ fontSize: '1.1rem' }}>{error}</p>
          </motion.div>
          
          <div style={{
            display: 'flex',
            justifyContent: screenWidth <= 768 ? 'center' : 'flex-start', 
            padding: screenWidth <= 480 ? '1.5rem 0.75rem' : '2rem 1rem',
            marginTop: screenWidth <= 480 ? '1rem' : '2rem'
          }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: screenWidth <= 480 ? '0.6rem 1.2rem' : '0.75rem 1.5rem',
                backgroundColor: theme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: screenWidth <= 480 ? '0.9rem' : '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md,
                fontFamily: fonts.body
              }}
            >
              <FaArrowLeft /> Back to Search
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentMovie) return null;

  // Parse ratings to display them nicely
  const imdbRating = currentMovie.Ratings?.find(rating => rating.Source === "Internet Movie Database")?.Value || "N/A";
  const rottenRating = currentMovie.Ratings?.find(rating => rating.Source === "Rotten Tomatoes")?.Value || "N/A";
  const metaRating = currentMovie.Ratings?.find(rating => rating.Source === "Metacritic")?.Value || "N/A";

  return (
    <div style={{
      padding: '0',
      backgroundColor: theme.background,
      minHeight: '100vh',
      fontFamily: fonts.body,
      color: theme.text
    }}>
      {/* Hero Section with Backdrop */}
      <div style={{
        position: 'relative',
        height: '70vh',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), ${theme.background}), url(${currentMovie.Poster !== 'N/A' ? currentMovie.Poster : 'https://via.placeholder.com/1200x600?text=No+Backdrop'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: `linear-gradient(to bottom, transparent, ${theme.background})`,
          height: '50%'
        }} />
      </div>

      {/* Content container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: screenWidth <= 480 ? '0 0.75rem' : '0 1rem',
        transform: screenWidth <= 768 ? 'translateY(-100px)' : 'translateY(-150px)',
        position: 'relative',
        zIndex: 2
      }} className="movie-details-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: screenWidth <= 768 ? '1fr' : '300px 1fr',
          gap: screenWidth <= 480 ? '1.5rem' : '2rem',
        }} className="movie-details-grid">
          {/* Movie Poster */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{
              gridColumn: screenWidth <= 768 ? '1 / 2' : '1 / 2',
              alignSelf: 'start',
              maxWidth: screenWidth <= 768 ? '250px' : '300px',
              margin: screenWidth <= 768 ? '0 auto' : 'inherit'
            }}
            className="movie-poster-container"
          >
            <div style={{
              position: 'relative',
              boxShadow: isDarkMode ? shadows.dark.lg : shadows.light.lg,
              borderRadius: screenWidth <= 480 ? '10px' : '12px',
              overflow: 'hidden'
            }}>
              <img
                src={currentMovie.Poster !== 'N/A' ? currentMovie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                alt={currentMovie.Title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: screenWidth <= 480 ? '10px' : '12px'
                }}
              />
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFavorite}
                style={{
                  position: 'absolute',
                  top: screenWidth <= 480 ? '8px' : '12px',
                  right: screenWidth <= 480 ? '8px' : '12px',
                  backgroundColor: isFavorite(currentMovie.imdbID) ? 'rgba(255,107,107,0.9)' : 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: screenWidth <= 480 ? '40px' : '50px',
                  height: screenWidth <= 480 ? '40px' : '50px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(4px)',
                  fontSize: screenWidth <= 480 ? '1rem' : '1.2rem'
                }}
              >
                <FaHeart />
              </motion.button>
            </div>
          </motion.div>

          {/* Movie details */}
          <div style={{
            gridColumn: screenWidth <= 768 ? '1 / 2' : '2 / 3',
            textAlign: screenWidth <= 768 ? 'center' : 'left'
          }} className="movie-details-content">
            <div style={{ marginBottom: screenWidth <= 480 ? '1.5rem' : '2rem' }}>
              <h1 style={{
                fontSize: screenWidth <= 480 ? '1.8rem' : screenWidth <= 768 ? '2.5rem' : '3rem',
                fontWeight: '700',
                marginBottom: screenWidth <= 480 ? '0.75rem' : '1rem',
                lineHeight: '1.2',
                fontFamily: fonts.heading
              }} className="movie-title">
                {currentMovie.Title}
              </h1>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: screenWidth <= 480 ? '1rem' : '1.5rem',
                marginBottom: screenWidth <= 480 ? '1rem' : '1.5rem',
                color: theme.text,
                opacity: 0.8,
                justifyContent: screenWidth <= 768 ? 'center' : 'flex-start',
                fontSize: screenWidth <= 480 ? '0.9rem' : '1rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCalendarAlt /> {currentMovie.Year}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaClock /> {currentMovie.Runtime}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaGlobe /> {currentMovie.Language}
                </span>
              </div>
              
              {/* Ratings */}
              <div style={{
                display: 'flex',
                gap: screenWidth <= 480 ? '0.5rem' : '1rem',
                flexWrap: 'wrap',
                marginBottom: screenWidth <= 480 ? '1.5rem' : '2rem',
                justifyContent: screenWidth <= 768 ? 'center' : 'flex-start'
              }}>
                {imdbRating !== "N/A" && (
                  <div style={{
                    backgroundColor: theme.card,
                    padding: screenWidth <= 480 ? '0.5rem 0.75rem' : '0.75rem 1rem',
                    borderRadius: '8px',
                    boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: screenWidth <= 480 ? '0.3rem' : '0.5rem'
                  }}>
                    <FaStar style={{ color: '#FFD700' }} />
                    <div>
                      <div style={{ fontSize: screenWidth <= 480 ? '0.75rem' : '0.85rem', opacity: 0.7 }}>IMDb</div>
                      <div style={{ fontWeight: '600', fontSize: screenWidth <= 480 ? '0.9rem' : '1rem' }}>{imdbRating}</div>
                    </div>
                  </div>
                )}
                
                {rottenRating !== "N/A" && (
                  <div style={{
                    backgroundColor: theme.card,
                    padding: screenWidth <= 480 ? '0.5rem 0.75rem' : '0.75rem 1rem',
                    borderRadius: '8px',
                    boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: screenWidth <= 480 ? '0.3rem' : '0.5rem'
                  }}>
                    <span style={{ color: '#FF6347' }}>🍅</span>
                    <div>
                      <div style={{ fontSize: screenWidth <= 480 ? '0.75rem' : '0.85rem', opacity: 0.7 }}>Rotten Tomatoes</div>
                      <div style={{ fontWeight: '600', fontSize: screenWidth <= 480 ? '0.9rem' : '1rem' }}>{rottenRating}</div>
                    </div>
                  </div>
                )}
                
                {metaRating !== "N/A" && (
                  <div style={{
                    backgroundColor: theme.card,
                    padding: screenWidth <= 480 ? '0.5rem 0.75rem' : '0.75rem 1rem',
                    borderRadius: '8px',
                    boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: screenWidth <= 480 ? '0.3rem' : '0.5rem'
                  }}>
                    <span style={{ fontWeight: '700', color: '#5799EF' }}>M</span>
                    <div>
                      <div style={{ fontSize: screenWidth <= 480 ? '0.75rem' : '0.85rem', opacity: 0.7 }}>Metacritic</div>
                      <div style={{ fontWeight: '600', fontSize: screenWidth <= 480 ? '0.9rem' : '1rem' }}>{metaRating}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Genre Pills */}
              {currentMovie.Genre && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: screenWidth <= 480 ? '1.5rem' : '2rem',
                  justifyContent: screenWidth <= 768 ? 'center' : 'flex-start'
                }}>
                  {currentMovie.Genre.split(', ').map((genre, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ y: -3 }}
                      style={{
                        padding: screenWidth <= 480 ? '0.4rem 0.8rem' : '0.5rem 1rem',
                        backgroundColor: theme.accent,
                        color: 'white',
                        borderRadius: '999px',
                        fontSize: screenWidth <= 480 ? '0.8rem' : '0.85rem',
                        fontWeight: '500',
                        boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm
                      }}
                    >
                      {genre}
                    </motion.span>
                  ))}
                </div>
              )}
              
              {/* Plot */}
              <div style={{ marginBottom: screenWidth <= 480 ? '1.5rem' : '2rem' }}>
                <h3 style={{ 
                  marginBottom: '1rem', 
                  fontSize: screenWidth <= 480 ? '1.3rem' : screenWidth <= 768 ? '1.5rem' : '1.8rem',
                  fontWeight: '600',
                  fontFamily: fonts.heading,
                  color: theme.accent
                }}>
                  Plot
                </h3>
                <p style={{ 
                  fontSize: screenWidth <= 480 ? '1rem' : '1.1rem',
                  lineHeight: '1.6',
                  color: theme.text
                }}>
                  {currentMovie.Plot}
                </p>
              </div>
            </div>
            
            {/* Main Info Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              <div style={{
                backgroundColor: theme.card,
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md
              }}>
                <h3 style={{ 
                  marginBottom: '1.5rem', 
                  fontSize: screenWidth <= 480 ? '1.2rem' : screenWidth <= 768 ? '1.3rem' : '1.5rem',
                  fontWeight: '600',
                  fontFamily: fonts.heading,
                  color: theme.accent
                }}>
                  Cast & Crew
                </h3>
                
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                  <div>
                    <h4 style={{ fontSize: screenWidth <= 480 ? '0.9rem' : '1rem', opacity: 0.7, marginBottom: '0.3rem' }}>Director</h4>
                    <p style={{ fontSize: screenWidth <= 480 ? '1rem' : '1.1rem', fontWeight: '500' }}>{currentMovie.Director}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: screenWidth <= 480 ? '0.9rem' : '1rem', opacity: 0.7, marginBottom: '0.3rem' }}>Writers</h4>
                    <p style={{ fontSize: screenWidth <= 480 ? '1rem' : '1.1rem' }}>{currentMovie.Writer}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: screenWidth <= 480 ? '0.9rem' : '1rem', opacity: 0.7, marginBottom: '0.3rem' }}>Actors</h4>
                    <p style={{ fontSize: screenWidth <= 480 ? '1rem' : '1.1rem' }}>{currentMovie.Actors}</p>
                  </div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: theme.card,
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: isDarkMode ? shadows.dark.md : shadows.light.md
              }}>
                <h3 style={{ 
                  marginBottom: '1.5rem', 
                  fontSize: screenWidth <= 480 ? '1.2rem' : screenWidth <= 768 ? '1.3rem' : '1.5rem',
                  fontWeight: '600',
                  fontFamily: fonts.heading,
                  color: theme.accent
                }}>
                  Details
                </h3>
                
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                  <div>
                    <h4 style={{ fontSize: screenWidth <= 480 ? '0.9rem' : '1rem', opacity: 0.7, marginBottom: '0.3rem' }}>Released</h4>
                    <p style={{ fontSize: screenWidth <= 480 ? '1rem' : '1.1rem', fontWeight: '500' }}>{currentMovie.Released}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: screenWidth <= 480 ? '0.9rem' : '1rem', opacity: 0.7, marginBottom: '0.3rem' }}>Rated</h4>
                    <p style={{ fontSize: screenWidth <= 480 ? '1rem' : '1.1rem' }}>{currentMovie.Rated}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: screenWidth <= 480 ? '0.9rem' : '1rem', opacity: 0.7, marginBottom: '0.3rem' }}>Box Office</h4>
                    <p style={{ fontSize: screenWidth <= 480 ? '1rem' : '1.1rem' }}>{currentMovie.BoxOffice || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: screenWidth <= 480 ? '0.9rem' : '1rem', opacity: 0.7, marginBottom: '0.3rem' }}>Awards</h4>
                    <p style={{ fontSize: screenWidth <= 480 ? '1rem' : '1.1rem' }}>{currentMovie.Awards || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem 3rem',
      }}>
        {/* Add responsive styles */}
        <style jsx>{`
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Responsive styles */
          .movie-details-grid {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 2rem;
          }
          
          @media (max-width: 992px) {
            .movie-details-grid {
              grid-template-columns: 250px 1fr;
              gap: 1.5rem;
            }
          }
          
          @media (max-width: 768px) {
            .movie-details-container {
              transform: translateY(-100px);
            }
            .movie-details-grid {
              grid-template-columns: 1fr;
            }
            .movie-poster-container {
              max-width: 250px;
              margin: 0 auto;
            }
            .movie-details-content {
              grid-column: 1 / 2;
            }
          }
          
          @media (max-width: 576px) {
            .movie-details-container {
              transform: translateY(-80px);
            }
            .ratings-container {
              flex-direction: column;
              align-items: flex-start;
            }
            .rating-item {
              width: 100%;
              margin-bottom: 0.5rem;
            }
            .metadata-row {
              flex-wrap: wrap;
            }
            .metadata-item {
              margin-bottom: 0.5rem;
            }
          }
          
          @media (max-width: 480px) {
            .movie-details-container {
              transform: translateY(-50px);
              padding: 0 0.75rem;
            }
            .section-content {
              padding: 1rem;
            }
            h1.movie-title {
              font-size: 1.75rem;
            }
            .genre-tags {
              gap: 0.5rem;
            }
            .genre-tag {
              padding: 0.25rem 0.5rem;
              font-size: 0.75rem;
            }
          }
          
          @media (max-width: 320px) {
            .movie-details-container {
              transform: translateY(-30px);
              padding: 0 0.5rem;
            }
            .movie-poster-container {
              max-width: 100%;
            }
            .section-content {
              padding: 0.75rem;
            }
            h1.movie-title {
              font-size: 1.5rem;
            }
            .rating-item {
              padding: 0.5rem;
            }
            .action-button {
              padding: 0.5rem 0.75rem;
              font-size: 0.9rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default MovieDetails;