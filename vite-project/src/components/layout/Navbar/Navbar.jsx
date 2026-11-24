import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ShoppingCart } from 'lucide-react';
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import { doSignOut } from "../../../firebase/auth";
import './Navbar.css';
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../../../assets/FixItNow Logo.png';
import NotificationBell from '../../common/NotificationBell';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/#services' },
  { label: 'About', path: '/#about' },
  { label: 'Products', path: '/products' },
  { label: 'Testimonials', path: '/#testimonials' },
  { label: 'Contact', path: '/#contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false); // slides away while scrolling down
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const [showNavbar, setShowNavbar] = useState(!isHomePage);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Floating-nav behaviour: hide on scroll down, come back on scroll up.
  // Small backwards nudges (snap scrolling, layout shifts) are ignored, so
  // only a deliberate scroll up brings the navbar back.
  useEffect(() => {
    let lastY = window.scrollY;
    let travelled = 0; // distance since the direction last changed (+ down, - up)

    const onScrollDirection = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (delta === 0) return;

      // Start counting again whenever the direction flips
      if (Math.sign(delta) !== Math.sign(travelled)) travelled = 0;
      travelled += delta;

      if (y < 120) {
        setHidden(false);        // always visible near the top
      } else if (travelled > 10) {
        setHidden(true);         // scrolling down: slide away
      } else if (travelled < -36) {
        setHidden(false);        // a real scroll up: bring it back
      }
    };

    window.addEventListener('scroll', onScrollDirection, { passive: true });
    return () => window.removeEventListener('scroll', onScrollDirection);
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      setShowNavbar(true);
      return;
    }

    const handleNavbarVisibility = () => {
      // Hide global navbar during the 500vh canvas section
      const triggerHeight = window.innerHeight * 4.5;
      setShowNavbar(window.scrollY > triggerHeight);
    };

    handleNavbarVisibility();
    window.addEventListener('scroll', handleNavbarVisibility);
    return () => window.removeEventListener('scroll', handleNavbarVisibility);
  }, [isHomePage]);

  const { userLoggedIn, currentUser } = useAuth();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate('/signin');
    } catch (error) {
      console.log(error);
    }
  };

  const navigate = useNavigate();

  // Stay visible while the mobile menu is open
  const retracted = hidden && !mobileOpen;

  // Cart icon with item count, available on every page that shows the navbar
  const cartLink = (extraClass = '') => (
    <Link
      to="/cart"
      className={`navbar__cart ${extraClass}`}
      aria-label={cartCount > 0 ? `Shopping cart, ${cartCount} items` : 'Shopping cart'}
    >
      <ShoppingCart size={20} />
      {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
    </Link>
  );

  return (
    <motion.nav
      data-theme="light"
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${!showNavbar ? 'navbar--hidden' : ''} ${retracted ? 'navbar--retracted' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: retracted ? -170 : 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="FixItNow Logo" className="navbar__logo-img" />
        </Link>

        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.path}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          {cartLink()}
          {!userLoggedIn ? (
            <>
              <Link to="/signin" className="navbar__signin">
                Sign In
              </Link>
              <Link to="/signup" className="navbar__signup">
                Sign Up
              </Link>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <NotificationBell />
              <Link to="/dashboard" className="navbar__signin">
                Dashboard
              </Link>
              <button
                className="navbar__signup"
                onClick={handleLogout}
              >
                Logout
              </button>
              <div className="avatar" title={currentUser?.displayName || "Account"}>
                <User size={20} />
              </div>
              <span className="user-name">
                {currentUser?.displayName}
              </span>
            </div>
          )}
        </div>

        {cartLink('navbar__cart--mobile')}

        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.path}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {userLoggedIn ? (
              <div className="mobile-user-profile">
                <div className="user-profile">
                  <div className="avatar">
                    <User size={20} />
                  </div>
                  <span className="user-name">
                    {currentUser?.displayName}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  className="mobile-signin"
                  onClick={() => setMobileOpen(false)}
                  style={{ marginBottom: '8px' }}
                >
                  Dashboard
                </Link>
                <button
                  className="mobile-signup"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="mobile-signin"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="mobile-signup"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;