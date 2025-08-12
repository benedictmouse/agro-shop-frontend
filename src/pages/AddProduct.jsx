import React, { useState } from 'react';
import { IoMdAdd } from "react-icons/io";
import '../styles/AddProduct.css';

const AddProduct = ({ onAddProduct }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    newPrice: '',
    stock: '',
    category: '',
    company: '',
    color: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateProductId = () => {
    return Date.now(); // Simple ID generation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create new product object
      const newProduct = {
        ID: generateProductId(),
        img: imagePreview, // In a real app, you'd upload to a server
        title: formData.title,
        stock: formData.stock,
        reviews: "(0 reviews)",
        newPrice: formData.newPrice,
        company: formData.company,
        color: formData.color,
        category: formData.category,
        Description: formData.description
      };

      // Call the callback function to add product
      if (onAddProduct) {
        onAddProduct(newProduct);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        newPrice: '',
        stock: '',
        category: '',
        company: '',
        color: '',
        image: null
      });
      setImagePreview(null);
      
      alert('Product added successfully!');
    } catch (error) {
      alert('Error adding product. Please try again.');
      console.error('Error adding product:', error);
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
            required
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
            <label>Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Enter company name"
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
            <label>Price ($)</label>
            <input
              type="number"
              name="newPrice"
              value={formData.newPrice}
              onChange={handleInputChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>

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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select category</option>
              <option value="sneakers">Sneakers</option>
              <option value="sandals">Sandals</option>
              <option value="flats">Flats</option>
              <option value="heels">Heels</option>
            </select>
          </div>

          <div className="form-group">
            <label>Color</label>
            <select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              required
            >
              <option value="">Select color</option>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;