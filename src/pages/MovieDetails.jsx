import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { addToFavorites, removeFromFavorites } from '../store/favoritesSlice';
import { colors } from '../styles/theme';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  const fetchMovieDetails = useCallback(async () => {
    try {
      const response = await axios.get(`https://www.omdbapi.com/?apikey=4abf06c1&i=${id}&plot=full`);
      if (response.data.Response === 'True') {
        setMovie(response.data);
      } else {
        setError(response.data.Error);
      }
    } catch (err) {
      setError('Failed to fetch movie details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);

  const isFavorite = useCallback((movieId) => {
    return favorites.some(movie => movie.imdbID === movieId);
  }, [favorites]);

  const toggleFavorite = () => {
    if (!movie) return;
    
    if (isFavorite(movie.imdbID)) {
      dispatch(removeFromFavorites(movie.imdbID));
    } else {
      dispatch(addToFavorites({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster
      }));
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          color: theme.text
        }}
      >
        Loading...
      </motion.div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!movie) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        padding: '2rem 1rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        backgroundColor: theme.card,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <img
            src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
            alt={movie.Title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '600px',
              objectFit: 'cover'
            }}
          />
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <h1 style={{
              color: theme.text,
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>
              {movie.Title} ({movie.Year})
            </h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isFavorite(movie.imdbID) ? '#ff6b6b' : theme.text,
                padding: '0.5rem',
                fontSize: '1.5rem'
              }}
            >
              <FaHeart />
            </motion.button>
          </div>

          <div style={{
            display: 'grid',
            gap: '1rem',
            color: theme.text
          }}>
            <p style={{ fontSize: '1.1rem' }}>{movie.Plot}</p>

            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: theme.accent }}>Details</h3>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <p><strong>Director:</strong> {movie.Director}</p>
                <p><strong>Writers:</strong> {movie.Writer}</p>
                <p><strong>Actors:</strong> {movie.Actors}</p>
                <p><strong>Genre:</strong> {movie.Genre}</p>
                <p><strong>Released:</strong> {movie.Released}</p>
                <p><strong>Runtime:</strong> {movie.Runtime}</p>
                <p><strong>Language:</strong> {movie.Language}</p>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: theme.accent }}>Ratings</h3>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {movie.Ratings.map((rating, index) => (
                  <p key={index}>
                    <strong>{rating.Source}:</strong> {rating.Value}
                  </p>
                ))}
                <p><strong>IMDb Rating:</strong> {movie.imdbRating}</p>
                <p><strong>IMDb Votes:</strong> {movie.imdbVotes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MovieDetails;