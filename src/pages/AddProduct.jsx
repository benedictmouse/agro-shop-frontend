import React, { useState, useContext } from 'react';
import { IoMdAdd } from "react-icons/io";
import '../styles/AddProduct.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AddProduct = ({ onAddProduct }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear errors on input change
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('You must be logged in as a vendor to add a product.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      if (formData.category) {
        formDataToSend.append('category', formData.category);
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Debug: Log what we're sending
      console.log('Sending data:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const token = localStorage.getItem('access_token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.post('https://agroshopp.onrender.com/products/create/', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Remove Content-Type to let browser set it automatically with boundary
        }
      });

      // Call the callback function to add product locally (if needed)
      if (onAddProduct) {
        onAddProduct(response.data);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: null
      });
      setImagePreview(null);
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // Better error handling
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to add products. Make sure you are logged in as a vendor.');
      } else if (error.response?.data) {
        // Handle Django validation errors
        const errorMessages = [];
        Object.entries(error.response.data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        });
        setError(errorMessages.join(' | '));
      } else {
        setError('Error adding product. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h2>Add New Product</h2>
        <p>Fill in the details below to add a new product to your inventory</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group image-upload">
          <label htmlFor="image-input" className="image-upload-label">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <IoMdAdd className="upload-icon" />
                <span>Upload Product Image</span>
              </div>
            )}
          </label>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="image-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Product Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter product title"
              required
            />
          </div>

          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter product description"
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="Enter stock quantity"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Enter category name"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || !isAuthenticated}
        >
          {isSubmitting ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;