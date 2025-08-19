import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FiShoppingBag, FiX, FiPlus, FiMinus, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import '../styles/Cart.css';

const Cart = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cartData, setCartData] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState('');

  // API base URL - adjust according to your backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://agroshopp.onrender.com';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // API headers
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // Function to construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    return `${API_BASE_URL}/media/${imagePath}`;
  };

  // Fetch cart data from backend
  const fetchCartData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/cart/`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCartData(data);
        
        if (data.items && data.items.length > 0) {
          const initialSelected = data.items.reduce((acc, item) => ({
            ...acc,
            [item.id]: true
          }), {});
          setSelectedItems(initialSelected);
        } else {
          setSelectedItems({});
        }
      } else if (response.status === 401) {
        setError('Please log in to view your cart');
        localStorage.removeItem('access_token');
      } else if (response.status === 403) {
        setError('Access denied. Please ensure you have customer privileges.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || errorData.detail || 'Failed to fetch cart');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchCartData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add item to cart');
      }
    } catch (err) {
      alert(`Failed to add item: ${err.message}`);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    setUpdateLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/item/${itemId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({
          action: 'remove_all'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchCartData();
        
        setSelectedItems(prev => {
          const newSelected = { ...prev };
          delete newSelected[itemId];
          return newSelected;
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to remove item from cart');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setUpdateLoading(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/item/${itemId}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          quantity: newQuantity
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchCartData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update quantity');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clear/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchCartData();
        setSelectedItems({});
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [isAuthenticated]);

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getPrice = (price) => {
    try {
      const numPrice = typeof price === 'string' 
        ? parseFloat(price.replace(/[^\d.-]/g, '')) 
        : Number(price);
      return isNaN(numPrice) ? 0 : numPrice;
    } catch {
      return 0;
    }
  };

  const { subtotal, itemCount, selectedCartItems } = useMemo(() => {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      return { subtotal: 0, itemCount: 0, selectedCartItems: [] };
    }

    const selected = cartData.items.filter(item => selectedItems[item.id]);
    const subtotal = selected.reduce(
      (total, item) => total + (getPrice(item.product.price) * item.quantity), 
      0
    );
    
    return {
      subtotal,
      itemCount: selected.length,
      selectedCartItems: selected
    };
  }, [cartData, selectedItems]);

  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 || itemCount === 0 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Please enter a valid phone number in format: 254XXXXXXXXX');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleCheckoutInitiation = () => {
    if (!selectedCartItems.length) {
      alert('Please select items to checkout');
      return;
    }
    setShowCheckoutModal(true);
    setCheckoutSuccess(false);
    setPhoneNumber('');
    setPhoneError('');
  };

  const handleCheckout = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const checkoutResponse = await fetch(`${API_BASE_URL}/initiate/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          cart_id: cartData.id,
          phone: phoneNumber
        }),
      });

      if (checkoutResponse.ok) {
        const checkoutData = await checkoutResponse.json();
        setCheckoutRequestId(checkoutData.checkout.checkout_request_id);
        setCheckoutSuccess(true);
        
        setTimeout(() => {
          fetchCartData();
          setSelectedItems({});
        }, 2000);
      } else {
        const errorData = await checkoutResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Checkout failed');
      }
    } catch (err) {
      setError(`Checkout failed: ${err.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchCartData();
  };

  const handleImageError = (e, item) => {
    e.target.src = '/placeholder-image.jpg';
  };

  if (!isAuthenticated) {
    return (
      <div className="premium-cart-container">
        <div className="premium-empty-cart">
          <div className="empty-cart-icon">
            <FiShoppingBag />
          </div>
          <h2>Please log in to view your cart</h2>
          <p>You need to be logged in to access your shopping cart</p>
          <a href="/login" className="premium-btn primary">
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="premium-cart-container">
        <div className="premium-empty-cart">
          <div className="empty-cart-icon loading">
            <FiShoppingBag />
          </div>
          <h2>Loading your cart...</h2>
          <p>Please wait while we fetch your items</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="premium-cart-container">
        <div className="premium-empty-cart">
          <div className="empty-cart-icon error-icon">
            <FiX />
          </div>
          <h2>Error loading cart</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="premium-btn primary">
            Try Again
          </button>
          <a href="/" className="premium-btn secondary" style={{ marginTop: '10px' }}>
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const cartItems = cartData?.items || [];

  return (
    <div className="premium-cart-container">
      {showCheckoutModal && (
        <div className="checkout-modal-overlay" onClick={() => !isCheckingOut && setShowCheckoutModal(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            {checkoutSuccess ? (
              <div className="checkout-success">
                <div className="success-icon">
                  <FiCheck />
                </div>
                <h3>Checkout Initiated Successfully</h3>
                <p>Please check your phone to complete the M-Pesa payment</p>
                <p className="request-id">Request ID: {checkoutRequestId}</p>
                <button
                  className="premium-btn primary"
                  onClick={() => setShowCheckoutModal(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3>Complete Your Purchase</h3>
                <p>Enter your M-Pesa phone number to proceed with payment</p>
                
                <div className="form-group">
                  <label>M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
                    className={phoneError ? 'error' : ''}
                  />
                  {phoneError && <p className="error-message">{phoneError}</p>}
                </div>
                
                <div className="order-summary">
                  <h4>Order Summary</h4>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>Ksh {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (0%)</span>
                    <span>Ksh {tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `Ksh ${shipping.toFixed(0)}`}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>Ksh {total.toFixed(0)}</span>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button
                    className="premium-btn secondary"
                    onClick={() => setShowCheckoutModal(false)}
                    disabled={isCheckingOut}
                  >
                    Cancel
                  </button>
                  <button
                    className={`premium-btn primary ${isCheckingOut ? 'processing' : ''}`}
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="premium-cart-header">
        <h1 className="premium-cart-title">
          <FiShoppingBag className="cart-icon" />
          Your Shopping Bag
          {cartItems.length > 0 && (
            <span className="item-count-badge">{cartItems.length}</span>
          )}
        </h1>
        <div className="cart-header-actions">
          <a href="/" className="continue-shopping-btn">
            <FiArrowLeft /> Continue Shopping
          </a>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          )}
        </div>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="premium-empty-cart">
          <div className="empty-cart-icon">
            <FiShoppingBag />
          </div>
          <h2>Your bag is empty</h2>
          <p>Start adding items to begin your shopping experience</p>
          <a href="/" className="premium-btn primary">
            Discover Our Collection
          </a>
        </div>
      ) : (
        <div className="premium-cart-content">
          <div className="premium-cart-items">
            {cartItems.map(item => (
              <div className="premium-cart-item" key={item.id}>
                <div className="item-selection">
                  <input
                    type="checkbox"
                    id={`item-${item.id}`}
                    checked={!!selectedItems[item.id]}
                    onChange={() => toggleItemSelection(item.id)}
                    className="premium-checkbox"
                  />
                  <label htmlFor={`item-${item.id}`} className="checkbox-label"></label>
                </div>
                
                <div className="item-image-container">
                  <img 
                    src={getImageUrl(item.product?.image)} 
                    alt={item.product?.name || item.product?.title || 'Product'} 
                    className="item-image"
                    loading="lazy"
                    onError={(e) => handleImageError(e, item)}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-title">{item.product?.name || item.product?.title}</h3>
                  <p className="item-price">Ksh {getPrice(item.product?.price).toFixed(2)}</p>
                  <p className="item-color">Color: {item.product?.color || 'N/A'}</p>
                  <p className="item-size">Size: {item.product?.size || 'Standard'}</p>
                  
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updateLoading[item.id]}
                    >
                      <FiMinus />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        if (value !== item.quantity) {
                          updateQuantity(item.id, value);
                        }
                      }}
                      min="1"
                      className="quantity-input"
                      disabled={updateLoading[item.id]}
                    />
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updateLoading[item.id]}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
                
                <div className="item-subtotal">
                  <p className="subtotal-price">
                    Ksh {(getPrice(item.product?.price) * item.quantity).toFixed(2)}
                  </p>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    disabled={updateLoading[item.id]}
                  >
                    {updateLoading[item.id] ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <FiX />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="premium-cart-summary">
            <div className="summary-header">
              <h3>Order Summary</h3>
              <p>{itemCount} {itemCount === 1 ? 'Item' : 'Items'} selected</p>
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Ksh {subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax (0%)</span>
                <span>Ksh {tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `Ksh ${shipping.toFixed(2)}`}</span>
              </div>
              {subtotal > 1 && (
                <div className="summary-note">
                  <small>🎉 Free shipping on orders over Ksh 50!</small>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>Ksh {total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className={`premium-btn checkout-btn ${isCheckingOut ? 'processing' : ''} ${!itemCount ? 'disabled' : ''}`}
              disabled={!itemCount || isCheckingOut}
              onClick={handleCheckoutInitiation}
            >
              {isCheckingOut ? 'Processing...' : `Proceed to Checkout (Ksh ${total.toFixed(2)})`}
            </button>
            
            <div className="payment-methods">
              <p>We accept:</p>
              <div className="payment-icons">
                <span className="payment-icon visa">Visa</span>
                <span className="payment-icon mastercard">Mastercard</span>
                <span className="payment-icon amex">Amex</span>
                <span className="payment-icon mpesa">M-Pesa</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;