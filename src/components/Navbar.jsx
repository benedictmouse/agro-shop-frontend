import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiX, FiHome, FiInfo, FiMail } from 'react-icons/fi';
import { LuLayoutDashboard } from "react-icons/lu";
import { BiMenuAltLeft } from 'react-icons/bi';
import { RiArrowDropDownLine } from 'react-icons/ri';
import logo from '../assets/Agro Shop logo.png';
import '../styles/Navbar.css';
import appLinks from '../routing/Links';

const Navbar = ({cartItem}) => {

    const cartCount = Array.isArray(cartItem) 
    ? cartItem.reduce((total, item) => total + (item.quantity || 0), 0) 
    : 0;
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    // const [searchQuery, setSearchQuery] = useState('');
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
                            <Link to={appLinks.dashboard} className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                                <span>Dashboard</span>
                            </Link>
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
                                <span className="cart-badge pulse">{cartCount}</span>
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
                                <div className="user-info">
                                    <div className="user-avatar">AS</div>
                                    <div className="user-details">
                                        <div className="user-name">Agro Shopper</div>
                                        <div className="user-email">user@agroshop.com</div>
                                    </div>
                                </div>
                                <Link to="/profile" className="user-menu-item" onClick={toggleUserMenu}>
                                    <span>My Profile</span>
                                </Link>
                                <Link to="/orders" className="user-menu-item" onClick={toggleUserMenu}>
                                    <span>My Orders</span>
                                </Link>
                                <div className="dropdown-divider"></div>
                                <Link to="/login" className="user-menu-item" onClick={toggleUserMenu}>
                                    <span>Login</span>
                                </Link>
                                <Link to="/signup" className="user-menu-item signup-item" onClick={toggleUserMenu}>
                                    <span>Create Account</span>
                                </Link>
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
                            <Link to={appLinks.dashboard} className={`mobile-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <LuLayoutDashboard className="mobile-nav-icon" />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/about" className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <FiInfo className="mobile-nav-icon" />
                                <span>About</span>
                            </Link>
                            <Link to="/contact" className={`mobile-nav-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <FiMail className="mobile-nav-icon" />
                                <span>Contact</span>
                            </Link>

                            <div className="mobile-menu-divider" />

                            <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                                <FiUser className="mobile-nav-icon" />
                                <span>My Profile</span>
                            </Link>
                            <Link to="/cart" className="mobile-nav-link" onClick={closeMobileMenu}>
                                <FiShoppingCart className="mobile-nav-icon" />
                                <span>My Cart ({cartCount})</span>
                            </Link>

                            <div className="mobile-menu-divider" />

                            <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                                <span>Login</span>
                            </Link>
                            <Link to="/signup" className="mobile-nav-link" onClick={closeMobileMenu}>
                                <span style={{ color: 'var(--primary)' }}>Create Account</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;