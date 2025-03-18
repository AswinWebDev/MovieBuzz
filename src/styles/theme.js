export const colors = {
  light: {
    primary: '#2D3250',
    secondary: '#424769',
    accent: '#7077A1',
    background: '#F6F6F6',
    text: '#2D3250',
    card: '#FFFFFF',
    border: '#E0E0E0'
  },
  dark: {
    primary: '#7077A1',
    secondary: '#424769',
    accent: '#2D3250',
    background: '#121212',
    text: '#F6F6F6',
    card: '#1E1E1E',
    border: '#333333'
  }
};

export const fonts = {
  heading: "'Poppins', sans-serif",
  body: "'Inter', sans-serif"
};

export const breakpoints = {
  xs: '320px',   // Extra small devices (phones)
  sm: '480px',   // Small devices (large phones)
  md: '768px',   // Medium devices (tablets)
  lg: '992px',   // Large devices (desktops)
  xl: '1200px'   // Extra large devices (large desktops)
};

export const mediaQueries = {
  xs: `@media (max-width: ${breakpoints.xs})`,
  sm: `@media (max-width: ${breakpoints.sm})`,
  md: `@media (max-width: ${breakpoints.md})`,
  lg: `@media (max-width: ${breakpoints.lg})`,
  xl: `@media (max-width: ${breakpoints.xl})`,
  
  // Min width queries (from this breakpoint and up)
  xsUp: `@media (min-width: ${breakpoints.xs})`,
  smUp: `@media (min-width: ${breakpoints.sm})`,
  mdUp: `@media (min-width: ${breakpoints.md})`,
  lgUp: `@media (min-width: ${breakpoints.lg})`,
  xlUp: `@media (min-width: ${breakpoints.xl})`
};

export const transitions = {
  default: 'all 0.3s ease',
  smooth: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

export const shadows = {
  light: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)'
  },
  dark: {
    sm: '0 1px 3px rgba(0,0,0,0.3)',
    md: '0 4px 6px rgba(0,0,0,0.2)',
    lg: '0 10px 15px rgba(0,0,0,0.2)'
  }
};