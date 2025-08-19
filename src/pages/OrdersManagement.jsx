import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import appLinks from '../routing/Links';
import "../styles/OrderItem.css";

const OrderItem = ({ orderUuid, userRole }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChoices, setStatusChoices] = useState({});
  const [updating, setUpdating] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // Base API URL - make sure this matches your Django server
  const API_BASE_URL = 'https://agroshopp.onrender.com';

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
      
      const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, { refresh }, {
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

  // Fetch order details - UPDATED URL TO MATCH DJANGO
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders/${orderUuid}/`, { 
        headers: getHeaders() 
      });
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error('Fetch order error:', err);
      if (err.response?.status === 404) {
        setError(`Order ${orderUuid} not found. Please check if the order ID is correct and belongs to your account.`);
        setMessage({ type: 'error', text: `Order not found: ${orderUuid}` });
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this order.');
        setMessage({ type: 'error', text: 'Access denied: You cannot view this order' });
      } else {
        setError('Failed to load order details');
        setMessage({ type: 'error', text: 'Failed to load order details' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor order items - UPDATED URL TO MATCH DJANGO
  const fetchVendorOrderItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/vendor/order-items/`, { 
        headers: getHeaders() 
      });
      // Handle both paginated and direct response formats
      const items = response.data.results || response.data.order_items || response.data;
      setOrderItems(Array.isArray(items) ? items : []);
      setError(null);
    } catch (err) {
      setError('Failed to load order items');
      setMessage({ type: 'error', text: 'Failed to load order items' });
      console.error('Fetch order items error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch status choices - UPDATED URL TO MATCH DJANGO
  const fetchStatusChoices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status-choices/`, { 
        headers: getHeaders() 
      });
      setStatusChoices(response.data);
    } catch (err) {
      console.error('Failed to fetch status choices:', err);
    }
  };

  // Cancel order (customer only) - UPDATED URL TO MATCH DJANGO
  const cancelOrder = async (reason = '') => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/orders/${orderUuid}/cancel/`, 
        { reason }, 
        { headers: getHeaders() }
      );
      
      setMessage({ type: 'success', text: 'Order cancelled successfully' });
      await fetchOrderDetails(); // Refresh order data
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to cancel order';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Cancel order error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update order item status (vendor only) - UPDATED URL TO MATCH DJANGO
  const updateItemStatus = async (itemId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      
      const response = await axios.patch(`${API_BASE_URL}/vendor/order-items/${itemId}/status/`, 
        { status: newStatus }, 
        { headers: getHeaders() }
      );

      setMessage({ type: 'success', text: response.data.message });
      
      // Refresh data based on user role
      if (userRole === 'vendor' && !orderUuid) {
        await fetchVendorOrderItems();
      } else {
        await fetchOrderDetails();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update status';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Update status error:', err);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Fetch customer orders list - UPDATED URL TO MATCH DJANGO
  const fetchCustomerOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/`, { 
        headers: getHeaders() 
      });
      return response.data;
    } catch (err) {
      console.error('Fetch customer orders error:', err);
      setMessage({ type: 'error', text: 'Failed to fetch orders list' });
      return null;
    }
  };

  // Clear messages
  const clearMessage = () => setMessage({ type: '', text: '' });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Please log in to view orders');
      setLoading(false);
      return;
    }

    fetchStatusChoices();
    
    if (userRole === 'customer' && orderUuid) {
      fetchOrderDetails();
    } else if (userRole === 'vendor' && !orderUuid) {
      fetchVendorOrderItems();
    } else if (userRole === 'vendor' && orderUuid) {
      fetchOrderDetails();
    }
  }, [orderUuid, userRole]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#f59e0b',
      'PAID': '#3b82f6',
      'PROCESSING': '#8b5cf6',
      'SHIPPED': '#06b6d4',
      'DELIVERED': '#10b981',
      'CANCELLED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div className="loading-state">Loading order details...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  // Customer View - Single Order
  if (userRole === 'customer' && order) {
    const canCancel = ['PENDING', 'PAID'].includes(order.status);

    return (
      <div className="order-management-container">
        {/* Messages */}
        {message.text && (
          <div className={`message ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={clearMessage}>×</button>
          </div>
        )}

        <div className="order-header">
          <h2>Order Details</h2>
          <div className="order-meta">
            <p>Order ID: {order.uuid}</p>
            <p>Order Number: {order.order_number}</p>
            <p>Status: <span className="status" style={{backgroundColor: getStatusColor(order.status)}}>{order.status}</span></p>
            <p>Order Date: {formatDate(order.created_at)}</p>
            <p>Total: ${order.total_price}</p>
            <p>Total Items: {order.total_items}</p>
          </div>
        </div>

        <div className="items-section">
          <h3>Items</h3>
          {order.items && order.items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-details">
                {item.product_image && (
                  <img 
                    src={item.product_image} 
                    alt={item.product_name} 
                    className="item-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="item-info">
                  <h4>{item.product_name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Unit Price: ${item.unit_price}</p>
                  <p>Subtotal: ${item.subtotal}</p>
                  <p>Status: <span className="status" style={{backgroundColor: getStatusColor(item.status)}}>{item.status}</span></p>
                  {item.vendor_name && <p>Vendor: {item.vendor_name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {order.delivery_address && (
          <div className="delivery-section">
            <h3>Delivery Address</h3>
            <p>{order.delivery_address}</p>
          </div>
        )}

        {order.phone_number && (
          <div className="delivery-section">
            <h3>Contact Information</h3>
            <p>Phone Number: {order.phone_number}</p>
          </div>
        )}

        {order.notes && (
          <div className="notes-section">
            <h3>Order Notes</h3>
            <p>{order.notes}</p>
          </div>
        )}

        <div className="action-buttons">
          {canCancel && (
            <button 
              className="action-button cancel"
              onClick={() => {
                const reason = prompt('Please provide a reason for cancellation (optional):');
                if (reason !== null) {
                  cancelOrder(reason);
                }
              }}
              disabled={loading}
            >
              Cancel Order
            </button>
          )}
          <button className="action-button secondary">Track Order</button>
          <button className="action-button secondary">Contact Support</button>
        </div>
      </div>
    );
  }

  // Vendor View - All Order Items
  if (userRole === 'vendor' && !orderUuid) {
    return (
      <div className="order-management-container">
        {/* Messages */}
        {message.text && (
          <div className={`message ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={clearMessage}>×</button>
          </div>
        )}

        <div className="order-header">
          <h2>Order Items Management</h2>
          <p>Total Items: {orderItems.length}</p>
        </div>

        <div className="items-section">
          <h3>Your Order Items</h3>
          {orderItems.length === 0 ? (
            <p>No order items found.</p>
          ) : (
            orderItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-details">
                  {item.product_image && (
                    <img 
                      src={item.product_image} 
                      alt={item.product_name} 
                      className="item-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="item-info">
                    <h4>{item.product_name}</h4>
                    <p>Item ID: {item.id}</p>
                    <p>Order ID: {item.order?.uuid || 'N/A'}</p>
                    <p>Order Number: {item.order?.order_number || 'N/A'}</p>
                    <p>Customer: {item.order?.customer_email || 'N/A'}</p>
                    <p>Customer Phone: {item.order?.phone_number || 'N/A'}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Unit Price: ${item.unit_price}</p>
                    <p>Subtotal: ${item.subtotal}</p>
                    <p>Current Status: <span className="status" style={{backgroundColor: getStatusColor(item.status)}}>{item.status}</span></p>
                    <p>Order Date: {item.order?.created_at ? formatDate(item.order.created_at) : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="status-update">
                  <label>Update Status:</label>
                  <select 
                    defaultValue={item.status}
                    onChange={(e) => updateItemStatus(item.id, e.target.value)}
                    disabled={updating[item.id]}
                  >
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {updating[item.id] && <span className="status-updating">Updating...</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Vendor View - Single Order
  if (userRole === 'vendor' && order) {
    const vendorItems = order.items || [];
    const totalRevenue = vendorItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    return (
      <div className="order-management-container">
        {/* Messages */}
        {message.text && (
          <div className={`message ${message.type}`}>
            <span>{message.text}</span>
            <button onClick={clearMessage}>×</button>
          </div>
        )}

        <div className="order-header">
          <h2>Order Management</h2>
          <div className="order-meta">
            <p>Order ID: {order.uuid}</p>
            <p>Order Number: {order.order_number}</p>
            <p>Customer: {order.customer_email}</p>
            <p>Customer Phone: {order.phone_number}</p>
            <p>Order Date: {formatDate(order.created_at)}</p>
            <p>Overall Order Status: <span className="status" style={{backgroundColor: getStatusColor(order.status)}}>{order.status}</span></p>
            <p>Total Items: {order.total_items}</p>
            <p>Order Total: ${order.total_price}</p>
          </div>
        </div>

        <div className="items-section">
          <h3>Your Items in this Order</h3>
          {vendorItems.length === 0 ? (
            <p>No items found for this vendor in this order.</p>
          ) : (
            vendorItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-details">
                  {item.product_image && (
                    <img 
                      src={item.product_image} 
                      alt={item.product_name} 
                      className="item-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="item-info">
                    <h4>{item.product_name}</h4>
                    <p>Item ID: {item.id}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Unit Price: ${item.unit_price}</p>
                    <p>Subtotal: ${item.subtotal}</p>
                    <p>Current Status: <span className="status" style={{backgroundColor: getStatusColor(item.status)}}>{item.status}</span></p>
                  </div>
                </div>
                
                <div className="status-update">
                  <label>Update Status:</label>
                  <select 
                    defaultValue={item.status}
                    onChange={(e) => updateItemStatus(item.id, e.target.value)}
                    disabled={updating[item.id]}
                  >
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {updating[item.id] && <span className="status-updating">Updating...</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {order.delivery_address && (
          <div className="delivery-section">
            <h3>Delivery Details</h3>
            <p>Address: {order.delivery_address}</p>
            <p>Phone: {order.phone_number}</p>
          </div>
        )}

        <div className="vendor-summary">
          <h3>Revenue Summary</h3>
          <p>Total Items: {vendorItems.length}</p>
          <p>Total Revenue: ${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="action-buttons">
          <button className="action-button">Print Packing Slip</button>
          <button className="action-button">Generate Invoice</button>
          <button className="action-button">Contact Customer</button>
        </div>

        {order.notes && (
          <div className="notes-section">
            <h3>Order Notes</h3>
            <p>{order.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="order-management-container">
      <p>No order data available or invalid configuration.</p>
    </div>
  );
};

// Demo wrapper component with enhanced functionality
const OrderItemDemo = ({ userRole = 'customer' }) => {
  const [orderUuid, setOrderUuid] = useState('');
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Base API URL
  const API_BASE_URL = 'https://agroshopp.onrender.com';

  // Function to test with customer orders list first
  const fetchCustomerOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.get(`${API_BASE_URL}/orders/`, { headers });
      
      const orders = response.data.results || response.data;
      setOrdersList(Array.isArray(orders) ? orders : []);
      
      if (Array.isArray(orders) && orders.length > 0) {
        setOrderUuid(orders[0].uuid);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      alert('Failed to fetch orders. Please check your authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="demo-wrapper" style={{padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px'}}>
        <h1>Order Management System</h1>
        <div className="demo-controls" style={{marginBottom: '15px'}}>
          <input 
            type="text" 
            value={orderUuid} 
            onChange={(e) => setOrderUuid(e.target.value)}
            placeholder="Enter order UUID"
            style={{marginRight: '10px', padding: '8px', width: '300px'}}
          />
          <button 
            className="action-button" 
            onClick={fetchCustomerOrders}
            disabled={loading}
            style={{padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
          >
            {loading ? 'Loading...' : 'Fetch My Orders'}
          </button>
        </div>
        <div style={{fontSize: '14px', color: '#666'}}>
          <p>Current token: {localStorage.getItem('access_token') ? '✅ Present' : '❌ Missing'}</p>
          <p>Current role: {userRole}</p>
          <p>Testing with UUID: {orderUuid || 'None'}</p>
          {ordersList.length > 0 && (
            <details>
              <summary>Available Orders ({ordersList.length})</summary>
              <ul style={{maxHeight: '100px', overflow: 'auto', margin: '10px 0'}}>
                {ordersList.map(order => (
                  <li 
                    key={order.uuid} 
                    onClick={() => setOrderUuid(order.uuid)}
                    style={{cursor: 'pointer', padding: '2px', fontSize: '12px'}}
                  >
                    {order.order_number} - {order.status} - ${order.total_price}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
      
      <OrderItem 
        orderUuid={orderUuid || null}
        userRole={userRole} 
      />
    </div>
  );
};

export default OrderItemDemo;