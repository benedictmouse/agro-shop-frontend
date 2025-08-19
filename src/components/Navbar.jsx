import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiX, FiHome, FiInfo, FiMail, FiLogOut } from 'react-icons/fi';
import { LuLayoutDashboard } from "react-icons/lu";
import { BiMenuAltLeft } from 'react-icons/bi';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/Agro Shop logo.png';
import '../styles/Navbar.css';
import appLinks from '../routing/Links';

const Navbar = ({ cartItem }) => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const [userInfo, setUserInfo] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    
    // Fetch user info from backend when authenticated
    const fetchUserInfo = async () => {
        if (!isAuthenticated) {
            setUserInfo(null);
            return;
        }
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/users/profile/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserInfo(data);
                // Store user info in localStorage for quick access
                localStorage.setItem('user_info', JSON.stringify(data));
            } else {
                console.error('Failed to fetch user info:', response.status);
            }
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            // Fallback to localStorage data if available
            const storedUserInfo = localStorage.getItem('user_info');
            if (storedUserInfo) {
                setUserInfo(JSON.parse(storedUserInfo));
            }
        }
    };

    // Fetch cart data from backend
    const fetchCartData = async () => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/cart/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Calculate total items from cart items
                const totalItems = data.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
                setCartCount(totalItems);
            } else {
                console.error('Failed to fetch cart data:', response.status);
                setCartCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch cart data:', error);
            setCartCount(0);
        }
    };

    // Initialize user info from localStorage if available
    useEffect(() => {
        if (isAuthenticated) {
            const storedUserInfo = localStorage.getItem('user_info');
            if (storedUserInfo) {
                try {
                    setUserInfo(JSON.parse(storedUserInfo));
                } catch (e) {
                    console.error('Error parsing stored user info:', e);
                    localStorage.removeItem('user_info');
                }
            }
            // Always fetch fresh data from backend
            fetchUserInfo();
            fetchCartData();
            
            // Set up interval to refresh cart count periodically
            const cartInterval = setInterval(fetchCartData, 30000); // Every 30 seconds
            return () => clearInterval(cartInterval);
        } else {
            setUserInfo(null);
            setCartCount(0);
            localStorage.removeItem('user_info');
        }
    }, [isAuthenticated]);

    // Also check for prop-based cart data as fallback
    useEffect(() => {
        if (cartItem && Array.isArray(cartItem)) {
            const propCartCount = cartItem.reduce((total, item) => total + (item.quantity || 0), 0);
            // Only use prop count if we don't have API data or if prop count is higher
            if (!isAuthenticated || propCartCount > cartCount) {
                setCartCount(propCartCount);
            }
        }
    }, [cartItem, isAuthenticated, cartCount]);

    const userRole = userInfo?.role || 'customer'; // Default to customer if no role found


        
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const menuButtonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
                !menuButtonRef.current.contains(event.target)) {
                closeMobileMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        closeMobileMenu();
    }, [location]);

    const toggleMenu = () => {
        setIsMenuOpen(prev => {
            document.body.classList.toggle('menu-open', !prev);
            return !prev;
        });
    };

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
        document.body.classList.remove('menu-open');
    };

    const toggleUserMenu = () => setIsUserMenuOpen(prev => !prev);

    const handleLogout = () => {
        logout();
        setUserInfo(null);
        setCartCount(0);
        localStorage.removeItem('user_info');
        setIsUserMenuOpen(false);
        closeMobileMenu();
    };

    // Check if user can see dashboard (vendors and admins only)
    const canSeeDashboard = userRole === 'vendor' || userRole === 'admin';

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-content">
                    {/* Logo */}
                    <div className="navbar-logo">
                        <Link to="/" className="navbar-logo-link">
                            <img src={logo} alt="Agro Shop" className="logo-image" />
                            <span className="logo-text">AgroShop</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="desktop-nav">
                        <div className="nav-links">
                            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                                <span>Home</span>
                            </Link>
                            
                            {/* Only show Dashboard for vendors and admins */}
                            {canSeeDashboard && (
                                <Link to={appLinks.dashboard} className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                                    <span>Dashboard</span>
                                </Link>
                            )}
                            
                            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                                <span>About</span>
                            </Link>
                            <Link to={appLinks.contact} className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                                <span>Contact</span>
                            </Link>
                        </div>
                    </div>

                    <div className="desktop-icons">
                        <Link to="/cart" className="icon-button cart-link">
                            <div className="icon-wrapper">
                                <FiShoppingCart className="icon" />
                                {cartCount > 0 && <span className="cart-badge pulse">{cartCount}</span>}
                                <span className="icon-tooltip">Cart</span>
                            </div>
                        </Link>

                        <div className="user-menu-container" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="icon-button user-button"
                                aria-expanded={isUserMenuOpen}
                            >
                                <div className="icon-wrapper">
                                    <FiUser className="icon" />
                                    <RiArrowDropDownLine className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`} />
                                    <span className="icon-tooltip">Account</span>
                                </div>
                            </button>

                            <div className={`user-menu-dropdown ${isUserMenuOpen ? 'open' : ''}`}>
                                {isAuthenticated ? (
                                    <>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {userInfo?.first_name ? userInfo.first_name.charAt(0).toUpperCase() : 
                                                 userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div className="user-details">
                                                <div className="user-name">
                                                    {userInfo?.first_name && userInfo?.last_name 
                                                        ? `${userInfo.first_name} ${userInfo.last_name}`
                                                        : userInfo?.username || 'User'}
                                                </div>
                                                <div className="user-email">{userInfo?.email || 'user@agroshop.com'}</div>
                                                <div className="user-role">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</div>
                                            </div>
                                        </div>
                                        <Link to="/profile" className="user-menu-item" onClick={toggleUserMenu}>
                                            <span>My Profile</span>
                                        </Link>
                                        <Link to="/order" className="user-menu-item" onClick={toggleUserMenu}>
                                            <span>My Orders</span>
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button className="user-menu-item logout-button" onClick={handleLogout}>
                                            <FiLogOut style={{ marginRight: '8px' }} />
                                            <span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="user-menu-item" onClick={toggleUserMenu}>
                                            <span>Login</span>
                                        </Link>
                                        <Link to="/signup" className="user-menu-item signup-item" onClick={toggleUserMenu}>
                                            <span>Create Account</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="mobile-menu-button" ref={menuButtonRef}>
                        <button
                            onClick={toggleMenu}
                            className="menu-toggle-button"
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? (
                                <FiX className="menu-icon" />
                            ) : (
                                <BiMenuAltLeft className="menu-icon" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu} />
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
                    <div className="mobile-menu-header">
                        <button className="mobile-close-button" onClick={closeMobileMenu}>
                            <FiX />
                        </button>
                    </div>
                    
                    <div className="mobile-menu-content">
                        <div className="mobile-nav-links">
                            <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <FiHome className="mobile-nav-icon" />
                                <span>Home</span>
                            </Link>
                            
                            {/* Only show Dashboard for vendors and admins in mobile menu */}
                            {canSeeDashboard && (
                                <Link to={appLinks.dashboard} className={`mobile-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={closeMobileMenu}>
                                    <LuLayoutDashboard className="mobile-nav-icon" />
                                    <span>Dashboard</span>
                                </Link>
                            )}
                            
                            <Link to="/about" className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <FiInfo className="mobile-nav-icon" />
                                <span>About</span>
                            </Link>
                            <Link to="/order" className={`mobile-nav-link ${location.pathname === '/order' ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <FiInfo className="mobile-nav-icon" />
                                <span>Orders</span>
                            </Link>
                            <Link to="/contact" className={`mobile-nav-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <FiMail className="mobile-nav-icon" />
                                <span>Contact</span>
                            </Link>

                            <div className="mobile-menu-divider" />

                            {isAuthenticated && (
                                <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                                    <FiUser className="mobile-nav-icon" />
                                    <span>My Profile</span>
                                </Link>
                            )}
                            
                            <Link to="/cart" className="mobile-nav-link" onClick={closeMobileMenu}>
                                <FiShoppingCart className="mobile-nav-icon" />
                                <span>My Cart {cartCount > 0 && `(${cartCount})`}</span>
                            </Link>

                            <div className="mobile-menu-divider" />

                            {isAuthenticated ? (
                                <button className="mobile-nav-link logout-mobile" onClick={handleLogout}>
                                    <FiLogOut className="mobile-nav-icon" />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                                        <span>Login</span>
                                    </Link>
                                    <Link to="/signup" className="mobile-nav-link" onClick={closeMobileMenu}>
                                        <span style={{ color: 'var(--primary)' }}>Create Account</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;