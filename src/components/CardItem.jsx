import React from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi'
import '../styles/CardItems.css'

const CardItems = ({ ID, img, title, newPrice, category,company }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${ID}`} className="card-link">
        <div className="card-image-container">
          <img src={img} alt={title} className="card-image" />
          <span className="category-badge">{category}</span>
        </div>
        
        <div className="card-details">
          <h3 className="card-title">{title}</h3>
          <h4 className="card-title">{company}</h4>
          <div className="price-container">
            <span className="card-price">Ksh {newPrice}</span>
          </div>
        </div>
      </Link>
      
    </div>
  )
}

export default CardItems