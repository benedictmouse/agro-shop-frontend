import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { FaTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa';
import appLinks from '../routing/Links';
import '../styles/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribeMessage('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => setSubscribeMessage(''), 3000);
    } else {
      setSubscribeMessage('Please enter a valid email address.');
      setTimeout(() => setSubscribeMessage(''), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section footer-about">
          <h3 className="footer-title">AgroShop</h3>
          <p className="footer-description">
            Your one-stop shop for fresh, organic produce. Discover quality products delivered straight from the farm to your table.
          </p>
        </div>

        <div className="footer-section footer-links">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-nav">
            <li><Link to={appLinks.home} className="footer-link">Home</Link></li>
            <li><Link to={appLinks.dashboard} className="footer-link">Dashboard</Link></li>
            <li><Link to="/about" className="footer-link">About</Link></li>
            <li><Link to="/contact" className="footer-link">Contact</Link></li>
            <li><Link to={appLinks.profile} className="footer-link">My Profile</Link></li>
            <li><Link to={appLinks.cart} className="footer-link">Cart</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-contact">
          <h3 className="footer-title">Contact Us</h3>
          <ul className="footer-contact-list">
            <li>
              <FiMail className="footer-icon" />
              <span>support@agroshop.com</span>
            </li>
            <li>
              <FiPhone className="footer-icon" />
              <span>+1 (123) 456-7890</span>
            </li>
            <li>
              <FiMapPin className="footer-icon" />
              <span>123 Farm Road, Agro City, AC 12345</span>
            </li>
          </ul>
        </div>

        <div className="footer-section footer-newsletter">
          <h3 className="footer-title">Newsletter</h3>
          <p>Subscribe to get the latest updates and offers.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="newsletter-input-container">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">
                <FiSend className="footer-icon" />
              </button>
            </div>
            {subscribeMessage && (
              <p className={`newsletter-message ${subscribeMessage.includes('Thank') ? 'success' : 'error'}`}>
                {subscribeMessage}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-social">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
            <FaTwitter />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
            <FaInstagram />
          </a>
        </div>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} AgroShop. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;