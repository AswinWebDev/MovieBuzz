import { useSelector } from 'react-redux';
import { colors } from '../styles/theme';

function ThemeProvider({ children }) {
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