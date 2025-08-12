import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiUserPlus, FiPhone } from 'react-icons/fi';
import appLinks from '../routing/Links';
import '../styles/Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage('');

    // Client-side validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setFormMessage('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }
    if (!/^\+?\d{10,12}$/.test(formData.phone)) {
      setFormMessage('Please enter a valid phone number (10-12 digits, optional country code).');
      setIsSubmitting(false);
      return;
    }
    if (formData.password.length < 6) {
      setFormMessage('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormMessage('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    // Simulate signup (replace with real backend call)
    setTimeout(() => {
      setFormMessage('Account created successfully! Redirecting to login...');
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setIsSubmitting(false);
      // TODO: Store user data (including phone) in backend or localStorage
      navigate(appLinks.login);
    }, 1000);
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">Create an AgroShop Account</h1>
      <p className="signup-subtitle">Sign up to start shopping for fresh, organic produce.</p>

      <div className="signup-form-section">
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>
          </div>
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
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <FiPhone className="input-icon" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your Phone Number (e.g., +1234567890)"
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
              />
            </div>
          </div>
          <button type="submit" className="signup-btn" disabled={isSubmitting}>
            <FiUserPlus className="action-icon" />
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
          {formMessage && (
            <p className={`form-message ${formMessage.includes('successfully') ? 'success' : 'error'}`}>
              {formMessage}
            </p>
          )}
        </form>

        <div className="signup-links">
          <Link to={appLinks.Login} className="login-link">
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;