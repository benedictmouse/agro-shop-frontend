import React, { useState, useEffect } from 'react';
import CardItems from './CardItem';
import '../styles/Cards.css';

const Cards = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://agroshopp.onrender.com';

  // Fetch products from Django backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/products/public/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform Django data to match frontend structure
        const transformedProducts = data.map(product => ({
          ID: product.id,
          img: product.image_url || product.image, // Handle both possible field names
          title: product.title,
          category: product.category?.name || product.category, // Handle nested category
          newPrice: product.price,
          Description: product.description,
          company: product.vendor?.username || 'Unknown Vendor', // Add vendor info
          stock: product.stock || 0
        }));
        
        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE_URL]);

  // Get unique categories from products
  const categories = ['All', ...new Set(products.map(item => item.category))];

  // Filter products based on category and search query
  const filteredCards = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.newPrice.toString().includes(searchQuery);
    
    return matchesCategory && matchesSearch;
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  if (loading) {
    return (
      <section className="cards-section">
        <div className="loading-container">
          <h2>Loading products...</h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="cards-section">
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
      </section>
    );
  }

  return (
    <section className="cards-section">
      <div className="cards-header">
        <h2 className="section-title">Start Shopping</h2>
        
        {/* Search Input */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or price..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-bttn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredCards.length > 0 ? (
        <div className="cards-grid">
          {filteredCards.map(({ ID, img, title, category, newPrice, Description, company, stock }) => (
            <CardItems
              key={ID}
              ID={ID}
              img={img}
              title={title}
              category={category}
              newPrice={newPrice}
              Description={Description}
              company={company}
              stock={stock}
            />
          ))}
        </div>
      ) : (
        <div className="no-items">
          <h2>
            No Items Found 
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </h2>
          <button 
            className="reset-filter-btn"
            onClick={clearSearch}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </section>
  );
};

export default Cards;
