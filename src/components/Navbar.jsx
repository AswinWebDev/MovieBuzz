import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaHeart } from 'react-icons/fa';
import { toggleTheme } from '../store/themeSlice';
import { colors } from '../styles/theme';

function Navbar() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <nav style={{
      backgroundColor: theme.card,
      borderBottom: `1px solid ${theme.border}`,
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" style={{
            color: theme.text,
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-heading)'
          }}>
            Movie Explorer
          </Link>
        </motion.div>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/favorites" style={{
              color: theme.text,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaHeart />
              Favorites
            </Link>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleTheme())}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.text,
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.2rem'
            }}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </motion.button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;