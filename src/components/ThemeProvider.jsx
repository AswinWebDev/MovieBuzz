import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { toggleTheme } from '../store/themeSlice';
import { colors, shadows } from '../styles/theme';

function ThemeProvider({ children }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <div style={{ 
      backgroundColor: theme.background,
      color: theme.text,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      {children}
      
      {/* Floating Theme Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(toggleTheme())}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: isDarkMode ? '#ffffff' : '#333333',
          color: isDarkMode ? '#333333' : '#ffffff',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <FaSun size={22} style={{ color: '#FFD700' }} />
        ) : (
          <FaMoon size={20} style={{ color: '#6C5DD3' }} />
        )}
      </motion.button>
    </div>
  );
}

export default ThemeProvider;