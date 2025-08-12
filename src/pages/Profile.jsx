import React, { useState } from 'react';
import { FiUser, FiMail, FiMapPin, FiSave, FiLogOut, FiTrash2,FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import appLinks from '../routing/Links';
import '../styles/Profile.css';

const Profile = ({ orders = [] }) => { // Default to empty array
  const [userData, setUserData] = useState({
    name: 'Agro Shopper',
    email: 'user@agroshop.com',
    number: '0712345671',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!userData.name || !userData.email || !userData.address) {
      setFormMessage('Please fill in all fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      setFormMessage('Please enter a valid email address.');
      return;
    }
    setFormMessage('Profile updated successfully!');
    setIsEditing(false);
    setTimeout(() => setFormMessage(''), 3000);
    // TODO: Save to backend or localStorage
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // TODO: Implement logout logic
      alert('Logged out successfully.');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      // TODO: Implement account deletion logic
      alert('Account deleted successfully.');
    }
  };

  // Filter orders for the current user (placeholder: "Guest User")
  const userOrders = Array.isArray(orders) ? orders.filter(order => order.customer === 'Guest User') : [];

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>
      <p className="profile-subtitle">Manage your personal information and view your order history.</p>

      <div className="profile-content">
        <div className="profile-section profile-info">
          <h2 className="section-title">Personal Information</h2>
          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  disabled={!isEditing}
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
                  value={userData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="address">Phone number</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input
                  type="number"
                  id="number"
                  name="number"
                  value={userData.number}
                  onChange={handleChange}
                  placeholder="Your Address"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>
            {isEditing ? (
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  <FiSave className="action-icon" />
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
            {formMessage && (
              <p className={`form-message ${formMessage.includes('successfully') ? 'success' : 'error'}`}>
                {formMessage}
              </p>
            )}
          </form>
          <div className="account-actions">
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut className="action-icon" />
              Log Out
            </button>
            <button className="delete-account-btn" onClick={handleDeleteAccount}>
              <FiTrash2 className="action-icon" />
              Delete Account
            </button>
          </div>
        </div>

        <div className="profile-section profile-orders">
          <h2 className="section-title">Order History</h2>
          {userOrders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found.</p>
              <Link to={appLinks.home} className="shop-now-btn">
                <FiShoppingCart className="action-icon" />
                Shop Now
              </Link>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Total Price</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>
                      {order.items.map(item => (
                        <div key={item.ID}>
                          {item.title} (Qty: {item.quantity})
                        </div>
                      ))}
                    </td>
                    <td>${order.totalPrice.toFixed(2)}</td>
                    <td>{new Date(order.timestamp).toLocaleDateString()}</td>
                    <td>
                      <span className={`order-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;