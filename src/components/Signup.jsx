import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiUserPlus, FiPhone, FiKey } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import appLinks from '../routing/Links';
import '../styles/Signup.css';

const Signup = () => {
  const { login, logout, isAuthenticated } = useContext(AuthContext);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordChangeData, setPasswordChangeData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordChangeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage('');

    // Client-side validation
    if (!signupData.firstName || !signupData.email || !signupData.phone || !signupData.password || !signupData.confirmPassword) {
      setFormMessage('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      setFormMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }
    if (!/^\+?\d{10,12}$/.test(signupData.phone)) {
      setFormMessage('Please enter a valid phone number (10-12 digits, optional country code).');
      setIsSubmitting(false);
      return;
    }
    if (signupData.password.length < 6) {
      setFormMessage('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setFormMessage('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Register user
      await axios.post('https://agroshopp.onrender.com/users/register/', {
        email: signupData.email,
        password: signupData.password,
        password2: signupData.confirmPassword,
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        phone: signupData.phone,
      });

      // Automatically log in
      const loginResponse = await axios.post('https://agroshopp.onrender.com/api/token/', {
        email: signupData.email,
        password: signupData.password,
      });

      // Store tokens and update auth state
      login(loginResponse.data.access, loginResponse.data.refresh);

      setFormMessage('Account created successfully! Redirecting to homepage...');
      setSignupData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      setIsSubmitting(false);

      setTimeout(() => {
        navigate(appLinks.home);
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response && error.response.status === 400) {
        const errors = error.response.data;
        if (errors.email) {
          setFormMessage(errors.email[0]);
        } else if (errors.phone) {
          setFormMessage(errors.phone[0]);
        } else if (errors.first_name) {
          setFormMessage(errors.first_name[0]);
        } else if (errors.last_name) {
          setFormMessage(errors.last_name[0]);
        } else if (errors.password2) {
          setFormMessage(errors.password2[0]);
        } else {
          setFormMessage('Registration failed. Please check your details.');
        }
      } else if (error.response && error.response.status === 401) {
        setFormMessage('Login failed after registration. Please try logging in manually.');
      } else {
        setFormMessage('An error occurred. Please try again later.');
      }
      console.error('Signup error:', error.response?.data || error);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage('');

    // Client-side validation
    if (!passwordChangeData.oldPassword || !passwordChangeData.newPassword || !passwordChangeData.confirmNewPassword) {
      setFormMessage('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }
    if (passwordChangeData.newPassword.length < 6) {
      setFormMessage('New password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }
    if (passwordChangeData.newPassword !== passwordChangeData.confirmNewPassword) {
      setFormMessage('New passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('https://agroshopp.onrender.com/users/changepassword/', {
        old_password: passwordChangeData.oldPassword,
        new_password: passwordChangeData.newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setFormMessage('Password changed successfully! Please log in again.');
      setPasswordChangeData({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setIsSubmitting(false);
      logout();
      setTimeout(() => navigate(appLinks.Login), 1000);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response && error.response.status === 400) {
        const errors = error.response.data;
        if (errors.error) {
          setFormMessage(errors.error);
        } else {
          setFormMessage('Failed to change password. Please check your details.');
        }
      } else if (error.response && error.response.status === 401) {
        setFormMessage('Session expired. Please log in again.');
        logout();
        navigate(appLinks.Login);
      } else {
        setFormMessage('An error occurred. Please try again later.');
      }
      console.error('Change password error:', error.response?.data || error);
    }
  };

  const toggleForm = () => {
    setIsChangePassword(!isChangePassword);
    setFormMessage('');
    setIsSubmitting(false);
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">
        {isChangePassword ? 'Change Password' : 'Create an AgroShop Account'}
      </h1>
      <p className="signup-subtitle">
        {isChangePassword
          ? 'Update your password for your AgroShop account.'
          : 'Sign up to start shopping for fresh, organic produce.'}
      </p>

      <div className="signup-form-section">
        {!isChangePassword ? (
          <>
            <form className="signup-form" onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    placeholder="Your First Name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    placeholder="Your Last Name"
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
                    value={signupData.email}
                    onChange={handleSignupChange}
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
                    value={signupData.phone}
                    onChange={handleSignupChange}
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
                    value={signupData.password}
                    onChange={handleSignupChange}
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
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
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
              {isAuthenticated && (
                <button className="change-password-toggle-btn" onClick={toggleForm}>
                  <FiKey className="action-icon" />
                  Change Password
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <form className="signup-form" onSubmit={handlePasswordChangeSubmit}>
              <div className="form-group">
                <label htmlFor="oldPassword">Old Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordChangeData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Your Current Password"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordChangeData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Your New Password"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={passwordChangeData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm New Password"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="signup-btn" disabled={isSubmitting}>
                <FiKey className="action-icon" />
                {isSubmitting ? 'Changing Password...' : 'Change Password'}
              </button>
              {formMessage && (
                <p className={`form-message ${formMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {formMessage}
                </p>
              )}
            </form>
            <div className="signup-links">
              <button className="signup-toggle-btn" onClick={toggleForm}>
                <FiUserPlus className="action-icon" />
                Back to Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;