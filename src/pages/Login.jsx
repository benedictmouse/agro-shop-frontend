// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import appLinks from '../routing/Links';
import '../styles/Login.css';

const Login = () => {
  const { login } = useContext(AuthContext); // Use context
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage('');

    if (!formData.email || !formData.password) {
      setFormMessage('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        email: formData.email,
        password: formData.password,
      });

      // Use context to set auth state
      login(response.data.access, response.data.refresh);

      setFormMessage('Login successful! Redirecting...');
      setFormData({ email: '', password: '' });
      setIsSubmitting(false);

      setTimeout(() => {
        navigate(appLinks.home);
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response && error.response.status === 401) {
        setFormMessage('Invalid email or password.');
      } else {
        setFormMessage('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login to AgroShop</h1>
      <p className="login-subtitle">Sign in to access your account and start shopping.</p>

      <div className="login-form-section">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your Password"
                required
              />
            </div>
          </div>
          <button type="submit" className="login-btn" disabled={isSubmitting}>
            <FiLogIn className="action-icon" />
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          {formMessage && (
            <p className={`form-message ${formMessage.includes('successful') ? 'success' : 'error'}`}>
              {formMessage}
            </p>
          )}
        </form>

        <div className="login-links">
          <Link to="/signup" className="signup-link">
            Don't have an account? Sign Up
          </Link>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;