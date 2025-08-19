import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showMessage, setShowMessage] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fixed: Remove trailing slash from API_BASE_URL to avoid double slashes
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Fetch single product from Django backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Fixed: Ensure proper URL formatting
        const response = await fetch(`${API_BASE_URL}/products/public/${id}/`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform Django data to match frontend structure
        const transformedProduct = {
          ID: data.id,
          img: data.image_url || data.image,
          title: data.title,
          category: data.category?.name || data.category,
          newPrice: data.price,
          Description: data.description,
          company: data.vendor?.username || 'Unknown Vendor',
          stock: data.stock || 0
        };
        
        setProduct(transformedProduct);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_BASE_URL]);

  // Fixed: Updated add to cart function to match Django backend expectations
  const addToCart = async () => {
    if (!product || quantity > product.stock) return;

    if (!isAuthenticated) {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      return;
    }

    try {
      setAddingToCart(true);
      const token = localStorage.getItem('access_token');
      
      // Fixed: Correct URL path to match Django urls.py
      const response = await fetch(`${API_BASE_URL}/cart/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.ID,
          quantity: quantity
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to add items to cart');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Please ensure you have customer privileges.');
        }
        
        // Try to get error details from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add item to cart');
      }

      const data = await response.json();
      console.log('Added to cart:', data);
      
      // Reset quantity and show success message
      setQuantity(1);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (product && value <= product.stock && value >= 1) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-container">
          <h2>Loading product...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="not-found">Product not found</div>;
  }

  return (
    <div className="product-detail-container">
      <div className="product-image-container">
        <img src={product.img} alt={product.title} className="product-image" />
      </div>
      
      <div className="product-info">
        <h1 className="product-title">{product.title}</h1>
        <p className="product-category">{product.category}</p>
        <p className="product-vendor">Sold by: {product.company}</p>
        
        <div className="product-price">Ksh {product.newPrice}</div>
        
        <div className="product-stock">
          {product.stock > 0 ? (
            <span className="in-stock">{product.stock} available</span>
          ) : (
            <span className="out-of-stock">Out of stock</span>
          )}
        </div>
        
        <div className="product-description">
          <h3>Description</h3>
          <p>{product.Description || 'No description available'}</p>
        </div>
        
        {product.stock > 0 && (
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
              max={product.stock}
              className="quantity-input"
            />
            <button
              onClick={increaseQuantity}
              disabled={quantity >= product.stock}
              className="quantity-btn"
            >
              <FiPlus />
            </button>
          </div>
        )}
        
        <button
          className="add-to-cart-btn"
          onClick={addToCart}
          disabled={product.stock === 0 || addingToCart}
        >
          <FiShoppingCart className="cart-icon" />
          {addingToCart ? 'Adding...' : 'Add to Cart'}
        </button>

        {showMessage && (
          <div className="cart-message">
            {isAuthenticated 
              ? `${product.title} has been added to your cart!`
              : 'Please login to add items to cart'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;