import React, { useState, useEffect, useMemo } from 'react';
import { FiShoppingBag, FiX, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import '../styles/Cart.css'; 

const Cart = ({ cartItem, setCartItem }) => {
  const [selectedItems, setSelectedItems] = useState(
    cartItem.reduce((acc, item) => ({ ...acc, [item.ID]: true }), {})
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    localStorage.setItem('greenCart', JSON.stringify(cartItem));
  }, [cartItem]);

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const removeItem = (itemId) => {
    setCartItem(prev => prev.filter(item => item.ID !== itemId));
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      delete newSelected[itemId];
      return newSelected;
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCartItem(prev => prev.map(item => 
      item.ID === itemId ? { ...item, quantity: newQuantity } : item
    ));
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

  const { subtotal, itemCount } = useMemo(() => {
    const selected = cartItem.filter(item => selectedItems[item.ID]);
    const subtotal = selected.reduce(
      (total, item) => total + (getPrice(item.newPrice) * item.quantity), 
      0
    );
    return {
      subtotal,
      itemCount: selected.length
    };
  }, [cartItem, selectedItems]);

  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 || itemCount === 0 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      const remainingCart = cartItem.filter(item => !selectedItems[item.ID]);
      setCartItem(remainingCart);
      setSelectedItems({});
      setIsCheckingOut(false);
      alert('Checkout completed successfully!');
    }, 1500);
  };

  return (
    <div className="premium-cart-container">
      <div className="premium-cart-header">
        <h1 className="premium-cart-title">
          <FiShoppingBag className="cart-icon" />
          Your Shopping Bag
          {cartItem.length > 0 && (
            <span className="item-count-badge">{cartItem.length}</span>
          )}
        </h1>
        <a href="/" className="continue-shopping-btn">
          <FiArrowLeft /> Continue Shopping
        </a>
      </div>
      
      {cartItem.length === 0 ? (
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
            {cartItem.map(item => (
              <div className="premium-cart-item" key={item.ID}>
                <div className="item-selection">
                  <input
                    type="checkbox"
                    id={`item-${item.ID}`}
                    checked={!!selectedItems[item.ID]}
                    onChange={() => toggleItemSelection(item.ID)}
                    className="premium-checkbox"
                  />
                  <label htmlFor={`item-${item.ID}`} className="checkbox-label"></label>
                </div>
                
                <div className="item-image-container">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="item-image"
                    loading="lazy"
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-price">${getPrice(item.newPrice).toFixed(2)}</p>
                  <p className="item-color">Color: {item.color || 'N/A'}</p>
                  <p className="item-size">Size: {item.size || 'Standard'}</p>
                  
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.ID, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <FiMinus />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.ID, parseInt(e.target.value) || 1)}
                      min="1"
                      className="quantity-input"
                    />
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.ID, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
                
                <div className="item-subtotal">
                  <p className="subtotal-price">
                    ${(getPrice(item.newPrice) * item.quantity).toFixed(2)}
                  </p>
                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item.ID)}
                    aria-label={`Remove ${item.title} from cart`}
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="premium-cart-summary">
            <div className="summary-header">
              <h3>Order Summary</h3>
              <p>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</p>
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className={`premium-btn checkout-btn ${isCheckingOut ? 'processing' : ''}`}
              disabled={!itemCount || isCheckingOut}
              onClick={handleCheckout}
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            
            <div className="payment-methods">
              <p>We accept:</p>
              <div className="payment-icons">
                <span className="payment-icon visa">Visa</span>
                <span className="payment-icon mastercard">Mastercard</span>
                <span className="payment-icon amex">Amex</span>
                <span className="payment-icon paypal">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;