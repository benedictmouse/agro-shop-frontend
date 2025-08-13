import React, { useState } from 'react';
import CardItems from './CardItem';
import '../styles/Cards.css';

const Cards = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories from products
  const categories = ['All', ...new Set(products.map(item => item.category))];

  const filteredCards = selectedCategory === 'All' 
    ? products 
    : products.filter(card => card.category === selectedCategory);

  return (
    <section className="cards-section">
      <div className="cards-header">
        <h2 className="section-title">Fresh Produce</h2>
        
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
          {filteredCards.map(({ ID, img, title, category, newPrice, Description }) => (
            <CardItems
              key={ID}
              ID={ID}
              img={img}
              title={title}
              category={category}
              newPrice={newPrice}
              Description={Description}
            />
          ))}
        </div>
      ) : (
        <div className="no-items">
          <h2>No Items Available in {selectedCategory}</h2>
          <button 
            className="reset-filter-btn"
            onClick={() => setSelectedCategory('All')}
          >
            Show All Products
          </button>
        </div>
      )}
    </section>
  );
};

export default Cards;