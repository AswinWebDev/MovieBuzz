import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSun, FaMoon, FaHeart, FaFilm, FaBars, FaTimes, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { toggleTheme } from '../store/themeSlice';
import { colors, fonts, shadows, transitions } from '../styles/theme';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const location = useLocation();
  const dispatch = useDispatch();
  
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
  
  // Responsive media queries using JS
  const checkMobile = () => {
    return window.innerWidth <= 800;
  };
  
  // Initial mobile state
  const [isMobile, setIsMobile] = useState(checkMobile());
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkMobile());
      setMenuOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  
  const isActive = (path) => location.pathname === path;
  
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };
  
  const mobileItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const styles = {
    desktopNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    mobileMenuButton: {
      display: 'none'
    },
    brandName: {
      fontSize: '1.5rem'
    },
    navbar: {
      padding: scrolled ? '0.75rem 0' : '1rem 0'
    }
  };
  
  const mediaQueries = {
    '(max-width: 768px)': {
      desktopNav: {
        display: 'none'
      },
      mobileMenuButton: {
        display: 'block'
      },
      brandName: {
        fontSize: '1.3rem'
      }
    },
    '(max-width: 480px)': {
      navbar: {
        padding: scrolled ? '0.5rem 0' : '0.75rem 0'
      },
      brandName: {
        fontSize: '1.1rem'
      }
    },
    '(max-width: 320px)': {
      brandName: {
        fontSize: '1rem'
      },
      mobileMenu: {
        width: '85%'
      }
    }
  };
  
  const mediaQuery = window.matchMedia('(max-width: 768px)').matches;
  
  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: scrolled ? theme.background : (isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(246, 246, 246, 0.8)'),
          backdropFilter: 'blur(10px)',
          boxShadow: scrolled ? (isDarkMode ? shadows.dark.sm : shadows.light.sm) : 'none',
          transition: 'all 0.3s ease',
          padding: scrolled ? '0.75rem 0' : '1rem 0',
          borderBottom: scrolled ? `1px solid ${theme.border}` : 'none',
          width: '100%'
        }}
        className="navbar"
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1rem'
        }}>
          {/* Logo & Brand Name */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaFilm size={24} style={{ color: theme.accent, marginRight: '0.5rem' }} />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                fontFamily: fonts.heading,
                color: theme.text,
                display: 'flex',
                alignItems: 'center'
              }}
              className="brand-name"
            >
              <span style={{ color: theme.accent }}>Movie</span>Buzz
            </motion.span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="desktop-nav">
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <NavLink to="/" active={isActive('/')} theme={theme} text="Home" />
              <NavLink to="/favorites" active={isActive('/favorites')} theme={theme} text="Favorites" icon={<FaHeart size={14} />} />
            </div>
            
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleTheme())}
              style={{
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                color: theme.text,
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: transitions.default,
                boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm
              }}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="theme-toggle"
            >
              {isDarkMode ? (
                <>
                  <FaSun size={16} style={{ color: '#FFD700' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }} className="toggle-text">Light</span>
                </>
              ) : (
                <>
                  <FaMoon size={14} style={{ color: '#6C5DD3' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }} className="toggle-text">Dark</span>
                </>
              )}
            </motion.button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="mobile-menu-button">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                backgroundColor: 'transparent',
                color: theme.text,
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: transitions.default
              }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%', 
              maxWidth: '250px',
              backgroundColor: theme.background,
              boxShadow: isDarkMode ? shadows.dark.lg : shadows.light.lg,
              zIndex: 1100,
              padding: '4rem 1rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              overflowY: 'auto'
            }}
            className="mobile-menu"
          >
            {/* Close button inside sidebar */}
            <motion.button
              variants={mobileItemVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                color: theme.teal,
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: transitions.default,
                zIndex: 1200
              }}
              aria-label="Close menu"
            >
              <FaArrowRight size={16} />
            </motion.button>
            <motion.div 
              variants={mobileItemVariants}
              style={{ marginTop: '1.5rem' }}
            >
              <Link 
                to="/" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: isActive('/') ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                  color: isActive('/') ? '#f59e0b' : theme.text,
                  fontWeight: isActive('/') ? '600' : '500',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: transitions.default
                }}
                onClick={() => setMenuOpen(false)}
              >
                <FaFilm size={16} />
                <span>Home</span>
              </Link>
            </motion.div>
            
            <motion.div variants={mobileItemVariants}>
              <Link 
                to="/favorites" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: isActive('/favorites') ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                  color: isActive('/favorites') ? '#f59e0b' : theme.text,
                  fontWeight: isActive('/favorites') ? '600' : '500',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: transitions.default
                }}
                onClick={() => setMenuOpen(false)}
              >
                <FaHeart size={16} />
                <span>Favorites</span>
              </Link>
            </motion.div>
            
            <motion.div 
              variants={mobileItemVariants} 
              style={{ marginTop: 'auto' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderTop: `1px solid ${theme.border}`,
                marginTop: '1rem'
              }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => dispatch(toggleTheme())}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                    color: theme.text,
                    border: 'none',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: transitions.default,
                    boxShadow: isDarkMode ? shadows.dark.sm : shadows.light.sm
                  }}
                  aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? (
                    <>
                      <FaSun size={16} style={{ color: '#FFD700' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Light</span>
                    </>
                  ) : (
                    <>
                      <FaMoon size={14} style={{ color: '#6C5DD3' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Dark</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay backdrop for mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1050,
              backdropFilter: 'blur(3px)'
            }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Responsive styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .mobile-menu-button {
          display: none;
        }
        
        .brand-name {
          font-size: 1.5rem;
        }
        
        .navbar {
          padding: ${scrolled ? '0.75rem 0' : '1rem 0'};
          width: 100%;
        }
        
        /* Responsive breakpoints */
        @media (max-width: 800px) {
          .desktop-nav {
            display: none;
          }
          
          .mobile-menu-button {
            display: block;
          }
          
          .brand-name {
            font-size: 1.3rem;
          }
        }
        
        @media (max-width: 600px) {
          .navbar {
            padding: ${scrolled ? '0.5rem 0' : '0.75rem 0'};
          }
          
          .brand-name {
            font-size: 1.1rem;
          }
          
          .container {
            padding-left: 10px;
            padding-right: 10px;
          }
        }
        
        @media (max-width: 480px) {
          .brand-name {
            font-size: 0.95rem;
          }
          
          .navbar > div {
            padding: 0 8px;
          }
          
          .mobile-menu {
            padding-top: 4rem;
            max-width: 240px;
          }
        }
        
        @media (max-width: 400px) {
          .brand-name {
            font-size: 0.9rem;
          }
          
          .mobile-menu-button button {
            width: 36px;
            height: 36px;
          }
        }
        
        @media (max-width: 360px) {
          .brand-name {
            font-size: 0.85rem;
          }
          
          .mobile-menu {
            max-width: 220px;
          }
        }
        
        @media (max-width: 320px) {
          .brand-name {
            font-size: 0.8rem;
          }
          
          .mobile-menu-button button {
            width: 32px;
            height: 32px;
          }
          
          .mobile-menu {
            max-width: 200px;
            padding-left: 8px;
            padding-right: 8px;
          }
        }
        
        /* Add this to ensure theme toggle is always visible */
        .theme-toggle {
          min-width: fit-content;
        }
        
        /* Hide text on very small screens but keep the icon */
        @media (max-width: 360px) {
          .toggle-text {
            display: none;
          }
        }
        `
      }} />
    </>
  );
}

// NavLink component for desktop navigation
function NavLink({ to, active, theme, text, icon }) {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  
  return (
    <Link
      to={to}
      style={{
        position: 'relative',
        fontWeight: active ? '600' : '500',
        color: active ? '#f59e0b' : theme.text,
        textDecoration: 'none',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        transition: transitions.default
      }}
    >
      {icon && icon}
      {text}
      {active && (
        <motion.div
          layoutId="activeNavIndicator"
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '20%',
            right: '20%',
            height: '3px',
            background: 'linear-gradient(to right, #f59e0b, #ef4444)',
            borderRadius: '4px'
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  );
}

export default Navbar;