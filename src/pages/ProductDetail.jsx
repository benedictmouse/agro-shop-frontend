import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import '../styles/ProductDetail.css';

const ProductDetail = ({ cartItem, setCartItem, products }) => {
  const { id } = useParams();
  const card = products.find(item => item.ID === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [showMessage, setShowMessage] = useState(false);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (card && value <= card.stock && value >= 1) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (card && quantity < card.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = () => {
    if (!card || quantity > card.stock) return;

    const existingItem = cartItem.find(item => item.ID === card.ID);

    if (existingItem) {
      const updatedCart = cartItem.map(item =>
        item.ID === card.ID
          ? { ...item, quantity: (item.quantity || 1) + quantity }
          : item
      );
      setCartItem(updatedCart);
    } else {
      setCartItem([...cartItem, { ...card, quantity }]);
    }
    setQuantity(1);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000); // Hide message after 3 seconds
  };

  if (!card) {
    return <div className="not-found">Product not found</div>;
  }

  return (
    <div className="product-detail-container">
      <div className="product-image-container">
        <img src={card.img} alt={card.title} className="product-image" />
      </div>
      
      <div className="product-info">
        <h1 className="product-title">{card.title}</h1>
        <p className="product-category">{card.category}</p>
        
        <div className="product-price">${card.newPrice}</div>
        
        <div className="product-stock">
          {card.stock > 0 ? (
            <span className="in-stock">{card.stock} available</span>
          ) : (
            <span className="out-of-stock">Out of stock</span>
          )}
        </div>
        
        <div className="product-description">
          <h3>Description</h3>
          <p>{card.Description || 'No description available'}</p>
        </div>
        
        <div className="quantity-controls">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="quantity-btn"
          >
            <FiMinus />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            max={card.stock}
            className="quantity-input"
          />
          <button
            onClick={increaseQuantity}
            disabled={quantity >= card.stock}
            className="quantity-btn"
          >
            <FiPlus />
          </button>
        </div>
        
        <button
          className="add-to-cart-btn"
          onClick={addToCart}
          disabled={card.stock === 0}
        >
          <FiShoppingCart className="cart-icon" />
          Add to Cart
        </button>

        {showMessage && (
          <div className="cart-message">
            {card.title} has been added to your cart!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;