import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPackage, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import appLinks from '../routing/Links';
import '../styles/Dashboard.css';

const Dashboard = ({ products, onDeleteProduct, onEditProduct }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredProducts, setFilteredProducts] = useState(products || []);

    useEffect(() => {
        if (!products) return;

        let filtered = products.filter(product =>
            product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.company.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory]);

    const categories = ['All', ...new Set((products || []).map(item => item.category))];

    const handleDelete = (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            onDeleteProduct(productId);
        }
    };

    const getStockStatus = (stock) => {
        const stockNum = parseInt(stock);
        if (stockNum === 0) return { status: 'Out of Stock', class: 'out-of-stock' };
        if (stockNum < 5) return { status: 'Low Stock', class: 'low-stock' };
        return { status: 'In Stock', class: 'in-stock' };
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Product Dashboard</h1>
                    <p>Manage your product inventory</p>
                </div>

                <div className="header-actions">
                    <Link to={appLinks.addProduct} className="add-product-btn">
                        <FiPlus className="add-icon" />
                        Add Product
                    </Link>

                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <FiPackage className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-number">{products?.length || 0}</span>
                                <span className="stat-label">Total Products</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-controls">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="category-filter">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="products-table-container">
                {filteredProducts.length === 0 ? (
                    <div className="no-products">
                        <FiPackage className="no-products-icon" />
                        <h3>No Products Found</h3>
                        <p>Add some products to get started!</p>
                        <Link to={appLinks.addProduct} className="add-product-btn">
                            <FiPlus className="add-icon" />
                            Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Product Name</th>
                                <th>Company</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const stockStatus = getStockStatus(product.stock);
                                return (
                                    <tr key={product.ID}>
                                        <td>
                                            <img src={product.img} alt={product.title} className="product-thumbnail"
                                            />
                                        </td>
                                        <td>
                                            <div className="product-info">
                                                <span className="product-title">{product.title}</span>
                                                <span className="product-color">Color: {product.color}</span>
                                            </div>
                                        </td>
                                        <td>{product.company}</td>
                                        <td>
                                            <span className="category-badge">{product.category}</span>
                                        </td>
                                        <td>${product.newPrice}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <span className={`stock-status ${stockStatus.class}`}>
                                                {stockStatus.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() => onEditProduct && onEditProduct(product.ID)}
                                                    title="Edit Product"
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDelete(product.ID)}
                                                    title="Delete Product"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;