import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaHeart, FaArrowLeft, FaStar, FaCalendarAlt, FaClock, FaGlobe, FaUser, FaVideo, FaTrophy, FaDollarSign, FaInfoCircle, FaTicketAlt } from 'react-icons/fa';
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
  
  const staggeredFadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 10,
        mass: 0.5
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div className="loader" style={{
            width: '60px',
            height: '60px',
            border: `5px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderBottomColor: '#06b6d4',
            borderRadius: '50%',
            display: 'inline-block',
            boxSizing: 'border-box',
            animation: 'rotation 1s linear infinite'
          }} />
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              color: theme.text,
              fontSize: '1.5rem',
              fontWeight: '500'
            }}
          >
            Loading movie details...
          </motion.h2>
        </div>
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
      <div className="flex items-center justify-center min-h-screen">
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              padding: '2rem',
              backgroundColor: isDarkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)',
              borderRadius: '16px',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 107, 107, 0.2)',
              boxShadow: '0 10px 30px rgba(255, 107, 107, 0.1)'
            }}
          >
            <h2 style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '1.75rem' }}>Error</h2>
            <p style={{ fontSize: '1.1rem', color: theme.text }}>{error}</p>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#06b6d4',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
              fontFamily: fonts.body
            }}
          >
            <FaArrowLeft /> Back to Search
          </motion.button>
        </div>
      </div>
    );
  }

  if (!currentMovie) return null;

  // Parse ratings to display them nicely
  const imdbRating = currentMovie.Ratings?.find(rating => rating.Source === "Internet Movie Database")?.Value || "N/A";
  const rottenRating = currentMovie.Ratings?.find(rating => rating.Source === "Rotten Tomatoes")?.Value || "N/A";
  const metaRating = currentMovie.Ratings?.find(rating => rating.Source === "Metacritic")?.Value || "N/A";

  // High-resolution backdrop based on movie title for larger screens
  const backdropUrl = currentMovie.Poster !== 'N/A' ? currentMovie.Poster : '/placeholder.jpg';

  return (
    <div className="movie-details-page" style={{
      padding: '0',
      backgroundColor: theme.background,
      minHeight: '100vh',
      fontFamily: fonts.body,
      color: theme.text,
      overflowX: 'hidden'
    }}>
      {/* Hero Section with High-Res Backdrop */}
      <div style={{
        position: 'relative',
        height: screenWidth <= 480 ? '60vh' : '70vh',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: isDarkMode ? 'brightness(0.7)' : 'brightness(0.85)',
            zIndex: 1
          }}
        />
        
        {/* Dark overlay for better text visibility */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isDarkMode 
            ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(15, 23, 42, 0.9) 70%, rgba(15, 23, 42, 1) 100%)'
            : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0.8) 70%, rgba(255, 255, 255, 1) 100%)',
          zIndex: 2
        }} />
        
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            position: 'absolute',
            top: screenWidth <= 480 ? '1rem' : '2rem',
            left: screenWidth <= 480 ? '1rem' : '2rem',
            zIndex: 10
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: screenWidth <= 480 ? '0.6rem 1rem' : '0.75rem 1.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: screenWidth <= 480 ? '0.9rem' : '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              fontFamily: fonts.body
            }}
          >
            <FaArrowLeft /> Back
          </motion.button>
        </motion.div>
        
        {/* Title overlay with gradient for readability */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: screenWidth <= 480 ? '2rem 1rem' : '3rem 2rem',
            zIndex: 3,
            marginBottom: '20px',
            backgroundImage: isDarkMode 
              ? 'linear-gradient(to top, rgba(15, 23, 42, 1), rgba(15, 23, 42, 0.7) 50%, rgba(0, 0, 0, 0))' 
              : 'linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.8) 50%, rgba(0, 0, 0, 0))',
          }}
        >
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <h1 style={{
              fontSize: screenWidth <= 480 ? '2rem' : screenWidth <= 768 ? '2.5rem' : '3.5rem',
              fontWeight: '800',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#fff' : '#1e293b',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
              fontFamily: fonts.heading,
              lineHeight: 1.1
            }}>
              {currentMovie.Title}
            </h1>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: screenWidth <= 480 ? '1rem' : '1.5rem',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : theme.text,
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
          </div>
        </motion.div>
      </div>

      {/* Content container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: screenWidth <= 480 ? '0 1rem' : '0 2rem',
        position: 'relative',
        zIndex: 2000,
        marginTop: '-70px'
      }}>
        <motion.div
          variants={staggeredFadeIn}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: screenWidth <= 768 ? '1fr' : '300px 1fr',
            gap: screenWidth <= 480 ? '2rem' : '3rem',
            width: '100%',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: screenWidth <= 768 ? '2rem 0' : '3rem 0',
          }}
        >
          {/* Movie Poster */}
          <motion.div
            variants={scaleIn}
            style={{
              gridColumn: screenWidth <= 768 ? '1 / 2' : '1 / 2',
              alignSelf: 'start',
              maxWidth: screenWidth <= 768 ? '280px' : '300px',
              margin: screenWidth <= 768 ? '0 auto' : '0',
            }}
          >
            <div style={{
              position: 'relative',
              boxShadow: isDarkMode ? 
                '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : 
                '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              borderRadius: '16px',
              overflow: 'hidden',
              background: isDarkMode ? 
                'rgba(30, 41, 59, 0.8)' : 
                'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease'
            }}>
              <img
                src={currentMovie.Poster !== 'N/A' ? currentMovie.Poster : '/placeholder.jpg'}
                alt={currentMovie.Title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = '/placeholder.jpg';
                }}
              />
              
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFavorite}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: isFavorite(currentMovie.imdbID) ? 
                    'rgba(255, 86, 86, 0.9)' : 
                    'rgba(0, 0, 0, 0.65)',
                  color: '#fff',
                  border: isFavorite(currentMovie.imdbID) ?
                    '1px solid rgba(255, 86, 86, 0.3)' :
                    '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                  zIndex: 10,
                  transition: 'all 0.3s ease'
                }}
                aria-label={isFavorite(currentMovie.imdbID) ? "Remove from favorites" : "Add to favorites"}
              >
                <FaHeart size={18} />
              </motion.button>
              
              {/* Type badge */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.9)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '600',
                zIndex: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
              }}>
                {currentMovie.Type || 'Movie'}
              </div>
            </div>
            
            {/* Ratings section */}
            <motion.div
              variants={fadeIn}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '25px',
                background: isDarkMode ? 
                  'rgba(30, 41, 59, 0.8)' : 
                  'rgba(255, 255, 255, 0.8)',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: isDarkMode ? 
                  '0 10px 30px -5px rgba(0, 0, 0, 0.5)' : 
                  '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h3 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600',
                color: theme.text, 
                marginBottom: '5px',
                textAlign: screenWidth <= 768 ? 'center' : 'left',
              }}>
                Ratings
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {imdbRating !== "N/A" && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaStar style={{ color: '#FFD700' }} />
                      <span style={{ fontWeight: '500' }}>IMDb</span>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                      {imdbRating}
                    </div>
                  </div>
                )}
                
                {rottenRating !== "N/A" && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#FF6347', fontWeight: 'bold' }}>🍅</span>
                      <span style={{ fontWeight: '500' }}>Rotten Tomatoes</span>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                      {rottenRating}
                    </div>
                  </div>
                )}
                
                {metaRating !== "N/A" && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#5799EF', fontWeight: 'bold' }}>M</span>
                      <span style={{ fontWeight: '500' }}>Metacritic</span>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                      {metaRating}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Movie Details Content */}
          <div style={{
            gridColumn: screenWidth <= 768 ? '1 / 2' : '2 / 3',
          }}>
            {/* Genre Pills */}
            {currentMovie.Genre && (
              <motion.div
                variants={staggeredFadeIn}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '25px',
                  justifyContent: screenWidth <= 768 ? 'center' : 'flex-start'
                }}
              >
                {currentMovie.Genre.split(', ').map((genre, index) => (
                  <motion.span
                    key={index}
                    whileHover={{ 
                      y: -3, 
                      boxShadow: '0 10px 25px rgba(6, 182, 212, 0.3)',
                      backgroundColor: '#06b6d4',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.1 * index,
                      duration: 0.5
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(6, 182, 212, 0.9)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      boxShadow: '0 4px 15px rgba(6, 182, 212, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {genre}
                  </motion.span>
                ))}
              </motion.div>
            )}
            
            {/* Plot Section */}
            <motion.div 
              variants={fadeIn}
              style={{ 
                marginBottom: '30px',
                background: isDarkMode ? 
                  'rgba(30, 41, 59, 0.9)' : 
                  'rgba(255, 255, 255, 0.9)',
                borderRadius: '16px',
                padding: '25px',
                boxShadow: isDarkMode ? 
                  '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' : 
                  '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 style={{ 
                marginBottom: '15px', 
                fontSize: screenWidth <= 480 ? '1.4rem' : '1.6rem',
                fontWeight: '700',
                fontFamily: fonts.heading,
                color: '#06b6d4',
                textAlign: screenWidth <= 768 ? 'center' : 'left',
              }}>
                Plot
              </h3>
              <p style={{ 
                fontSize: '1.05rem',
                lineHeight: '1.7',
                color: theme.text,
                textAlign: screenWidth <= 768 ? 'center' : 'left',
              }}>
                {currentMovie.Plot}
              </p>
            </motion.div>
            
            {/* Info Cards */}
            <motion.div
              variants={staggeredFadeIn}
              style={{
                display: 'grid',
                gridTemplateColumns: screenWidth <= 480 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Cast & Crew Card */}
              <motion.div
                variants={scaleIn}
                style={{
                  background: isDarkMode ? 
                    'rgba(30, 41, 59, 0.9)' : 
                    'rgba(255, 255, 255, 0.9)',
                  borderRadius: '16px',
                  padding: '25px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDarkMode ? 
                    '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' : 
                    '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FaUser size={18} color="#06b6d4" />
                </div>
                
                <h3 style={{ 
                  marginBottom: '20px', 
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  fontFamily: fonts.heading,
                  color: '#06b6d4',
                  textAlign: screenWidth <= 768 ? 'center' : 'left',
                  position: 'relative',
                }}>
                  Cast & Crew
                </h3>
                
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', marginBottom: '5px' }}>Director</h4>
                    <p style={{ fontSize: '1.05rem', fontWeight: '500', color: theme.text }}>{currentMovie.Director}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', marginBottom: '5px' }}>Writers</h4>
                    <p style={{ fontSize: '1.05rem', color: theme.text }}>{currentMovie.Writer}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', marginBottom: '5px' }}>Actors</h4>
                    <p style={{ fontSize: '1.05rem', color: theme.text }}>{currentMovie.Actors}</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Movie Details Card */}
              <motion.div
                variants={scaleIn}
                style={{
                  background: isDarkMode ? 
                    'rgba(30, 41, 59, 0.9)' : 
                    'rgba(255, 255, 255, 0.9)',
                  borderRadius: '16px',
                  padding: '25px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDarkMode ? 
                    '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' : 
                    '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FaInfoCircle size={18} color="#06b6d4" />
                </div>
                
                <h3 style={{ 
                  marginBottom: '20px', 
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  fontFamily: fonts.heading,
                  color: '#06b6d4',
                  textAlign: screenWidth <= 768 ? 'center' : 'left',
                }}>
                  Details
                </h3>
                
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', marginBottom: '5px' }}>Released</h4>
                    <p style={{ fontSize: '1.05rem', fontWeight: '500', color: theme.text }}>{currentMovie.Released}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', marginBottom: '5px' }}>Rated</h4>
                    <p style={{ fontSize: '1.05rem', color: theme.text }}>{currentMovie.Rated}</p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', marginBottom: '5px' }}>Box Office</h4>
                    <p style={{ fontSize: '1.05rem', color: theme.text }}>
                      {currentMovie.BoxOffice && currentMovie.BoxOffice !== 'N/A' 
                        ? currentMovie.BoxOffice 
                        : 'Not available'}
                    </p>
                  </div>
                  
                  {currentMovie.Awards && currentMovie.Awards !== 'N/A' && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', marginBottom: '5px' }}>Awards</h4>
                      <p style={{ fontSize: '1.05rem', color: theme.text }}>{currentMovie.Awards}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Bottom navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '40px',
            marginBottom: '20px',
            width: '100%',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              backgroundColor: '#06b6d4',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(6, 182, 212, 0.3)',
              fontFamily: fonts.body
            }}
          >
            <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Search
          </motion.button>
        </motion.div>
      </div>
      
      {/* Custom CSS for responsive design */}
      <style jsx>{`
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .movie-details-page {
            overflow-x: hidden;
          }
        }
      `}</style>
    </div>
  );
}

export default MovieDetails;