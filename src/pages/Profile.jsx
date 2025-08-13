import React, { useState, useEffect, useContext } from 'react';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLogOut, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import appLinks from '../routing/Links';
import '../styles/Profile.css';

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    role: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Get auth token
  const getAuthToken = () => localStorage.getItem('access_token');

  // API headers
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  });

  // Refresh token
  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token available');
      
      const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      localStorage.setItem('access_token', response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
      setTimeout(() => navigate(appLinks.Login), 1500);
      throw error;
    }
  };

  // Axios interceptor for 401 handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          try {
            const newAccessToken = await refreshToken();
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(error.config);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/users/profile/', { headers: getHeaders() });
      setUserData(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile data' });
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      const response = await axios.patch('http://localhost:8000/users/profile/', {
        first_name: userData.first_name,
        last_name: userData.last_name
      }, { headers: getHeaders() });

      setUserData(response.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setErrors(error.response?.data || {});
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      // Client-side validation
      if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_new_password) {
        setErrors({ general: 'All fields are required' });
        return;
      }
      if (passwordData.new_password !== passwordData.confirm_new_password) {
        setErrors({ new_password: 'Passwords do not match' });
        return;
      }
      if (passwordData.new_password.length < 8) {
        setErrors({ new_password: 'Password must be at least 8 characters long' });
        return;
      }

      const response = await axios.patch('http://localhost:8000/users/changepassword/', passwordData, {
        headers: getHeaders()
      });

      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
      });
      setShowPasswordForm(false);
      setMessage({ type: 'success', text: 'Password changed successfully! Please log in again.' });
      
      setTimeout(() => {
        logout();
        navigate(appLinks.Login);
      }, 1500);
    } catch (error) {
      const errorData = error.response?.data || {};
      setErrors(errorData);
      setMessage({ 
        type: 'error', 
        text: errorData.old_password?.[0] || 
              errorData.new_password?.[0] || 
              errorData.confirm_new_password?.[0] || 
              'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Clear messages
  const clearMessage = () => setMessage({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading && !userData.id) {
    return (
      <div className="profile-loading-screen">
        <div className="profile-loading-spinner">
          <div className="profile-spinner-circle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <FiUser className="profile-avatar-icon" />
            </div>
            <div className="profile-header-text">
              <h1 className="profile-title">Profile Settings</h1>
              <p className="profile-subtitle">Manage your account information and security</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`profile-message profile-message-${message.type}`}>
            <div className="profile-message-content">
              <span className="profile-message-icon">
                {message.type === 'success' ? '✓' : '⚠'}
              </span>
              <span>{message.text}</span>
              <button onClick={clearMessage} className="profile-message-close">
                <FiX />
              </button>
            </div>
          </div>
        )}

        <div className="profile-grid">
          {/* Profile Information */}
          <div className="profile-info-section">
            <div className="profile-card">
              <div className="profile-card-header">
                <h2 className="profile-card-title">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="profile-edit-button"
                  >
                    <FiEdit2 className="profile-button-icon" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="profile-action-buttons">
                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="profile-save-button"
                    >
                      <FiSave className="profile-button-icon" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setErrors({});
                      }}
                      className="profile-cancel-button"
                    >
                      <FiX className="profile-button-icon" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-card-body">
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label className="profile-form-label">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.first_name || ''}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className={`profile-form-input ${errors.first_name ? 'profile-input-error' : ''}`}
                      />
                    ) : (
                      <p className="profile-info-text">{userData.first_name || 'Not provided'}</p>
                    )}
                    {errors.first_name && <p className="profile-error-message">{errors.first_name[0]}</p>}
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.last_name || ''}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className={`profile-form-input ${errors.last_name ? 'profile-input-error' : ''}`}
                      />
                    ) : (
                      <p className="profile-info-text">{userData.last_name || 'Not provided'}</p>
                    )}
                    {errors.last_name && <p className="profile-error-message">{errors.last_name[0]}</p>}
                  </div>
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">Email Address</label>
                  <p className="profile-info-text">{userData.email}</p>
                  <p className="profile-info-note">Email cannot be changed</p>
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">Role</label>
                  <span className="profile-role-badge">
                    {userData.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="profile-security-section">
            <div className="profile-card">
              <div className="profile-card-header">
                <h2 className="profile-card-title">Security</h2>
              </div>

              <div className="profile-card-body">
                <div className="profile-security-content">
                  <div className="profile-security-item">
                    <h3 className="profile-security-title">Password</h3>
                    <p className="profile-security-description">Keep your account secure with a strong password</p>
                    
                    {!showPasswordForm ? (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="profile-change-password-button"
                      >
                        <FiLock className="profile-button-icon" />
                        <span>Change Password</span>
                      </button>
                    ) : (
                      <div className="profile-password-form">
                        <div className="profile-form-group">
                          <label className="profile-form-label">Current Password</label>
                          <div className="profile-password-input-wrapper">
                            <input
                              type={showPasswords.old ? 'text' : 'password'}
                              value={passwordData.old_password}
                              onChange={(e) => handlePasswordChange('old_password', e.target.value)}
                              className={`profile-form-input ${errors.old_password ? 'profile-input-error' : ''}`}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('old')}
                              className="profile-password-toggle"
                            >
                              {showPasswords.old ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {errors.old_password && <p className="profile-error-message">{errors.old_password[0]}</p>}
                        </div>

                        <div className="profile-form-group">
                          <label className="profile-form-label">New Password</label>
                          <div className="profile-password-input-wrapper">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordData.new_password}
                              onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                              className={`profile-form-input ${errors.new_password ? 'profile-input-error' : ''}`}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="profile-password-toggle"
                            >
                              {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {errors.new_password && <p className="profile-error-message">{errors.new_password[0]}</p>}
                        </div>

                        <div className="profile-form-group">
                          <label className="profile-form-label">Confirm New Password</label>
                          <div className="profile-password-input-wrapper">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordData.confirm_new_password}
                              onChange={(e) => handlePasswordChange('confirm_new_password', e.target.value)}
                              className={`profile-form-input ${errors.confirm_new_password ? 'profile-input-error' : ''}`}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="profile-password-toggle"
                            >
                              {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {errors.confirm_new_password && <p className="profile-error-message">{errors.confirm_new_password[0]}</p>}
                        </div>

                        <div className="profile-password-actions">
                          <button
                            onClick={changePassword}
                            disabled={loading}
                            className="profile-save-password-button"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordData({
                                old_password: '',
                                new_password: '',
                                confirm_new_password: ''
                              });
                              setErrors({});
                            }}
                            className="profile-cancel-password-button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to log out?')) {
                        logout();
                        navigate(appLinks.Login);
                      }
                    }}
                    className="profile-logout-button"
                  >
                    <FiLogOut className="profile-button-icon" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;