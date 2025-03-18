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
    </div>
  );
}

export default ThemeProvider;