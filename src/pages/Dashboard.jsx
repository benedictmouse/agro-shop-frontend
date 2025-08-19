import React, { useState, useEffect, useContext } from 'react';
import { FiTrash2, FiPackage, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import appLinks from '../routing/Links';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Create axios instance with interceptors for token handling
    const api = axios.create({
        baseURL: 'https://agroshopp.onrender.com',
    });

    // Add token to all requests
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Handle token expiration
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                console.log('Token expired or invalid');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // You might want to redirect to login or refresh token here
            }
            return Promise.reject(error);
        }
    );

    // Fetch products from Django API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products/view/');
            
            console.log('Fetched products:', response.data);
            setProducts(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else {
                setError('Failed to load products');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories from Django API
    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await api.get('/products/categories/');
            
            console.log('Fetched categories:', response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Don't show error for categories fetch failure
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
            fetchCategories();
        }
    }, [isAuthenticated]);

    // Filter products based on search and category
    useEffect(() => {
        if (!products) return;

        let filtered = products.filter(product =>
            product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(product => 
                product.category?.name === selectedCategory
            );
        }

        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory]);

    // Get unique categories for filter buttons (from fetched categories and products)
    const getFilterCategories = () => {
        const categorySet = new Set(['All']);
        
        // Add categories from fetched categories list
        categories.forEach(category => {
            categorySet.add(category.name);
        });
        
        // Add categories from products (in case some products have categories not in the main list)
        products.forEach(product => {
            if (product.category?.name) {
                categorySet.add(product.category.name);
            }
        });
        
        return Array.from(categorySet);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            console.log('Attempting to delete product with ID:', productId);
            
            const response = await api.delete(`/products/${productId}/`);
            console.log('Delete response:', response);

            // Remove product from local state
            setProducts(products.filter(product => product.id !== productId));
            console.log('Product deleted successfully');
            
            // Show success message (optional)
            alert('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            
            if (error.response?.status === 401) {
                alert('Authentication failed. Please log in again.');
            } else if (error.response?.status === 404) {
                alert('Product not found or you don\'t have permission to delete it.');
            } else if (error.response?.status === 403) {
                alert('You don\'t have permission to delete this product.');
            } else {
                alert('Failed to delete product. Please try again.');
            }
        }
    };

    const getStockStatus = (stock) => {
        const stockNum = parseInt(stock);
        if (stockNum === 0) return { status: 'Out of Stock', class: 'out-of-stock' };
        if (stockNum < 5) return { status: 'Low Stock', class: 'low-stock' };
        return { status: 'In Stock', class: 'in-stock' };
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '/placeholder-image.jpg';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `https://agroshopp.onrender.com${imageUrl}`;
    };

    if (!isAuthenticated) {
        return (
            <div className="dashboard-container">
                <div className="error-message">
                    Please log in to view your products.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">Loading products...</div>
            </div>
        );
    }

    const filterCategories = getFilterCategories();

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
                                <span className="stat-number">{products.length}</span>
                                <span className="stat-label">Total Products</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <FiPackage className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-number">{categories.length}</span>
                                <span className="stat-label">Categories</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={fetchProducts}>Retry</button>
                </div>
            )}

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
                    {categoriesLoading ? (
                        <div className="loading-categories">Loading categories...</div>
                    ) : (
                        filterCategories.map(category => (
                            <button
                                key={category}
                                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="products-table-container">
                {filteredProducts.length === 0 ? (
                    <div className="no-products">
                        <FiPackage className="no-products-icon" />
                        <h3>No Products Found</h3>
                        <p>
                            {products.length === 0 
                                ? "Add some products to get started!" 
                                : "No products match your search criteria."
                            }
                        </p>
                        {products.length === 0 && (
                            <Link to={appLinks.addProduct} className="add-product-btn">
                                <FiPlus className="add-icon" />
                                Add Your First Product
                            </Link>
                        )}
                    </div>
                ) : (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Product Name</th>
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
                                    <tr key={product.id}>
                                        <td>
                                            <img 
                                                src={getImageUrl(product.image)} 
                                                alt={product.title} 
                                                className="product-thumbnail"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <div className="product-info">
                                                <span className="product-title">{product.title}</span>
                                                <span className="product-description">
                                                    {product.description.length > 50 
                                                        ? `${product.description.substring(0, 50)}...`
                                                        : product.description
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="category-badge">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td>${parseFloat(product.price).toFixed(2)}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <span className={`stock-status ${stockStatus.class}`}>
                                                {stockStatus.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDelete(product.id)}
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